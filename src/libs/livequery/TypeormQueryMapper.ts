import { FindConditions, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Not } from "typeorm"
import { QueryFilter } from "./Filter"


export function TypeormQueryMapper<T>(filters: QueryFilter[]): FindConditions<T> {


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

    for (const [key, filter] of Object.entries(filters)) {
        const condition = typeof filter != 'object' ? { eq: filter } : filter
        for (const fn in Object.keys(condition)) mapper[fn] && mapper[fn](key, condition[fn])
    }

    return where
}