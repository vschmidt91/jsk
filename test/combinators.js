import { strictEqual, deepStrictEqual, throws } from 'assert';
import { fibonacci, numeral, compile, exec } from '../combinators.mjs';
import { SKIToJot, JotToSKI } from '../jot.mjs';

describe('app', function()
{
    describe('#exec()', function()
    {
        it('should correctly evaluate numerals', function()
        {
            for(var i = 0; i < 10; ++i)
            {
                let code = compile([numeral(i), n => n + 1, 0])
                deepStrictEqual(exec(code), i, 'incorrectly evaluated ' + i.toString())
            }
        });
        it('should correctly fibonacci recursion', function()
        {
            for(var i = 0; i < 5; ++i)
            {
                let code = compile(['fib', numeral(i), n => n + 1, 0])
                deepStrictEqual(exec(code), fibonacci(i), 'incorrectly evaluated fibonacci(' + i.toString() + ')')
            }
        });
        it('should be able to do basic arithmetic', function()
        {
            for(var i = 0; i < 10; ++i)
            {
                for(var j = 1; j < i; ++j)
                {
                    deepStrictEqual(
                        exec(compile(['add', numeral(i), numeral(j), n => n + 1, 0])),
                        i + j, 'incorrectly evaluated ' + i.toString() + ' + ' + j.toString())
                    deepStrictEqual(
                        exec(compile(['sub', numeral(i), numeral(j), n => n + 1, 0])),
                        i - j, 'incorrectly evaluated ' + i.toString() + ' - ' + j.toString())
                    deepStrictEqual(
                        exec(compile(['mul', numeral(i), numeral(j), n => n + 1, 0])),
                        i * j, 'incorrectly evaluated ' + i.toString() + ' * ' + j.toString())
                    deepStrictEqual(
                        exec(compile(['div', numeral(i), numeral(j), n => n + 1, 0])),
                        Math.floor(i / j), 'incorrectly evaluated ' + i.toString() + ' / ' + j.toString())
                }
            }
        });
    });
});