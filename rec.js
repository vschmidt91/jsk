
const _ = require('lodash')

const base =
{

    //uncomment to enable reductions

    // I: [['S', 'K'], 'K'],
    // U: [['S', 'I'], 'I'],
    // Y: {f: [
    //     {x: ['f', ['x', 'x']]},
    //     {x: ['f', ['x', 'x']]}
    // ]},
    // F: ['T', 'I'],
    // O: {f: {x: ['f', 'x']}},
    // B: [['S', ['K', 'S']], 'K'],
    // C: [['S', [['S', ['K', 'B']], 'S']], ['K', 'K']],
    K: 'T',

    /* BOOLEAN */
    and: {p: {q: ['p', 'q', 'F']}},
    or: {p: {q: ['p', 'T', 'q']}},
    not: 'C',

    /* NUMERALS */
    zero: 'F',
    one: 'O',
    two: ['succ', 'one'],
    three: ['succ', 'two'],

    /* ARITHMETIC */
    succ: ['S', 'B'],
    pred: {n: {f: {x: ['n', {g: {h: ['h', ['g', 'f']]}}, ['K', 'x'], 'I']}}},
    isZero: {n: ['n', ['K', 'F'], 'T']},

    add: {m: {n: {f: {x: ['m', 'f', ['n', 'f', 'x']]}}}},
    sub: {m: {n: ['n', 'pred', 'm']}},
    mul: 'B',
    div1: {c: {n: {m: {f: {x: [[{d: ['isZero', 'd', 'x', ['f', ['c', 'd', 'm', 'f', 'x']]]},['sub', 'n', 'm']]]}}}}},
    div: {n: ['Y', 'div1', ['succ', 'n']]},

    leq: {m: {n: ['isZero', ['sub', 'm', 'n']]}},
    geq: {m: {n: ['isZero', ['sub', 'n', 'm']]}},
    eq: {m: {n: ['and', ['leq', 'm', 'n'], ['geq', 'm', 'n']]}},
    fac: ['Y', {f: {n: ['isZero', 'n', 'one', ['mul', 'n', ['f', ['pred', 'n']]]]}}],
}

const arg = c => Object.keys(c)[0]
const body = c => c[arg(c)]
const size = c => Array.isArray(c) ? 1 + _.sum(c.map(size)) : 1
const print = x => console.log(JSON.stringify(x))

function numeral(n)
{
    switch(n)
    {
        case 0: return 'zero'
        case 1: return 'one'
        case 2: return 'two'
        case 3: return 'three'
    }
    if(n < 10) return ['succ', numeral(n - 1)]
    let k = Math.floor(Math.sqrt(n))
    let r = n - k * k
    switch(r)
    {
        case 0: return ['two', numeral(k)]
        case 1: return ['succ', ['two', numeral(k)]]
        case 2: return ['succ', ['succ', ['two', numeral(k)]]]
    }
    return ['add', ['two', numeral(k)], numeral(r)]
}

function contains(code, fragment)
{
    if(Array.isArray(code))
        return _.some(code, c => contains(c, fragment))
    else if(typeof code === 'object')
        return contains(body(code), fragment)
    else
        return equals(code, fragment)
}

function fan(code)
{
    if(Array.isArray(code))
        return code.reduce((b, t) => b ? [b, t] : t, null)
    else
        return code
}

function equals(a, b)
{
    return a == b || JSON.stringify(a) == JSON.stringify(b)
}

function compile(code)
{
    if(code in base)
        return compile(base[code])
    else if(Array.isArray(code))
        return fan(code.map(compile))
    else if(typeof code === 'object')
    {
        let a = arg(code)
        let b = fan(body(code))
        if(a === b)
            return compile('I')
        else if(!contains(b, a))
            return compile(['K', b])
        else if(Array.isArray(b) && !contains(b[0], a))
            return compile(['B', b[0], { [a]: b[1] }])
        else if(Array.isArray(b) && !contains(b[1], a))
            return compile(['C', {[a]: b[0]}, b[1]])
        else if(Array.isArray(b))
            return compile(['S', {[a]: b[0]}, {[a]: b[1]}])
        else if(typeof b === 'object')
            return compile({ [a]: compile({[arg(b)]: body(b)}) })
    }
    else return code
}

function exec(code)
{
    if(Array.isArray(code))
    {
        let x = code[1]
        if(typeof code[0] === 'function')
            return exec(code[0](exec(x)))
        switch(code[0])
        {
            case 'I': return exec(x)
            case 'U': return exec([x, x])
            case 'Y': return exec([x, ['Y', x]])
        }
        if(Array.isArray(code[0]))
        {
            let f = code[0][1]
            switch(code[0][0])
            {
                case 'F': return exec(x)
                case 'T': return exec(f)
                case 'O': return exec([f, x])
            }
            if(Array.isArray(code[0][0]))
            {
                let g = code[0][0][1]
                switch(code[0][0][0])
                {
                    case 'B': return exec([g, [f, x]])
                    case 'C': return exec([[g, x], f])
                    case 'S': return exec([[g, x], [f, x]])
                }
            }
        }
        let f = exec(code[0])
        if(!equals(f, code[0]))
            return exec([f, code[1]])
    }
    return code
}

const ref = (n, k) => Math.floor(n / k)
const test = (n, k) => exec(compile(['div', numeral(n), numeral(k), n => n + 1, 0]))
const desc = (n, k) => n + ' / ' + k

const random = (from, to) => from + Math.floor((to - from) * Math.random())
const data = _.range(1000).map(i => [random(10, 50), random(5, 10)])

for(const [n, k] of data)
{
    const refResult = ref(n, k)
    const testResult = test(n, k)
    const testDesc = desc(n, k)
    if(testResult === refResult)
        console.log(testDesc + ' = ' + refResult + '\tOK')
    else
        throw new Error(testDesc + ' = ' + refResult + '\trecieved ' + testResult)
}