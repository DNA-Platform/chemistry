import { $Rep, PrimitiveType, Type, Typeof, Constructor, primitives, TypeofType, typeofTypes } from "./types";
import { $lib, $Library } from './catalogue';
import {// $SubjectiveRep
    $ref$, $roles$, $role$, $of$, $type$$, $prototype$$, $canonical$, $key$, $value$, $name$, $members$, $membersOwn$, $membersMap$, $method$, $getter$, $setter$, $parameters$, $constructor$
} from './symbols'
import {// $ObjectiveRep
    $literal$, $typeof$, $functionInfo$
} from './symbols'

export type $ObjectiveRole = 'object' | 'function' | 'primitive' | 'array' | 'parameter' | 'instance' | 'prototype' | 'type' | 'constructor' | 'class' | 'generic' | 'member' | 'field' | 'property' | 'method' | 'getter' | 'setter' | 'identifier' | 'value' | 'JavaScript' | 'TypeScript';

export function $instanceof<T>(literal: null): $Primitive<null>;
export function $instanceof(literal: undefined): $Primitive<undefined>;
export function $instanceof(literal: string): $Primitive<string>;
export function $instanceof(literal: number): $Primitive<number>;
export function $instanceof(literal: boolean): $Primitive<boolean>;
export function $instanceof(literal: symbol): $Primitive<symbol>;
export function $instanceof(literal: bigint): $Primitive<bigint>;
export function $instanceof(literal: Function): $Function;
export function $instanceof<T>(literal: T[]): $Array<T>;
export function $instanceof<T>(literal: T): $Object<T>;
export function $instanceof(literal: any): any {
    if (literal === null || literal === undefined)
        return $$type(literal).$as('primitive');
    const type = $$typeof(literal);
    const of = type[$of$];
    return of as $ObjectiveRep;
}

export function $typeof(literal: null): $PrimitiveType;
export function $typeof(literal: undefined): $PrimitiveType;
export function $typeof(literal: string): $PrimitiveType;
export function $typeof(literal: number): $PrimitiveType;
export function $typeof(literal: boolean): $PrimitiveType;
export function $typeof(literal: symbol): $PrimitiveType;
export function $typeof(literal: bigint): $PrimitiveType;
export function $typeof<T>(literal: T[]): $Type<typeof Array>;
export function $typeof<T extends Function>(literal: T): $Type<typeof Function>;
export function $typeof(literal: object): $Type;
export function $typeof(literal: any): $Type | $PrimitiveType;
export function $typeof(literal: any): any {
    if (literal === null || literal === undefined)
        return $$type(undefined);
    if (literal == Object.prototype) {
        const $object = $$type(Object);
        return $object.$of($object.$prototype);
    }
    const $$$type = primitives.has(typeof literal) ?
        $$type(primitives.get(typeof literal)!) :
        $$type(Object.getPrototypeOf(literal)?.constructor);

    const $$$instance = new $ObjectiveRep('instance', $$$type, literal);
    return $$$type.$of($$$instance);
}

export function $type(type: undefined): $PrimitiveType;
export function $type(type: null): $PrimitiveType;
export function $type(type: typeof String): $PrimitiveType;
export function $type(type: typeof Number): $PrimitiveType;
export function $type(type: typeof Boolean): $PrimitiveType;
export function $type(type: typeof Symbol): $PrimitiveType;
export function $type(type: typeof BigInt): $PrimitiveType;
export function $type<T extends Constructor>(type: T): $Type<T>;
export function $type(type: Type | TypeofType): $Type | $PrimitiveType;
export function $type(type: Type | TypeofType): any {
    return new $ObjectiveRep('type', 'JavaScript', type, $lib);
}

const $$instanceof: (literal: any) => $ObjectiveRep = $instanceof as any;
const $$typeof: (literal: any) => $ObjectiveRep = $typeof as any;
const $$type: (type: Type | TypeofType) => $ObjectiveRep = $type as any;

export interface $Object<T = any> extends $Rep {
    literal: T;
    $name: string;
    $ref: string;
    $role: { role: string, of: any, $ref: string };
    $type: $Type;
    $prototype: $Object;
    $constructor: $Constructor;
    $is(literal: undefined): boolean;
    $is(role: 'primitive'): this is $Primitive;
    $is(role: 'function'): this is $Function;
    $is(role: 'type'): this is $Type;
    $is(role: 'constructor'): this is $Constructor;
    $is(role: 'array'): this is $Array;
    $is(role: 'instance'): this is $Object<T>;
    $is(role: 'object'): this is $Object<T>;
    $is(role: 'prototype'): this is $Object;
    $is(jstype: 'string'): this is $Primitive<string>;
    $is(jstype: 'number'): this is $Primitive<number>;
    $is(jstype: 'boolean'): this is $Primitive<boolean>;
    $is(jstype: 'symbol'): this is $Primitive<symbol>;
    $is(jstype: 'bigint'): this is $Primitive<bigint>;
    $is(jstype: 'undefined'): this is $Primitive<undefined>;
    $is(type: typeof String): boolean;
    $is(type: typeof Number): boolean;
    $is(type: typeof Boolean): boolean;
    $is(type: typeof Symbol): boolean;
    $is(type: typeof BigInt): boolean;
    $is(type: typeof Object): boolean;
    $is(type: typeof Array): boolean;
    $is(type: typeof Function): boolean;
    $is(type: Type | TypeofType): boolean;
    $as(role: 'primitive'): $Primitive;
    $as(role: 'function'): $Function;
    $as(role: 'type'): $Type;
    $as(role: 'constructor'): $Constructor;
    $as(role: 'array'): $Array;
    $as(role: 'object'): $Object<T>;
    $as(role: 'instance'): $Object<T>;
    $as(role: 'prototype'): $Object;
    $member(name: string | symbol, whos?: 'own' | 'all'): $Member;
    $members(whos?: 'own' | 'all'): $Member[];
    $field(name: string | symbol, whos?: 'own' | 'all'): $Field;
    $fields(whos?: 'own' | 'all'): $Field[];
    $property(name: string | symbol, whos?: 'own' | 'all'): $Property;
    $properties(whos?: 'own' | 'all'): $Property[];
    $method(name: string | symbol, whos?: 'own' | 'all'): $Method;
    $methods(whos?: 'own' | 'all'): $Method[];
    $equals(other: $Rep): boolean;
}

