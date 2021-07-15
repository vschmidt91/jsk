
let base =
{

    //uncomment to enable reductions

    // B: ['S', ['K', 'S'], 'K'],
    // C: ['S', ['S', ['K', 'B'], 'S'], ['K', 'K']],
    // I: ['S', 'K', 'K'],

    Y: {
        f: [
            { x: ['f', ['x', 'x']] },
            { x: ['f', ['x', 'x']] }
        ]
    },

    // Y: ['B', 'U', 'Z'],
    // U: ['S', 'I', 'I'],
    // Z: ['C', ['B', 'B', 'I'], 'U'],

    /* BOOLEAN */
    F: ['K', 'I'],
    T: 'K',

    and: { p: { q: ['p', 'q', 'F'] } },
    or: { p: { q: ['p', 'T', 'q'] } },
    not: 'C',

    /* PAIR */
    pair: { x: { y: { z: ['z', 'x', 'y'] } } },
    first: { p: ['p', 'T'] },
    second: { p: ['p', 'F'] },

    /* LIST */
    nil: 'F',
    cons: 'pair',
    isNil: { l: ['l', { h: { t: { d: 'F' } } }, 'T'] },
    head: 'first',
    tail: 'second',

    /* NUMERALS */
    zero: 'F',
    one: 'I',
    two: ['succ', 'one'],

    /* ARITHMETIC */
    succ: ['S', 'B'],
    pred: { n: { f: { x: ['n', { g: { h: ['h', ['g', 'f']] } }, ['K', 'x'], 'I'] } } },
    isZero: { n: ['n', ['K', 'F'], 'T'] },

    add: { m: { n: { f: { x: ['m', 'f', ['n', 'f', 'x']] } } } },
    sub: { m: { n: ['n', 'pred', 'm'] } },
    mul: 'B',
    div1: { c: { n: { m: { f: { x: [
        { d: ['isZero', 'd', 'x', ['f', ['c', 'd', 'm', 'f', 'x']]] },
        ['sub', 'n', 'm']
    ] } } } } },
    div: { n: ['Y', 'div1', ['succ', 'n']] },

    leq: { m: { n: ['isZero', ['sub', 'm', 'n']] } },
    geq: { m: { n: ['isZero', ['sub', 'n', 'm']] } },
    eq: { m: { n: ['and', ['leq', 'm', 'n'], ['geq', 'm', 'n']] } },
    fac: ['Y', { f: { n: ['isZero', 'n', 'one', ['mul', 'n', ['f', ['pred', 'n']]]] } }],
    fib: ['Y', {
        f: {
            n: [
                'leq', 'n', 'one', 'n', [
                    'add', ['f', ['pred', 'n']], ['f', ['pred', ['pred', 'n']]]
                ]
            ]
        }
    }]
}

function arg(code) {
    return Object.keys(code)[0]
}

function body(code) {
    return Object.values(code)[0]
}

function size(code) {
    if (Array.isArray(code)) {
        return code.map(size).reduce((a, b) => a + b)
    }
    else {
        return 1
    }
}

function toString(code) {
    if (Array.isArray(code)) {
        return code.map(toString)
    }
    else if (typeof code === 'function') {
        return code.toString()
    }
    else {
        return code
    }
}

function print(code) {
    console.log(JSON.stringify(toString(code)))
}

function numeral(n) {
    switch (n) {
        case 0: return 'zero'
        case 1: return 'one'
        case 2: return 'two'
    }
    if (n < 10) {
        return ['succ', numeral(n - 1)]
    }
    let k = Math.floor(Math.sqrt(n))
    let r = n - k * k
    // switch(r)
    // {
    //     case 0: return ['two', numeral(k)]
    //     case 1: return ['succ', ['two', numeral(k)]]
    //     case 2: return ['succ', ['succ', ['two', numeral(k)]]]
    // }
    return ['add', ['two', numeral(k)], numeral(r)]
}

function contains(code, fragment) {
    if (Array.isArray(code)) {
        return code.some(c => contains(c, fragment))
    }
    else if (typeof code === 'object') {
        return contains(body(code), fragment)
    }
    else {
        return code === fragment
    }
}

function fan(code) {
    if (!Array.isArray(code)) {
        return code
    }
    else if (code.length <= 2) {
        return code
    }
    else {
        return code.map(fan).reduce((a, b) => a ? [a, b] : b)
    }
}

function unfan(code) {
    if (!Array.isArray(code)) {
        return code
    }
    else {
        while (Array.isArray(code[0])) {
            code = code[0].concat(code.slice(1))
        }
        return code.map(unfan)
    }
}

function compile(code) {
    while (true) {
        if (code in base) {
            code = base[code]
        }
        else if (Array.isArray(code)) {
            return code.map(compile)
        }
        else if (typeof code === 'object') {
            let a = arg(code)
            let b = fan(body(code))
            if (a === b) {
                code = 'I'
            }
            else if (!contains(b, a)) {
                code = ['K', b]
            }
            else if (Array.isArray(b)) {
                if (!contains(b[0], a)) {
                    code = ['B', b[0], { [a]: b[1] }]
                }
                else if (!contains(b[1], a)) {
                    code = ['C', { [a]: b[0] }, b[1]]
                }
                else {
                    code = ['S', { [a]: b[0] }, { [a]: b[1] }]
                }
            }
            else if (typeof b === 'object') {
                code = { [a]: compile(b) }
            }
        }
        else {
            return code
        }
    }
}

function exec(code) {
    while (Array.isArray(code)) {
        let cmd = code.shift()
        if (Array.isArray(cmd)) {
            code.unshift(...cmd)
        }
        else if (code.length === 0) {
            code.unshift(code = cmd)
        }
        else if (typeof cmd === 'function') {
            let args = code.splice(0, cmd.length).map(exec)
            let result = cmd.apply(code, args)
            code.unshift(result)
        }
        else if (typeof cmd === 'string') {
            switch (cmd) {

                // case 'U': code.unshift(code[0]); break
                // case 'Y': code.splice(1, 0, ['Y', code[0]]); break

                // case 'F': code.shift(); break
                // case 'T': code.splice(1, 1); break

                case 'S': code.splice(2, 0, [...code.splice(1, 1), code[1]]); break
                case 'K': code.splice(1, 1); break
                case 'I': break
                case 'B': code.splice(1, 0, code.splice(1, 2)); break
                case 'C': code.splice(2, 0, ...code.splice(1, 1)); break

                default: throw new Error('invalid instruction: ' + cmd)

            }
        }
    }
    return code
}

function run(src) {

    console.log(src)
    let bin = unfan(compile(src))

    // console.log(bin)
    // console.log(size(bin))

    console.time(label)
    exec(bin)
    console.log(bin)
    console.timeEnd(label)
    console.log()

}

let toNumber = [n => n + 1, 0]

let label = 'jot'
// run(['mul', numeral(3), numeral(5), ...toNumber])
// run(['fib', numeral(16), ...toNumber])
run(['fac', numeral(7), ...toNumber])
