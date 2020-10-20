import { Collection } from "fireorm";


@Collection('payment-histories')
export class PaymentHistory {


    id: string
    icon: string
    amount: number
    service_name: string
    total: number
    created_at: number
    message: string
    from?: string
    from_user_id?: string
    to?: string
    to_user_id?: string
}