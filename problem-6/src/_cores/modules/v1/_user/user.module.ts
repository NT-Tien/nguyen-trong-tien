import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/_cores/entities/user.entity";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { Role, RoleSchema } from "src/_cores/entities/role.entity";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Role.name, schema: RoleSchema },
        ]),
    ],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule { }