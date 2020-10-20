import { Collection } from "fireorm"


@Collection('vouchers')
export class Voucher {

    id: string
    active_from: number
    active_to: number
    is_decrease: boolean
    percent: number
    max_amount: number
    amount: number
    services: string[]
    user_tags: string[]
    quantity: number
    remain_quantity: number 

}