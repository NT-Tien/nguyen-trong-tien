import { PartialType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Tenant } from 'src/_cores/entities/tenant.entity';

export namespace TenantDto {
  export class CreateTenantDto extends Tenant { }
  export class UpdateTenantDto extends PartialType(CreateTenantDto) {
    @Expose()
    id: string;
   }
}