export interface $Primitive<T extends string | number | boolean | symbol | bigint | null | undefined = any> extends $Rep {
    literal: T;
    $name: string;
    $ref: string;
    $role: { role: string, of: any, $ref: string };
    $type: $Type;
    $prototype: $Object;
    $constructor: $Constructor;
    $is(literal: undefined): boolean;
    $is(role: 'object'): this is $Object<T>;
    $is(role: 'primitive'): this is $Primitive<T>;
    $is(jstype: 'string'): this is $Primitive<string>;
    $is(jstype: 'number'): this is $Primitive<number>;
    $is(jstype: 'boolean'): this is $Primitive<boolean>;
    $is(jstype: 'symbol'): this is $Primitive<symbol>;
    $is(jstype: 'bigint'): this is $Primitive<bigint>;
    $is(type: Type | TypeofType): boolean;
    $as(role: 'object'): $Object<T>;
    $as(role: 'primitive'): $Primitive<T>;
    $member(name: string | symbol, whos?: 'own' | 'all'): $Member;
    $members(whos?: 'own' | 'all'): $Member[];
    $field(name: string | symbol, whos?: 'own' | 'all'): $Field;
    $fields(whos?: 'own' | 'all'): $Field[];
    $property(name: string | symbol, whos?: 'own' | 'all'): $Property;
    $properties(whos?: 'own' | 'all'): $Property[];
    $method(name: string | symbol, whos?: 'own' | 'all'): $Method;
    $methods(whos?: 'own' | 'all'): $Method[];
    $equals(other: $Rep): boolean;
}

export interface $Function<T extends Function = Function> extends $Rep {
    literal: T;
    $name: string;
    $ref: string;
    $role: { role: string, of: any, $ref: string };
    $type: $Type;
    $prototype: $Object;
    $constructor: $Constructor;
    $parameters: $Parameter[];
    form: 'lambda' | 'function' | 'method' | 'getter' | 'setter' | 'class' | 'unknown';
    isAsync: boolean | undefined;
    isGenerator: boolean | undefined;
    isNative: boolean | undefined;
    hasRest: boolean;
    $is(literal: undefined): boolean;
    $is(role: 'type'): this is $Type;
    $is(role: 'constructor'): this is $Constructor;
    $is(role: 'function'): this is $Function<T>;
    $is(role: 'object'): this is $Object<T>;
    $is(jstype: 'function'): this is $Function<T>;
    $is(type: typeof Function): boolean;
    $is(type: Type | TypeofType): boolean;
    $as(role: 'type'): $Type;
    $as(role: 'constructor'): $Constructor;
    $as(role: 'function'): $Function<T>;
    $as(role: 'object'): $Object<T>;
    $call(...args: any): T;
    $equals(other: $Rep): boolean;
}

export interface $PrimitiveType extends $Rep {
    literal: undefined | null | typeof String | typeof Number | typeof Boolean | typeof Symbol | typeof BigInt;
    $name: string;
    $ref: string;
    $role: { role: string, of: any, $ref: string };
    $prototype: $Object;
    $constructor: $Constructor;
    $type: $Type;
    $parameters: $Parameter[];
    $is(literal: undefined): boolean;
    $is(role: 'type'): this is $Type;
    $is(type: typeof String): this is $Type<typeof String>;
    $is(type: typeof Number): this is $Type<typeof Number>;
    $is(type: typeof Boolean): this is $Type<typeof Boolean>;
    $is(type: typeof Symbol): this is $Type<typeof Symbol>;
    $is(type: typeof BigInt): this is $Type<typeof BigInt>;
    $is(type: Type | TypeofType): boolean;
    $as(role: 'type'): $Type;
    $member(name: string | symbol, whos?: 'own' | 'all'): $Member;
    $members(whos?: 'own' | 'all'): $Member[];
    $field(name: string | symbol, whos?: 'own' | 'all'): $Field;
    $fields(whos?: 'own' | 'all'): $Field[];
    $property(name: string | symbol, whos?: 'own' | 'all'): $Property;
    $properties(whos?: 'own' | 'all'): $Property[];
    $method(name: string | symbol, whos?: 'own' | 'all'): $Method;
    $methods(whos?: 'own' | 'all'): $Method[];
    $equals(other: $Rep): boolean;
}

