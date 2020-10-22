import { FilterExpressionsList } from "./FilterExpressions"
import { LiveQuery, QueryFilter } from "./types"

type Request = {
    headers: { [key: string]: string }
    query: { [key: string]: string },
    body: { [key: string]: string },
    path: string
}


export const QueryFilterParser = (request: Request) => {
 
    const refs = request.path.split('/').slice(1).map(r => {
        const [collection, id] = r.split('@')
        return { collection, id }
    })

    if (refs.some((current, index) => refs[index + 1] && !current.id && refs[index + 1].collection)) throw 'Require ID to access subcollection'


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
        cursor,
        refs
    } as LiveQuery

}

