import { Collection } from "fireorm"

export class ProviderServiceActionFormItem {


}

export type ProviderServiceActionAdvanceOption = {
    id: string
    label: string
    form: ProviderServiceActionFormItem[]
}

export class ProviderServiceActionType {
    type: string
    by: string
}

@Collection('actions')
export class ProviderServiceAction {
    id: string
    endpoint: string
    method: 'GET' | 'POST'
    name: string
    title: string
    price_function?: string
    for_order_only: boolean
    mapping: string
    action_type: ProviderServiceActionType
    form: ProviderServiceActionFormItem[]
    advance_options: ProviderServiceActionAdvanceOption[]
}