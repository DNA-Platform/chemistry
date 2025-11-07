import { $Rep, PrimitiveType, Type, Typeof, Constructor, primitives, primitiveTypes, TypeofType, typeofTypes } from "./types";
import { $lib, $Library } from './catalogue';
import {// $ObjectiveRep
    $lib$, $ref$, $rolesmap$, $roles$, $role$, $of$, $rolesof$, $literal$, $typeof$, $type$, $prototype$, $canonical$, $members$, $membersOwn$, $membersMap$, $membersOwnMap$
} from './symbols'

export type $ObjectiveRole = 'object' | 'function' | 'primitive' | 'array' | 'parameter' | 'instance' | 'prototype' | 'type' | 'constructor' | 'class' | 'generic' | 'member' | 'field' | 'property' | 'method' | 'getter' | 'setter' | 'JavaScript';

export function $instanceof(literal: any): $ObjectiveRep {
    return new $ObjectiveRep('instance', $typeof(literal), literal);
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
        $type(Object.getPrototypeOf(literal).constructor);

    const $$instance = new $ObjectiveRep('instance', $$type, literal);
    return $$type.$of($$instance);
}

export function $type(type: Type | TypeofType): $ObjectiveRep {
    return new $ObjectiveRep('type', 'JavaScript', type, $lib);
}

export class $ObjectiveRep {
    [$lib$]?: $Library;
    [$ref$]?: string;
    [$roles$] = new Map<string, $ObjectiveRep>;
    [$role$]: $ObjectiveRole;
    [$of$]: $ObjectiveRep | $ObjectiveRole
    [$rolesof$] = new Map<string, $ObjectiveRep>;
    [$literal$]: any;
    [$type$]?: $ObjectiveRep;
    [$typeof$]: Typeof;
    [$prototype$]?: $ObjectiveRep;
    [$canonical$]!: $ObjectiveRep;
    [$members$]?: $ObjectiveRep[];
    [$membersOwn$]?: $ObjectiveRep[];
    [$membersMap$]?: Map<string, $ObjectiveRep>;
    [$membersOwnMap$]?: Map<string, $ObjectiveRep>;

    get literal() { return this[$literal$]; }

    get $name(): string {
        if (this.isNullOfUndefined()) return `${this[$literal$]}`;
        const name: string = (this[$literal$] as Function)?.name || '';
        return typeofTypes.has(this[$literal$]) ? name.toLowerCase() : name;
    }

    get $role(): string {
        let $rep = 
             this[$of$] === 'JavaScript' ? this.$name : 
            typeof this[$of$] === 'string' ? this[$of$] : 
            this.describe(this[$of$][$literal$]);
        if (this.$name && $rep !== this.$name) 
            $rep = `${$rep}:${this.$name}`;
        return `${this[$role$]}of(${$rep})`;
    }

    get $ref(): string { 
        if (this[$ref$]) return this[$ref$];
        if (this[$canonical$] !== this) 
            this[$ref$] = this[$canonical$].$ref;
        else
            this[$ref$] = `${this[$role$]}(${this.$name})`;
        return this[$ref$]
    }

    get $type(): $ObjectiveRep { 
        if (this[$type$]) return this[$type$];
        this[$type$] = $typeof(this[$literal$]);
        return this[$type$];
     }

    get $prototype(): $ObjectiveRep {
        if (this[$prototype$]) return this[$prototype$];
        if (this.isNullOfUndefined())
            return $type(undefined).$as('prototype').$of(this);
        else if (primitives.has(this[$typeof$]))
            this[$prototype$] = this.$type.$prototype.$of(this);
        else
            this[$prototype$] = new $ObjectiveRep('prototype', this, Object.getPrototypeOf(this[$literal$]), this[$lib$]);
        return this[$prototype$];
    }

