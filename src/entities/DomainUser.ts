import { Collection, ISubCollection, SubCollection } from "fireorm";
import { PaymentHistory } from "./PaymentHistory";

type Pricing = {
    [service: string]: number
}

@Collection('users')
export class DomainUser {
    id: string
    balance: number
    email:string

    pricing: Pricing

    @SubCollection(PaymentHistory)
    payment_histories: ISubCollection<PaymentHistory>
}