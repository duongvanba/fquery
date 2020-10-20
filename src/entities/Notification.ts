import { Collection } from "fireorm"


@Collection('notifications')
export class Notification {

    id: string
    icon: string
    title: string
    description: string
    images?: string[]
    videos?: string[]
    created_at: number
    bubble: boolean

}