
const _ = require('lodash')
const jot = require('./jot')()

const base =
{

    //uncomment to enable reductions

    B: ['S', ['K', 'S'], 'K'],
    C: ['S', ['S', ['K', 'B'], 'S'], ['K', 'K']],
    // I: [['S', 'K'], 'K'],

    // Y: {f: [
    //     {x: ['f', ['x', 'x']]},
    //     {x: ['f', ['x', 'x']]}
    // ]},

    Y: ['B', 'U', 'Z'],
    U: ['S', 'I', 'I'],
    Z: ['C', ['B', 'B', 'I'], 'U'],
    
    /* BOOLEAN */
    F: ['K', 'I'],
    T: 'K',
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
    div1: {c: {n: {m: {f: {x: [{d: ['isZero', 'd', 'x', ['f', ['c', 'd', 'm', 'f', 'x']]]},['sub', 'n', 'm']]}}}}},
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

function arg(code)
{
    return Object.keys(code)[0]
}

function body(code)
{
    return Object.values(code)[0]
}

function size(code)
{
    let result = 0
    let queue = [code]
    while((code = queue.pop()) != undefined)
    {
        if(Array.isArray(code))
            queue.push(...code)
        else
            result++
    }
    return result
}

function toString(code)
{
    if(Array.isArray(code))
    {
        return code.map(toString)
    }
    else
    {
        return code.toString()
    }
}

function print(code)
{
    console.log(JSON.stringify(toString(code)))
}

function numeral(n)
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
    if(n < 10)
        return ['succ', numeral(n - 1)]
    else
        return ['add', ['two', numeral(k)], numeral(r)]
}

function contains(code, fragment)
{
    let queue = [code]
    while((code = queue.pop()) != undefined)
    {
        if(Array.isArray(code))
            queue.push(...code)
        else if(typeof code === 'object')
            queue.push(body(code))
        else if(code === fragment)
            return true
    }
    return false
}

function fan(code)
{
    if(!Array.isArray(code))
        return code
    else if(code.length <= 2)
        return code
    else
        return code.map(fan).reduce((b, t) => b ? [b, t] : t, null)
}

function unfan(code)
{
    if(!Array.isArray(code))
        return code
    else
    {
        while(Array.isArray(code[0]))
            code = code[0].concat(code.slice(1).map(unfan))
        return code
    }
}

function compile(code)
{
    while(true)
    {
        if(code in base)
            code = base[code]
        else if(Array.isArray(code))
            return fan(code).map(compile)
        else if(typeof code === 'object')
        {
            let a = arg(code)
            let b = fan(body(code))
            if(a === b)
                code = 'I'
            else if(!contains(b, a))
                code = ['K', b]
            else if(Array.isArray(b) && !contains(b[0], a))
                code = ['B', b[0], { [a]: b[1] }]
            else if(Array.isArray(b) && !contains(b[1], a))
                code = ['C', {[a]: b[0]}, b[1]]
            else if(Array.isArray(b))
                code = ['S', {[a]: b[0]}, {[a]: b[1]}]
            else if(typeof b === 'object')
                code = { [a]: compile({[arg(b)]: body(b)}) }
        }
        else
            return code
    }
}

function copy(code)
{
    return _.cloneDeep(code)
}

function exec(code)
{
    while(Array.isArray(code))
    {
        let f = code.shift()
        if(code.length === 0)
        {
            if(Array.isArray(f))
            {
                code.unshift(...f)
            }
            else
            {
                code.unshift(code = f)
            }
        }
        else if(Array.isArray(f))
            code.unshift(...f)
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

                case 'U': code.unshift(copy(code[0])); break
                case 'Y': code.splice(1, 0, ['Y', copy(code[0])]); break
                // case 'F': code.shift(); break

                case 'I': break
                case 'B': code.splice(1, 0, code.splice(1, 2)); break
                case 'C': code.splice(2, 0, code.splice(1, 1)[0]); break

                case 'K': code.splice(1, 1); break
                case 'S': code.splice(2, 0, [code.splice(1, 1)[0], code[1]]); break

                default: throw f

            }
        }
    }
    return code
}

function run(src, args)
{
    print(src)
    let bin = unfan(compile(src))
    print(bin)

    // let j = jot.toJot(bin)
    // let bytes = _(j)
    //     .chunk(8)
    //     .map(a => a.reduce((x, b) => 2 * x + b, 0))
    //     .value()
    // print(bytes)
    // bin = jot.toSK(j)
    // print(bin)

    let code = bin.concat(args)
    console.log(exec(code))
}

let start = process.hrtime()
// run(numeral(4), [n => n + 1, 0])
run(['fac', numeral(6)], [n => n + 1, 0])
let duration = process.hrtime(start)

console.log(duration + 's')