import { NestFactory } from "@nestjs/core"
import { Logger } from "@nestjs/common"
import { json } from "body-parser"
import { AppModule } from "./api.module";
import { WsAdapter } from '@nestjs/platform-ws'

setImmediate(async () => {
    const app = await NestFactory.create(AppModule)
    app.useWebSocketAdapter(new WsAdapter(app));
    app.enableCors()
    app.use(json({ limit: "100mb" }))
    const PORT = Number(process.env.API_PORT || 8888)
    await app.listen(PORT)
    Logger.log(`Server is listening on ${PORT}`)
})