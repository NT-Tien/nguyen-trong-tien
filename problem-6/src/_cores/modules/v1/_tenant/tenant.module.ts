import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TenantService } from "./tenant.service";
import { TenantController } from "./tenant.controller";
import { Tenant, TenantSchema } from "src/_cores/entities/tenant.entity";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Tenant.name, schema: TenantSchema },
        ]),
    ],
    controllers: [TenantController],
    providers: [TenantService],
    exports: [TenantService]
})
export class TenantModule { }