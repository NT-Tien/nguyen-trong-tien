import { Body, Controller, Delete, Get, Headers, Inject, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { FilterQuery } from "mongoose";
import { BaseDTO } from "src/_cores/common/base/dto.base";
import { SearchParams } from "src/_cores/utils/decorators/search.decorator";
import { MODULE_VERSION } from "../version.config";
import { UserDto } from "./dto/user.dto";
import { PermissionGuard } from "../_auth/guards/permission.guard";

@ApiTags(`user v${MODULE_VERSION}`)
@UseGuards(PermissionGuard)
@Controller({ path: "user", version: MODULE_VERSION, })
export class UserController {
    constructor(@Inject() readonly userService: UserService) { }

    @ApiBearerAuth()
    @ApiQuery({
        name: ' ',
        description: '&search[title:in]=oke&projection[title]=1&sort[created_at]=desc',
        required: false,
    })
    @Get()
    async getAllQuery(
        @SearchParams()
        params: {
            filterQuery: FilterQuery<any>;
            sortQuery: Record<string, -1 | 1>;
            projection: Record<string, any>;
        },
        @Query('limit') limit: number = 10,
        @Query('page') skip: number = 1,
        @Headers('x-tenant-id') tenant_id: string,
    ): Promise<any> {
        if (limit.toString() === 'all') limit = 10;
        const { filterQuery, sortQuery, projection } = params;
        const populateFields = [
            {
                path: 'role',
                model: 'Role',
            },
            {
                path: 'featured_image',
                model: 'Media',
            },
            {
                path: 'parent_id',
                model: 'User',
                // hide password field
                select: { password: 0 },
            },
            {
                path: 'updated_by',
                model: 'User',
                select: { username: 1 },
            },
            {
                path: 'created_by',
                model: 'User',
                select: { username: 1 },
            },
        ];
        return this.userService.findAllQuery(
            populateFields,
            filterQuery,
            { ...projection, password: 0 },
            sortQuery,
            limit,
            (skip - 1) * limit < 0 ? 0 : (skip - 1) * limit,
            tenant_id,
        );
    }

    @ApiBearerAuth()
    @Get(':id')
    async getOne(
        @Param('id') id: string,
        @Headers('x-tenant-id') tenant_id: string,
    ) {
        const populateFields = [
            {
                path: 'role',
                model: 'Role',
            },
            {
                path: 'featured_image',
                model: 'Media',
            },
            {
                path: 'parent_id',
                model: 'User',
                // hide password field
                select: { password: 0 },
            },
        ];
        let user = await this.userService.findOne(id, populateFields, tenant_id);
        user.password = undefined;
        return user;
    }

    @ApiBearerAuth()
    @Post()
    async create(@Body() data: UserDto.CreateUserDto) {
        return this.userService.create(
            BaseDTO.plainToClass(UserDto.CreateUserDto, data),
        );
    }

    @ApiBearerAuth()
    @Put(':id')
    async update(
        @Param('id') id: string,
        @Headers('x-tenant-id') tenant_id: string,
        @Body() data: UserDto.UpdateUserDto,
    ) {
        return this.userService.update(
            id,
            BaseDTO.plainToClass(UserDto.UpdateUserDto, data),
            tenant_id,
        );
    }

    @ApiBearerAuth()
    @Delete()
    async delete(
        @Query('ids') ids: string
    ) {
        let idArr = ids.split(',');
        for (let i = 0; i < idArr.length; i++) {
            await this.userService.hardDelete(idArr[i]);
        }
        return { message: 'Delete successfully!' };
    }


}