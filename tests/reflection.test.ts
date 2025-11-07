import { $lib } from '@/catalogue';
import { parseFunctionInfo, $FunctionInfo, $type, $typeof } from '@/reflection';
import { describe, it, expect, beforeEach } from 'vitest';

class Test {
    get prop() { return 0; }
    set prop(value: number) { }
}

describe('$Reflection', () => {
    beforeEach(() => { $lib.$reset(); });
    describe('$ObjectiveRep', () => {
        describe('$type function', () => {
            it('should cache the same instances', () => {
                let type = $type(undefined);
                let sameType = $type(undefined);
                expect(type === sameType).toBe(true);
                type = $type(null);
                sameType = $type(null);
                expect(type === sameType).toBe(true);
                type = $type(String);
                sameType = $type(String);
                expect(type === sameType).toBe(true);
            });

            it('should return the right metadata for undefined', () => {
                const type = $type(undefined);
                expect(type.literal).toBeUndefined();
                expect(type.$name).toBe('undefined');
                expect(type.$ref).toBe('type(undefined)');
                expect(type.$role).toBe('typeof(undefined)');
                expect(type.$type.$equals($type(undefined))).toBe(true);
                expect(type.$properties.length).toBe(0);
            });

            it('should have the right metadata for null', () => {
                const type = $type(null);
                expect(type.literal).toBeNull();
                expect(type.$name).toBe('null');
                expect(type.$ref).toBe('type(null)');
                expect(type.$role).toBe('typeof(null)');
                expect(type.$type.$equals($type(undefined))).toBe(true);
                expect(type.$properties.length).toBe(0);
            });

            it('should have the right metadata for string', () => {
                const type = $type(String);
                expect(type.literal).toBe(String);
                expect(type.$name).toBe('string');
                expect(type.$ref).toBe('type(string)');
                expect(type.$role).toBe('typeof(string)');
                expect(type.$type.$equals($type(Object))).toBe(true);
                expect(type.$properties.length).toBeGreaterThan(0);
            });

            it('should have the right metadata for number', () => {
                const type = $type(Number);
                expect(type.literal).toBe(Number);
                expect(type.$name).toBe('number');
                expect(type.$ref).toBe('type(number)');
                expect(type.$role).toBe('typeof(number)');
                expect(type.$type.$equals($type(Object))).toBe(true);
                expect(type.$properties.length).toBeGreaterThan(0);
            });

            it('should have the right metadata for bigint', () => {
                const type = $type(BigInt);
                expect(type.literal).toBe(BigInt);
                expect(type.$name).toBe('bigint');
                expect(type.$ref).toBe('type(bigint)');
                expect(type.$role).toBe('typeof(bigint)');
                expect(type.$type.$equals($type(Object))).toBe(true);
                expect(type.$properties.length).toBeGreaterThan(0);
            });

            it('should have the right metadata for boolean', () => {
                const type = $type(Boolean);
                expect(type.literal).toBe(Boolean);
                expect(type.$name).toBe('boolean');
                expect(type.$ref).toBe('type(boolean)');
                expect(type.$role).toBe('typeof(boolean)');
                expect(type.$type.$equals($type(Object))).toBe(true);
                expect(type.$properties.length).toBeGreaterThan(0);
            });

            it('should have the right metadata for symbol', () => {
                const type = $type(Symbol);
                expect(type.literal).toBe(Symbol);
                expect(type.$name).toBe('symbol');
                expect(type.$ref).toBe('type(symbol)');
                expect(type.$role).toBe('typeof(symbol)');
                expect(type.$type.$equals($type(Object))).toBe(true);
                expect(type.$properties.length).toBeGreaterThan(0);
            });

            it('should have the right metadata for function', () => {
                const type = $type(Function);
                expect(type.literal).toBe(Function);
                expect(type.$name).toBe('function');
                expect(type.$ref).toBe('type(function)');
                expect(type.$role).toBe('typeof(function)');
                expect(type.$type.$equals($type(Object))).toBe(true);
                expect(type.$properties.length).toBeGreaterThan(0);
            });

            it('should have the right metadata for object', () => {
                const type = $type(Object);
                expect(type.literal).toBe(Object);
                expect(type.$name).toBe('object');
                expect(type.$ref).toBe('type(object)');
                expect(type.$role).toBe('typeof(object)');
                expect(type.$type.$equals($type(Object))).toBe(true);
                expect(type.$properties.length).toBeGreaterThan(0);
            });
        });

        describe('$typeof function', () => {
            it('should cache equivalent instances', () => {
                let type = $type(undefined);
                let sameType = $typeof(undefined);
                expect(type.$equals(sameType)).toBe(true);
                type = $type(String);
                sameType = $typeof("");
                expect(type.$equals(sameType)).toBe(true);
                type = $type(Boolean);
                sameType = $typeof(true);
                expect(type.$equals(sameType)).toBe(true);
            });

            it('should return the right metadata for undefined', () => {
                const type = $typeof(undefined);
                expect(type.literal).toBeUndefined();
                expect(type.$name).toBe('undefined');
                expect(type.$ref).toBe('type(undefined)');
                expect(type.$role).toBe('typeof(undefined)');
                expect(type.$prototype.$ref).toBe('type(undefined)');
                expect(type.$prototype.$role).toBe('prototypeof(undefined)');
                expect(type.$type.$equals($type(undefined))).toBe(true);
                expect(type.$properties.length).toBe(0);
            });

            it('should have the right metadata for null', () => {
                const type = $typeof(null);
                expect(type.literal).toBeUndefined();
                expect(type.$name).toBe('undefined');
                expect(type.$ref).toBe('type(undefined)');
                expect(type.$role).toBe('typeof(undefined)');
                expect(type.$prototype.$role).toBe('prototypeof(undefined)');
                expect(type.$type.$equals($type(undefined))).toBe(true);
                expect(type.$properties.length).toBe(0);
            });

            it('should have the right metadata for a string', () => {
                const type = $typeof("test");
                expect(type.literal).toBe(String);
                expect(type.$name).toBe('string');
                expect(type.$ref).toBe('type(string)');
                expect(type.$role).toBe('typeof("test":string)');
                expect(type.$type.$equals($type(Object))).toBe(true);
                expect(type.$properties.length).toBeGreaterThan(0);
            });

            it('should have the right metadata for number', () => {
                const type = $typeof(0);
                expect(type.literal).toBe(Number);
                expect(type.$name).toBe('number');
                expect(type.$ref).toBe('type(number)');
                expect(type.$role).toBe('typeof(0:number)');
                expect(type.$type.$equals($type(Object))).toBe(true);
                expect(type.$properties.length).toBeGreaterThan(0);
            });

            it('should have the right metadata for bigint', () => {
                const type = $typeof(BigInt(1000));
                expect(type.literal).toBe(BigInt);
                expect(type.$name).toBe('bigint');
                expect(type.$ref).toBe('type(bigint)');
                expect(type.$role).toBe('typeof(1000:bigint)');
                expect(type.$type.$equals($type(Object))).toBe(true);
                expect(type.$properties.length).toBeGreaterThan(0);
            });

            it('should have the right metadata for boolean', () => {
                const type = $typeof(true);
                expect(type.literal).toBe(Boolean);
                expect(type.$name).toBe('boolean');
                expect(type.$ref).toBe('type(boolean)');
                expect(type.$role).toBe('typeof(true:boolean)');
                expect(type.$type.$equals($type(Object))).toBe(true);
                expect(type.$properties.length).toBeGreaterThan(0);
            });
            
            it('should have the right metadata for symbol', () => {
                const type = $typeof(Symbol("test"));
                expect(type.literal).toBe(Symbol);
                expect(type.$name).toBe('symbol');
                expect(type.$ref).toBe('type(symbol)');
                expect(type.$role).toBe('typeof(${test}:symbol)');
                expect(type.$type.$equals($type(Object))).toBe(true);
                expect(type.$properties.length).toBeGreaterThan(0);
            });

            it('should have the right metadata for function', () => {
                const type = $typeof(function () {});
                expect(type.literal).toBe(Function);
                expect(type.$name).toBe('function');
                expect(type.$ref).toBe('type(function)');
                expect(type.$role).toBe('typeof(():function)');
                expect(type.$type.$equals($type(Object))).toBe(true);
                expect(type.$properties.length).toBeGreaterThan(0);
            });

            it('should have the right metadata for object', () => {
                const type = $typeof({});
                expect(type.literal).toBe(Object);
                expect(type.$name).toBe('object');
                expect(type.$ref).toBe('type(object)');
                expect(type.$role).toBe('typeof({properties:0}:object)');
                expect(type.$type.$equals($type(Object))).toBe(true);
                expect(type.$properties.length).toBeGreaterThan(0);
            });
        }); 

        describe('$prototype', () => {
            it('should return the right metadata for undefined', () => {
                const type = $typeof(undefined).$prototype;
                expect(type.literal).toBeUndefined();
                expect(type.$name).toBe('undefined');
                expect(type.$ref).toBe('type(undefined)');
                expect(type.$role).toBe('prototypeof(undefined)');
                expect(type.$type.$role).toBe('typeof(undefined)');
            });
        }); 
    });

    describe('parseFunctionInfo', () => {
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
                    expect(result.params).toEqual(undefined);
                });
            });
        });

        describe('comprehensive combinations', () => {
            it('async lambda with rest params', () => {
                const result = parseFunctionInfo([async (...args: any[]) => { }][0]);
                expect(result.form).toBe('lambda');
                expect(result.async).toBe(true);
                expect(result.params).toEqual([{ spread: true }]);
            });

            it('async generator with params and rest', () => {
                const result = parseFunctionInfo([async function* (a: any, b: any, ...spread: any[]) { }][0]);
                expect(result.form).toBe('function');
                expect(result.async).toBe(true);
                expect(result.generator).toBe(true);
                expect(result.params).toEqual([{ spread: false }, { spread: false }, { spread: true }]);
            });

            it('async generator method with rest', () => {
                const result = parseFunctionInfo([({ async *method(...args: any[]) { } }).method][0]);
                expect(result.form).toBe('method');
                expect(result.async).toBe(true);
                expect(result.generator).toBe(true);
                expect(result.params).toEqual([{ spread: true }]);
            });
        });

        describe('parameter array structure', () => {
            const testCases: Array<{name: string, func: Function, expected: Array<{ spread: boolean }>}> = [
                { name: 'no params - lambda', func: [() => { }][0], expected: [] },
                { name: 'no params - function', func: [function() { }][0], expected: [] },
                { name: 'no params - method', func: [({ m() { } }).m][0], expected: [] },
                { name: 'single param - lambda', func: [(x: any) => { }][0], expected: [{ spread: false }] },
                { name: 'single param - function', func: [function(x: any) { }][0], expected: [{ spread: false }] },
                { name: 'single param - method', func: [({ m(x: any) { } }).m][0], expected: [{ spread: false }] },
                { name: 'two params - lambda', func: [(x: any, y: any) => { }][0], expected: [{ spread: false }, { spread: false }] },
                { name: 'two params - function', func: [function(x: any, y: any) { }][0], expected: [{ spread: false }, { spread: false }] },
                { name: 'two params - method', func: [({ m(x: any, y: any) { } }).m][0], expected: [{ spread: false }, { spread: false }] },
                { name: 'three params - lambda', func: [(x: any, y: any, z: any) => { }][0], expected: [{ spread: false }, { spread: false }, { spread: false }] },
                { name: 'three params - function', func: [function(x: any, y: any, z: any) { }][0], expected: [{ spread: false }, { spread: false }, { spread: false }] },
                { name: 'three params - method', func: [({ m(x: any, y: any, z: any) { } }).m][0], expected: [{ spread: false }, { spread: false }, { spread: false }] },
                { name: 'four params - lambda', func: [(a: any, b: any, c: any, d: any) => { }][0], expected: [{ spread: false }, { spread: false }, { spread: false }, { spread: false }] },
                { name: 'four params - function', func: [function(a: any, b: any, c: any, d: any) { }][0], expected: [{ spread: false }, { spread: false }, { spread: false }, { spread: false }] },
                { name: 'four params - method', func: [({ m(a: any, b: any, c: any, d: any) { } }).m][0], expected: [{ spread: false }, { spread: false }, { spread: false }, { spread: false }] },
                { name: 'rest only - lambda', func: [(...args: any[]) => { }][0], expected: [{ spread: true }] },
                { name: 'rest only - function', func: [function(...args: any[]) { }][0], expected: [{ spread: true }] },
                { name: 'rest only - method', func: [({ m(...args: any[]) { } }).m][0], expected: [{ spread: true }] },
                { name: 'single param + rest - lambda', func: [(x: any, ...rest: any[]) => { }][0], expected: [{ spread: false }, { spread: true }] },
                { name: 'single param + rest - function', func: [function(x: any, ...rest: any[]) { }][0], expected: [{ spread: false }, { spread: true }] },
                { name: 'single param + rest - method', func: [({ m(x: any, ...rest: any[]) { } }).m][0], expected: [{ spread: false }, { spread: true }] },
                { name: 'two params + rest - lambda', func: [(a: any, b: any, ...rest: any[]) => { }][0], expected: [{ spread: false }, { spread: false }, { spread: true }] },
                { name: 'two params + rest - function', func: [function(a: any, b: any, ...rest: any[]) { }][0], expected: [{ spread: false }, { spread: false }, { spread: true }] },
                { name: 'two params + rest - method', func: [({ m(a: any, b: any, ...rest: any[]) { } }).m][0], expected: [{ spread: false }, { spread: false }, { spread: true }] },
                { name: 'three params + rest - lambda', func: [(a: any, b: any, c: any, ...rest: any[]) => { }][0], expected: [{ spread: false }, { spread: false }, { spread: false }, { spread: true }] },
                { name: 'three params + rest - function', func: [function(a: any, b: any, c: any, ...rest: any[]) { }][0], expected: [{ spread: false }, { spread: false }, { spread: false }, { spread: true }] },
                { name: 'three params + rest - method', func: [({ m(a: any, b: any, c: any, ...rest: any[]) { } }).m][0], expected: [{ spread: false }, { spread: false }, { spread: false }, { spread: true }] },
                { name: 'four params + rest - lambda', func: [(a: any, b: any, c: any, d: any, ...rest: any[]) => { }][0], expected: [{ spread: false }, { spread: false }, { spread: false }, { spread: false }, { spread: true }] },
                { name: 'four params + rest - function', func: [function(a: any, b: any, c: any, d: any, ...rest: any[]) { }][0], expected: [{ spread: false }, { spread: false }, { spread: false }, { spread: false }, { spread: true }] },
                { name: 'four params + rest - method', func: [({ m(a: any, b: any, c: any, d: any, ...rest: any[]) { } }).m][0], expected: [{ spread: false }, { spread: false }, { spread: false }, { spread: false }, { spread: true }] },
            ];

            testCases.forEach(({ name, func, expected }) => {
                it(name, () => {
                    const result = parseFunctionInfo(func);
                    expect(result.params).toEqual(expected);
                });
            });
        });
    });
});