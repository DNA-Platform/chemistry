import { $Rep, PrimitiveType, Type, Typeof, Constructor, primitives, TypeofType, typeofTypes } from "./types";
import { $lib, $Library } from './catalogue';
import {// $ObjectiveRep
    $lib$, $ref$, $roles$, $role$, $of$, $literal$, $typeof$, $type$$, $prototype$$, $canonical$, $key$, $value$, $name$, $properties$, $propertiesOwn$, $propertiesMap$, $method$, $getter$, $setter$, $functionInfo$, $parameters$, $constructor$
} from './symbols'

export type $ObjectiveRole = 'object' | 'function' | 'primitive' | 'array' | 'parameter' | 'instance' | 'prototype' | 'type' | 'constructor' | 'class' | 'generic' | 'member' | 'field' | 'property' | 'method' | 'getter' | 'setter' | 'identifier' | 'value' | 'JavaScript';

export function $instanceof(literal: any): $ObjectiveRep {
    if (literal === null || literal === undefined)
        return $type(literal).$as('primitive');
    const type = $typeof(literal);
    const of = type[$of$];
    return of as $ObjectiveRep;
}

export function $typeof(literal: any): $ObjectiveRep {
    if (literal === null || literal === undefined)
        return $type(undefined);
    if (literal == Object.prototype) {
        const $object = $type(Object);
        return $object.$of($object.$prototype);
    }
    const $$type = primitives.has(typeof literal) ?
        $type(primitives.get(typeof literal)!) :
        $type(Object.getPrototypeOf(literal)?.constructor);

    const $$instance = new $ObjectiveRep('instance', $$type, literal);
    return $$type.$of($$instance);
}

export function $type(type: Type | TypeofType): $ObjectiveRep {
    return new $ObjectiveRep('type', 'JavaScript', type, $lib);
}

export class $ObjectiveRep {
    #lib?: $Library;
    [$lib$]?: PropertyDescriptor;
    [$ref$]?: string;
    [$role$]: $ObjectiveRole;
    [$roles$] = new Map<string, $ObjectiveRep>;
    [$of$]: $ObjectiveRep | $ObjectiveRole
    [$literal$]: any;
    [$type$$]?: $ObjectiveRep;
    [$typeof$]: Typeof;
    [$prototype$$]?: $ObjectiveRep;
    [$canonical$]!: $ObjectiveRep;
    [$name$]?: string;
    [$key$]?: $ObjectiveRep;
    [$value$]?: $ObjectiveRep;
    [$properties$]?: $ObjectiveRep[];
    [$propertiesOwn$]?: $ObjectiveRep[];
    [$propertiesMap$]?: Map<string | symbol, $ObjectiveRep>;
    [$method$]?: $ObjectiveRep;
    [$getter$]?: $ObjectiveRep;
    [$setter$]?: $ObjectiveRep;
    [$functionInfo$]?: $FunctionInfo;
    [$parameters$]?: $ObjectiveRep[];
    [$constructor$]?: $ObjectiveRep;

    get literal() { return this[$literal$]; }

    get $name(): string {
        if (!this[$name$])
            this[$name$] = this.getName();
        return this[$name$]!;
    }

