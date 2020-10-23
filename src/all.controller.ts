import { Controller, Param, Post, Body, Get, Query, Req, Delete } from '@nestjs/common'

import { WSGateway } from './ws';
import { Request } from 'express';
import { TypeormQueryMapper } from './libs/livequery/TypeormQueryMapper';
import { QueryFilterParser, QueryRefParser } from './libs/livequery/QueryFilterParser';
import { MongoDBDeleteMapper, MongoDBQueryMapper, MongoDBUpdateMapper } from './libs/livequery/MongoDBQueryMapper';
import { Db } from 'mongodb';



@Controller('@db/*')
export class RealtimeGenericController {

    constructor(
        private ws: WSGateway,
        private db: Db
    ) { }

    @Get()
    async catchALl(
        @Req() request: Request,
    ) {
        const query = QueryFilterParser(request)
        const data = query.use_data ? await MongoDBQueryMapper(this.db, query) : { items: [] }
        const subscription = query.live_session ? this.ws.subscribe(query) : null

        if (query.target_id) return data.items[0]

        return {
            ...data,
            path: query.path,
            subscription
        }
    }


    @Post()
    async list(
        @Req() request: Request,
        @Body() data: any
    ) {
        return await MongoDBUpdateMapper(
            this.db,
            QueryRefParser(request).refs,
            data
        )
    }

    @Delete()
    async delete(
        @Req() request: Request 
    ) {
        return await MongoDBDeleteMapper(this.db, QueryRefParser(request).refs)
    }
}
