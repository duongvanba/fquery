import { FilterExpressions } from "./FilterExpressions"

export type QueryFilter = {
    key: string,
    expression: 'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte' | 'in' | 'nin' | 'array_contains'
    value: number | string | boolean | null
}



export type LiveQuery = {
    use_data: boolean,
    live_session: string,
    limit: number,
    filters: QueryFilter[],
    order_by: string
    cursor: string,
    sort: 'asc' | 'desc',
    refs: Array<{ collection: string, id: string }>,
    action:string
    path:string
}

