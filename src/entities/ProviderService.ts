import { Collection, ISubCollection, SubCollection } from 'fireorm'
import { ProviderServiceAction } from './ProviderServiceAction'


export class ProviderServiceAuth {
    type: 'api_key'
    header?: string
    key: string
}


@Collection('provider-services')
export class ProviderService {
    id: string
    auth: ProviderServiceAuth
    user_id: string

    @SubCollection(ProviderServiceAction)
    actions: ISubCollection<ProviderServiceAction>
}