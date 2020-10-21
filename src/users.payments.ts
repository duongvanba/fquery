import { Controller, Param, Post, Body, Get, Query, Req } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './decorators/User';
import { QueryFilterParser, isFilterMatch } from './libs/livequery/Filter';

import {
    WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'ws';
import { WSGateway } from './ws';
import { Request } from 'express';
import { TypeormQueryMapper } from './libs/livequery/TypeormQueryMapper';

@Controller('@users/:id/payments')
export class UserPaymentController {

    @WebSocketServer()
    server: Server


    private users = [{ id: '#1', name: 'ba' }]

    constructor(private ws: WSGateway) { }

    @Get()
    async list(
        @Req() request: Request
    ) {
        console.log('ahihi')
        const query = QueryFilterParser(request)

        const data = query.use_data ? TypeormQueryMapper(null, query) : null


        const realtime_subscription = query.live_session && this.ws.subscribe('users', query.live_session, query.filters)

        return {
            data,
            live: realtime_subscription ? { session: realtime_subscription } : null
        }
    }

    @Post( )
    async create(
        @Body() data: any
    ) {
        return {success:true,from:'UserPaymentController'}
        await this.ws.broadcast('users', [{ type: 'added', data }])
    }

}
