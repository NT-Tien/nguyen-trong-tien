import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseService } from "src/_cores/common/base/service.mongoose.base";
import { Role } from "src/_cores/entities/role.entity";
import { User } from "src/_cores/entities/user.entity";
import { ObjectId } from "mongodb";

@Injectable()
export class UserService extends BaseService<User> {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>,
        @InjectModel(Role.name)
        private readonly roleModel: Model<Role>,
    ) {
        super(userModel);
    }

    private async filterRoleWithTenantId(data: any[], tenant_id: string) {
        // get all roles detail with tenant_id
        let roles_detail = await this.roleModel.find({ tenant_id });
        // remove role that is not in tenant_id
        for (let i = 0; i < data.length; i++) {
            data[i].role = data[i]?.role?.map((role: any) => {
                for (let role_detail of roles_detail) {
                    if (role_detail._id.toString() == role._id.toString()) {
                        return {
                            _id: role_detail._id,
                            name: role_detail.title,
                        };
                    }
                }
            });
            // remove role that is null
            data[i].role = data[i]?.role?.filter((role: any) => role != null);
        }
        // detail role for data.role
        return data;
    }

    async findAllQuery(
        populateFields: any[],
        filterQuery: any,
        projection: Record<string, any>,
        sortQuery: Record<string, -1 | 1>,
        limit: number,
        skip: number,
        tenant_id: string,
    ) {
        let result = await super.findAllQuery(populateFields, filterQuery, projection, sortQuery, limit, skip);
        if (result.documents && result.documents.length > 0) {
            result.documents = await this.filterRoleWithTenantId(result.documents, tenant_id);
        }
        return result;
    }

    async findOne(id: string, populateFields: any[], tenant_id?: string) {
        let result = await super.findOne(id, populateFields);
        let new_result = await this.filterRoleWithTenantId([result], tenant_id) as any[];
        if (new_result && new_result.length > 0) {
            return new_result[0];
        } else {
            return null;
        }
    }

    private async importUniqueRole(roles: string[]) {
        let new_roles = [];
        if (roles && roles.length > 0) {
            for (let role of roles) {
                let isExist = false;
                for (let new_role of new_roles) {
                    if (new_role == role) {
                        isExist = true;
                        break;
                    }
                }
                if (!isExist) {
                    new_roles.push(role);
                }
            }
        }
        return new_roles;
    }

    private async handleRoleWithTenantLogic(data: User, old_data: User, tenant_id: string) {
        if (tenant_id) {
            let roles = await this.importUniqueRole(data.role);
            let old_roles = await this.importUniqueRole(old_data.role);
            // merge old roles with new roles
            let merge_roles = [...roles, ...old_roles];
            // get all roles detail
            let role_details = await this.roleModel.find({ _id: { $in: merge_roles } });
            // get role of other tenant_id
            let other_tenant_roles = role_details.filter((role: any) => role.tenant_id != tenant_id);
            // get role of current tenant_id
            let current_tenant_roles = role_details.filter((role: any) => role.tenant_id == tenant_id);
            // overwrite current_tenant_roles with data.role
            current_tenant_roles = data.role ?
                data?.role.map(roleId => role_details.find(role => role._id.toString() === roleId)) : [];
            // merge current_tenant_roles with other_tenant_roles
            data.role = [...current_tenant_roles, ...other_tenant_roles].map(role => role._id) as any;
        }
        return data;
    }

    async update(id: string, data: any, tenant_id: string) {
        let old_data = await this.userModel.findOne({ _id: id });
        if (!old_data) {
            throw new HttpException(`Entity with id ${id} not found`, HttpStatus.NOT_FOUND);
        }
        data = await this.handleRoleWithTenantLogic(data, old_data, tenant_id);
        if (
            data.parent_id
            && (
                (
                    Array.isArray(data.parent_id) && ObjectId.isValid(data.parent_id[0] as any)
                )
                || (
                    typeof data.parent_id === 'string' && ObjectId.isValid(data.parent_id as any)
                )
            )
        ) {
            let parent_id = Array.isArray(data.parent_id) ? data.parent_id[0] : data.parent_id;
            data.parent_id = new ObjectId(parent_id);
        } else {
            data.parent_id = null;
        }
        let result = await super.update(id, data);
        // remove password from result
        if (result && result.password) {
            result.password = undefined;
        }
        return result;
    }
}