import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BaseDTO } from 'src/_cores/common/base/dto.base';
import { MODULE_VERSION } from '../version.config';
import { AuthService } from './auth.service';
import { AuthRequestDto } from './dto/request.dto';
import { AuthResponseDto } from './dto/response.dto';
import { JWTGuard } from './guards/jwt.guard';

@ApiTags(`auth v${MODULE_VERSION}`)
@Controller({ version: MODULE_VERSION, path: 'auth' })
export class AuthController {
    constructor(@Inject('AUTH_SERVICE_TIENNT') readonly authService: AuthService) { }

    @ApiResponse({ status: 201, type: AuthResponseDto.RegisterResponseDto })
    @Post('/register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() data: AuthRequestDto.RegisterDataDto) {
        return await this.authService.register(BaseDTO.plainToClass(AuthRequestDto.RegisterDataDto, data));
    }

    @ApiResponse({ status: 200, type: AuthResponseDto.LoginResponseDto })
    @Post('/login')
    @HttpCode(HttpStatus.OK)
    login(@Body() data: AuthRequestDto.LoginLocalDataDto) {
        return this.authService.login(data.email, data.password);
    }

    @UseGuards(JWTGuard)
    @Get('/logout')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    async logout(@Headers('user') user: any) {
        return this.authService.logout(user);
    }

    @UseGuards(JWTGuard)
    @ApiResponse({ status: 200, type: AuthResponseDto.GetAccountResponseDto })
    // @CacheRedisTTL(600)
    // @CacheRedisKey(CACHE_KEYS.ACCOUNT)
    // @UseInterceptors(CacheInterceptor)
    @Get('/me')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    async getAccount(@Headers('user') user: any) {
        return this.authService.getProfile(user.email);
    }


}
