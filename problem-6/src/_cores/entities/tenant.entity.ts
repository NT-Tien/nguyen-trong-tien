import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Types } from 'mongoose';
import { IsOptional } from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';
import { appSettings } from '../config/appsettings';
import { User } from './user.entity';


@Schema({ timestamps: appSettings.timeZoneMongoDB, collection: 'tenant' })
export class Tenant {

    @ApiProperty()
    @Expose()
    @Prop({ type: String , required: true, unique: true })
    title: string;

    @ApiProperty()
    @Expose()
    @Prop({type: MongooseSchema.Types.Mixed})
    settings?: any; // only for setting at front-end

    @ApiProperty()
    @IsOptional()
    @Expose()
    @Prop({ default: true })
    is_active: boolean; // for soft delete

    @Expose()
    @Prop({ type: Types.ObjectId, ref: User.name, required: true })
    created_by: string;
  
    @Expose()
    @Prop({ type: Types.ObjectId, ref: User.name , required: true})
    updated_by: string;
    
}

const TenantSchema = SchemaFactory.createForClass(Tenant);

export { TenantSchema };
