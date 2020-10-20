import { Collection } from "fireorm";



@Collection('payment-methods')
export class PaymentMethod{

    id:string
    name:string
    account:string
    owner:string
    message:string
}