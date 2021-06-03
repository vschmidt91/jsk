export function SKIToJot(sk)
{
    if (Array.isArray(sk))
    {
        while (sk.length === 1)
            sk = sk[0]
        return Array.prototype.concat.apply(Array(sk.length - 1).fill(1), sk.map(SKIToJot))
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
            default:
                throw Error("Compilation Error: " + sk)
        }
    }
    else
        throw Error("Compilation Error: " + sk.toString())
}
export function JotToSKI(jot)
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
            default:
                throw Error("Compilation Error: " + x.toString())
    }
    }
}