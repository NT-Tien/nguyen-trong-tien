import { PartialType } from '@nestjs/swagger';
import { Role } from 'src/_cores/entities/role.entity';

export namespace RoleDto {
  export class CreateRoleDto extends Role { }
  export class UpdateRoleDto extends PartialType(CreateRoleDto) { }
}