export interface $Type<T extends Constructor | Function = Constructor> extends $Rep {
    literal: T;
    $name: string;
    $ref: string;
    $role: { role: string, of: any, $ref: string };
    $prototype: $Object;
    $constructor: $Constructor<T>;
    $type: $Type;
    $parameters: $Parameter[];
    $is(literal: undefined): boolean;
    $is(role: 'constructor'): this is $Constructor<T>;
    $is(role: 'function'): this is $Function<T>;
    $is(role: 'type'): this is $Type<T>;
    $is(role: 'class'): this is $Type<T>;
    $is(role: 'object'): this is $Object<T>;
    $is(type: Type | TypeofType): boolean;
    $as(role: 'constructor'): $Constructor<T>;
    $as(role: 'function'): $Function<T>;
    $as(role: 'type'): $Type<T>;
    $as(role: 'class'): $Type<T>;
    $as(role: 'object'): $Object<T>;
    $member(name: string | symbol, whos?: 'own' | 'all'): $Member;
    $members(whos?: 'own' | 'all'): $Member[];
    $field(name: string | symbol, whos?: 'own' | 'all'): $Field;
    $fields(whos?: 'own' | 'all'): $Field[];
    $property(name: string | symbol, whos?: 'own' | 'all'): $Property;
    $properties(whos?: 'own' | 'all'): $Property[];
    $method(name: string | symbol, whos?: 'own' | 'all'): $Method;
    $methods(whos?: 'own' | 'all'): $Method[];
    $equals(other: $Rep): boolean;
}

export interface $Constructor<T extends Constructor | Function = Constructor> extends $Rep {
    literal: T;
    $name: string;
    $ref: string;
    $role: { role: string, of: any, $ref: string };
    $prototype: $Object;
    $type: $Type;
    $constructor: $Constructor<T>;
    $parameters: $Parameter[];
    $is(literal: undefined): boolean;
    $is(role: 'type'): this is $Type<T>;
    $is(role: 'function'): this is $Function<T>;
    $is(role: 'constructor'): this is $Constructor<T>;
    $is(role: 'object'): this is $Object<T>;
    $is(type: Type | TypeofType): boolean;
    $as(role: 'type'): $Type<T>;
    $as(role: 'function'): $Function<T>;
    $as(role: 'constructor'): $Constructor<T>;
    $as(role: 'object'): $Object<T>;
    $new(...args: any): T;
    $member(name: string | symbol, whos?: 'own' | 'all'): $Member;
    $members(whos?: 'own' | 'all'): $Member[];
    $property(name: string | symbol, whos?: 'own' | 'all'): $Property;
    $properties(whos?: 'own' | 'all'): $Property[];
    $field(name: string | symbol, whos?: 'own' | 'all'): $Field;
    $fields(whos?: 'own' | 'all'): $Field[];
    $method(name: string | symbol, whos?: 'own' | 'all'): $Method;
    $methods(whos?: 'own' | 'all'): $Method[];
    $equals(other: $Rep): boolean;
}

export interface $Array<T = any> extends $Rep {
    literal: T[];
    $name: string;
    $ref: string;
    $role: { role: string, of: any, $ref: string };
    $type: $Type;
    $prototype: $Object;
    $constructor: $Constructor;
    $is(literal: undefined): boolean;
    $is(role: 'array'): this is $Array<T>;
    $is(role: 'object'): this is $Object<T[]>;
    $is(type: typeof Array): boolean;
    $is(type: Type | TypeofType): boolean;
    $as(role: 'array'): $Array<T>;
    $as(role: 'object'): $Object<T[]>;
    $member(name: string | symbol, whos?: 'own' | 'all'): $Member;
    $members(whos?: 'own' | 'all'): $Member[];
    $field(name: string | symbol, whos?: 'own' | 'all'): $Field;
    $fields(whos?: 'own' | 'all'): $Field[];
    $property(name: string | symbol, whos?: 'own' | 'all'): $Property;
    $properties(whos?: 'own' | 'all'): $Property[];
    $method(name: string | symbol, whos?: 'own' | 'all'): $Method;
    $methods(whos?: 'own' | 'all'): $Method[];
    $equals(other: $Rep): boolean;
}

export interface $Member extends $Rep {
    $name: string;
    $ref: string;
    $role: { role: string, of: any, $ref: string };
    $key: $Object<string | symbol>;
    $value: any;
    isReadable: boolean;
    isWritable: boolean;
    isConfigurable: boolean;
    isEnumerable: boolean;
    isField: boolean;
    isMethod: boolean;
    isProperty: boolean;
    $is(role: 'member'): this is $Member;
    $is(role: 'property'): this is $Property;
    $is(role: 'field'): this is $Field;
    $is(role: 'method'): this is $Method;
    $as(role: 'member'): $Member;
    $as(role: 'property'): $Property;
    $as(role: 'field'): $Field;
    $as(role: 'method'): $Method;
    $equals(other: $Rep): boolean;
}

