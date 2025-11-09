import { $lib } from '@/catalogue';
import { parseFunctionInfo, $FunctionInfo, $type, $typeof, $instanceof } from '@/reflection';
import { describe, it, expect, beforeEach } from 'vitest';

class $Class {
    field = 1;
    get property() { return this.field; }
    set property(value: number) { this.field = value; }
    method(arg1: number, arg2: string, ...rest: boolean[]) {
        return [arg1, arg2, ...rest];
    }
}

class $SubClass extends $Class {
    subField = 2;
    override method(arg1: number, arg2: string, ...rest: boolean[]) {
        return [...rest, arg1, arg2];
    }
    subMethod() {
        return 'sub';
    }
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
                expect(type.$role.$ref).toBe('typeof(undefined)');
                expect(type.$type.$equals($type(undefined))).toBe(true);
                expect(type.$members().length).toBe(0);
            });

            it('should have the right metadata for null', () => {
                const type = $type(null);
                expect(type.literal).toBeNull();
                expect(type.$name).toBe('null');
                expect(type.$ref).toBe('type(null)');
                expect(type.$role.$ref).toBe('typeof(null)');
                expect(type.$type.$equals($type(undefined))).toBe(true);
                expect(type.$members().length).toBe(0);
            });

            it('should have the right metadata for string', () => {
                const type = $type(String);
                expect(type.literal).toBe(String);
                expect(type.$name).toBe('string');
                expect(type.$ref).toBe('type(string)');
                expect(type.$role.$ref).toBe('typeof(string)');
                expect(type.$type.$equals($type(Object))).toBe(true);
                expect(type.$members().length).toBeGreaterThan(0);
            });

            it('should have the right metadata for number', () => {
                const type = $type(Number);
                expect(type.literal).toBe(Number);
                expect(type.$name).toBe('number');
                expect(type.$ref).toBe('type(number)');
                expect(type.$role.$ref).toBe('typeof(number)');
                expect(type.$type.$equals($type(Object))).toBe(true);
                expect(type.$members().length).toBeGreaterThan(0);
            });

            it('should have the right metadata for bigint', () => {
                const type = $type(BigInt);
                expect(type.literal).toBe(BigInt);
                expect(type.$name).toBe('bigint');
                expect(type.$ref).toBe('type(bigint)');
                expect(type.$role.$ref).toBe('typeof(bigint)');
                expect(type.$type.$equals($type(Object))).toBe(true);
                expect(type.$members().length).toBeGreaterThan(0);
            });

            it('should have the right metadata for boolean', () => {
                const type = $type(Boolean);
                expect(type.literal).toBe(Boolean);
                expect(type.$name).toBe('boolean');
                expect(type.$ref).toBe('type(boolean)');
                expect(type.$role.$ref).toBe('typeof(boolean)');
                expect(type.$type.$equals($type(Object))).toBe(true);
                expect(type.$members().length).toBeGreaterThan(0);
            });

            it('should have the right metadata for symbol', () => {
                const type = $type(Symbol);
                expect(type.literal).toBe(Symbol);
                expect(type.$name).toBe('symbol');
                expect(type.$ref).toBe('type(symbol)');
                expect(type.$role.$ref).toBe('typeof(symbol)');
                expect(type.$type.$equals($type(Object))).toBe(true);
                expect(type.$members().length).toBeGreaterThan(0);
            });

            it('should have the right metadata for function', () => {
                const type = $type(Function);
                expect(type.literal).toBe(Function);
                expect(type.$name).toBe('function');
                expect(type.$ref).toBe('type(function)');
                expect(type.$role.$ref).toBe('typeof(function)');
                expect(type.$type.$equals($type(Object))).toBe(true);
                expect(type.$members().length).toBeGreaterThan(0);
            });

            it('should have the right metadata for object', () => {
                const type = $type(Object);
                expect(type.literal).toBe(Object);
                expect(type.$name).toBe('object');
                expect(type.$ref).toBe('type(object)');
                expect(type.$role.$ref).toBe('typeof(object)');
                expect(type.$type.$equals($type(Object))).toBe(true);
                expect(type.$members().length).toBeGreaterThan(0);
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
                expect(type.$role.$ref).toBe('typeof(undefined)');
                expect(type.$prototype.$ref).toBe('type(undefined)');
                expect(type.$prototype.$role.$ref).toBe('prototypeof(undefined)');
                expect(type.$type.$equals($type(undefined))).toBe(true);
                expect(type.$members().length).toBe(0);
            });

            it('should have the right metadata for null', () => {
                const type = $typeof(null);
                expect(type.literal).toBeUndefined();
                expect(type.$name).toBe('undefined');
                expect(type.$ref).toBe('type(undefined)');
                expect(type.$role.$ref).toBe('typeof(undefined)');
                expect(type.$prototype.$role.$ref).toBe('prototypeof(undefined)');
                expect(type.$type.$equals($type(undefined))).toBe(true);
                expect(type.$members().length).toBe(0);
            });

            it('should have the right metadata for a string', () => {
                const type = $typeof("test");
                expect(type.literal).toBe(String);
                expect(type.$name).toBe('string');
                expect(type.$ref).toBe('type(string)');
                expect(type.$role.$ref).toBe('typeof("test")');
                expect(type.$type.$equals($type(Object))).toBe(true);
                expect(type.$members().length).toBeGreaterThan(0);
            });

            it('should have the right metadata for number', () => {
                const type = $typeof(0);
                expect(type.literal).toBe(Number);
                expect(type.$name).toBe('number');
                expect(type.$ref).toBe('type(number)');
                expect(type.$role.$ref).toBe('typeof(0)');
                expect(type.$type.$equals($type(Object))).toBe(true);
                expect(type.$members().length).toBeGreaterThan(0);
            });

            it('should have the right metadata for bigint', () => {
                const type = $typeof(BigInt(1000));
                expect(type.literal).toBe(BigInt);
                expect(type.$name).toBe('bigint');
                expect(type.$ref).toBe('type(bigint)');
                expect(type.$role.$ref).toBe('typeof(1000)');
                expect(type.$type.$equals($type(Object))).toBe(true);
                expect(type.$members().length).toBeGreaterThan(0);
            });

            it('should have the right metadata for boolean', () => {
                const type = $typeof(true);
                expect(type.literal).toBe(Boolean);
                expect(type.$name).toBe('boolean');
                expect(type.$ref).toBe('type(boolean)');
                expect(type.$role.$ref).toBe('typeof(true)');
                expect(type.$type.$equals($type(Object))).toBe(true);
                expect(type.$members().length).toBeGreaterThan(0);
            });
            
            it('should have the right metadata for symbol', () => {
                const type = $typeof(Symbol("test"));
                expect(type.literal).toBe(Symbol);
                expect(type.$name).toBe('symbol');
                expect(type.$ref).toBe('type(symbol)');
                expect(type.$role.$ref).toBe('typeof(${test})');
                expect(type.$type.$equals($type(Object))).toBe(true);
                expect(type.$members().length).toBeGreaterThan(0);
            });

            it('should have the right metadata for function', () => {
                const type = $typeof(function () {});
                expect(type.literal).toBe(Function);
                expect(type.$name).toBe('function');
                expect(type.$ref).toBe('type(function)');
                expect(type.$role.$ref).toBe('typeof(())');
                expect(type.$type.$equals($type(Object))).toBe(true);
                expect(type.$members().length).toBeGreaterThan(0);
            });

            it('should have the right metadata for object', () => {
                const type = $typeof({});
                expect(type.literal).toBe(Object);
                expect(type.$name).toBe('object');
                expect(type.$ref).toBe('type(object)');
                expect(type.$role.$ref).toBe('typeof({})');
                expect(type.$type.$equals($type(Object))).toBe(true);
                expect(type.$members().length).toBeGreaterThan(0);
            });
        }); 

        describe('$properties', () => {
            describe('on instances', () => {
                it('should list own properties of plain objects', () => {
                    const $object = { x: 1, y: 2, z: 3 };
                    const $instance = $instanceof($object);
                    const $members = $instance.$members('own');
                    
                    expect($members.length).toBe(3);
                    expect($members.every(p => p.$role.role === 'member')).toBe(true);
                    expect($members.map(p => p.$key?.$name).sort()).toEqual(['x', 'y', 'z']);
                });

                it('should list all properties including inherited', () => {
                    const instance = $instanceof(new $SubClass());
                    const ownProps = instance.$members('own');
                    const allProps = instance.$members('all');
                    
                    expect(ownProps.length).toBeGreaterThan(0);
                    expect(allProps.length).toBeGreaterThan(ownProps.length);
                    
                    // Should include both own and inherited
                    const ownNames = ownProps.map(p => p.$key?.$name);
                    expect(ownNames).toContain('field');
                    expect(ownNames).toContain('subField');
                    
                    const allNames = allProps.map(p => p.$key?.$name);
                    expect(allNames).toContain('field');
                    expect(allNames).toContain('subField');
                    expect(allNames).toContain('method');
                    expect(allNames).toContain('property'); // getter/setter
                });

                it('should handle arrays correctly', () => {
                    const values = [1, 2, 3];
                    const instance = $instanceof(values);
                    const properties = instance.$members('own');
                    
                    // Arrays have numeric indices as properties
                    const names = properties.map(p => p.$key?.$name);
                    expect(names).toContain('0');
                    expect(names).toContain('1');
                    expect(names).toContain('2');
                    expect(names).toContain('length');
                });

                it('should handle functions as objects', () => {
                    const compute = function named(x: number) { return x * 2; };
                    compute.version = '1.0';
                    
                    const $instance = $instanceof(compute);
                    const $members = $instance.$as('object').$members('own');
                    const $names = $members.map(m => m.$name);
                    expect($names).toContain('version');
                    expect($names).toContain('length'); // function length
                    expect($names).toContain('name');   // function name
                });
            });

            describe('on types', () => {
                it('should list prototype properties of built-in types', () => {
                    const stringType = $type(String);
                    const props = stringType.$members('own');
                    
                    const propNames = props.map(p => p.$key?.$name);
                    expect(propNames).toContain('charAt');
                    expect(propNames).toContain('slice');
                    expect(propNames).toContain('length'); // String.prototype.length getter
                });

                it('should list class prototype properties', () => {
                    const classType = $type($Class);
                    const props = classType.$members('own');
                    
                    const propNames = props.map(p => p.$key?.$name);
                    expect(propNames).toContain('property'); // getter/setter
                    expect(propNames).toContain('method');
                    expect(propNames).toContain('constructor');
                });
            });

            describe('on primitives', () => {
                it('should delegate to type for primitive strings', () => {
                    const $string = $instanceof('hello');
                    const $properties = $string.$members('all');
                    const properties = $properties.map(p => p.$key?.$name);
                    expect(properties).toContain('charAt');
                    expect(properties).toContain('toUpperCase');
                });

                it('should return empty for null/undefined', () => {
                    const nullRep = $instanceof(null);
                    const undefinedRep = $instanceof(undefined);
                    
                    expect(nullRep.$members('own')).toEqual([]);
                    expect(nullRep.$members('all')).toEqual([]);
                    expect(undefinedRep.$members('own')).toEqual([]);
                    expect(undefinedRep.$members('all')).toEqual([]);
                });
            });

            it('should find specific fields by name', () => {
                const data = { field: 'value', count: 42 };
                const instance = $instanceof(data);
                
                const field = instance.$field('field');
                expect(field.$role.role).toBe('field');
                expect(field.$value.literal).toBe('value');
                
                const count = instance.$field('count');
                expect(count.$role.role).toBe('field');
                expect(count.$value.literal).toBe(42);
            });

            it('should return undefined rep for missing properties', () => {
                const point = { x: 1 };
                const instance = $instanceof(point);
                
                const missing = instance.$member('y');
                expect(missing.$role.role).toBe('property');
                expect(missing.$role.of).toBe(instance); 
            });

            it('should find inherited properties with "all"', () => {
                const instance = $instanceof(new $SubClass());
                const subField = instance.$field('subField', 'own');
                const inherited = instance.$method('toString', 'own');
                const inheritedAll = instance.$method('toString', 'all');
                
                expect(subField.$value.literal).toBe(2);
                expect(inheritedAll.$value.literal).toBe(Object.prototype.toString);
            });

            it('should handle symbol properties', () => {
                const $symbol = Symbol('test');
                const $object = { [$symbol]: 'symbol value' };
                const $instance = $instanceof($object);
                const $property = $instance.$field($symbol);

                expect($property.$role.role).toBe('field');
                expect($property.$value.literal).toBe('symbol value');
            });

            it('should work with properties', () => {
                const rep = $type($Class).$member("property");
                expect(rep.isProperty).toBe(true);
                expect(rep.isField).toBe(false);
                expect(rep.isMethod).toBe(false); 
                expect(rep.isConfigurable).toBe(true);
                expect(rep.isEnumerable).toBe(false);
                expect(rep.isReadable).toBe(true);
                expect(rep.isWritable).toBe(true); 
            });

            it('should identify field descriptors', () => {
                const obj = { field: 'value' };
                const rep =  $instanceof(obj).$field("field")
                expect(rep.isField).toBe(true);
                expect(rep.isMethod).toBe(false);
                expect(rep.isProperty).toBe(false);
                expect(rep.isWritable).toBe(true);
                expect(rep.$value.literal).toBe('value');
            });

            it('should identify method descriptors', () => {
                const rep = $type($Class).$method("method");
                expect(rep.isMethod).toBe(true);
                expect(rep.isField).toBe(false);
                expect(rep.isProperty).toBe(false);
                expect(typeof rep.$value.literal).toBe('function');
            });

            it('should handle getter-only properties', () => {
                const obj = { get readOnly() { return 42; } };
                const rep = $instanceof(obj).$member("readOnly").$as('property');
                expect(rep.isProperty).toBe(true);
                expect(rep.isReadable).toBe(true);
                expect(rep.isWritable).toBe(false);
                expect(rep.$getter.literal).toBeDefined();
                expect(rep.$setter.literal).toBeUndefined();
            });

            it('should handle setter-only properties', () => {
                const obj = { set writeOnly(v: number) { }};
                const rep = $instanceof(obj).$member("writeOnly").$as('property');
                expect(rep.isProperty).toBe(true);
                expect(rep.isReadable).toBe(false);
                expect(rep.isWritable).toBe(true);
                expect(rep.$getter.literal).toBeUndefined();
                expect(rep.$setter.literal).toBeDefined();
            });

            it('should transform property to field when appropriate', () => {
                const $object = { data: [1, 2, 3] };
                const $instance = $instanceof($object);
                const $field = $instance.$field('data');
                
                const field = $field.$as('field');
                expect(field.$role.role).toBe('field');
                expect(field.$value.literal).toEqual([1, 2, 3]);
                expect(field.isField).toBe(true);
            });

            it('should transform property to method when appropriate', () => {
                const $object = { compute: function (x: number) { return x * 2 } };
                const $instance = $instanceof($object);
                const $method = $instance.$method('compute');
                
                const method = $method.$as('method');
                expect(method.$role.role).toBe('method');
                expect(method.isMethod).toBe(true);
                expect(typeof method.$value.literal).toBe('function');
            });

            it('should handle getter/setter role transformations', () => {
                const property = $type($Class).$member("property").$as('property');;
                const getter = property.$as('getter');
                const setter = property.$as('setter');
                expect(getter.$role.role).toBe('getter');
                expect(setter.$role.role).toBe('setter');
            });

            it('should maintain of relationship through transformations', () => {
                const instance = $instanceof({ x: 1 });
                const prop = instance.$member('x');
                const field = prop.$as('field');
                
                expect(field.$role.of).toBe(instance);
                expect(prop.$role.of).toBe(instance);
            });
        });

        describe('$fields', () => {
            it('should filter only fields (non-function values)', () => {
                const data = {
                    count: 123,
                    field: 'text',
                    fieldFunction: () => {},
                    method: function() {},
                };
                const instance = $instanceof(data);
                
                const fields = instance.$fields();
                expect(fields.length).toBe(3);
                expect(fields.every(f => f.$role.role === 'field')).toBe(true);
                
                const names = fields.map(f => f.$key?.$name).sort();
                expect(names).toEqual(['count', 'field', 'fieldFunction']);
            });

            it('should correctly identify fields on class instances', () => {
                const instance = $instanceof(new $Class());
                const fields = instance.$fields('own');
                
                const fieldNames = fields.map(f => f.$key?.$name);
                expect(fieldNames).toContain('field');
                expect(fieldNames).not.toContain('method');
                expect(fieldNames).not.toContain('property'); // getter/setter
            });

            it('should return field rep for valid field', () => {
                const $object = { data: [1, 2, 3] };
                const $instance = $instanceof($object);
                const $field = $instance.$field('data');
                expect($field.$role.role).toBe('field');
                expect($field.$value.literal).toEqual([1, 2, 3]);
            });

            it('should return undefined rep for non-field', () => {
                const $object = { method: function () {} };
                const $instance = $instanceof($object);
                const notField = $instance.$field('method');
                expect(notField.$role.role).toBe('field');
                expect(notField.$role.of).toBe($instance);
            });
        });

        describe('$methods', () => {
            it('should filter only methods (function values)', () => {
                const $object = {
                    field: 'text',
                    fieldFunction: () => 2,
                    method(x: number) { return x * 3; },
                    methodFunction: function() { return 1; },
                };
                const $instance = $instanceof($object);
                const $methods = $instance.$methods();
                const names = $methods.map(m => m.$key?.$name).sort();

                expect($methods.length).toBe(2);
                expect($methods.every(m => m.$role.role === 'method')).toBe(true);
                expect(names).toEqual(['method', 'methodFunction']);
            });

            it('should find methods on class prototypes', () => {
                const $class = $type($Class);
                const $methods = $class.$methods();
                const names = $methods.map(m => m.$key?.$name);
                expect(names).toContain('method');
                expect(names).not.toContain('property');
            });

            it('should return method rep for valid method', () => {
                const instance = $instanceof(new $Class());
                const method = instance.$method('method', 'all');
                expect(method.$role.role).toBe('method');
                expect(typeof method.$value.literal).toBe('function');
            });

            it('should handle bound methods', () => {
                const obj = {
                    value: 42,
                    getValue() { return this.value; }
                };
                const bound = obj.getValue.bind(obj);
                const instance = $instanceof({ boundMethod: bound });
                
                const method = instance.$method('boundMethod');
                expect(method.$role.role).toBe('method');
                expect(method.$value.literal()).toBe(42);
            });
        });

        describe('$constructor', () => {
            it('should return the right constructors the primitives', () => {
                const $undefinedConstructor = $instanceof(undefined).$constructor;
                const $nullConstructor = $instanceof(null).$constructor;
                const $stringConstructor = $instanceof("test").$constructor;
                const $booleanConstructor = $instanceof(true).$constructor;
                const $objectConstructor = $instanceof({}).$constructor;
                const $functionConstructor = $instanceof(function(){}).$constructor;
                const $prototypeConstructor = $instanceof({}).$prototype.$constructor;

                expect($undefinedConstructor.literal).toBe(undefined);
                expect($nullConstructor.literal).toBe(undefined);
                expect($stringConstructor.literal).toBe(String);
                expect($booleanConstructor.literal).toBe(Boolean);
                expect($objectConstructor.literal).toBe(Object);
                expect($functionConstructor.literal).toBe(Function);
                expect($prototypeConstructor.literal).toBe(undefined);
                expect($undefinedConstructor.$role.$ref).toBe('constructorof(undefined)');
                expect($nullConstructor.$role.$ref).toBe('constructorof(null)');
                expect($stringConstructor.$role.$ref).toBe('constructorof(string)');
                expect($booleanConstructor.$role.$ref).toBe('constructorof(boolean)');
                expect($objectConstructor.$role.$ref).toBe('constructorof(object)');
                expect($functionConstructor.$role.$ref).toBe('constructorof(function)');
                expect($prototypeConstructor.$role.$ref).toBe('constructorof({}.prototype)');
            });

            it('should find methods on class prototypes', () => {
                const $class = $type($Class);
                const $methods = $class.$methods();
                const names = $methods.map(m => m.$key?.$name);
                expect(names).toContain('method');
                expect(names).not.toContain('property');
            });

            it('should return method rep for valid method', () => {
                const instance = $instanceof(new $Class());
                const method = instance.$method('method', 'all');
                expect(method.$role.role).toBe('method');
                expect(typeof method.$value.literal).toBe('function');
            });

            it('should handle bound methods', () => {
                const obj = {
                    value: 42,
                    getValue() { return this.value; }
                };
                const bound = obj.getValue.bind(obj);
                const instance = $instanceof({ boundMethod: bound });
                
                const method = instance.$method('boundMethod');
                expect(method.$role.role).toBe('method');
                expect(method.$value.literal()).toBe(42);
            });
        });

        describe('$parameters', () => {
            it('should handle parameter literals with rest property', () => {
                const func = $instanceof((...args: any[]) => {});
                const parameter = func.$parameters[0];
                expect(parameter.$role.role).toBe('parameter');
                expect(parameter.isRest).toBe(true);
                expect(parameter.isRest).toEqual(true);
            });

            it('should handle non-rest parameters', () => {
                const func = $instanceof((x: number) => x);
                const parameter = func.$parameters[0];
                expect(parameter.$role.role).toBe('parameter');
                expect(parameter.isRest).toBe(false);
            });

            it('should build parameters array from function info', () => {
                const compute = (a: number, b: string, ...rest: boolean[]) => {};
                const func = $instanceof(compute);
                const parameters = func.$parameters;
                
                expect(parameters.length).toBe(3);
                expect(parameters[0].isRest).toBe(false);
                expect(parameters[1].isRest).toBe(false);
                expect(parameters[2].isRest).toBe(true);
                
                expect(parameters.every(p => p.$role.role === 'parameter')).toBe(true);
                expect(parameters.every(p => p.$role.of === func)).toBe(true);
            });

            it('should detect hasRest on functions', () => {
                const withRest = $instanceof((...args: any[]) => {});
                const withoutRest = $instanceof((x: number, y: number) => {});
                
                expect(withRest.hasRest).toBe(true);
                expect(withoutRest.hasRest).toBe(false);
            });
        });

        describe('$miscellaneous', () => {
            it('should handle nested object properties', () => {
                const structure = {
                    level1: {
                        level2: {
                            value: 'deep'
                        }
                    }
                };
                const instance = $instanceof(structure);
                
                const level1 = instance.$field('level1');
                expect(level1.isField).toBe(true);
                
                const level1Instance = $instanceof(level1.$value.literal);
                const level2 = level1Instance.$field('level2');
                expect(level2.isField).toBe(true);
                
                const level2Instance = $instanceof(level2.$value.literal);
                const value = level2Instance.$field('value');
                expect(value.$value.literal).toBe('deep');
            });

            it('should handle properties on prototype chain correctly', () => {
                class Base {
                    baseField = 1;
                    baseMethod() { return 'base'; }
                }
                
                class Derived extends Base {
                    derivedField = 2;
                    override baseMethod() { return 'derived'; }
                }
                
                const instance = $instanceof(new Derived());
                
                // Own properties include instance fields
                const ownProps = instance.$members('own');
                const ownNames = ownProps.map(p => p.$key?.$name);
                expect(ownNames).toContain('baseField');
                expect(ownNames).toContain('derivedField');
                
                // Methods are on prototype, found in 'all'
                const allMethods = instance.$methods('all');
                const methodNames = allMethods.map(m => m.$key?.$name);
                expect(methodNames).toContain('baseMethod');
            });

            it('should handle property modifications through descriptors', () => {
                const data = { value: 1 };
                
                // Make property non-writable
                Object.defineProperty(data, 'value', {
                    writable: false,
                    value: 42
                });
                
                const instance = $instanceof(data);
                const property = instance.$field('value');
                
                expect(property.isWritable).toBe(false);
                expect(property.isReadable).toBe(true);
                expect(property.$value.literal).toBe(42);
            });

            it('should handle objects with null prototype', () => {
                const bare = Object.create(null);
                bare.x = 1;
                
                const instance = $instanceof(bare);
                const properties = instance.$members('own');
                
                expect(properties.length).toBe(1);
                expect(properties[0].$key?.$name).toBe('x');
            });

            it('should handle frozen objects', () => {
                const immutable = Object.freeze({ x: 1, y: 2 });
                const instance = $instanceof(immutable);
                
                const properties = instance.$members();
                properties.forEach(property => {
                    expect(property.isConfigurable).toBe(false);
                    expect(property.isWritable).toBe(false);
                });
            });

            it('should handle property names that are numbers', () => {
                const indexed = { 0: 'zero', 1: 'one', 2: 'two' };
                const instance = $instanceof(indexed);
                
                const property0 = instance.$field('0');
                expect(property0.$value.literal).toBe('zero');
                
                const property1 = instance.$field('1');
                expect(property1.$value.literal).toBe('one');
            });

            it('should handle empty objects', () => {
                const empty = {};
                const instance = $instanceof(empty);
                
                expect(instance.$members('own').length).toBe(0);
                expect(instance.$fields('own').length).toBe(0);
                expect(instance.$methods('own').length).toBe(0);
                
                // But should have inherited properties
                expect(instance.$members('all').length).toBeGreaterThan(0);
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
                    { name: 'getter', func: [Object.getOwnPropertyDescriptor($Class.prototype, 'property')!.get!][0], expectedForm: 'getter' },
                    { name: 'setter', func: [Object.getOwnPropertyDescriptor($Class.prototype, 'property')!.set!][0], expectedForm: 'setter' },
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
                    { name: 'getter', func: [Object.getOwnPropertyDescriptor($Class.prototype, 'property')!.get!][0], expectedName: 'property' },
                    { name: 'setter', func: [Object.getOwnPropertyDescriptor($Class.prototype, 'property')!.set!][0], expectedName: 'property' },
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
                expect(result.params).toEqual([{ rest: true }]);
            });

            it('async generator with params and rest', () => {
                const result = parseFunctionInfo([async function* (a: any, b: any, ...rest: any[]) { }][0]);
                expect(result.form).toBe('function');
                expect(result.async).toBe(true);
                expect(result.generator).toBe(true);
                expect(result.params).toEqual([{ rest: false }, { rest: false }, { rest: true }]);
            });

            it('async generator method with rest', () => {
                const result = parseFunctionInfo([({ async *method(...args: any[]) { } }).method][0]);
                expect(result.form).toBe('method');
                expect(result.async).toBe(true);
                expect(result.generator).toBe(true);
                expect(result.params).toEqual([{ rest: true }]);
            });
        });

        describe('parameter array structure', () => {
            const testCases: Array<{name: string, func: Function, expected: Array<{ rest: boolean }>}> = [
                { name: 'no params - lambda', func: [() => { }][0], expected: [] },
                { name: 'no params - function', func: [function() { }][0], expected: [] },
                { name: 'no params - method', func: [({ m() { } }).m][0], expected: [] },
                { name: 'single param - lambda', func: [(x: any) => { }][0], expected: [{ rest: false }] },
                { name: 'single param - function', func: [function(x: any) { }][0], expected: [{ rest: false }] },
                { name: 'single param - method', func: [({ m(x: any) { } }).m][0], expected: [{ rest: false }] },
                { name: 'two params - lambda', func: [(x: any, y: any) => { }][0], expected: [{ rest: false }, { rest: false }] },
                { name: 'two params - function', func: [function(x: any, y: any) { }][0], expected: [{ rest: false }, { rest: false }] },
                { name: 'two params - method', func: [({ m(x: any, y: any) { } }).m][0], expected: [{ rest: false }, { rest: false }] },
                { name: 'three params - lambda', func: [(x: any, y: any, z: any) => { }][0], expected: [{ rest: false }, { rest: false }, { rest: false }] },
                { name: 'three params - function', func: [function(x: any, y: any, z: any) { }][0], expected: [{ rest: false }, { rest: false }, { rest: false }] },
                { name: 'three params - method', func: [({ m(x: any, y: any, z: any) { } }).m][0], expected: [{ rest: false }, { rest: false }, { rest: false }] },
                { name: 'four params - lambda', func: [(a: any, b: any, c: any, d: any) => { }][0], expected: [{ rest: false }, { rest: false }, { rest: false }, { rest: false }] },
                { name: 'four params - function', func: [function(a: any, b: any, c: any, d: any) { }][0], expected: [{ rest: false }, { rest: false }, { rest: false }, { rest: false }] },
                { name: 'four params - method', func: [({ m(a: any, b: any, c: any, d: any) { } }).m][0], expected: [{ rest: false }, { rest: false }, { rest: false }, { rest: false }] },
                { name: 'rest only - lambda', func: [(...args: any[]) => { }][0], expected: [{ rest: true }] },
                { name: 'rest only - function', func: [function(...args: any[]) { }][0], expected: [{ rest: true }] },
                { name: 'rest only - method', func: [({ m(...args: any[]) { } }).m][0], expected: [{ rest: true }] },
                { name: 'single param + rest - lambda', func: [(x: any, ...rest: any[]) => { }][0], expected: [{ rest: false }, { rest: true }] },
                { name: 'single param + rest - function', func: [function(x: any, ...rest: any[]) { }][0], expected: [{ rest: false }, { rest: true }] },
                { name: 'single param + rest - method', func: [({ m(x: any, ...rest: any[]) { } }).m][0], expected: [{ rest: false }, { rest: true }] },
                { name: 'two params + rest - lambda', func: [(a: any, b: any, ...rest: any[]) => { }][0], expected: [{ rest: false }, { rest: false }, { rest: true }] },
                { name: 'two params + rest - function', func: [function(a: any, b: any, ...rest: any[]) { }][0], expected: [{ rest: false }, { rest: false }, { rest: true }] },
                { name: 'two params + rest - method', func: [({ m(a: any, b: any, ...rest: any[]) { } }).m][0], expected: [{ rest: false }, { rest: false }, { rest: true }] },
                { name: 'three params + rest - lambda', func: [(a: any, b: any, c: any, ...rest: any[]) => { }][0], expected: [{ rest: false }, { rest: false }, { rest: false }, { rest: true }] },
                { name: 'three params + rest - function', func: [function(a: any, b: any, c: any, ...rest: any[]) { }][0], expected: [{ rest: false }, { rest: false }, { rest: false }, { rest: true }] },
                { name: 'three params + rest - method', func: [({ m(a: any, b: any, c: any, ...rest: any[]) { } }).m][0], expected: [{ rest: false }, { rest: false }, { rest: false }, { rest: true }] },
                { name: 'four params + rest - lambda', func: [(a: any, b: any, c: any, d: any, ...rest: any[]) => { }][0], expected: [{ rest: false }, { rest: false }, { rest: false }, { rest: false }, { rest: true }] },
                { name: 'four params + rest - function', func: [function(a: any, b: any, c: any, d: any, ...rest: any[]) { }][0], expected: [{ rest: false }, { rest: false }, { rest: false }, { rest: false }, { rest: true }] },
                { name: 'four params + rest - method', func: [({ m(a: any, b: any, c: any, d: any, ...rest: any[]) { } }).m][0], expected: [{ rest: false }, { rest: false }, { rest: false }, { rest: false }, { rest: true }] },
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