    constructor(role: $ObjectiveRole, of: $ObjectiveRep | $ObjectiveRole, literal: any, lib?: $Library) {
        this[$lib$] = lib;
        this[$role$] = role;
        this[$literal$] = literal;
        this[$typeof$] = typeof this;
        this[$of$] = of;
        if (this[$of$] === 'JavaScript') 
            this[$canonical$] = this;
        if (lib && this[$canonical$]) {
            let $this = $lib.$find(this[$canonical$]) as $ObjectiveRep;
            if ($this) return $this.$as(role).$of(of as any);
            lib.$index(this);
            this[$roles$].set(role, this);
            if (typeof of === 'string')
                this[$roles$].set(this.$role, this);
        } else {
            this[$canonical$] = this;
        } 
    }

    protected is(type: Typeof): boolean { return typeof this[$typeof$] === type; }
    $is(role: $ObjectiveRole) { 
        return this[$roles$].has(role);
    }

    $as(role: $ObjectiveRole): $ObjectiveRep { 
        if (this[$role$] == role) return this;
        if (this[$roles$].has(role))
            return this[$roles$].get(role)!;
        const $this = Object.create(this) as $ObjectiveRep;
        $this[$role$] = role;
        $this[$roles$].set(role, $this);
        if (typeof this[$of$] === 'string')
            this[$roles$].set($this.$role, $this);
        return $this;
    }

    $of(of: $ObjectiveRep | $ObjectiveRole): $ObjectiveRep {
        if (this[$of$] == of) return this;
        const $this = Object.create(this) as $ObjectiveRep;
        $this[$of$] = of;
        const $$this = this[$roles$].get($this.$role);
        return $$this ? $$this : $this;
    }

    $equals(other: $ObjectiveRep): boolean {
        if (this.$ref !== other.$ref)
            throw `${this.$ref} ${other.$ref}`;
        return this.$ref === other.$ref;
    }

    protected isNullOfUndefined() {
        return this[$literal$] === null || this[$literal$] === undefined;
    }

    protected ofNullOfUndefined() {
        return this[$of$] instanceof $ObjectiveRep ? this[$of$].isNullOfUndefined() : false;
    }

    protected roleref(role: $ObjectiveRole, of?: string) {
        return of ? `${role}(${of})` : role;
    }

    protected describe(value: any) {
        if (value === null || value === undefined) return typeof value;
        if (typeof value === "string") return `"${value}"`;
        if (typeof value === "symbol") return `${'${'}${value.description}}`;
        return value.toString();
    }
}

export const $undefined = $type(undefined).$of('primitive');
export const $null = $type(null).$of('primitive');
export const $string = $type(String).$of('primitive');
export const $number = $type(Number).$of('primitive');
export const $boolean = $type(Boolean).$of('primitive');
export const $bigint = $type(BigInt).$of('primitive');
export const $symbol = $type(Symbol).$of('primitive');
export const $object = $type(Object);
export const $function = $type(Function);
export const $prototype = $object.$prototype;

// ========== KIND SETS ==========
// const $$object = new Set(['object']);
// const $$primitive = new Set(['primitive']);
// const $$prototype = new Set(['prototype']);
// const $$function = new Set([...$$object, 'function']);
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
//             this.#lib = lib;
//         }
//     }

//     static member(desc: PropertyDescriptor, name: string, owner: $ObjectRep, lib?: $Library): $ObjectRep {
//         return new $ObjectRep(desc, name, 'member', owner, lib);
//     }

//     // Protected so subclasses can use it
//     protected enumerateMembers(target: object, getParent: () => $ObjectRep | null, own: boolean): $ObjectRep[] {
//         const cacheKey = this.#kinds.has('type') && this.#lib
//             ? new $ObjectRep(`members:${this.ref}:${own}`, 'primitive')
//             : null;

//         if (cacheKey) {
//             const cached = this.#lib!.$find<$ObjectRep[]>(cacheKey);
//             if (cached !== undefined) return cached;
//         }

//         const result: $ObjectRep[] = [];
//         const seen = new Set<string>();
//         const descriptors = Object.getOwnPropertyDescriptors(target);