export interface $Property extends $Rep {
    $name: string;
    $ref: string;
    $role: { role: string, of: any, $ref: string };
    $key: $Object<string | symbol>;
    isReadable: boolean;
    isWritable: boolean;
    isConfigurable: boolean;
    isEnumerable: boolean;
    isField: boolean;
    isMethod: boolean;
    isProperty: boolean;
    $getter: $Function;
    $setter: $Function;
    $is(role: 'member'): this is $Member;
    $is(role: 'property'): this is $Property;
    $is(role: 'getter'): boolean;
    $is(role: 'setter'): boolean;
    $as(role: 'member'): $Member;
    $as(role: 'property'): $Property;
    $as(role: 'getter'): $Function;
    $as(role: 'setter'): $Function;
    $equals(other: $Rep): boolean;
}

export interface $Field<T = any> extends $Rep {
    $name: string;
    $ref: string;
    $role: { role: string, of: any, $ref: string };
    $key: $Object<string | symbol>;
    isReadable: boolean;
    isWritable: boolean;
    isConfigurable: boolean;
    isEnumerable: boolean;
    isField: boolean;
    isMethod: boolean;
    isProperty: boolean;
    $value: $Object<T>;
    $is(role: 'member'): this is $Member;
    $is(role: 'field'): this is $Field<T>;
    $as(role: 'member'): $Member;
    $as(role: 'field'): $Field<T>;
    $equals(other: $Rep): boolean;
}

export interface $Method<T extends Function = Function> extends $Rep {
    $name: string;
    $ref: string;
    $role: { role: string, of: any, $ref: string };
    $key: $Object<string | symbol>;
    isReadable: boolean;
    isWritable: boolean;
    isConfigurable: boolean;
    isEnumerable: boolean;
    isField: boolean;
    isMethod: boolean;
    isProperty: boolean;
    $value: $Function<T>;
    $parameters: $Parameter[];
    form: 'method' | 'function';
    isAsync: boolean | undefined;
    isGenerator: boolean | undefined;
    $is(role: 'member'): this is $Member;
    $is(role: 'method'): this is $Method<T>;
    $is(role: 'function'): boolean;
    $as(role: 'member'): $Member;
    $as(role: 'method'): $Method<T>;
    $as(role: 'function'): $Function<T>;
    $call(...args: any): T;
    $equals(other: $Rep): boolean;
}

export interface $Parameter extends $Rep {
    $ref: string;
    $role: { role: string, of: any, $ref: string };
    isRest: boolean;
    $equals(other: $Rep): boolean;
}

export type LiteralOf<T> = T extends { literal: infer L } ? L : never;
export type IsRole<T, R extends string> = T extends { $is(role: R): true } ? T : never;
export type AsRole<T, R extends string> = T extends { $as(role: R): infer U } ? U : never;

export class $SubjectiveRep<$RepType extends $SubjectiveRep<$RepType> = any>  {
    #lib?: $Library;
    [$ref$]: string;
    [$role$]: string;
    [$roles$] = new Map<string, $RepType>;
    [$of$]: $RepType | string;
    [$type$$]?: $RepType;
    [$prototype$$]?: $RepType;
    [$canonical$]!: $RepType;
    [$name$]?: string;
    [$key$]?: $RepType;
    [$members$]?: $RepType[];
    [$membersOwn$]?: $RepType[];
    [$membersMap$]?: Map<string | symbol, $RepType>;
    [$value$]?: $RepType;
    [$getter$]?: $RepType;
    [$setter$]?: $RepType;
    [$parameters$]?: $RepType[];
    [$constructor$]?: $RepType;

    get $ref(): string {
        return this[$ref$];
    }

    get $name(): string {
        return this[$name$] || this[$ref$];
    }

    get $type(): $RepType {
        const $this: $RepType = this as any;
        return this[$type$$] || $this.$as('type').$of($this);
    }

    get $role(): { role: string, of: $SubjectiveRep | string, $ref: string } {
        const $this: $RepType = this as any;
        const $role = {
            role: this[$role$],
            of: this[$of$],
            get $ref() {
                return `${$this[$role$]}of(${$role.of[$role$]})`;
            },
            toString: () => $role.$ref
        } as any;
        return $role;
    }
    
    constructor(role: string, of: $RepType | string, ref: string, lib?: $Library, customize?: ($this: $SubjectiveRep<$RepType>) => void) {
        this[$ref$] = ref;
        this[$role$] = role;
        this[$of$] = of;
        if (ref === undefined) return;
        this.#lib = lib;
        const $this: $RepType = this as any; 
        if (lib) {
            const $this = lib!.$find(this) as $RepType;
            if ($this) return $this.$as(role).$of(of as any) as any;
            lib!.$index(this);
            this[$canonical$] = $this;
        }
        this[$roles$].set(role, $this);
        if (typeof of === 'string')
            this[$roles$].set($this.$role.$ref, $this);
        if (customize)
            customize(this);
    }

    $as(role: string): $RepType {
        if (this[$role$] == role) return this as any;
        if (this[$roles$].has(role))
            return this[$roles$].get(role)!;
        const $this = this.$create(this[$canonical$]);
        $this[$role$] = role;
        $this[$roles$].set(role, $this);
        if (typeof this[$of$] === 'string')
            this[$roles$].set($this.$role.$ref, $this);
        return $this;
    }

