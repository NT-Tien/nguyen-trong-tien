import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseService } from "src/_cores/common/base/service.mongoose.base";
import { Role } from "src/_cores/entities/role.entity";

@Injectable()
export class RoleService extends BaseService<Role> {
    constructor(
        @InjectModel(Role.name)
        private readonly roleModel: Model<Role>,
    ) {
        super(roleModel);
    }

}