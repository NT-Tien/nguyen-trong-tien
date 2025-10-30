import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseService } from "src/_cores/common/base/service.mongoose.base";
import { Tenant } from "src/_cores/entities/tenant.entity";

@Injectable()
export class TenantService extends BaseService<Tenant> {

    constructor(
        @InjectModel(Tenant.name)
        private readonly tenantModel: Model<Tenant>,
    ) {
        super(tenantModel);
    }

}