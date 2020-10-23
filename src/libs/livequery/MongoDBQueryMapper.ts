import { execFileSync } from 'child_process'
import { Db, ObjectId } from 'mongodb'
import { isOmittedExpression } from 'typescript'
import { LiveQuery } from './types'

function omit(data: any, keys: string[]) {
    let newObj = {}
    for (const key in data) if (!keys.includes(key)) newObj[key] = data[key]
    return newObj
}

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

    // console.log(JSON.stringify(aggregate_list, null, 2))

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



export async function MongoDBUpdateMapper(db: Db, refs: Array<{ collection: string, id: string }>, _data: any, overwrite: boolean = false) {

    // If create new 
    const firstRef = refs[0]
    const lastRef = refs[refs.length - 1]

    const data = omit(_data, ['id', '_id'])



    if (!lastRef.id) {
        const id = new ObjectId()
        const new_data = { _id: id, ...data }

        // Push 
        if (refs.length == 1) {
            await db.collection(firstRef.collection).insertOne(new_data)
            return { id, ...data }
        }

        // Nested push
        const path = refs.slice(1, refs.length).map(({ collection, id }, index) => `@@${collection}${id ? `.$[key${index}]` : ''}`).join('.')
        const arrayFilters = [
            ...refs.slice(1, refs.length - 1).map(({ id }, index) => ({
                [`key${index}._id`]: new ObjectId(id)
            }))
        ]

        const args = [
            firstRef.id ? { _id: new ObjectId(firstRef.id) } : {},
            {
                $push: path.length > 0 ? { [path]: new_data } : new_data
            },
            { arrayFilters }
        ]
        // console.log(JSON.stringify(args, null, 2))
        await (db.collection(firstRef.collection).updateOne as Function)(...args)

        return { id, ...data }

    }

    // Update nested
    const path = refs.slice(1, refs.length).map(({ collection, id }, index) => `@@${collection}.$[key${index}]`).join('.')
    let $set = {}
    let $unset = {}
    if (overwrite) {
        path.length > 0 ? ($set[path] = data) : ($set = data)
    } else {
        for (const key in data) {
            if (data[key] == null) {
                $unset[`${path ? `${path}.` : ''}${key}`] = true
                continue
            }
            $set[`${path ? `${path}.` : ''}${key}`] = data[key]
        }
    }

    const updater = { ...Object.keys($set).length > 0 ? { $set } : {}, ...Object.keys($unset).length > 0 ? { $unset } : {} }
    const arrayFilters = [
        ...refs.slice(1, refs.length).map(({ id }, index) => ({
            [`key${index}._id`]: new ObjectId(id)
        }))
    ]
    const { result: { nModified } } = await db.collection(firstRef.collection).updateOne({ _id: new ObjectId(firstRef.id) }, updater, { arrayFilters })

    if (nModified == 0) throw 'NOT_FOUND'

    return { ..._data, id: lastRef.id }
}


export async function MongoDBDeleteMapper(db: Db, refs: Array<{ collection: string, id: string }>) {

    const firstRef = refs[0]
    const lastRef = refs[refs.length - 1]

    if (refs.length == 1) {
        await db.collection(refs[0].collection).deleteOne({
            _id: new ObjectId(refs[0].id)
        })
        return
    }


    // Update nested
    const path = refs.slice(1, refs.length).map(({ collection }, index) => `@@${collection}${refs[index + 2]?.id ? `.$[key${index}]` : ''}`).join('.')

    const updater = { $pull: { [path]: { _id: new ObjectId(lastRef.id) } } }
    const arrayFilters = [
        ...refs.slice(1, refs.length - 1).map(({ id }, index) => ({
            [`key${index}._id`]: new ObjectId(id)
        }))
    ]
    // console.log(JSON.stringify({
    //     _id: new ObjectId(firstRef.id),
    //     updater,
    //     arrayFilters
    // }, null, 2))
    const { result: { nModified } } = await db.collection(firstRef.collection).updateOne({ _id: new ObjectId(firstRef.id) }, updater, { arrayFilters })

    if (nModified == 0) throw 'NOT_FOUND'
} 