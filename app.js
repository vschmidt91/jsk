
import { numeral, compile, exec, unfan, fan } from './combinators.mjs'

function run(src) {

    console.log(src)
    let bin = unfan(compile(src))

    // console.log(bin)
    // console.log(size(bin))

    let label = 'jot'
    console.time(label)
    exec(bin)
    console.log(bin)
    console.timeEnd(label)
    console.log()

}

let toNumber = [n => n + 1, 0]

// run(['mul', numeral(3), numeral(5), ...toNumber])
// run(['fib', numeral(16), ...toNumber])
run(['fac', numeral(7), ...toNumber])
