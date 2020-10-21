import { Controller, Param, Post, Body, Get, Query, Req, Redirect, Res } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './decorators/User';
import { QueryFilterParser, isFilterMatch } from './libs/livequery/Filter';
import { Response } from 'express'

import {
    WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'ws';
import { WSGateway } from './ws';
import { Request } from 'express';
import { TypeormQueryMapper } from './libs/livequery/TypeormQueryMapper';
import { Any } from 'typeorm';
import { UserPaymentController } from './users.payments'


@Controller('users')
export class UserController {

    @WebSocketServer()
    server: Server


    private users = [{ id: '#1', name: 'ba' }]

    constructor(
        private ws: WSGateway 
    ) { }

    @Get()
    async list(
        @Req() request: Request
    ) {
        const query = QueryFilterParser(request)
        console.log({query})

        // validate

        const data = this.users.filter(x => isFilterMatch(x, query.filters))


        const realtime_subscription = query.live_session && this.ws.subscribe('users', query.live_session, query.filters)

        return {
            data,
            live: realtime_subscription ? { session: realtime_subscription } : null
        }
    }

    @Post()
    async create(
        @Body() data: any
    ) {
        // return { success: true, from: 'UserController' }
        await this.ws.broadcast('users', [{ type: 'added', data }])
    }
 
}