    get $key(): $ObjectiveRep | undefined {
        if (this[$key$]) return this[$key$];
        this[$key$] = new $ObjectiveRep('identifier', this, this[$literal$].property, this[$canonical$].#lib);
        return this[$key$];
    }

    get $role(): { role: string, of: $ObjectiveRep | string, $ref: string } {
        const $this = this;
        const $role = { 
            role: this[$role$], 
            of: this[$of$], 
            get $ref() {
                let $rep = $this[$of$] === 'JavaScript' ? $this.$name :
                    typeof $this[$of$] === 'string' ? $this[$of$] :
                    $this[$of$].getDescription();
                // if ($this.$name && $rep !== $this.$name)
                //     $rep = `${$rep}:${$this.$name}`;
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
                this[$literal$] === Object.prototype || this[$literal$] === null ? $typeof(undefined).$as('constructor').$of(this) :
                this[$roles$].has('type') ? this.$as('constructor') : 
                this.$type.$as('constructor');
        }
        return this[$constructor$];
    }

    get $value(): $ObjectiveRep {
        if (!this[$value$]) {
            const descriptor = this[$literal$] as PropertyDescriptor;
            this[$value$] = new $ObjectiveRep('value', this, descriptor?.value, this[$canonical$].#lib);
        }
        return this[$value$];
    }

    get $getter(): $ObjectiveRep {
        if (!this[$getter$]) {
            const descriptor = this[$literal$] as PropertyDescriptor;
            this[$getter$] = new $ObjectiveRep('getter', this, descriptor?.get, this[$canonical$].#lib);
        }
        return this[$getter$];
    }

    get $setter(): $ObjectiveRep {
        if (!this[$setter$]) {
            const descriptor = this[$literal$] as PropertyDescriptor;
            this[$setter$] = new $ObjectiveRep('setter', this, descriptor?.set, this[$canonical$].#lib);
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
                    new $ObjectiveRep('parameter', this, param, this[$canonical$].#lib)
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
        return params?.length > 0 && params[params.length-1].isRest;
    }

    $property(name: string | symbol, whos: 'own' | 'all' = 'all'): $ObjectiveRep {
        this.getProperties(whos);
        const $undefined = $instanceof(undefined).$as('property').$of(this);
        const $property = this[$propertiesMap$]!.get(name);
        if ($property) return $property;
        if (whos === 'own') return $property || $undefined;
        if (this.$equals(this.$type)) return $undefined;
        return this.$type.literal ? this.$type.$property(name, whos).$of(this) : $undefined;
    }

    $properties(whos: 'own' | 'all' = 'own') {
        return this.getProperties(whos);
    }

    $field(name: string | symbol, whos: 'own' | 'all' = 'all'): $ObjectiveRep {
        this.getProperties(whos);
        const $undefined = $instanceof(undefined).$as('field').$of(this);
        const $property = this.$property(name, whos);
        return $property.isField ? $property.$as('field') : $undefined;
    }

    $fields(whos: 'own' | 'all' = 'own'): $ObjectiveRep[] {
        return this.$properties(whos).filter(p => p.isField).map(p => p.$as('field'));
    }

    $method(name: string | symbol, whos: 'own' | 'all' = 'all'): $ObjectiveRep {
        this.getProperties(whos);
        const $undefined = $instanceof(undefined).$as('method').$of(this);
        const $property = this.$property(name, whos);
        return $property.isMethod ? $property.$as('method') : $undefined;
    }

    $methods(whos: 'own' | 'all' = 'own'): $ObjectiveRep[] {
        return this.$properties(whos).filter(p => p.isMethod).map(p => p.$as('method'));
    }

    constructor(role: $ObjectiveRole, of: $ObjectiveRep | $ObjectiveRole, literal: any, lib?: $Library) {
        this.#lib = lib;
        this[$role$] = role;
        this[$literal$] = literal;
        this[$typeof$] = typeof literal;
        this[$of$] = of;
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
        return this.$equals($type(role));
    }

    $as(role: $ObjectiveRole): $ObjectiveRep {
        if (this[$role$] == role) return this;
        if (this[$roles$].has(role))
            return this[$roles$].get(role)!;
        const $this = this.$new(this[$canonical$]);
        $this[$role$] = role;
        $this[$roles$].set(role, $this);
        if (typeof this[$of$] === 'string')
            this[$roles$].set($this.$role.$ref, $this);
        return $this;
    }

    $of(of: $ObjectiveRep | $ObjectiveRole): $ObjectiveRep {
        if (this[$of$] == of) return this;
        const $this = this.$new();
        $this[$of$] = of;
        const $$this = this[$roles$].get($this.$role.$ref);
        return $$this ? $$this : $this;
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
        if (this[$roles$].has('type')) return literal.name;
        if (this[$roles$].has('property')) return this.$key!.getName();
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
        if (this[$roles$].has('type')) return this.getName();
        if (this[$roles$].has('property')) return this.getName();
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
                this[$prototype$$] = $type(undefined).$as('prototype').$of(this);
            else if (this.isPrimitive())
                this[$prototype$$] = this.$type.$as('prototype').$of(this);
            else if (this.isType())
                this[$prototype$$] = new $ObjectiveRep('prototype', this, this[$literal$].prototype, this[$canonical$].#lib);
            else
                this[$prototype$$] = new $ObjectiveRep('prototype', this, Object.getPrototypeOf(this[$literal$]), this[$canonical$].#lib);
        }
        return this[$prototype$$];
    }

    protected getType(of?: $ObjectiveRep): $ObjectiveRep {
        if (!this[$type$$]) {
            if (this.isNullOfUndefined()) {
                this[$type$$] = $type(undefined).$of(this);
                return this[$type$$];
            }
            if (this.isPrimitive()) { 
                this[$type$$] = $type(primitives.get(this[$typeof$])).$of(this)
            } else if (this.isType()) {
                this[$type$$] = this.$prototype.$type.$of(this);
            } else {
                this[$type$$] = $typeof(this[$literal$]).$of(this);
            }
        }
        return of ? this[$type$$].$of(of) : this[$type$$];
    }

    protected getProperties(whos: 'own' | 'all' = 'own', of?: $ObjectiveRep): $ObjectiveRep[] {
        if (!this[$propertiesOwn$]) {
            if (this.isNullOfUndefined()) {
                this[$propertiesOwn$] = [];
                return this[$propertiesOwn$];
            }
            let $this = this as $ObjectiveRep;
            if (this.isPrimitive()) {
                this[$propertiesOwn$] = this.$type.getProperties('own', this);
                this[$propertiesMap$] =  new Map();
                this[$propertiesOwn$].forEach($descriptor => 
                    this[$propertiesMap$]!.set($descriptor.$key!.literal, $descriptor));
            } else if (this.isType()) {
                this[$propertiesOwn$] = this.$prototype.getProperties('own', this);
                this[$propertiesMap$] =  new Map();
                this[$propertiesOwn$].forEach($descriptor => 
                    this[$propertiesMap$]!.set($descriptor.$key!.literal, $descriptor));
            } else {
                this[$propertiesOwn$] = [];
                this[$propertiesMap$] = new Map();
                const descriptors = Object.getOwnPropertyDescriptors(this[$literal$]);
                const keys = Reflect.ownKeys(descriptors);  // Gets both strings AND symbols
                for (const property of keys) {
                    const descriptor = descriptors[property as any] as any;
                    descriptor.property = property;
                    const $property = new $ObjectiveRep('property', $this, descriptor, this[$canonical$].#lib);
                    this[$propertiesOwn$].push($property);
                    this[$propertiesMap$].set(property, $property);
                }
            }
        }
        if (whos === 'all' && !this[$properties$]) {
            if (this.isNullOfUndefined()) {
                this[$properties$] = [];
                return this[$properties$];
            }
            let $this = this as $ObjectiveRep;
            if (this.$equals(this.$type) || this.$type.isNullOfUndefined()) {
                this[$properties$] = this[$propertiesOwn$];
            } else if (this.isPrimitive()) {
                this[$properties$] = this.$type.getProperties('all', this);
            } else {
                this[$properties$] = this.$type.getProperties('all', this).concat(this.getProperties('own', this));
            }
        }
        const $properties = whos === 'own' ? this[$propertiesOwn$]! : this[$properties$]!;
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

    protected $new(version?: $ObjectiveRep): $ObjectiveRep {
        version = version || this;
        const $this = Object.create(version) as $ObjectiveRep;
        return $this;
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

// ========== KIND SETS ==========
// const $$object = new Set(['object']);
// const $$primitive = new Set(['primitive']);
// const $$prototype = new Set(['prototype']);
// const $$function = new Set([...$$object, 'function']);q
// const $$constructor = new Set([...$$function, 'constructor']);
// const $$type = new Set([...$$constructor, 'type', 'class']);
// const $$member = new Set(['member']);
// const $$method = new Set([...$$member, 'method']);
// const $$parameter = new Set(['parameter']);

// // ========== INTERFACES ==========

// export interface $Object extends $Rep {
//     literal: any;
//     isPrimitive: boolean;
//     isPrototype: boolean;
//     isFunction: boolean;
//     isArray: boolean;
//     $as(kind: 'primitive'): $Primitive;
//     $as(kind: 'function'): $Function;
//     $as(kind: 'prototype'): $Prototype;
//     $prototype: $Prototype;
//     $type: $Type;
//     $members(own?: boolean): $Member[];
//     $fields(own?: boolean): $Field[];
//     $properties(own?: boolean): $Property[];
//     $methods(own?: boolean): $Method[];
//     $getField(name: string, own?: boolean): $Field | undefined;
//     $getProperty(name: string, own?: boolean): $Property | undefined;
//     $getMethod(name: string, own?: boolean): $Method | undefined;
// }

// export interface $Primitive extends $Rep {
//     literal: any;
//     $as(kind: 'object'): $Object;
// }

// export interface $Prototype extends $Rep {
//     literal: object;
//     $as(kind: 'object'): $Object;
//     $members(own?: boolean): $Member[];
//     $fields(own?: boolean): $Field[];
//     $properties(own?: boolean): $Property[];
//     $methods(own?: boolean): $Method[];
//     $getField(name: string, own?: boolean): $Field | undefined;
//     $getProperty(name: string, own?: boolean): $Property | undefined;
//     $getMethod(name: string, own?: boolean): $Method | undefined;
// }

// export interface $Function extends $Object {
//     literal: (...args: any[]) => any;
//     form: 'lambda' | 'function' | 'method' | 'getter' | 'setter' | 'class' | 'unknown';
//     name: string;
//     async: boolean;
//     generator: boolean;
//     native: boolean;
//     isConstructor: boolean;
//     isType: boolean;
//     isMethod: boolean;
//     isGeneric: boolean;
//     $as(kind: 'primitive'): $Primitive;
//     $as(kind: 'function'): $Function;
//     $as(kind: 'prototype'): $Prototype;
//     $as(kind: 'constructor'): $Constructor;
//     $as(kind: 'generic'): $GenericFunction;
//     $typeParameters: $TypeParameter[];
//     $parameters: $FunctionParameter[];
// }

// export interface $Constructor extends $Rep {
//     $as(kind: 'function'): $Function;
// }

// export interface $Type extends $Rep {
//     literal: Type;
//     isGeneric: boolean;
//     $as(kind: 'class'): $Class;
//     $as(kind: 'constructor'): $Constructor;
//     $as(kind: 'generic'): $GenericType;
//     $baseType: $Type;
//     $prototype: $Prototype;
//     $parameters: $TypeParameter[];
//     asGenericType(...types: $GenericType[]): any;
//     $members(own?: boolean): $Member[];
//     $fields(own?: boolean): $Field[];
//     $properties(own?: boolean): $Property[];
//     $methods(own?: boolean): $Method[];
//     $getMember(name: string, own?: boolean): $Member | undefined;
//     $getField(name: string, own?: boolean): $Field | undefined;
//     $getProperty(name: string, own?: boolean): $Property | undefined;
//     $getMethod(name: string, own?: boolean): $Method | undefined;
// }

// export interface $Class extends $Rep {
//     literal: Type;
//     $members(): $Member[];
//     $fields(): $Field[];
//     $methods(): $Method[];
//     $getField(name: string): $Field | undefined;
//     $getMethod(name: string): $Method | undefined;
// }

// export interface $Member extends $Rep {
//     name: string;
//     isReadable: boolean;
//     isWritable: boolean;
//     isConfigurable: boolean;
//     isEnumerable: boolean;
//     $owner: $Object;
//     $as(kind: 'field'): $Field;
//     $as(kind: 'property'): $Property;
//     $as(kind: 'method'): $Method;
// }

// export interface $Field extends $Rep {
//     $value: $Object;
//     isConfigurable: boolean;
//     isEnumerable: boolean;
// }

// export interface $Property extends $Rep {
//     $get?: $Function;
//     $set?: $Function;
//     isReadable: boolean;
//     isWritable: boolean;
//     isConfigurable: boolean;
//     isEnumerable: boolean;
// }

// export interface $Method extends $Function {
//     isConfigurable: boolean;
//     isEnumerable: boolean;
// }

// export interface $FunctionParameter extends $Rep {
//     name: string;
//     isRest: boolean;
//     $type?: $TypeParameter;
// }

// export interface $TypeParameter extends $Rep {
//     name: string;
//     $constraint?: $Type;
//     $default?: $Type;
// }

// export interface $GenericFunction extends $Rep {
//     $as(kind: 'function'): $Function;
//     $as(kind: 'constructor'): $Constructor;
//     $arguments: $Type;
// }

// export interface $GenericType extends $Rep {
//     $as(kind: 'type'): $Type;
//     $as(kind: 'constructor'): $Constructor;
//     arguments: $Type;
// }

// // ========== OBJECT REPRESENTATION ==========

// class $ObjectRep {
//     static #nextRid = 1;

//     #literal: any;
//     #lib?: $Library;
//     #rid: number;
//     #kinds: Set<string>;
//     #name?: string;
//     #owner?: $ObjectRep;

//     #ref?: string;
//     #prototype?: $ObjectRep;
//     #type?: $ObjectRep;
//     #asObject?: $ObjectRep;
//     #asPrimitive?: $ObjectRep;
//     #value?: $ObjectRep;
//     #get?: $ObjectRep;
//     #set?: $ObjectRep;

//     protected get kinds(): Set<string> { return this.#kinds; }
//     protected get rid(): number { return this.#rid; }

//     constructor(literal: object, kind: 'object');
//     constructor(literal: object, kind: 'prototype');
//     constructor(literal: any, kind: 'primitive');
//     constructor(literal: PropertyDescriptor, name: string, kind: 'member', owner?: $ObjectRep, lib?: $Library);
//     constructor(literal: any, kindOrName: any, libOrOwner?: any, owner?: $ObjectRep, lib?: $Library) {
//         this.#kinds = $$object;
//         this.#rid = $ObjectRep.#nextRid++;

//         // Functions get special treatment
//         if (typeof literal === 'function' && kindOrName !== 'member') {
//             return new $FunctionRep(literal, kindOrName, libOrOwner) as any;
//         }

//         this.#literal = literal;
//         if (kindOrName === 'prototype') {
//             this.#kinds = $$prototype;
//         } else if (kindOrName === 'primitive') {
//             this.#kinds = $$primitive;
//         } else if (libOrOwner === 'member') {
//             const desc = literal as PropertyDescriptor;
//             this.#kinds = (desc.value !== undefined && typeof desc.value === 'function') 
//                 ? $$method 
//                 : $$member;
//             this.#name = kindOrName;
//             this.#owner = owner;
//             this[$canonical$].#lib = lib;
//         }
//     }

//     static member(desc: PropertyDescriptor, name: string, owner: $ObjectRep, lib?: $Library): $ObjectRep {
//         return new $ObjectRep(desc, name, 'member', owner, lib);
//     }

//     // Protected so subclasses can use it
//     protected enumerateMembers(target: object, getParent: () => $ObjectRep | null, own: boolean): $ObjectRep[] {
//         const cacheKey = this.#kinds.has('type') && this[$canonical$].#lib
//             ? new $ObjectRep(`members:${this.ref}:${own}`, 'primitive')
//             : null;

//         if (cacheKey) {
//             const cached = this[$canonical$].#lib!.$find<$ObjectRep[]>(cacheKey);
//             if (cached !== undefined) return cached;
//         }

//         const result: $ObjectRep[] = [];
//         const seen = new Set<string>();
//         const descriptors = Object.getOwnPropertyDescriptors(target);

//         for (const [name, desc] of Object.entries(descriptors)) {
//             if (name === 'constructor' && this.#kinds.has('prototype')) continue;
//             seen.add(name);
//             result.push($ObjectRep.member(desc, name, this, this[$canonical$].#lib));
//         }

//         if (!own) {
//             const parent = getParent();
//             if (parent) {
//                 for (const m of parent.$members(false)) {
//                     if (!seen.has(m.name)) result.push(m);
//                 }
//             }
//         }

//         if (cacheKey) this[$canonical$].#lib!.$index(cacheKey, result, this[$canonical$].#lib!.$subject);
//         return result;
//     }

//     get ref(): string {
//         if (this.#ref !== undefined) return this.#ref;

//         if (this.#kinds.has('object')) {
//             this.#ref = `${this.$type?.ref || 'Object'}#${this.#rid}`;
//         } else if (this.#kinds.has('prototype')) {
//             this.#ref = `Prototype#${this.#rid}`;
//         } else if (this.#kinds.has('primitive')) {
//             const t = typeof this.#literal;
//             if (this.#literal === null) this.#ref = 'null';
//             else if (this.#literal === undefined) this.#ref = 'undefined';
//             else if (t === 'symbol') this.#ref = `symbol:${this.#literal.toString()}`;
//             else this.#ref = `${t}:${String(this.#literal)}`;
//         } else if (this.#kinds.has('member')) {
//             this.#ref = `${this.#owner?.ref || 'Member'}:${this.#name}`;
//         }

//         return this.#ref!;
//     }

//     get literal(): any { return this.#literal; }
//     get name(): string { return this.#name || ''; }

//     // Type predicates
//     get isPrimitive(): boolean { return this.#kinds.has('primitive'); }
//     get isPrototype(): boolean { return this.#kinds.has('prototype'); }
//     get isFunction(): boolean { return false; }
//     get isArray(): boolean { return this.#kinds.has('object') && Array.isArray(this.#literal); }

//     get isField(): boolean {
//         if (!this.#kinds.has('member')) return false;
//         const desc = this.#literal as PropertyDescriptor;
//         return desc.value !== undefined && typeof desc.value !== 'function';
//     }

//     get isProperty(): boolean {
//         if (!this.#kinds.has('member')) return false;
//         const desc = this.#literal as PropertyDescriptor;
//         return desc.get !== undefined || desc.set !== undefined;
//     }

//     get isMethod(): boolean { return this.#kinds.has('method'); }

//     get isReadable(): boolean {
//         if (!this.#kinds.has('member')) return false;
//         const desc = this.#literal as PropertyDescriptor;
//         return desc.get !== undefined || desc.value !== undefined;
//     }

//     get isWritable(): boolean {
//         if (!this.#kinds.has('member')) return false;
//         const desc = this.#literal as PropertyDescriptor;
//         return desc.set !== undefined || (desc.writable === true);
//     }

//     get isConfigurable(): boolean { 
//         if (!this.#kinds.has('member')) return false;
//         const desc = this.#literal as PropertyDescriptor;
//         return desc.configurable === true;
//     }

//     get isEnumerable(): boolean { 
//         if (!this.#kinds.has('member')) return false;
//         const desc = this.#literal as PropertyDescriptor;
//         return desc.enumerable === true;
//     }

//     // Type navigation
//     get $type(): $ObjectRep {
//         if (!this.#kinds.has('object')) return undefined as any;
//         if (this.#type === undefined) {
//             const ctor = this.#literal.constructor;
//             this.#type = (ctor && typeof ctor === 'function') 
//                 ? new $FunctionRep(ctor, 'type') 
//                 : undefined;
//         }
//         return this.#type!;
//     }

//     get $prototype(): $ObjectRep {
//         if (!this.#kinds.has('object')) return undefined as any;
//         if (this.#prototype === undefined) {
//             const proto = Object.getPrototypeOf(this.#literal);
//             this.#prototype = proto === null 
//                 ? undefined 
//                 : new $ObjectRep(proto, 'prototype');
//         }
//         return this.#prototype!;
//     }

//     get $owner(): $ObjectRep | undefined { return this.#owner; }

//     get $value(): $ObjectRep | undefined {
//         if (!this.isField) return undefined;
//         if (this.#value === undefined) {
//             const desc = this.#literal as PropertyDescriptor;
//             this.#value = new $ObjectRep(desc.value, 'object');
//         }
//         return this.#value;
//     }

//     get $get(): $ObjectRep | undefined {
//         if (!this.isProperty) return undefined;
//         const desc = this.#literal as PropertyDescriptor;
//         if (!desc.get) return undefined;
//         if (this.#get === undefined) {
//             this.#get = new $FunctionRep(desc.get, 'function', this[$canonical$].#lib!);
//         }
//         return this.#get;
//     }

//     get $set(): $ObjectRep | undefined {
//         if (!this.isProperty) return undefined;
//         const desc = this.#literal as PropertyDescriptor;
//         if (!desc.set) return undefined;
//         if (this.#set === undefined) {
//             this.#set = new $FunctionRep(desc.set, 'function', this[$canonical$].#lib!);
//         }
//         return this.#set;
//     }

//     // Shapeshifting
//     $as(kind: string): $ObjectRep {
//         switch (kind) {
//             case 'object':
//                 if (this.#kinds.has('prototype')) {
//                     if (this.#asObject === undefined) {
//                         this.#asObject = new $ObjectRep(this.#literal, 'object');
//                     }
//                     return this.#asObject;
//                 }
//                 if (this.#kinds.has('primitive')) {
//                     if (this.#asPrimitive === undefined) {
//                         if (this.#literal === null || this.#literal === undefined) return undefined as any;
//                         this.#asObject = new $ObjectRep(Object(this.#literal), 'object');
//                     }
//                     return this.#asObject!;
//                 }
//                 return this;

//             case 'primitive':
//                 if (!this.#kinds.has('object')) return undefined as any;
//                 if (this.#asPrimitive === undefined) {
//                     this.#asPrimitive = new $ObjectRep(this.#literal.valueOf(), 'primitive');
//                 }
//                 return this.#asPrimitive;

//             case 'prototype':
//                 return this.$prototype;

//             case 'field':
//                 return this.isField ? this : undefined as any;

//             case 'property':
//                 return this.isProperty ? this : undefined as any;

//             case 'method':
//                 return this.isMethod ? this : undefined as any;

//             default:
//                 return undefined as any;
//         }
//     }

//     // Member enumeration
//     $members(own: boolean = true): $ObjectRep[] {
//         if (this.#kinds.has('object')) {
//             return this.enumerateMembers(this.#literal, () => this.$prototype, own);
//         }
//         if (this.#kinds.has('prototype')) {
//             return this.enumerateMembers(this.#literal, () => {
//                 const proto = Object.getPrototypeOf(this.#literal);
//                 return proto ? new $ObjectRep(proto, 'prototype') : null;
//             }, own);
//         }
//         return [];
//     }

//     $fields(own: boolean = true): $ObjectRep[] { 
//         return this.$members(own).filter(m => m.isField);
//     }

//     $properties(own: boolean = true): $ObjectRep[] { 
//         return this.$members(own).filter(m => m.isProperty);
//     }

//     $methods(own: boolean = true): $ObjectRep[] { 
//         return this.$members(own).filter(m => m.isMethod);
//     }

//     $getField(name: string, own: boolean = true): $ObjectRep | undefined { 
//         return this.$fields(own).find(f => f.name === name);
//     }

//     $getProperty(name: string, own: boolean = true): $ObjectRep | undefined { 
//         return this.$properties(own).find(p => p.name === name);
//     }

//     $getMethod(name: string, own: boolean = true): $ObjectRep | undefined { 
//         return this.$methods(own).find(m => m.name === name);
//     }

//     $getMember(name: string, own: boolean = false): $ObjectRep | undefined { 
//         return this.$members(own).find(m => m.name === name);
//     }
// }

// // ========== FUNCTION REPRESENTATION ==========

// class $FunctionRep extends $ObjectRep {
//     #lib?: $Library;
//     #info?: $FunctionInfo;
//     #parameters?: $ParameterRep[];
//     #asConstructor?: $FunctionRep;
//     #asFunction?: $FunctionRep;
//     #asType?: $FunctionRep;
//     #baseType?: $FunctionRep;
//     #prototype?: $ObjectRep;

//     constructor(literal: Function, kind: 'function', lib?: $Library);
//     constructor(literal: Function, kind: 'constructor', lib?: $Library);
//     constructor(literal: Constructor, kind: 'type', lib?: $Library);
//     constructor(literal: any, kind: any, lib?: $Library) {
//         super(literal, 'object');
//         this[$canonical$].#lib = lib;

//         // Set the appropriate kinds
//         if (kind === 'function') {
//             (this as any)['#kinds'] = $$function;
//         } else if (kind === 'constructor') {
//             (this as any)['#kinds'] = $$constructor;
//         } else if (kind === 'type') {
//             (this as any)['#kinds'] = $$type;
//             if (this[$canonical$].#lib) {
//                 const existing = this[$canonical$].#lib.$find<$FunctionRep>(this, this[$canonical$].#lib.$subject);
//                 if (existing) return existing;
//                 this[$canonical$].#lib.$index(this, this, this[$canonical$].#lib.$subject);
//             }
//         }
//     }

//     // Factory methods
//     static function$(literal: Function, lib?: $Library): $FunctionRep {
//         return new $FunctionRep(literal, 'function', lib);
//     }

//     static constructor$(literal: Function, lib?: $Library): $FunctionRep {
//         return new $FunctionRep(literal, 'constructor', lib);
//     }

//     static type(literal: Constructor, lib?: $Library): $FunctionRep {
//         return new $FunctionRep(literal, 'type', lib);
//     }

//     private getInfo(): $FunctionInfo {
//         if (this.#info === undefined) {
//             if (this[$canonical$].#lib) {
//                 const cached = this[$canonical$].#lib.$find<$FunctionInfo>(this);
//                 if (cached !== undefined) return cached;
//             }
//             this.#info = parseFunctionInfo(this.literal);
//             if (this[$canonical$].#lib) {
//                 this[$canonical$].#lib.$index(this, this.#info, this[$canonical$].#lib.$subject);
//             }
//         }
//         return this.#info;
//     }

//     get ref(): string {
//         let cachedRef = (this as any)['#ref'];
//         if (cachedRef !== undefined) return cachedRef;

//         if (this.kinds.has('function') && !this.kinds.has('constructor')) {
//             cachedRef = `Function#${this.rid}`;
//         } else if (this.kinds.has('constructor') && !this.kinds.has('type')) {
//             cachedRef = this.literal.name || 'Constructor';
//         } else if (this.kinds.has('type')) {
//             const name = this.literal.name || 'Anonymous';
//             const params = this.$parameters;
//             const generic = params.length > 0 ? `<${params.map(p => p.ref).join(',')}>` : '';
//             const ns = this[$canonical$].#lib ? `${this[$canonical$].#lib.$subject}.` : '';
//             cachedRef = `${ns}${name}${generic}`;
//         } else {
//             return super.ref;
//         }

//         // Cache it directly on the private field
//         (this as any)['#ref'] = cachedRef;
//         return cachedRef;
//     }

//     // Override predicates
//     get isFunction(): boolean { return true; }
//     get isConstructor(): boolean { return this.kinds.has('constructor'); }
//     get isType(): boolean { return this.kinds.has('type'); }
//     get isMethod(): boolean { return this.kinds.has('method'); }
//     get isGeneric(): boolean { return false; }

//     // Function properties from info
//     get form(): $FunctionInfo['form'] { return this.getInfo().form; }
//     get name(): string { return this.literal.name || ''; }
//     get async(): boolean { return this.getInfo().async || false; }
//     get generator(): boolean { return this.getInfo().generator || false; }
//     get native(): boolean { return this.getInfo().native || false; }

//     // Override prototype for types
//     get $prototype(): $ObjectRep {
//         if (this.kinds.has('type')) {
//             if (this.#prototype === undefined) {
//                 this.#prototype = new $ObjectRep(this.literal.prototype, 'prototype');
//             }
//             return this.#prototype;
//         }
//         return super.$prototype;
//     }

//     get $baseType(): $FunctionRep {
//         if (!this.isType) return undefined as any;
//         if (this.#baseType === undefined) {
//             const proto = Object.getPrototypeOf(this.literal.prototype);
//             if (proto === null) return undefined as any;
//             const baseCtor = proto.constructor;
//             if (!baseCtor || baseCtor === Function || baseCtor === Object) return undefined as any;
//             this.#baseType = $FunctionRep.type(baseCtor, this[$canonical$].#lib);
//         }
//         return this.#baseType!;
//     }

//     get $typeParameters(): $ParameterRep[] { return []; }

//     get $parameters(): $ParameterRep[] {
//         if (this.#parameters === undefined) {
//             const info = this.getInfo();
//             this.#parameters = info.params ? info.params.map((p, i) => new $ParameterRep(`param${i}`, i, p.spread)) : [];
//         }
//         return this.#parameters;
//     }

//     // Shapeshifting
//     $as(kind: string): $FunctionRep {
//         switch (kind) {
//             case 'constructor':
//                 if (!this.literal.prototype) return undefined as any;
//                 if (this.#asConstructor === undefined) {
//                     this.#asConstructor = $FunctionRep.constructor$(this.literal, this[$canonical$].#lib);
//                 }
//                 return this.#asConstructor!;

//             case 'function':
//                 if (!this.isConstructor) return this;
//                 if (this.#asFunction === undefined) {
//                     this.#asFunction = $FunctionRep.function$(this.literal, this[$canonical$].#lib);
//                 }
//                 return this.#asFunction;

//             case 'type':
//             case 'class':
//                 if (!this.literal.prototype) return undefined as any;
//                 if (this.#asType === undefined) {
//                     this.#asType = $FunctionRep.type(this.literal, this[$canonical$].#lib);
//                 }
//                 return this.#asType;

//             case 'generic':
//                 return undefined as any;

//             default:
//                 return super.$as(kind) as any;
//         }
//     }

//     asGenericType(...types: any[]): any { return undefined; }

//     // Member enumeration for types
//     $members(own: boolean = true): $ObjectRep[] {
//         if (this.kinds.has('type')) {
//             if (this.kinds.has('class')) {
//                 return this.enumerateMembers(this.literal, () => null, true);
//             }
//             return this.enumerateMembers(this.literal.prototype, () => this.$baseType, own);
//         }
//         return super.$members(own);
//     }
// }

// // ========== PARAMETER REPRESENTATION ==========

// class $ParameterRep {
//     #name: string;
//     #position: number;
//     #isRest: boolean;
//     #ref?: string;

//     constructor(name: string, position: number, isRest: boolean) {
//         this.#name = name;
//         this.#position = position;
//         this.#isRest = isRest;
//     }

//     get ref(): string {
//         if (this.#ref === undefined) {
//             this.#ref = this.#isRest ? `...${this.#name}` : this.#name;
//         }
//         return this.#ref;
//     }

//     get name(): string { return this.#name; }
//     get position(): number { return this.#position; }
//     get isRest(): boolean { return this.#isRest; }
// }

// // ========== FACTORY FUNCTIONS ==========

// export function $object(literal: any): $Object {
//     const kind = literal === null || literal === undefined || typeof literal !== 'object' ? 'primitive' : 'object';
//     return new $ObjectRep(literal, kind as any) as any;
// }

// export function $function(literal: Function, lib?: $Library): $Function {
//     return $FunctionRep.function$(literal, lib) as any;
// }

// export function $type(literal: Constructor, lib?: $Library): $Type {
//     return $FunctionRep.type(literal, lib) as any;
// }