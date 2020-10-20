import { Module, Controller } from "@nestjs/common";
import { UserController } from "./user.controller";
import { WSGateway } from "./ws";


@Module({
    controllers: [UserController],
    providers: [WSGateway]
})
export class AppModule { }
