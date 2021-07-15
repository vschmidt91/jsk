import { strictEqual, deepStrictEqual, throws } from 'assert';
import { SKIToJot, JotToSKI } from '../jot.mjs';
import { fibonacci, numeral, compile, exec } from '../combinators.mjs';

describe('jot', function()
{
    describe('#SKIToJot()', function()
    {
        it('should throw for values that are not Array or string', function()
        {
            throws(() => SKIToJot(null))
            throws(() => SKIToJot(undefined))
            throws(() => SKIToJot(0))
        });
        it('should correctly compile SKI combinators', function()
        {
            deepStrictEqual(SKIToJot('I'), [1, 1, 0, 1, 0], 'different I')
            deepStrictEqual(SKIToJot('K'), [1, 1, 1, 0, 0], 'different K')
            deepStrictEqual(SKIToJot('S'), [1, 1, 1, 1, 1, 0, 0, 0], 'different S')
        });
        it('should correctly convert numerals', function()
        {
            for(var i = 0; i < 10; ++i)
            {
                let code = compile(numeral(i))
                code = JotToSKI(SKIToJot(code))
                code = code.concat(n => n + 1, 0)
                deepStrictEqual(exec(code), i, 'incorrectly evaluated ' + i.toString())
            }
        });
        it('should correctly convert Fibonacci recursion', function()
        {
            for(var i = 0; i < 10; ++i)
            {
                let code = compile(['fib', numeral(i)])
                code = JotToSKI(SKIToJot(code))
                code = code.concat(n => n + 1, 0)
                deepStrictEqual(exec(code), fibonacci(i), 'incorrectly evaluated fibonacci(' + i.toString() + ')')
            }
        });
    });
    describe('#JotToSKI()', function()
    {
        it('should throw for values that are not Array or string', function()
        {
            throws(() => JotToSKI(null))
            throws(() => JotToSKI(undefined))
            throws(() => JotToSKI(0))
        });
        it('should correctly compile SKI combinators', function()
        {
            deepStrictEqual(JotToSKI([0]), [[], 'S', 'K'], 'different 0')
            deepStrictEqual(JotToSKI([1]), ['S', ['K', []]], 'different 1')
        });
    });
});