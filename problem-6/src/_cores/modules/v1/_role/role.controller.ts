import { Body, Controller, Delete, Get, Headers, Inject, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { FilterQuery } from "mongoose";
import { BaseDTO } from "src/_cores/common/base/dto.base";
import { SearchParams } from "src/_cores/utils/decorators/search.decorator";
import { AdminGuard } from "../_auth/guards/admin.guard";
import { RoleDto } from "./dto/role.dto";
import { MODULE_VERSION } from "../version.config";
import { RoleService } from "./role.service";

@ApiTags(`role v${MODULE_VERSION}`)
@UseGuards(AdminGuard)
@Controller({ path: "role", version: MODULE_VERSION, })
export class RoleController {
    constructor(@Inject() readonly roleService: RoleService) { }

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
        const populateFields = ['created_by', 'updated_by'];
        return this.roleService.findAllQuery(
            populateFields,
            filterQuery,
            projection,
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
        const populateFields = ['created_by', 'updated_by'];
        return this.roleService.findOne(id, populateFields, tenant_id);
    }

    @ApiBearerAuth()
    @Post()
    async create(
        @Headers('x-tenant-id') tenant_id: string,
        @Headers('user') user: any,
        @Body() data: RoleDto.CreateRoleDto,
    ) {
        data.tenant_id = tenant_id;
        data.created_by = user.id;
        data.updated_by = user.id;
        return this.roleService.create(
            BaseDTO.plainToClass(RoleDto.CreateRoleDto, data),
        );
    }

    @ApiBearerAuth()
    @Put(':id')
    async update(
        @Param('id') id: string,
        @Headers('x-tenant-id') tenant_id: string,
        @Headers('user') user: any,
        @Body() data: RoleDto.UpdateRoleDto,
    ) {
        data.tenant_id = tenant_id;
        data.updated_by = user.id;
        return this.roleService.update(
            id,
            BaseDTO.plainToClass(RoleDto.UpdateRoleDto, data),
        );
    }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Delete()
    async delete(@Query('ids') ids: string) {
        let idArr = ids.split(',');
        for (let i = 0; i < idArr.length; i++) {
            await this.roleService.hardDelete(idArr[i]);
        }
        return { message: 'Delete successfully' };
    }


}