import { Db, ObjectId } from 'mongodb'
import { LiveQuery } from './types'



export async function MongoDBQueryMapper<T>(db: Db, query: LiveQuery, hide_fields: string[] = []) {

    let where = {}

    const mapper = {
        eq: (key: string, value: any) => where[key] = value,
        like: (key: string, value: any) => where[key] = { $regex: value },
        ne: (key: string, value: any) => where[key] = { $ne: value },
        lt: (key: string, value: any) => where[key] = { $lt: value },
        lte: (key: string, value: any) => where[key] = { $lte: value },
        gt: (key: string, value: any) => where[key] = { $gt: value },
        gte: (key: string, value: any) => where[key] = { $gte: value },
    }

    for (const { expression, key, value } of query.filters) mapper[expression] && mapper[expression](key, value)

    // Paging  
    const order_by = query.order_by || 'id'
    const sort = query.sort == 'asc' ? '$gt' : '$lt'
    if (query.cursor) {
        const value = JSON.parse(Buffer.from(query.cursor, 'base64').toString('utf8'))
        if (order_by == 'id') {
            where['_id'] = { [sort]: new ObjectId(value) }
        } else {
            where[order_by] = { [sort]: value }
        }

    }

    const aggregate_list = [
        ...query.refs.map(({ id }, index) => {

            const next = query.refs[index + 1]

            return [
                ...id ? [{ $match: { _id: new ObjectId(id) } }] : [],
                ...next?.collection ? [
                    { $unwind: `$@@${next.collection}` },
                    { $replaceRoot: { newRoot: `$@@${next.collection}` } }
                ] : []
            ]
        }).flat(100),

        { $match: where },
        {
            $replaceRoot: {
                newRoot: {
                    $arrayToObject: {
                        $filter: {
                            input: { $objectToArray: "$$ROOT" },
                            cond: {
                                $regexMatch: { input: "$$this.k", regex: /^(?!@@)/ }
                            }
                        }
                    }
                }
            }
        },

        {
            $addFields: { id: "$_id" }
        },
        {
            $project: {
                _id: 0,
                ...hide_fields.reduce((p, c) => (p[c] = 0, p), {})
            }
        }
    ]

    const data = await db.collection(query.refs[0].collection).aggregate(aggregate_list).limit(query.limit + 1).toArray()
    const has_more = data.length > query.limit
    const end_cursor = has_more ? Buffer.from(JSON.stringify((data[data.length - 1][order_by]))).toString('base64') : null

    return {
        items: data.slice(0, query.limit),
        order_by,
        sort: query.sort,
        has_more,
        end_cursor
    }

}