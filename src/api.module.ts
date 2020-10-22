import { Module, Controller } from "@nestjs/common";
import { Db, MongoClient } from "mongodb";
import { RealtimeGenericController } from "./all.controller";
import { WSGateway } from "./ws";


@Module({
    controllers: [RealtimeGenericController],
    providers: [
        {
            provide: Db,
            useFactory: async () => {
                const connection = await MongoClient.connect(
                    'mongodb://root:root@localhost:27017',
                    {
                        useNewUrlParser: true,
                        useUnifiedTopology: true
                    }
                )
                const db = await connection.db('test')
                return db
            }
        },
        WSGateway
    ]
})
export class AppModule { }
