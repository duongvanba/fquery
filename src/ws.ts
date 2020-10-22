import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer, 
} from '@nestjs/websockets';
import Websocket from 'ws';
import { Server } from 'ws'
import { v4 } from 'uuid'
import { AsyncForEach } from './helpers/Loop'; 
import { QueryFilter } from './libs/livequery/types';
import { isFilterMatch } from './libs/livequery/FilterExpressions';


type CollectionID = string
type ConnectionID = string
type SubscriptionID = string


@WebSocketGateway()
export class WSGateway {


    @WebSocketServer() server: Server

    private refs = new Map<CollectionID, Map<ConnectionID, Map<SubscriptionID, QueryFilter[]>>>()
    private connections = new Map<string, { socket: Websocket, refs: Set<string> }>()

    subscribe(ref: string, connection_id: string, filters: QueryFilter[]) {
        if (!this.connections.has(connection_id)) throw 'CONNECTION_NOT_FOUND'

        if (!this.refs.has(ref)) this.refs.set(ref, new Map())
        if (!this.refs.get(ref).has(connection_id)) this.refs.get(ref).set(connection_id, new Map())
        const id = v4()
        this.refs.get(ref).get(connection_id).set(id, filters)
        console.log(`Active realtime subscription from #${connection_id} at <${ref}> with filters`, { filters })
        return id
    }

    async broadcast<T extends { id: string }>(ref: string, changes: Array<{ data: T, type: 'added' | 'modified' | 'deleted' }>) {
        const subscriptions = this.refs.get(ref)
        console.log({ subscriptions })
        if (!subscriptions) return
        await AsyncForEach([...subscriptions.entries()], async ([connection_id, listeners]) => {
            await AsyncForEach([...listeners.entries()], async ([id, filters]) => {

                const matched_changes = changes.filter(c => isFilterMatch(c.data, filters)) 
                if (matched_changes.length == 0) return
                await this.connections.get(connection_id)?.socket.send(JSON.stringify({ ref, changes: matched_changes }))
            })
        })
    }
 

    @SubscribeMessage('auth')
    auth(
        @MessageBody() data: { authorization: string },
        @ConnectedSocket() socket: Websocket
    ) {
        const connection_id = v4()
        this.connections.set(connection_id, { refs: new Set(), socket })
        console.log(`Your connection id ${connection_id}`)
        return { error: false }
    }

    @SubscribeMessage('unsubscribe')
    unsubscribe(
        @MessageBody() data: { ref: string },
        @ConnectedSocket() socket: Websocket & { id: string }
    ) {
        if (!this.connections.has(socket.id)) return
        const refs = [... this.connections.get(socket.id).refs]
        for (const ref of refs) this.refs.get(ref)?.get(socket.id)?.delete(data.ref)
        return { error: false }
    }




}
