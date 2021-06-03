
import { JotToSKI, SKIToJot } from './jot.mjs'
import { print, numeral, run, exec, compile } from './combinators.mjs'

let x = JotToSKI([0])

let label = 'jot'
console.time(label)
// run(numeral(4), [n => n + 1, 0])
console.log(exec(compile(['fib', numeral(2), n => n + 1, 0])))
run(['fac', numeral(7)], [n => n + 1, 0])

console.timeEnd(label)