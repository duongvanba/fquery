import { Collection, ISubCollection, SubCollection } from "fireorm"
import { Order } from "./Order"


@Collection('services')
export class DomainService {
    id: string

    name: string
    title: string
    icon: string
    visible: boolean
    published: boolean
    min_price: number
    flexible_price: boolean
    config: { [key: string]: string | number }

    @SubCollection(Order)
    orders: ISubCollection<Order>
}