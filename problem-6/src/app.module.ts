import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AllExceptionsFilter } from './_cores/common/exceptions/catch.exception';
import { ResponseInterceptor } from './_cores/common/interceptors/response.interceptor';
import { CoreModule } from './_cores/modules/core.module';
import { MONGO_CONFIG } from './_cores/config/database/mongo.config';

@Module({
  imports: [
    MongooseModule.forRoot(`${MONGO_CONFIG.url}`),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({
      ignoreErrors: true,
    }),
    CoreModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
