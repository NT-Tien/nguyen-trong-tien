import {
    Injectable,
    CanActivate,
    ExecutionContext,
    Inject,
  } from '@nestjs/common';
  import { JWTGuard } from './jwt.guard';
  import { JwtService } from '@nestjs/jwt';
  import { ROLE_SYSTEM } from 'src/_cores/entities/user.entity';
import { AuthService } from '../auth.service';
  
  @Injectable()
  export class AdminGuard extends JWTGuard implements CanActivate {
    constructor(
      protected readonly jwtService: JwtService,
      @Inject('AUTH_SERVICE_TIENNT') protected authService: AuthService,
    ) {
      super(jwtService, authService);
    }
    async canActivate(context: ExecutionContext): Promise<boolean> {
      if (!super.canActivate(context)) {
        return false;
      }
      try {
        const request = context.switchToHttp().getRequest();
        const user = request?.headers?.user as any;
        if (user && user.role_system === ROLE_SYSTEM.ADMIN) {
          return true;
        } else return false;
      } catch (error) {
        return false;
      }
    }
  }
  