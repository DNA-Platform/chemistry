import { parseFunctionInfo, $FunctionInfo } from '@/reflection';
import { describe, it, expect } from 'vitest';

class Test {
    get prop() { return 0; }
    set prop(value: number) { }
}

describe('$Reflection', () => {
    describe('parseFunctionInfo', () => {
        describe('parameter variations', () => {
            const testCases: Array<{
                name: string,
                func: Function,
                expected: { count: number, rest: boolean }
            }> = [
                    { name: 'no parameters - lambda', func: [() => { }][0], expected: { count: 0, rest: false } },
                    { name: 'no parameters - function', func: [function () { }][0], expected: { count: 0, rest: false } },
                    { name: 'no parameters - method', func: [({ m() { } }).m][0], expected: { count: 0, rest: false } },
                    { name: 'single parameter - lambda parens', func: [(x: any) => x][0], expected: { count: 1, rest: false } },
                    { name: 'single parameter - lambda no parens', func: [(x: any) => x][0], expected: { count: 1, rest: false } },
                    { name: 'single parameter - function', func: [function (x: any) { }][0], expected: { count: 1, rest: false } },
                    { name: 'single parameter - method', func: [({ m(x: any) { } }).m][0], expected: { count: 1, rest: false } },
                    { name: 'multiple parameters - lambda', func: [(x: any, y: any, z: any) => { }][0], expected: { count: 3, rest: false } },
                    { name: 'multiple parameters - function', func: [function (a: any, b: any, c: any) { }][0], expected: { count: 3, rest: false } },
                    { name: 'multiple parameters - method', func: [({ m(x: any, y: any) { } }).m][0], expected: { count: 2, rest: false } },
                    { name: 'rest only - lambda', func: [(...args: any[]) => { }][0], expected: { count: 0, rest: true } },
                    { name: 'rest only - function', func: [function (...args: any[]) { }][0], expected: { count: 0, rest: true } },
                    { name: 'rest only - method', func: [({ m(...args: any[]) { } }).m][0], expected: { count: 0, rest: true } },
                    { name: 'params + rest - lambda', func: [(a: any, b: any, ...rest: any[]) => { }][0], expected: { count: 2, rest: true } },
                    { name: 'params + rest - function', func: [function (x: any, ...rest: any[]) { }][0], expected: { count: 1, rest: true } },
                    { name: 'params + rest - method', func: [({ m(a: any, ...rest: any[]) { } }).m][0], expected: { count: 1, rest: true } },
                ];

            testCases.forEach(({ name, func, expected }) => {
                it(name, () => {
                    const result = parseFunctionInfo(func);
                    expect(result.params).toEqual(expected);
                });
            });
        });

        describe('async modifier', () => {
            const testCases: Array<{ name: string, func: Function }> = [
                { name: 'async lambda', func: [async () => { }][0] },
                { name: 'async lambda with params', func: [async (x: any, y: any) => { }][0] },
                { name: 'async function', func: [async function () { }][0] },
                { name: 'async function named', func: [async function fetch() { }][0] },
                { name: 'async method', func: [({ async m() { } }).m][0] },
                { name: 'async generator function', func: [async function* () { }][0] },
                { name: 'async generator method', func: [({ async *m() { } }).m][0] },
            ];

            testCases.forEach(({ name, func }) => {
                it(name, () => {
                    const result = parseFunctionInfo(func);
                    expect(result.async).toBe(true);
                });
            });
        });

        describe('generator modifier', () => {
            const testCases: Array<{ name: string, func: Function }> = [
                { name: 'generator function', func: [function* () { }][0] },
                { name: 'generator function named', func: [function* gen() { }][0] },
                { name: 'generator method', func: [({ *m() { } }).m][0] },
                { name: 'async generator function', func: [async function* () { }][0] },
                { name: 'async generator method', func: [({ async *m() { } }).m][0] },
            ];

            testCases.forEach(({ name, func }) => {
                it(name, () => {
                    const result = parseFunctionInfo(func);
                    expect(result.generator).toBe(true);
                });
            });
        });

        describe('function forms', () => {
            const testCases: Array<{
                name: string,
                func: Function,
                expectedForm: $FunctionInfo['form']
            }> = [
                    { name: 'lambda no params', func: [() => { }][0], expectedForm: 'lambda' },
                    { name: 'lambda single param no parens', func: [(x: any) => x][0], expectedForm: 'lambda' },
                    { name: 'lambda multiple params', func: [(x: any, y: any) => { }][0], expectedForm: 'lambda' },
                    { name: 'async lambda', func: [async () => { }][0], expectedForm: 'lambda' },
                    { name: 'function anonymous', func: [function () { }][0], expectedForm: 'function' },
                    { name: 'function named', func: [function foo() { }][0], expectedForm: 'function' },
                    { name: 'async function', func: [async function () { }][0], expectedForm: 'function' },
                    { name: 'generator function', func: [function* () { }][0], expectedForm: 'function' },
                    { name: 'method', func: [({ m() { } }).m][0], expectedForm: 'method' },
                    { name: 'async method', func: [({ async m() { } }).m][0], expectedForm: 'method' },
                    { name: 'generator method', func: [({ *m() { } }).m][0], expectedForm: 'method' },
                    { name: 'getter', func: [Object.getOwnPropertyDescriptor(Test.prototype, 'prop')!.get!][0], expectedForm: 'getter' },
                    { name: 'setter', func: [Object.getOwnPropertyDescriptor(Test.prototype, 'prop')!.set!][0], expectedForm: 'setter' },
                    { name: 'class named', func: [class Foo { }][0], expectedForm: 'class' },
                    { name: 'class anonymous', func: [class { }][0], expectedForm: 'class' },
                ];

            testCases.forEach(({ name, func, expectedForm }) => {
                it(name, () => {
                    const result = parseFunctionInfo(func);
                    expect(result.form).toBe(expectedForm);
                });
            });
        });

        describe('naming', () => {
            describe('named functions', () => {
                const testCases: Array<{ name: string, func: Function, expectedName: string }> = [
                    { name: 'function', func: [function myFunc() { }][0], expectedName: 'myFunc' },
                    { name: 'method', func: [({ myMethod() { } }).myMethod][0], expectedName: 'myMethod' },
                    { name: 'generator', func: [function* myGen() { }][0], expectedName: 'myGen' },
                    { name: 'class', func: [class MyClass { }][0], expectedName: 'MyClass' },
                    { name: 'getter', func: [Object.getOwnPropertyDescriptor(Test.prototype, 'prop')!.get!][0], expectedName: 'prop' },
                    { name: 'setter', func: [Object.getOwnPropertyDescriptor(Test.prototype, 'prop')!.set!][0], expectedName: 'prop' },
                ];

                testCases.forEach(({ name, func, expectedName }) => {
                    it(name, () => {
                        const result = parseFunctionInfo(func);
                        expect(result.name).toBe(expectedName);
                    });
                });
            });

            describe('anonymous functions', () => {
                const testCases: Array<{ name: string, func: Function }> = [
                    { name: 'lambda', func: [() => { }][0] },
                    { name: 'function', func: [function () { }][0] },
                    { name: 'generator', func: [function* () { }][0] },
                    { name: 'class', func: [class { }][0] },
                ];

                testCases.forEach(({ name, func }) => {
                    it(name, () => {
                        const result = parseFunctionInfo(func);
                        expect(result.name).toBe('');
                    });
                });
            });
        });

        describe('native functions', () => {
            const testCases: Array<{ name: string, func: Function }> = [
                { name: 'String constructor', func: [String][0] },
                { name: 'Array constructor', func: [Array][0] },
                { name: 'Object constructor', func: [Object][0] },
                { name: 'Array.prototype.map', func: [Array.prototype.map][0] },
                { name: 'String.prototype.slice', func: [String.prototype.slice][0] },
                { name: 'Math.pow', func: [Math.pow][0] },
                { name: 'bound function', func: [[function () { }][0].bind(null)][0] },
            ];

            testCases.forEach(({ name, func }) => {
                it(name, () => {
                    const result = parseFunctionInfo(func);
                    expect(result.native).toBe(true);
                });
            });
        });

        describe('unknown/unparseable', () => {
            const testCases: Array<{ name: string, setup: () => Function }> = [
                {
                    name: 'custom toString - gibberish',
                    setup: () => {
                        const f = [function () { }][0];
                        f.toString = () => 'completely unparseable';
                        return f;
                    }
                },
                {
                    name: 'custom toString - empty',
                    setup: () => {
                        const f = [function () { }][0];
                        f.toString = () => '';
                        return f;
                    }
                },
                {
                    name: 'custom toString - unicode',
                    setup: () => {
                        const f = [function () { }][0];
                        f.toString = () => '∂ƒ∆ø˙©ƒ';
                        return f;
                    }
                },
            ];

            testCases.forEach(({ name, setup }) => {
                it(name, () => {
                    const func = setup();
                    const result = parseFunctionInfo(func);

                    expect(result.form).toBe('unknown');
                    expect(result.async).toBeUndefined();
                    expect(result.generator).toBeUndefined();
                    expect(result.native).toBeUndefined();
                    expect(result.params).toEqual({ count: undefined, rest: undefined });
                });
            });
        });

        describe('comprehensive combinations', () => {
            it('async lambda with rest params', () => {
                const result = parseFunctionInfo([async (...args: any[]) => { }][0]);
                expect(result.form).toBe('lambda');
                expect(result.async).toBe(true);
                expect(result.params).toEqual({ count: 0, rest: true });
            });

            it('async generator with params and rest', () => {
                const result = parseFunctionInfo([async function* (a: any, b: any, ...rest: any[]) { }][0]);
                expect(result.form).toBe('function');
                expect(result.async).toBe(true);
                expect(result.generator).toBe(true);
                expect(result.params).toEqual({ count: 2, rest: true });
            });

            it('async generator method with rest', () => {
                const result = parseFunctionInfo([({ async *method(...args: any[]) { } }).method][0]);
                expect(result.form).toBe('method');
                expect(result.async).toBe(true);
                expect(result.generator).toBe(true);
                expect(result.params).toEqual({ count: 0, rest: true });
            });
        });
    });
});