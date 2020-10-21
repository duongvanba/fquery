import { Module, Controller } from "@nestjs/common";
import { UserController } from "./user.collection";
import { UserPaymentController } from "./users.payments";
import { WSGateway } from "./ws";


@Module({
    controllers: [UserController, UserPaymentController],
    providers: [WSGateway]
})
export class AppModule { }
