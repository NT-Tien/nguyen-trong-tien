import { PartialType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { ROLE_SYSTEM, User } from 'src/_cores/entities/user.entity';

export namespace UserDto {
  export class CreateUserDto extends User { }
  export class UpdateUserDto extends PartialType(CreateUserDto) { }
}