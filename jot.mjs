export function toJot(sk)
{
    if (Array.isArray(sk))
    {
        while (sk.length === 1)
            sk = sk[0]
        return Array.prototype.concat.apply(Array(sk.length - 1).fill(1), sk.map(this.toJot))
    }
    else if (typeof sk === 'string')
    {
        switch (sk)
        {
            case 'I':
                return [1, 1, 0, 1, 0]
            case 'K':
                return [1, 1, 1, 0, 0]
            case 'S':
                return [1, 1, 1, 1, 1, 0, 0, 0]
        }
    }
}
export function toSK(jot)
{
    let x = []
    let result = x
    while (true)
    {
        switch (jot.pop())
        {
            case undefined:
                return result
            case 0:
                x.push(x = [], 'S', 'K')
                break
            case 1:
                x.push('S', ['K', x = []])
                break
        }
    }
}