
const sleep = ms => new Promise(s => setTimeout(s, ms))

const InfinityLoopList = Symbol.for('InfinityLoopList')

type InfinityLoopConfig = {
    delay_start: number,
    delay: number,
    wait_for: (...args:any) => Promise<boolean>,
    stop_when: (...args:any) => Promise<boolean> | boolean,
    pause_when: (...args:any) => Promise<boolean> | boolean
}


export const InfinityLoop = (config: Partial<InfinityLoopConfig> = {}) => (target, method) => {
    const list = Reflect.getMetadata(InfinityLoopList, target) || []
    list.push({ ...config, method })
    Reflect.defineMetadata(InfinityLoopList, list, target)
}

export function activeCronJob(target) {
    const list = Reflect.getMetadata(InfinityLoopList, target) as Array<InfinityLoopConfig & { method: string }> || []
    for (const { delay, method, wait_for, pause_when, delay_start, stop_when } of list) {
        setImmediate(async () => {
            delay_start && await sleep(delay_start)
            wait_for && wait_for(target)
            while (true) {
                if (!pause_when || (pause_when && ! await pause_when(target))) await target[method]()
                await sleep(delay || 10000)
                if (stop_when && await stop_when(target)) break
            }
        })
    }

}