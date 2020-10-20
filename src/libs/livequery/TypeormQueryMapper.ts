import { FindConditions, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Not, Repository } from "typeorm"
import { LiveQuery, QueryFilter } from "./Filter"


export async function TypeormQueryMapper<T>(
    table: Repository<T>,
    query: LiveQuery
) {


    let where: FindConditions<T> = {}

    const mapper = {
        eq: (key: string, value: any) => where[key] = value,
        like: (key: string, value: any) => where[key] = Like(value),
        ne: (key: string, value: any) => where[key] = Not(value),
        lt: (key: string, value: any) => where[key] = LessThan(value),
        lte: (key: string, value: any) => where[key] = LessThanOrEqual(value),
        gt: (key: string, value: any) => where[key] = MoreThan(value),
        gte: (key: string, value: any) => where[key] = MoreThanOrEqual(value)
    }

    for (const [key, filter] of Object.entries(query.filters)) {
        const condition = typeof filter != 'object' ? { eq: filter } : filter
        for (const fn in Object.keys(condition)) mapper[fn] && mapper[fn](key, condition[fn])
    }

    const compareFunction = query.sort == 'asc' ? LessThanOrEqual : MoreThanOrEqual
    const compareValue = JSON.parse(query.cursor)
    where[query.order_by] = compareFunction(compareValue)

    const items = await table.find({
        where,
        take: query.limit + 1,
        order: {
            [query.order_by]: query.sort.toUpperCase()
        } as any
    })

    return {
        data: {
            items: items.slice(0, items.length - 1),
            has_more: items.length > query.limit,
            cursor: JSON.stringify(items.length[items.length - 2][query.order_by])
        }
    }
}