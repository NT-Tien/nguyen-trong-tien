import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthRequestDto } from './dto/request.dto';
import { ROLE_SYSTEM, User } from 'src/_cores/entities/user.entity';
import { Role } from 'src/_cores/entities/role.entity';
import { Tenant } from 'src/_cores/entities/tenant.entity';
import { REDIS_CONNECT_COMMON } from 'src/_cores/config/database/redis.config';

@Injectable()
export class AuthService {

  redisClient: any;

  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name)
    private readonly accountModel: Model<User>,
    @InjectModel(Role.name)
    private readonly roleModel: Model<Role>,
    @InjectModel(Tenant.name)
    private readonly tenantModel: Model<Tenant>,
  ) {
    this.redisClient = REDIS_CONNECT_COMMON;
  }

  async getProfile(email: string): Promise<any> {
    let profile = await this.accountModel.findOne({ email: email }).populate([
      {
        path: 'role',
        model: Role.name,
        populate: {
          path: 'tenant_id',
          model: Tenant.name, // chỗ này phải viết hoa chữ cái đầu
        }
      },
      {
        path: 'featured_image',
        model: 'Media',
      },
    ]).exec();
    if (!profile) throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
    profile.password = undefined;
    let result = {
      ...profile.toJSON()
    } as any;
    if (result.featured_image) {
      result.featured_image = result.featured_image?.length > 1 ? result.featured_image : result.featured_image[0];
    }
    return result;
  }

  async login(email: string, password: string): Promise<any> {
    const account = await this.accountModel.findOne({ email: email }).exec();
    
    if (!account)
      throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
    if (
      !bcrypt.compareSync(password, account.password) ||
      account.is_active === false
    )
      throw new HttpException(
        'Account info is not valid',
        HttpStatus.BAD_REQUEST,
      );
    let accessToken = await this.jwtService.signAsync({
      id: account.id,
      email: account.email,
      username: account.username,
      phone: account.phone,
      role_system: account.role_system,
      role: account.role,
      featured_image: account.featured_image,
      role_front: account.role_front,
      hashKey: await this.assignToken(),
    });
    return {
      accessToken: accessToken,
      user: {
        id: account.id,
        email: account.email,
        username: account.username,
        phone: account.phone,
        role_system: account.role_system,
        role: account.role,
        featured_image: account.featured_image,
        role_front: account.role_front,
      },
    };
  }

  async logout(user_decoded: any): Promise<void> {
    await this.removeToken(user_decoded.hashKey);
  }

  async register(data: AuthRequestDto.RegisterDataDto): Promise<any> {
    const account = await this.accountModel.findOne({ email: data.email });
    if (account)
      throw new HttpException('User is exist', HttpStatus.BAD_REQUEST);
    const result = await this.accountModel.create(data);
    result.password = undefined;
    return result;
  }

  async assignToken(): Promise<string> {
    const hashKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    await this.redisClient.setex(":token-session:" + hashKey, 60 * 60 * 24 * 7, 'true');
    return hashKey;
  }

  async removeToken(key: string): Promise<void> {
    await this.redisClient.del(":token-session:" + key);
  }

  async validateToken(key: string): Promise<boolean> {
    const result = await this.redisClient.get(":token-session:" + key);
    return result ? true : false;
  }

}
