import { Controller, Param, Post, Body, Get, Query, Req } from '@nestjs/common'
 
import { WSGateway } from './ws';
import { Request } from 'express';
import { TypeormQueryMapper } from './libs/livequery/TypeormQueryMapper';
import { QueryFilterParser } from './libs/livequery/QueryFilterParser';
import { MongoDBQueryMapper } from './libs/livequery/MongoDBQueryMapper';
import { Db  } from 'mongodb';



@Controller('*')
export class RealtimeGenericController {

    constructor(
        private ws: WSGateway,
        private db: Db
    ) { }

    @Get()
    async catchALl(
        @Req() request: Request,
    ) {
        return await MongoDBQueryMapper(this.db, QueryFilterParser(request))
    } 


    @Post()
    async list(
        @Req() request: Request,
        @Param('id') id: string
    ) {
        console.log(request.path)


        // return { collection: `users@${id}/payments`, id, method: 'get' }
        // const query = QueryFilterParser(request)

        // const data = query.use_data ? TypeormQueryMapper(null, query) : null


        // const realtime_subscription = query.live_session && this.ws.subscribe('users', query.live_session, query.filters)

        // return {
        //     data,
        //     live: realtime_subscription ? { session: realtime_subscription } : null
        // }
    }

    // @Post()
    async create(
        @Body() data: any,
        @Param('id') id: string
    ) {
        // return { collection: `users@${id}/payments`, id, method: 'post' }
        // return { success: true, from: 'UserPaymentController' }
        // await this.ws.broadcast('users', [{ type: 'added', data }])
    }

}
