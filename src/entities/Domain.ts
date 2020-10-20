import { Collection, ISubCollection, SubCollection } from "fireorm"
import { DomainService } from "./DomainService"
import { DomainUser } from "./DomainUser"
import { Notification } from "./Notification"
import { PaymentMethod } from "./PaymentMethod"


@Collection('domains')
export class Domain {
    id: string
    site_name: string
    domain: string
    owner_id: string
    owner_email: string
    ref_user_ids: string[]
    domain_ids: string[]

    @SubCollection(DomainUser)
    users: ISubCollection<DomainUser>

    @SubCollection(DomainService)
    services: ISubCollection<DomainService>

    @SubCollection(Notification)
    notifications: ISubCollection<Notification>

    @SubCollection(PaymentMethod)
    payment_methods: ISubCollection<PaymentMethod>
}