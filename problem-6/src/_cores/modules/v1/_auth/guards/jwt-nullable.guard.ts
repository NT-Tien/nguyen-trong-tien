import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JWTGuardNullAble implements CanActivate {

  protected jwtService: JwtService;

  constructor(
    jwtService: JwtService,
    @Inject('AUTH_SERVICE_TIENNT') protected readonly authService: any,
  ) {
    this.jwtService = jwtService;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const authorization = request.headers['authorization'];
      if (!authorization) {
        request.headers.user = {
          _id: 'anonymous',
          username: 'anonymous',
          roles: ['anonymous'],
        }
        return true;
      };
      const token = authorization.split(' ')[1];
      let user = this.jwtService.verify(token);
      request.headers.user = user;
      return await this.authService.validateToken(user.hashKey);
    } catch (error) {
      console.log(error);
      return false;
    }
  }

}
