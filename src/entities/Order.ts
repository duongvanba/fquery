import { Collection } from "fireorm";


@Collection('orders')
export class Order {

    id: string

    created_at: number
    status: 'done' | 'processing' | 'error' | 'expired' | 'pause'
    type: 'one-time' | 'time-by-time' | 'time-limit'
    amount: number
    remain_amount: number
    end_time: number
    target: string
    user_id: string
    fullname: string
    description: string
    total:number
}