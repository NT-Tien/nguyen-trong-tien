import { Body, Controller, Delete, Get, Headers, Inject, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { FilterQuery } from "mongoose";
import { BaseDTO } from "src/_cores/common/base/dto.base";
import { SearchParams } from "src/_cores/utils/decorators/search.decorator";
import { AdminGuard } from "../_auth/guards/admin.guard";
import { MODULE_VERSION } from "../version.config";
import { TenantService } from "./tenant.service";
import { TenantDto } from "./dto/tenant.dto";
import { PermissionGuard } from "../_auth/guards/permission.guard";

@ApiTags(`tenant v${MODULE_VERSION}`)
@UseGuards(PermissionGuard)
@Controller({ path: "tenant", version: MODULE_VERSION, })
export class TenantController {
    constructor(@Inject() readonly tenantService: TenantService) { }

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
    ): Promise<any> {
        if (limit.toString() === 'all') limit = 10;
        const { filterQuery, sortQuery, projection } = params;
        const populateFields = [
            'created_by', 
            'updated_by',
        ];
        return this.tenantService.findAllQuery(
            populateFields,
            filterQuery,
            projection,
            sortQuery,
            limit,
            (skip - 1) * limit < 0 ? 0 : (skip - 1) * limit,
        );
    }

    @ApiBearerAuth()
    @Get(':id')
    async getOne(@Param('id') id: string) {
        const populateFields = [
            'created_by', 
            'updated_by', 
        ];
        return this.tenantService.findOne(id, populateFields);
    }

    @ApiBearerAuth()
    @UseGuards(AdminGuard)
    @Post()
    async create(
        @Headers('user') user: any,
        @Body() data: TenantDto.CreateTenantDto
    ) {
        data.created_by = user.id;
        data.updated_by = user.id;
        return this.tenantService.create(
            BaseDTO.plainToClass(TenantDto.CreateTenantDto, data),
        );
    }

    @ApiBearerAuth()
    @UseGuards(AdminGuard)
    @Put(':id')
    async update(
        @Param('id') id: string,
        @Headers('user') user: any,
        @Body() data: TenantDto.UpdateTenantDto,
    ) {
        data.updated_by = user.id;
        return this.tenantService.update(
            id,
            BaseDTO.plainToClass(TenantDto.UpdateTenantDto, data),
        );
    }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Delete()
    async delete(@Query('ids') ids: string) {
        let idArr = ids.split(',');
        for (let i = 0; i < idArr.length; i++) {
            await this.tenantService.hardDelete(idArr[i]);
        }
        return { message: 'Delete successfully' };
    }


}