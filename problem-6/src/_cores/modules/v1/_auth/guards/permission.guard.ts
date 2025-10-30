import { CanActivate, ExecutionContext, HttpException, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { JWTGuard } from './jwt.guard';
import { ROLE_SYSTEM } from 'src/_cores/entities/user.entity';
import { FilterType } from 'src/_cores/entities/role.entity';

@Injectable()
export class PermissionGuard extends JWTGuard implements CanActivate {
    constructor(
        protected jwtService: JwtService,
        @Inject() protected reflector: Reflector,
        @Inject('AUTH_SERVICE_TIENNT') protected readonly authService: AuthService,
    ) {
        super(jwtService, authService);
    }
    async canActivate(context: ExecutionContext): Promise<boolean> {

        if (!super.canActivate(context)) return false;

        const request = context.switchToHttp().getRequest();
        const { params, headers, method } = request;
        const user = headers['user'] as any;
        const tenant_id = headers['x-tenant-id'] as string;

        let entity = params.entity || this.reflector.get<string>('entity', context.getHandler());

        if (!entity) throw new HttpException('Entity not found', 403);

        if (user?.role_system === ROLE_SYSTEM.ADMIN) return true;

        let profile = null;

        try {
            profile = await this.authService.getProfile(user?.email);
        } catch (error) {
            throw new HttpException('User not found', 403);
        }

        if (!profile) throw new HttpException('User not found', 403);

        let permission = profile.role.find(tenant => tenant.tenant_id?._id.toString() === tenant_id);
        if (!permission) throw new HttpException('Your role not have permission for tenant', 403);

        // ! handle for access junntion table, entity start with _ => junction table, _entity1-entity2
        if (entity.startsWith('_')) {
            // ? split entity to entity1, entity2, sign is '-' and '_'
            let entities = entity.split(/-|_/);
            entity = entities[0];
            if (method !== 'POST' && method !== 'DELETE')
                throw new HttpException('Access (post, delete) method for juntions conllection only!', 403);
        }
        
        let entityPermission = permission.permission.find(e => e.entity === entity);

        if (!entityPermission) throw new HttpException('Your role not have permission for entity', 403);

        // method get => get, get-all
        let methodPermission = entityPermission.filter.find(f => f.includes(method.toLowerCase()));

        if (methodPermission) {
            if (method === 'GET') {
                const hasPermission = entityPermission.filter.find(f => {
                    if (f === FilterType.GET_ALL && !params.id) {
                        console.log('GET_ALL');
                        user[FilterType.GET_ALL] = true;
                        return true;
                    }
                    if (f === FilterType.GET && params.id) {
                        user[FilterType.GET] = true;
                        return true;
                    }
                    return false;
                });
                if (hasPermission) return true;
            }
            else if (method === 'POST') {
                const hasPermission = entityPermission.filter.find(f => {
                    if (f === FilterType.POST) {
                        user[FilterType.POST] = true;
                        this.filterAccessField(entityPermission, request);
                        return true;
                    }
                    return false;
                });
                if (hasPermission) return true;
            }
            else if (method === 'PUT') {
                const hasPermission = entityPermission.filter.find(f => {
                    if (f === FilterType.PUT) {
                        user[FilterType.PUT] = true;
                        this.filterAccessField(entityPermission, request);
                        return true;
                    }
                    return false;
                });
                if (hasPermission) return true;
            }
            else if (method === 'DELETE') {
                const hasPermission = entityPermission.filter.find(f => {
                    if (f === FilterType.DELETE) {
                        user[FilterType.DELETE] = true;
                        return true;
                    }
                    return false;
                });
                if (hasPermission) return true;
            }
        }
        return false;
    }

    async filterAccessField(entityPermission: any, request: any) {
        if (request?.body) {
            let body = request.body;
            let accessField = entityPermission.access_field;
            if (accessField?.length > 0) {
                let keys = Object.keys(body);
                keys.forEach(key => {
                    if (!accessField.includes(key)) delete body[key];
                });
            }
        }
    }

}