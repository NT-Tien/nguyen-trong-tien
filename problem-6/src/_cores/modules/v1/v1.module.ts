import { Module } from "@nestjs/common";
import { AuthModule } from "./_auth/auth.module";
import { UserModule } from "./_user/user.module";
import { RoleModule } from "./_role/role.module";
import { TenantModule } from "./_tenant/tenant.module";

@Module({
    imports: [
        AuthModule,
        UserModule,
        TenantModule,
        RoleModule,
    ],
})
export class V1Module { }