    $of(of: $RepType | string): $RepType {
        if (this[$of$] == of) return this as any;
        const $this = this.$create();
        $this[$of$] = of;
        const $$this = this[$roles$].get($this.$role.$ref);
        return $$this ? $$this : $this;
    }

    protected getDescription(): string {
        return this[$ref$];
    }

    protected $create(version?: $RepType): $RepType {
        version = version || this as any;
        const $this = Object.create(version!) as $RepType;
        return $this;
    }
}

export class $ObjectiveRep extends $SubjectiveRep<$ObjectiveRep> {
    #$lib?: $Library;
    [$literal$]: any;
    [$typeof$]: Typeof;
    [$method$]?: $ObjectiveRep;
    [$functionInfo$]?: $FunctionInfo;

    get literal() { return this[$literal$]; }

    get $name(): string {
        if (!this[$name$])
            this[$name$] = this.getName();
        return this[$name$]!;
    }

    get $key(): $ObjectiveRep | undefined {
        if (this[$key$]) return this[$key$];
        this[$key$] = new $ObjectiveRep('identifier', this, this[$literal$].property, this[$canonical$].#$lib);
        return this[$key$];
    }

    get $role(): { role: string, of: $ObjectiveRep | string, $ref: string } {
        const $this = this;
        const $role = {
            role: this[$role$],
            of: this[$of$],
            get $ref() {
                let $rep = $this[$of$] === 'JavaScript' || this[$of$] === 'TypeScript' ? $this.$name :
                    typeof $this[$of$] === 'string' ? $this[$of$] :
                        $this[$of$].getDescription();
                return `${$this[$role$]}of(${$rep})`;
            },
            toString: () => $role.$ref
        } as any;
        return $role;
    }

    get $ref(): string {
        if (this[$canonical$][$ref$]) return this[$canonical$][$ref$];
        this[$canonical$][$ref$] = `${this[$canonical$][$role$]}(${this[$canonical$].$name})`;
        return this[$canonical$][$ref$];
    }

    get $prototype(): $ObjectiveRep {
        return this.getPrototype();
    }

    get $type(): $ObjectiveRep {
        return this.getType();
    }

    get $constructor(): $ObjectiveRep {
        if (!this[$constructor$]) {
            this[$constructor$] =
                this[$literal$] === Object.prototype || this[$literal$] === null ? $$typeof(undefined).$as('constructor').$of(this) :
                    this[$roles$].has('type') ? this.$as('constructor') :
                        this.$type.$as('constructor');
        }
        return this[$constructor$];
    }

    get $value(): $ObjectiveRep { 
        const descriptor = this[$literal$] as PropertyDescriptor;
        const $of = this[$of$] as $ObjectiveRep;
        if (!descriptor || !this.isReadable) return $$typeof(undefined).$as('value').$of(this);
        return 'value' in descriptor ? 
            new $ObjectiveRep('value', this, descriptor!.value, this[$canonical$].#$lib) :
            new $ObjectiveRep('value', this, descriptor!.get!.bind($of[$literal$])(), this[$canonical$].#$lib);
    }

    get $getter(): $ObjectiveRep {
        if (!this[$getter$]) {
            const descriptor = this[$literal$] as PropertyDescriptor;
            this[$getter$] = new $ObjectiveRep('getter', this, descriptor?.get, this[$canonical$].#$lib);
        }
        return this[$getter$];
    }

    get $setter(): $ObjectiveRep {
        if (!this[$setter$]) {
            const descriptor = this[$literal$] as PropertyDescriptor;
            this[$setter$] = new $ObjectiveRep('setter', this, descriptor?.set, this[$canonical$].#$lib);
        }
        return this[$setter$];
    }

    get $parameters(): $ObjectiveRep[] {
        if (!this[$parameters$]) {
            const info = this.getFunctionInfo();
            if (!info.params) {
                this[$parameters$] = [];
            } else {
                this[$parameters$] = info.params.map(param =>
                    new $ObjectiveRep('parameter', this, param, this[$canonical$].#$lib)
                );
            }
        }
        return this[$parameters$];
    }

    get isConfigurable(): boolean {
        const descriptor = this[$literal$] as PropertyDescriptor;
        return descriptor.configurable!;
    }

    get isEnumerable(): boolean {
        const descriptor = this[$literal$] as PropertyDescriptor;
        return descriptor.enumerable!;
    }

    get isReadable(): boolean {
        const descriptor = this[$literal$] as PropertyDescriptor;
        return 'value' in descriptor || !!descriptor.get;
    }

    get isWritable(): boolean {
        const descriptor = this[$literal$] as PropertyDescriptor;
        return !!descriptor.writable || !!descriptor.set;
    }

    get isField(): boolean {
        const descriptor = this[$literal$] as PropertyDescriptor;
        return 'value' in descriptor && !this.isMethod;
    }

    get isMethod(): boolean {
        return this.$value.$type.$is('function') && (this.$value.form === 'method' || this.$value.form === 'function');
    }

    get isProperty(): boolean {
        const descriptor = this[$literal$] as PropertyDescriptor;
        return !!(descriptor.get || descriptor.set);
    }

    get form(): 'lambda' | 'function' | 'method' | 'getter' | 'setter' | 'class' | 'unknown' {
        return this.getFunctionInfo().form;
    }

    get isAsync(): boolean | undefined {
        return this.getFunctionInfo().async;
    }

    get isGenerator(): boolean | undefined {
        return this.getFunctionInfo().generator;
    }

    get isNative(): boolean | undefined {
        return this.getFunctionInfo().native;
    }

    get isRest(): boolean {
        const literal = this[$literal$] as { rest: boolean };
        return literal.rest;
    }

    get hasRest(): boolean {
        const params = this.$parameters;
        return params?.length > 0 && params[params.length - 1].isRest;
    }

    $call<T = any>(...args: any[]): T {
        const $of = this[$of$] as $ObjectiveRep;
        const desc = this[$literal$] as PropertyDescriptor;
        return this[$role$] === 'constructor' ? this.$new(...args) :
            this[$role$] === 'method' ? desc.value.call($of[$literal$], ...args) :
            this[$literal$](...args);
    }

    $new<T = any>(...args: any[]): T {
        return new this[$literal$](...args);
    }

    $member(name: string | symbol, whos: 'own' | 'all' = 'all'): $ObjectiveRep {
        this.getMembers(whos);
        const $undefined = $$instanceof(undefined).$as('property').$of(this);
        const member = this[$membersMap$]!.get(name);
        if (member) return member;
        if (whos === 'own') return member || $undefined;
        if (this.$equals(this.$type)) return $undefined;
        return this.$type.literal ? this.$type.$member(name, whos).$of(this) : $undefined;
    }

    $members(whos: 'own' | 'all' = 'own') {
        return this.getMembers(whos);
    }

    $property(name: string | symbol, whos: 'own' | 'all' = 'all'): $ObjectiveRep {
        this.getMembers(whos);
        const $undefined = $$instanceof(undefined).$as('property').$of(this);
        const member = this.$member(name, whos);
        return member.isField ? member.$as('property') : $undefined;
    }

    $properties(whos: 'own' | 'all' = 'own'): $ObjectiveRep[] {
        return this.$members(whos).filter(p => p.isField).map(p => p.$as('field'));
    }

    $field(name: string | symbol, whos: 'own' | 'all' = 'all'): $ObjectiveRep {
        this.getMembers(whos);
        const $undefined = $$instanceof(undefined).$as('field').$of(this);
        const member = this.$member(name, whos);
        return member.isField ? member.$as('field') : $undefined;
    }

    $fields(whos: 'own' | 'all' = 'own'): $ObjectiveRep[] {
        return this.$members(whos).filter(p => p.isField).map(p => p.$as('field'));
    }

    $method(name: string | symbol, whos: 'own' | 'all' = 'all'): $ObjectiveRep {
        this.getMembers(whos);
        const $undefined = $$instanceof(undefined).$as('method').$of(this);
        const $member = this.$member(name, whos);
        return $member.isMethod ? $member.$as('method') : $undefined;
    }

    $methods(whos: 'own' | 'all' = 'own'): $ObjectiveRep[] {
        return this.$members(whos).filter(p => p.isMethod).map(p => p.$as('method'));
    }

    constructor(role: $ObjectiveRole, of: $ObjectiveRep | $ObjectiveRole, literal: any, lib?: $Library) {
        super(role, of, undefined as any, lib);
        this.#$lib = lib;
        this[$literal$] = literal;
        this[$typeof$] = typeof literal;
        if (this[$of$] === 'JavaScript')
            this[$canonical$] = this;
        if (lib && this[$canonical$]) {
            let $this = $lib.$find(this[$canonical$]) as $ObjectiveRep;
            if ($this) return $this.$as(role).$of(of as any);
            lib.$index(this[$canonical$]);
        } else {
            this[$canonical$] = this;
        }
        this[$roles$].set(role, this);
        if (typeof of === 'string')
            this[$roles$].set(this.$role.$ref, this);
    }

    $is(type: Type): boolean;
    $is(type: TypeofType): boolean;
    $is(role: $ObjectiveRole): boolean;
    $is(role: $ObjectiveRole | Type | TypeofType): boolean {
        if (role === undefined)
            return this[$literal$] === undefined;
        if (typeof role === 'string')
            return this[$typeof$] === role || this[$roles$].has(role);
        return this.$equals($$type(role));
    }

    $equals(other: $ObjectiveRep): boolean {
        return this.$ref === other.$ref;
    }

    toString() {
        return `$${this.$role.toString()}`;
    }

    protected getName(): string {
        const literal = this[$literal$];
        if (literal === null) return 'null';
        if (literal === undefined) return typeof literal;
        if (literal === Object.prototype) return 'Object.prototype';
        if (this[$canonical$][$of$] === 'TypeScript') return this.literal.description;
        if (this[$roles$].has('type')) return literal.name;
        if (this[$roles$].has('member')) return this.$key!.getName();
        if (this[$roles$].has('identifier')) return this.getSymbol(literal);
        if (typeof literal === "string") return this.getSymbol(literal);
        if (typeof literal === "symbol") return this.getSymbol(literal);
        if (typeofTypes.has(literal)) return literal.name.toLowerCase();
        if (typeof literal === 'function') return literal.name || 'function';
        return this[$role$];
    }

    protected getDescription(): string {
        const literal = this[$literal$];
        if (literal === null) return this.getName();
        if (literal === undefined) return this.getName();
        if (literal === Object.prototype) return '{}.prototype';
        if (this[$canonical$][$of$] === 'TypeScript') return this.literal.description;
        if (this[$roles$].has('type')) return this.getName();
        if (this[$roles$].has('memeber')) return this.getName();
        if (typeof literal === "string") return `"${literal}"`;
        if (typeof literal === "symbol") return `${'${'}${literal.description}}`;
        if (typeofTypes.has(literal)) return literal.name.toLowerCase();
        if (typeof literal === 'function') return literal.name ? `${literal.name}()` : `()`;
        if (typeof literal === 'object') return `{}`;
        return literal.toString();
    }

    protected getSymbol(literal: string | symbol) {
        if (typeof literal === "string") return literal;
        if (typeof literal === "symbol") return `${'${'}${literal.description}}`;
        return '';
    }

    protected getPrototype(): $ObjectiveRep {
        if (!this[$prototype$$]) {
            if (this.isNullOfUndefined())
                this[$prototype$$] = $$type(undefined).$as('prototype').$of(this);
            else if (this.isPrimitive())
                this[$prototype$$] = this.$type.$as('prototype').$of(this);
            else if (this.isType())
                this[$prototype$$] = new $ObjectiveRep('prototype', this, this[$literal$].prototype, this[$canonical$].#$lib);
            else
                this[$prototype$$] = new $ObjectiveRep('prototype', this, Object.getPrototypeOf(this[$literal$]), this[$canonical$].#$lib);
        }
        return this[$prototype$$];
    }

    protected getType(of?: $ObjectiveRep): $ObjectiveRep {
        if (!this[$type$$]) {
            if (this.isNullOfUndefined()) {
                this[$type$$] = $$type(undefined).$of(this);
                return this[$type$$];
            }
            if (this.isPrimitive()) {
                this[$type$$] = $$type(primitives.get(this[$typeof$])).$of(this)
            } else if (this.isType()) {
                this[$type$$] = this.$prototype.$type.$of(this);
            } else {
                this[$type$$] = $$typeof(this[$literal$]).$of(this);
            }
        }
        return of ? this[$type$$].$of(of) : this[$type$$];
    }

    protected getMembers(whos: 'own' | 'all' = 'own', of?: $ObjectiveRep): $ObjectiveRep[] {
        if (!this[$membersOwn$]) {
            if (this.isNullOfUndefined()) {
                this[$membersOwn$] = [];
                return this[$membersOwn$];
            }
            let $this = this as $ObjectiveRep;
            if (this.isPrimitive()) {
                this[$membersOwn$] = this.$type.getMembers('own', this);
                this[$membersMap$] = new Map();
                this[$membersOwn$].forEach($descriptor =>
                    this[$membersMap$]!.set($descriptor.$key!.literal, $descriptor));
            } else if (this.isType()) {
                this[$membersOwn$] = this.$prototype.getMembers('own', this);
                this[$membersMap$] = new Map();
                this[$membersOwn$].forEach($descriptor =>
                    this[$membersMap$]!.set($descriptor.$key!.literal, $descriptor));
            } else {
                this[$membersOwn$] = [];
                this[$membersMap$] = new Map();
                const descriptors = Object.getOwnPropertyDescriptors(this[$literal$]);
                const keys = Reflect.ownKeys(descriptors);  // Gets both strings AND symbols
                for (const property of keys) {
                    const descriptor = descriptors[property as any] as any;
                    descriptor.property = property;
                    const $property = new $ObjectiveRep('member', $this, descriptor, this[$canonical$].#$lib);
                    this[$membersOwn$].push($property);
                    this[$membersMap$].set(property, $property);
                }
            }
        }
        if (whos === 'all' && !this[$members$]) {
            if (this.isNullOfUndefined()) {
                this[$members$] = [];
                return this[$members$];
            }
            let $this = this as $ObjectiveRep;
            if (this.$equals(this.$type) || this.$type.isNullOfUndefined()) {
                this[$members$] = this[$membersOwn$];
            } else if (this.isPrimitive()) {
                this[$members$] = this.$type.getMembers('all', this);
            } else {
                this[$members$] = this.$type.getMembers('all', this).concat(this.getMembers('own', this));
            }
        }
        const $properties = whos === 'own' ? this[$membersOwn$]! : this[$members$]!;
        return !of ? $properties : $properties.map(p => p.$of(of));
    }

    protected getFunctionInfo(): $FunctionInfo {
        if (!this[$functionInfo$]) {
            this[$functionInfo$] = parseFunctionInfo(this[$literal$] as Function);
        }
        return this[$functionInfo$];
    }

    protected isNullOfUndefined() {
        return this[$literal$] === null || this[$literal$] === undefined;
    }

    protected ofNullOfUndefined() {
        return this[$of$] instanceof $ObjectiveRep ? this[$of$].isNullOfUndefined() : false;
    }

    protected isType() {
        return this[$role$] === 'type';
    }

    protected isPrimitive() {
        return primitives.has(this[$typeof$]);
    }

    protected ofPrimitive() {
        return this[$of$] instanceof $ObjectiveRep ? this[$of$].isPrimitive() : false;
    }
}

export const $undefined = $type(undefined);
export const $null = $type(null);
export const $string = $type(String);
export const $number = $type(Number);
export const $boolean = $type(Boolean);
export const $bigint = $type(BigInt);
export const $symbol = $type(Symbol);
export const $object = $type(Object);
export const $function = $type(Function);
export const $prototype = $object.$prototype;

export const $$any = new $SubjectiveRep('type', 'TypeScript', '$any', $lib, $this => {
    $this[$name$] = 'any';
    $this[$type$$] = $this.$of($this as any);
});

export interface $FunctionInfo {
    form: 'lambda' | 'function' | 'method' | 'getter' | 'setter' | 'class' | 'unknown';
    name?: string;
    async?: boolean;
    generator?: boolean;
    native?: boolean;
    params?: { rest: boolean }[];
}

export function parseFunctionInfo(func: Function): $FunctionInfo {
    const str = func.toString();
    let name = func.name || '';

    // Check for native code (but don't early return!)
    const hasNativeCode = str.includes('[native code]');

    // Single main pattern match
    const pattern = getFunctionPattern();
    const match = pattern.exec(str);

    if (!match?.groups) {
        // Can't parse - return unknown with undefined properties
        return {
            form: 'unknown',
            name,
            async: undefined,
            generator: undefined,
            native: hasNativeCode ? true : undefined,  // Only set true if we found [native code], otherwise undefined
            params: undefined
        };
    }

    const g = match.groups;

    // Check ALL async groups
    const async = !!g.async || !!g.asyncArrow || !!g.async2;
    const generator = !!g.funcStar || !!g.methodStar;

    let form: $FunctionInfo['form'];
    if (g.arrow) {
        form = 'lambda';
        // Clear computed names for anonymous arrows (like '0' from array wrapping)
        if (name && /^\d+$/.test(name)) name = '';
    }
    else if (g.class) form = 'class';
    else if (g.get) {
        form = 'getter';
        name = name.replace(/^get /, '');
    }
    else if (g.set) {
        form = 'setter';
        name = name.replace(/^set /, '');
    }
    else if (g.function) form = 'function';
    else if (g.methodName) form = 'method';
    else form = 'unknown';

    // Extract ALL parameter groups
    const paramStr = g.arrowParams || g.arrowSingle || g.params || g.params2 || '';

    if (!paramStr && form !== 'lambda') {
        return { form, name, async, generator, native: hasNativeCode, params: [] };
    }

    // For single arrow param without parens
    if (g.arrowSingle) {
        return { form, name, async, generator, native: hasNativeCode, params: createParams(1, false) };
    }

    // Parse parameter list
    const trimmed = paramStr.trim();
    if (!trimmed) {
        return { form, name, async, generator, native: hasNativeCode, params: [] };
    }

    // Simple comma split (fast, handles 99% of cases correctly)
    const parts = trimmed.split(',').map(p => p.trim());
    const last = parts[parts.length - 1];
    const rest = last.startsWith('...');
    const count = parts.length;

    return { form, name, async, generator, native: hasNativeCode, params: createParams(count, rest) };
}

let $pattern: RegExp | undefined;
function getFunctionPattern(): RegExp {
    if ($pattern) return $pattern;

    const ws = '\\s+';
    const ws0 = '\\s*';
    const id = '[a-zA-Z_$][a-zA-Z0-9_$]*';
    const paramContent = '[^)]*';

    // Build pattern with arrow functions FIRST in the alternation

    // Arrow function patterns (must come before method pattern!)
    const arrowBranch =
        `(?:` +
        `(?<asyncArrow>async${ws})?` +
        `(?:` +
        `\\((?<arrowParams>${paramContent})\\)${ws0}(?<arrow>=>)|` +  // Parens arrow
        `(?<arrowSingle>${id})${ws0}=>` +  // Single param arrow
        `)` +
        `)`;

    // Traditional patterns
    const traditionalBranch =
        `(?:` +
        `(?<async>async${ws})?` +
        `(?:` +
        `(?<class>class)|` +
        `(?<get>get)|` +
        `(?<set>set)|` +
        `(?<function>function)${ws0}(?<funcStar>\\*)?` +
        `)${ws0}(?:${id}${ws0})?` +
        `(?:\\((?<params>${paramContent})\\))?` +  // Optional params for class
        `)`;

    // Method pattern (must come AFTER arrow check!)
    const methodBranch =
        `(?:` +
        `(?<async2>async${ws})?` +
        `(?<methodStar>\\*)?` +
        `(?<methodName>${id})${ws0}` +
        `\\((?<params2>${paramContent})\\)` +
        `)`;

    // Combine all branches - arrows first!
    $pattern = new RegExp(
        `^(?:${arrowBranch}|${traditionalBranch}|${methodBranch})`
    );

    return $pattern;
}

function createParams(count: number, rest: boolean): { rest: boolean }[] {
    const result = Array.from({ length: count }, () => ({ rest: false }));
    if (rest) result[result.length - 1].rest = true;
    return result;
}