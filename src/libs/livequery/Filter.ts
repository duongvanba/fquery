
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

export const QueryFilterParser = (query: any) => Object
    .entries(query)
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




export const isFilterMatch = <T>(data: T, filters: QueryFilter[]) => filters.every(
    ({ expression, key, value }) => FilterExpressions[expression](data[key], value as any)
)

 