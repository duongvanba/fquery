import { Controller, Param, Post, Body, UseInterceptors, UploadedFile, UseGuards, Delete, Put, Inject, Headers, Get, Query } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm';
import { FindConditions, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { User } from './decorators/User';
import { QueryFilterParser, isFilterMatch } from './libs/livequery/Filter';
import { TypeormQueryMapper } from './libs/livequery/TypeormQuery';

import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,
} from '@nestjs/websockets';
import { Server } from 'ws';
import { WSGateway } from './ws';


@Controller('users')
export class UserController {

    @WebSocketServer()
    server: Server


    private users = [{ id: '#1', name: 'ba' }]

    constructor(
        private ws: WSGateway
    ) { }

    @Get()
    async getv(
        @Query() query: any,
        @Query('_orderBy') orderBy: string,
        @Query('_sort') sort: 'asc' | 'desc',
        @Query('_limit') limit: number,
        @Query('_cursor') cursor: string | number,
        @Headers('livequery_token') connection_id: string,
        @Headers('realtime_only') realtime_only: boolean = false
    ) { 
        const filters = QueryFilterParser(query)

        const data = realtime_only ? [] : this.users.filter(u => isFilterMatch(u, filters))
        const realtime_subscription = connection_id && this.ws.subscribe('users', connection_id, filters)
        const paging = {
            has_more: false,
            next_cursor: '#8dhvjfbvnjksdfhbuxgdfuhb'
        }

        return {
            data,
            paging,
            realtime_subscription
        }

    }

    @Post()
    async add_user(
        @Body() user: { id: string, name: string }
    ) {
        this.users.push(user)
        this.ws.broadcast('users', [{ data: user, type: 'added' }])
    }

}
