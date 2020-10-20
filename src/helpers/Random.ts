export class Random {

    static between(a: number, b: number) {
        const n = b - a
        return a + Math.round(Math.random() * n)
    }

    static in<T>(items: T[]) {
        return items[this.between(0, items.length - 1)]
    }
}