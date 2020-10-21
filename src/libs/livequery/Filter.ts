
export const FilterExpressions = ({
    eq: (a, b) => a == b,
    ne: (a, b) => a != b,
    lt: (a, b) => a < b,
    lte: (a, b) => a <= b,
    gt: (a, b) => a > b,
    gte: (a, b) => a >= b,
    in: (a, b: any[]) => b.includes(a),
    nin: (a, b: any[]) => !b.includes(a),
    array_contains: (a: any[], b: any[]) => a.some(i => b.includes(i))
})


export const FilterExpressionsList = Object.keys(FilterExpressions)

export type QueryFilter = {
    key: string,
    expression: keyof typeof FilterExpressions,
    value: number | string | boolean | null
}

type Request = {
    headers: { [key: string]: string }
    query: { [key: string]: string },
    body: { [key: string]: string },
}

export type LiveQuery = {
    use_data: boolean,
    live_session: string | null,
    limit: number,
    filters: QueryFilter[],
    order_by: string,
    cursor: string | null,
    sort: 'asc' | 'desc'
}

export const QueryFilterParser = (request: Request) => {

    const use_data = request.headers.usedata == 'false' ? false : true
    const live_session = request.headers.uselive || null
    const limit = isNaN(request.query._limit as any) ? 10 : Math.max(Number(request.query._limit), 50)
    const cursor = request.query._cursor || request.headers.cursor || null
    const order_by = request.query._order_by || null


    const filters = Object
        .entries(request.query)
        .filter(item => item[0][0] != '_')
        .map(([key, filterString]) => {

            const conditions = typeof filterString == 'string' ? [filterString] : filterString as any[]
            const filters = conditions.map(c => {
                const condition = c.includes('|') ? c : `eq|${c}`
                const [expression, value] = condition.trim().split('|') as [string, string]
                if (!FilterExpressionsList.includes(expression)) throw 'INVAILD_FUNCTION'
                if (value?.includes('"')) return { key, expression, value: JSON.parse(value) }
                return { key, expression, value: !isNaN(value as any) ? Number(value) : value }

            })
            return filters
        })
        .flat(1) as QueryFilter[]

    return {
        use_data,
        live_session,
        limit,
        filters,
        order_by,
        cursor
    } as LiveQuery

}

export const isFilterMatch = <T>(data: T, filters: QueryFilter[]) => filters.every(
    ({ expression, key, value }) => FilterExpressions[expression](data[key], value as any)
)