//         for (const [name, desc] of Object.entries(descriptors)) {
//             if (name === 'constructor' && this.#kinds.has('prototype')) continue;
//             seen.add(name);
//             result.push($ObjectRep.member(desc, name, this, this.#lib));
//         }

//         if (!own) {
//             const parent = getParent();
//             if (parent) {
//                 for (const m of parent.$members(false)) {
//                     if (!seen.has(m.name)) result.push(m);
//                 }
//             }
//         }

//         if (cacheKey) this.#lib!.$index(cacheKey, result, this.#lib!.$subject);
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
//             this.#get = new $FunctionRep(desc.get, 'function', this.#lib!);
//         }
//         return this.#get;
//     }
    
//     get $set(): $ObjectRep | undefined {
//         if (!this.isProperty) return undefined;
//         const desc = this.#literal as PropertyDescriptor;
//         if (!desc.set) return undefined;
//         if (this.#set === undefined) {
//             this.#set = new $FunctionRep(desc.set, 'function', this.#lib!);
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
//         this.#lib = lib;

//         // Set the appropriate kinds
//         if (kind === 'function') {
//             (this as any)['#kinds'] = $$function;
//         } else if (kind === 'constructor') {
//             (this as any)['#kinds'] = $$constructor;
//         } else if (kind === 'type') {
//             (this as any)['#kinds'] = $$type;
//             if (this.#lib) {
//                 const existing = this.#lib.$find<$FunctionRep>(this, this.#lib.$subject);
//                 if (existing) return existing;
//                 this.#lib.$index(this, this, this.#lib.$subject);
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
//             if (this.#lib) {
//                 const cached = this.#lib.$find<$FunctionInfo>(this);
//                 if (cached !== undefined) return cached;
//             }
//             this.#info = parseFunctionInfo(this.literal);
//             if (this.#lib) {
//                 this.#lib.$index(this, this.#info, this.#lib.$subject);
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
//             const ns = this.#lib ? `${this.#lib.$subject}.` : '';
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
//             this.#baseType = $FunctionRep.type(baseCtor, this.#lib);
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
//                     this.#asConstructor = $FunctionRep.constructor$(this.literal, this.#lib);
//                 }
//                 return this.#asConstructor!;
                
//             case 'function':
//                 if (!this.isConstructor) return this;
//                 if (this.#asFunction === undefined) {
//                     this.#asFunction = $FunctionRep.function$(this.literal, this.#lib);
//                 }
//                 return this.#asFunction;
                
//             case 'type':
//             case 'class':
//                 if (!this.literal.prototype) return undefined as any;
//                 if (this.#asType === undefined) {
//                     this.#asType = $FunctionRep.type(this.literal, this.#lib);
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

// ========== UTILITY FUNCTIONS ==========

function createPrototypeChain<T>(object: object, constructor?: Constructor<T>): object[] {
    if (constructor && !(object instanceof constructor))
        throw new Error(`[${object}] is not instanceof [${constructor?.name}]`);

    let prototype = object;
    const prototypes: object[] = [];
    while (prototype && prototype !== constructor?.prototype) {
        prototypes.unshift(prototype);
        prototype = Object.getPrototypeOf(prototype);
    }

    return prototypes
}

export interface $FunctionInfo {
    form: 'lambda' | 'function' | 'method' | 'getter' | 'setter' | 'class' | 'unknown';
    name?: string;
    async?: boolean;
    generator?: boolean;
    native?: boolean;
    params?: { spread: boolean }[];
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
    const spread = last.startsWith('...');
    const count = parts.length;

    return { form, name, async, generator, native: hasNativeCode, params: createParams(count, spread) };
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

function createParams(count: number, spread: boolean): { spread: boolean }[] {
    const result = Array.from({ length: count }, () => ({ spread: false }));
    if (spread) result[result.length - 1].spread = true;
    return result;
}