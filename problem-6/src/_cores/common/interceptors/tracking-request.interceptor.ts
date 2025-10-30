import {
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class TrackingRequestInterceptor implements NestInterceptor {

    private readonly logger = new Logger(TrackingRequestInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const controller = context.getClass().name;
        const handler = context.getHandler().name;
        const now = Date.now();
        return next.handle().pipe(
            tap(() => {
                const responseTime = Date.now() - now;
                this.logger.debug(
                    `Request to ${request.url} handled by ${controller} ${handler} - ${responseTime}ms`
                );
            }),
        );
    }
}