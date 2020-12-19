
const _ = require('lodash')

const arg = c => Object.keys(c)[0]
const body = c => c[arg(c)]
const size = c => Array.isArray(c) ? 1 + _.sum(c.map(size)) : 1
const toString = x => Array.isArray(x) ? x.map(toString) : x.toString()
const print = x => console.log(JSON.stringify(toString(x)))
const random = (from, to) => from + Math.floor((to - from) * Math.random())

let jot = require('./jot')()

const base =
{

    //uncomment to enable reductions

    B: [['S', ['K', 'S']], 'K'],
    C: [['S', [['S', ['K', 'B']], 'S']], ['K', 'K']],
    I: [['S', 'K'], 'K'],

    // Y: {f: [
    //     {x: ['f', ['x', 'x']]},
    //     {x: ['f', ['x', 'x']]}
    // ]},

    Y: ['B', 'U', 'Z'],
    Z: ['C', ['B', 'B', 'I'], ['S', 'I', 'I']],

    U: [['S', 'I'], 'I'],
    F: ['K', 'I'],
    T: 'K',

    /* BOOLEAN */
    and: {p: {q: ['p', 'q', 'F']}},
    or: {p: {q: ['p', 'T', 'q']}},
    not: 'C',

    /* PAIR */
    pair: {x: {y: {z: ['z', 'x', 'y']}}},
    first: {p: ['p', 'T']},
    second: {p: ['p', 'F']},

    /* LIST */
    nil: 'F',
    cons: 'pair',
    isNil: {l: ['l', {h: {t: {d: 'F'}}}, 'T']},
    head: 'first',
    tail: 'second',

    /* NUMERALS */
    zero: 'F',
    one: 'I',
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
    fib: ['Y', {f: {n:
        ['isZero', ['pred', 'n'],
            'n',
            ['add', ['f', ['pred', 'n']], ['f', ['pred', ['pred', 'n']]]]
        ]
    }}]
}

const numeral = n =>
{
    switch(n)
    {
        case 0: return 'zero'
        case 1: return 'one'
        case 2: return 'two'
        case 3: return 'three'
    }
    let k = Math.floor(Math.sqrt(n))
    let r = n - k * k
    switch(r)
    {
        case 0: return ['two', numeral(k)]
        case 1: return ['succ', ['two', numeral(k)]]
        case 2: return ['succ', ['succ', ['two', numeral(k)]]]
    }
    if(n < 10) return ['succ', numeral(n - 1)]
    return ['add', ['two', numeral(k)], numeral(r)]
}

const contains = (code, fragment) =>
{
    if(Array.isArray(code))
        return _.some(code, c => contains(c, fragment))
    else if(typeof code === 'object')
        return contains(body(code), fragment)
    else
        return code == fragment
}

const copy = _.cloneDeep

const fan = code =>
{
    if(Array.isArray(code))
        return code.reduce((b, t) => b ? [b, t] : t, null)
    else
        return code
}

const unfan = code =>
{
    if(Array.isArray(code))
    {
        if(Array.isArray(code[0]))
            return unfan(code[0].concat(code.slice(1)))
        else
            return code.map(unfan)
    }
    else
        return code
}

const compile = code =>
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

const exec = code =>
{
    while(Array.isArray(code))
    {
        let f = code.shift()
        if(code.length === 0)
            code = f
        else if(Array.isArray(f))
            code = f.concat(code)
        else if(typeof f === 'function')
        {
            let args = code.splice(0, f.length).map(exec)
            let result = f.apply(code, args)
            code.unshift(result)
        }
        else if(typeof f === 'string')
        {
            switch(f)
            {

                // case 'U': code.unshift(copy(code[0])); break
                // case 'Y': code.splice(1, 0, ['Y', copy(code[0])]); break
                // case 'F': code.shift(); break

                // case 'I': break
                // case 'B': code.splice(1, 0, code.splice(1, 2)); break
                // case 'C': code.splice(2, 0, code.splice(1, 1)[0]); break

                case 'K': code.splice(1, 1); break
                case 'S': code.splice(2, 0, [code.splice(1, 1)[0], code[1]]); break

                default: throw f

            }
        }
    }
    return code
}

const run = (src, args) =>
{
    print(src)
    let bin = unfan(compile(src))
    //print(bin)

    let j = jot.toJot(bin)
    let bytes = _(j)
        .chunk(8)
        .map(a => a.reduce((x, b) => 2 * x + b, 0))
        .value()
    print(bytes)
    bin = jot.toSK(j)
    //print(bin)

    let output = exec(bin.concat(args))
    print(output)
}

let start = process.hrtime()
run(['fac', numeral(4)], [n => n + 1, 0])
let duration = process.hrtime(start)

console.log(duration + 's')