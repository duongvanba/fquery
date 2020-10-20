


export async function BatchAsync<ResultType>(
    n: number,
    f: (index?: number) => Promise<ResultType | void>,
    err: (index: number) => Promise<ResultType | void> = async () => { }
): Promise<ResultType[]> {

    let queue = []
    for (let i = 1; i <= n; i++) queue.push(f(<any>i).catch(e => err(i)))
    return (await Promise.all(queue)).filter(f => f != undefined)
}


export async function BatchSync<ResultType>(
    n: number,
    f: (index?: number) => Promise<ResultType | void>,
    err: (index: number) => Promise<ResultType | void> = async () => { }
): Promise<ResultType[]> {

    let queue = []
    for (let i = 1; i <= n; i++) queue.push(await f(<any>i).catch(e => err(i)))
    return (await Promise.all(queue)).filter(f => f != undefined)
}



export async function AsyncForEach<ItemType, ResultType>(
    items: ItemType[],
    f: (item: ItemType, index?: number) => Promise<ResultType | void>
): Promise<ResultType[]> {

    let queue = []
    items.map((item, index) => queue.push(f(item, index).catch(() => { })))
    return (await Promise.all(queue)).filter(f => f != undefined)
}



export async function SyncForEach<ItemType, ResultType>(
    items: ItemType[],
    f: (item: ItemType, index?: number) => Promise<ResultType | void>,
    err: (item: ItemType, index: number) => Promise<ResultType | void> = async () => { }
): Promise<ResultType[]> {

    let queue = []
    for (const [index, item] of Object.entries<ItemType>(items)) {
        queue.push(await f(item, Number(index)).catch(e => err(item, Number(index))))
    }
    return (await Promise.all(queue)).filter(f => f != undefined)
}

export async function AsyncEachBlock<ItemType, ResultType>(
    items: ItemType[],
    block: number,
    f: (item: ItemType, index?: number) => Promise<ResultType | void>,
    on_progress?: (data: ResultType[], index: number, total: number) => Promise<any>
): Promise<ResultType[]> {
    const list = [...items]
    const rs: ResultType[] = []
    while (list.length > 0) {
        const processed = await AsyncForEach(list.splice(0, block), f)
        on_progress && await on_progress(processed, items.length - list.length, items.length)
        for (const r of processed) rs.push(r)
    }
    return rs
}


export async function InfinitiLoop(
    f: () => Promise<any>,
    err: (e: Error) => Promise<any> = async () => { }
) {
    while (true) {
        try {
            if (await f() == true) break
        } catch (e) {
            await err(e)
        }
    }
}



export async function PingInfinity(
    delay: number,
    f: () => Promise<any>,
    err: (e: Error) => Promise<any> = async () => { }
) {
    try {
        await f()
    } catch (e) {
        err(e)
    }

    const task = setInterval(async () => {
        try {
            if (await f() == true) clearInterval(task)
        } catch (e) {
            err(e)
        }
    }, delay)
}

export function GetUniquee<T, K extends keyof T>(items: T[], key: K): T[] {
    let list = new Set()
    return items.filter(item => {
        if (list.has(item[key])) return false
        list.add(item[key])
        return true
    })
}

