import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO } from 'src/_cores/common/base/dto.base';

export namespace AuthResponseDto {
  export class RegisterResponseDto {
    @ApiProperty({
      example: {
        email: 'example@gmail.com',
        username: 'user',
        phone: '+84999999999',
        deletedAt: null,
        id: 'uuidv4()',
        created_at: new Date(),
        updated_at: new Date(),
        role: 'user',
      },
      nullable: true,
    })
    data: object;

    @ApiProperty({
      example: 'Success',
    })
    message: string;

    @ApiProperty({
      example: 201,
    })
    statusCode: number;
  }
  export class LoginResponseDto {
    @ApiProperty({
      example: 'JWT Token',
    })
    data: string;

    @ApiProperty({
      example: 'Success',
    })
    message: string;

    @ApiProperty({
      example: 200,
    })
    statusCode: number;
  }
  class payloadGetAccountResponseDtoData {
    @ApiProperty({
      example: 'user',
    })
    role: string;
    @ApiProperty({
      example: 'user',
    })
    username: string;
    @ApiProperty({
      example: '+84999999999',
    })
    phone: string;
    @ApiProperty({
      example: null,
    })
    deletedAt: Date;
    @ApiProperty({
      example: 'uuidv4()',
    })
    id: string;
    @ApiProperty({
      example: new Date(),
    })
    created_at: Date;
    @ApiProperty({
      example: new Date(),
    })
    updatedAt: Date;
  }
  export class GetAccountResponseDto extends BaseDTO {
    @ApiProperty({
      type: [payloadGetAccountResponseDtoData],
      nullable: true,
    })
    data: object;

    @ApiProperty({
      example: 'Success',
    })
    message: string;

    @ApiProperty({
      example: 200,
    })
    statusCode: number;
  }
  export class UpdateAccountResponseDto {
    @ApiProperty({
      example: {
        generatedMaps: [],
        raw: [],
        affected: 1,
      },
      nullable: true,
    })
    data: object;

    @ApiProperty({
      example: 'Success',
    })
    message: string;

    @ApiProperty({
      example: 200,
    })
    statusCode: number;
  }
}
