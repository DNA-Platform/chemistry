"use client"
import React, { ReactNode, ReactElement, useState, useRef, useEffect, JSX, useContext } from 'react';
import stringify from 'fast-safe-stringify';

export type $Type<T = any> = $Constructor<T>;
export type $Constructor<T = {}> = new (...args: any[]) => T;
export type $State = Record<string, any>;
type $Child = { props: any, dependency?: $Dependency, template?: $Chemical } | $Chemical
type $ConstructorArgument = $Child | $Child[];

// // Type to remove undefined from optional constructor parameters while preserving tuple
// export type $RemoveOptional<T extends $Type> = 
//     ConstructorParameters<T> extends readonly [...infer P]
//         ? [...{ [K in keyof P]-?: Exclude<P[K], undefined> }]
//         : [];

// // Convert last array parameter to spread in tuple - fixed version
// export type $SpreadLast<T extends readonly unknown[]> = 
//     T extends readonly [...infer Rest, infer Last] ?
//         [Last] extends [readonly (infer E)[]] ?  // Wrap in tuple to prevent distribution
//             [...Rest, ...E[]] :  // Convert last array to spread
//             T :  // Keep as-is if last isn't array
//     T;  // Return unchanged if can't match

export type $<T = any> = 
    T extends keyof JSX.IntrinsicElements ? React.ComponentProps<T> :
    T extends React.ComponentType<any> ? React.ComponentProps<T> :
    T extends $Chemical ? T :
    T extends readonly (infer U)[] ? $<U>[] :
    any;

// export type $Children<T extends $Type> = 
//     $RemoveOptional<T> extends readonly [...infer Clean] ?
//         $SpreadLast<Clean> extends readonly [...infer Final] ?
//             [...{ [K in keyof Final]: $React<Final[K]> }] :
//             Clean :  // Return Clean if SpreadTuple fails
//         [];  // Return empty if RemoveOptional fails

// Combine properties and children
export type $Properties<T> = {
    [K in keyof T as K extends `$${infer Rest}` ? Rest : never]: T[K]
};

export type $Component<T extends $Chemical> = React.FC<$Properties<T>> & { template: T };

interface $BondType {
    cid?: number;
    property?: string;
    type: $Type<$Chemical>;
    plurality: 'one' | 'many';
    source: 'view' | 'children';
}

class $Dependency {
    cid: number;
    source: number;
    context: React.Context<$Molecule>;
    type: 'parent' | 'sibling';
    plurality: 'one' | 'many';
    property = '';
    index?: number;

    constructor(cid: number, source: $Chemical, context: React.Context<$Molecule>, type: 'parent' | 'sibling', plurality: 'one' | 'many', index?: number) {
        this.cid = cid;
        this.source = source.cid;
        this.context = context;
        this.type = type;
        this.plurality = plurality;
        this.index = index;
    }
}

class $Binding {
    parent = -1;
    source: 'parent' | 'sibling';
    plurality: 'one' | 'many';
    property = '';
    index?: number;

    constructor(source: 'parent' | 'sibling', plurality: 'one' | 'many') {
        this.source = source;
        this.plurality = plurality;
    }

    copy(): $Binding {
        return Object.assign(
            Object.create(Object.getPrototypeOf(this)),
            this
        );
    }
}

type $ChemicalExclusions = // Have Claude write the final list when ready
    | 'Component' 
    | 'parent'
    | 'children'
    | 'formula'
    | 'getType';

// Global registry for Chemical instances by key
const chemicalRegistry = new Map<number, $Chemical>();
const decoratorsKey = Symbol('decoratorsField');
class DecoratorCache {
    $: Map<string, $Type<$Chemical> | $Type<$Chemical>[]> = new Map();
    parent: Map<string, $Type<$Chemical>> = new Map();
    inert: Map<string, boolean> = new Map();
}

// A decorator for expressing configurable binding
// export function $(type: $Type<$Chemical> | $Type<$Chemical>[] | (() => $Type<$Chemical> | $Type<$Chemical>[])) {
//     type = resolveType(type);
//     const type$: any = type;
//     return function (target: $Chemical, property: string) {
//         const dynamicTarget: any = target;
//         if (!dynamicTarget[decoratorsKey])
//             dynamicTarget[decoratorsKey] = new DecoratorCache();
//         const decorators: DecoratorCache = dynamicTarget[decoratorsKey];
//         decorators.$.set(property, type);
//     };
// }

export class $Chemical {
    get cid() { return this._cid; }
    private _cid: number;
    private __proxy = false;

    get molecule() { return this._molecule; }
    private _molecule!: $Molecule;

    get formula(): $Formula { return this._formula; }
    private _formula: $Formula;

    get template(): this { return this._template; }
    private set template(chemical: this) {
        this._template = chemical;
    }
    private _template: this;

    get parent() { return this._parent; }
    private _parent: $Chemical | undefined;

    get Component(): $Component<this> {
        if (!this._component)
            this._component = this.__createComponent();
        return this._component! as any;
    }
    private _component?: $Component<this>;

    private _reactive = false;
    get reactive() { return this._reactive; }
    get inactive() { return !this._reactive; }
    reactivate() { this._reactive = true; }
    deactivate() { this._reactive = false; }

    private __crystallized = false;
    get crystalized() { return this.__crystallized; }
    crystallize() {
        for (const bond of this.formula.bonds.values())
            bond.crystallize();

        Object.freeze(this);
        this.__crystallized = true;
    }

    get children() { return this._children; }
    private _children: ReactNode;

    constructor() {
        this._cid = $Chemical.getNextCid();
        const type = this.getType();
        if (!type._template) 
            type._template = this;
        this._template = this;
        this._formula = new $Formula(this);
        this._molecule = new $Molecule(this);
    }

    // Create a function with the name of the class to set children
    //$Chemical(first: $Chemical, second: $<typeof Component>, third: $<'div'>) { }

    view(): ReactNode {
        // Default implementation shows the existing children from the props
        return this.children;
    }

    getType<T extends $Type<$Chemical> = typeof $Chemical>(): T {
        return this.constructor as any;
    }

    private __create(parent?: $Chemical, cid?: number): this {
        const template = this.getType()._template;
        const chemical = Object.create(template) as this;

        chemical._parent = parent;
        chemical._cid = cid == undefined ? $Chemical.getNextCid() : cid;
        chemical._formula = new $Formula(chemical);
        chemical._molecule = new $Molecule(this);
        return chemical as this;
    }

    private __createContext() {
        return React.createContext<$Molecule>(this._molecule);
    }

    private __createComponent(): $Component<this> {
        if (this._component) 
            throw new Error(`The Component for ${this.getType().name}[${this.cid}] has already been created`);
        
        const template = this.getType().template as this;
        const isTemplate = this === template;
        if (!template.__crystallized) {
            template.crystallize();
        }

        const Component: $Component<this> = props => {
            let dependency = this.__findProp<$Dependency>(props as any, $Chemical.dependencyProp);
            let context = dependency?.context!;
            let proxy = false;
            
            // Use state to track the chemical instance
            const [cid, setChemicalId] = useState<number>(-1);
            
            // Initialize only once
            let chemical: $Chemical = null!;
            if (cid == -1) {
                chemical = this.__create();
                if (dependency) 
                    chemical._cid = dependency.cid;
                setChemicalId(chemical.cid);
                chemicalRegistry.set(chemical.cid, chemical);
                context = chemical.__createContext();
            } else if (cid != -1) {
                if (!chemicalRegistry.has(cid))
                    throw new Error(`The chemical with cid ${cid} is missing from the registry`)
                chemical = chemicalRegistry.get(cid)!;
                if (!dependency)
                    context = chemical.__createContext();
            }

            const molecule = useContext(context);
            molecule.chemicals.set(cid, chemical);
            if (dependency && cid !== dependency.cid) 
                molecule.proxies.set(dependency.cid, chemical);

            useEffect(() => {
                return () => {
                    chemical._molecule.remove(chemical);
                    chemicalRegistry.delete(cid);
                };
            }, [chemical]);

            // Bind the props to the associated fields that are prefixed with $
            const $props$ = props as any;
            chemical.__bindProps($props$);

            // Add dependency info to the props
            const result = chemical.__processChildren(props, context);
            props = result.props;

            // Call the constructor
            const $chemical$ = chemical as any;
            const constructorName = chemical.getType().name;
            const constructor: Function = $chemical$[constructorName];
            if (typeof constructor === 'function') {
                const args = result.args;
                this.__evaluateArgs(args);
                constructor.apply(chemical, args);
            }

            // Render the view
            let view = chemical.view();

            //Bind the view

            return view
        }

        Component.template = this.template;

        if (isTemplate)
            template._component = Component;
        if (!this._component)
            this._component = Component;

        return Component;
    }

    private __findProp<T>(props: Record<string | symbol, T>, name: string | symbol): T | undefined {
        return props[name] as T | undefined;
    }

    private __bindProps(props: any) {
        const $this$ = this as any;
        this._children = props.children;        
        for (const key in props) {
            if (typeof key === 'symbol' || key === 'children' || key === 'key' || key === 'ref')
                continue;
            
            const property = '$' + key;
            $this$[property] = props[key];
        }
        this._formula.refresh();
    }

    private __processChildren(props: any, context: React.Context<$Molecule>): { props: any, args: $ConstructorArgument[] } {
    if (!props.children) return { props, args: [] };
    
    const children = React.Children.toArray(props.children);
    const newChildren: ReactNode[] = [];
    const rawArgs: $Child[] = [];
    
    for (const child of children) {
        if (Array.isArray(child)) 
            rawArgs.push(...child.map(c => this.__processChild(c, newChildren, context)));
        else 
            rawArgs.push(this.__processChild(child, newChildren, context));
    }
    
    const constructorName = this.template.getType().name;
    const constructor = (this as any)[constructorName] || (() => {});
    const { paramCount, hasRest } = this.__parseConstructor(constructor);
    
    const args: $ConstructorArgument[] = [];
    const regularParams = paramCount - (hasRest ? 1 : 0);
    
    for (let i = 0; i < regularParams; i++) args[i] = rawArgs[i];
    if (hasRest) (args as any)[regularParams] = rawArgs.slice(regularParams);
    while (args.length < paramCount + (hasRest ? 0 : 1)) args.push(undefined as any);
    
    return { props: { ...props, children: newChildren }, args };
}

private __processChild(child: any, newChildren: ReactNode[], context: React.Context<$Molecule>): $Child {
    if (typeof child !== 'object' || !React.isValidElement(child)) {
        newChildren.push(child);
        return { props: child, dependency: undefined, template: undefined };
    }
    
    const type = child.type as any;
    const template = type?.template;
    
    if (!(template instanceof $Chemical)) {
        newChildren.push(child);
        return { props: child.props, dependency: undefined, template: undefined };
    }
    
    const cid = $Chemical.getNextCid();
    const dependency = new $Dependency(cid, this, context, 'parent', 'one');
    const newChild = React.cloneElement(child, {
        ...(child.props as Record<string, any>),
        [$Chemical.dependencyProp]: dependency
    });
    
    newChildren.push(newChild);
    return { props: newChild.props, dependency, template };
}

private __evaluateArgs(args: $ConstructorArgument[]) {
    args.forEach((arg, index) => {
        const isArray = Array.isArray(arg);
        const isChemical = arg instanceof $Chemical;
        if (!isChemical && !isArray) {
            if (arg.dependency && arg.template) {
                const child = arg as $Child;
                const proxy = (child.template as $Chemical).__create();
                proxy.__proxy = true;
                proxy._cid = arg.dependency.cid;
                proxy.__bindProps(arg.props);
                args[index] = proxy;
            } else if (arg.props) {
                args[index] = arg.props;
            }
        } else if (isArray) {
            arg.forEach((item, index) => {
                const isArray = Array.isArray(item);
                const isChemical = item instanceof $Chemical;
                if (!isChemical && !isArray) {
                    if (item.dependency && item.template) {
                        const child = item as $Child;
                        const proxy = (child.template as $Chemical).__create();
                        proxy.__proxy = true;
                        proxy._cid = item.dependency.cid;
                        proxy.__bindProps(item.props);
                        arg[index] = proxy;
                    } else if (item.props) {
                        arg[index] = item.props;
                    }
                }
            });
        }
    });
}

private __parseConstructor(fn: Function): { paramCount: number, hasRest: boolean } {
    const match = fn.toString().match(/\(([^)]*)\)/);
    if (!match) return { paramCount: 0, hasRest: false };
    
    const params = match[1].split(',').map(p => p.trim()).filter(p => p);
    const hasRest = params.length > 0 && params[params.length - 1].startsWith('...');
    
    return { paramCount: params.length, hasRest };
}

    private static _template: $Chemical;
    static get template(): $Chemical { return this._template; }

    private static nextCid = 1;
    private static getNextCid(): number { return $Chemical.nextCid++; }

    private static dependencyProp = Symbol("Prop name that contains indormation about dependency kind");
}

class $Molecule {
    chemical: number;
    chemicals = new Map<number, $Chemical>();
    proxies = new Map<number, $Chemical>();
    bonds = new Map<$Binding, number>();

    constructor(chemical: $Chemical) {
        this.chemical = chemical.cid;
        this.chemicals.set(chemical.cid, chemical);
    }

    remove(chemical: $Chemical) {
        if (this.chemical === chemical.cid) {
            this.chemical = -1;
            this.chemicals.clear();
            this.bonds.clear();
        } else {
            const bonds: $Binding[] = [];
            this.chemicals.delete(chemical.cid);
            this.bonds.forEach((cid, binding) => {
                if (cid == chemical.cid) bonds.push(binding);
            });
            for (const bond of bonds)
                this.bonds.delete(bond);
        }
    }
}

export class $Formula {
    get chemical() { return this._chemical; }
    private _chemical: $Chemical;

    get bonds() { return this._bonds; } 
    private _bonds: Map<string, $Bond> = new Map();

    state: $State = [];
    resetState() { this.state = { cid: this._chemical.cid }; }

    constructor(chemical: $Chemical) {
        this._chemical = chemical;
        this.resetState();
        this._createBonds();
    }

    has(property: string): boolean {
        return this.bonds.has(property);
    }

    get<T extends $Chemical = $Chemical, P = any>(property: string): $Bond<T, P> | undefined {
        return this._bonds.get(property);
    }

    refresh() {
        if (this._chemical.crystalized) return;
        const propertyNames = Object.getOwnPropertyNames(this._chemical);
        for (const property of propertyNames) {
            if (this.bonds.has(property)) continue;
            const bond = new $Bond(this._chemical, property);
        }
    }

    private _createBonds() {
        if (this._chemical.crystalized) return;
        let $chemical$ = this._chemical as any;
        const prototypes: any[] = [];
        while ($chemical$) {
            prototypes.unshift($chemical$);
            if ($chemical$ === $Chemical.prototype) break;
            $chemical$ = Object.getPrototypeOf($chemical$);
        }

        for (const prototype of prototypes) {
            // Use Object.getOwnPropertyNames to get ALL properties including getters/setters
            const propertyNames = Object.getOwnPropertyNames(prototype);
            for (const property of propertyNames) {
                const value = $chemical$[property];
                if (!isReactiveProperty($chemical$, property, value)) continue;
                const bond = new $Bond(this._chemical, property);
            }
        }
    }
}

class $Bond<T extends $Chemical = any, P = any> {
    private _bid?: string;
    get bid() { 
        if (!this._bid) 
            this._bid = `${this._chemical.getType().name}${this.chemical.cid}.${this._property}`; 
        return this._bid 
    }
    get chemical() { return this._chemical; }
    private _chemical: T;
    get property() { return this._property; }
    private _property: string;
    get binding() { return this._binding; }
    private _binding!: $Binding;
    get bound() { return !!this._binding; }
    get value(): P { return (this._chemical as any)[this._property]; }
    set value(value: P) { (this._chemical as any)[this._property] = value; }
    get valueType() { return this._valueType; }
    private _valueType: $Type = Object;

    get reactive() { return this._reactive; }
    get inactive() { return !this._reactive; }
    private _reactive = false;
    reactivate() { this._reactive = true && !this._frozen; }
    deactivate() { this._reactive = false; }

    get frozen() { return this._frozen; }
    crystallize() { this.deactivate(); this._frozen = true;  }
    private _frozen = false;

    constructor(chemical: T, property: string) {
        this._chemical = chemical;
        this._property = property;
        this._initialize();
        if (!this._chemical.crystalized)
            this._chemical.formula.bonds.set(this._property, this);
    }

    private _initialize() {
        if (this._chemical.crystalized) return;
        let $prototype$ = this._chemical;
        const property = this.property;
        let foundDescriptor: PropertyDescriptor | undefined;
        while (true) {
            const type = $prototype$.constructor;
            foundDescriptor = Object.getOwnPropertyDescriptor($prototype$, property);
            if (type.name == '$Chemical') break;
            $prototype$ = Object.getPrototypeOf($prototype$);
        }

        const $chemical$ = this._chemical as any;
        let descriptor: PropertyDescriptor = foundDescriptor!;
        if (!foundDescriptor) {
            $chemical$[property] = undefined;
            descriptor = Object.getOwnPropertyDescriptor($chemical$, property)!;
        }

        let backingField: any = undefined;
        if (!descriptor.get) backingField = descriptor?.value;

        const getValue = descriptor.get ? () => descriptor.get?.call($chemical$) : () => backingField;
        const setValue = 
            descriptor.set ? (value: any) => descriptor.set?.call($chemical$, value) : 
            descriptor.get ? (value: any) => { throw new Error(`${property} property not settable`); } :
            (value: any) => backingField = value;

        const value = getValue();
        if (value && Array.isArray(value) && value[0] instanceof $Binding) {
            this._binding = value[0];
            this._binding.property = property;
            this._binding.parent = this._chemical.cid;
            this._valueType = value[1];
            if (this._binding.plurality == 'one') {
                const type: typeof $Chemical = value[1] as any;
                setValue(type.template ?? type.prototype);
            } else {
                if (this._frozen) return;
                setValue([]);
            }
        }

        Object.defineProperty($chemical$, 'computed', {
            get: () => {
                const molecule = this._chemical.molecule;
                let value = getValue();
                if (this.bound) {
                    const cid = molecule.bonds.get(this.binding);
                    let chemical = molecule.chemicals.get(cid!);
                    if (molecule.proxies.has(cid!)) {
                        chemical = molecule.proxies.get(cid!)!;
                        molecule.proxies.delete(cid!);
                        setValue(chemical);
                    }
                    if (!chemical) {
                        if (molecule.proxies.has(cid!)) {
                            chemical = molecule.proxies.get(cid!)!;
                            molecule.proxies.delete(cid!);
                            setValue(chemical.cid);
                        }
                    }
                    value = chemical ? chemical : undefined;
                    if (value) value.formula.state = this._chemical.formula.state;
                } else if (this.bound && Array.isArray(value)) {
                    value.forEach((item, index) => {
                        if (!(item instanceof $Chemical))
                            throw new Error("Bound arrays must contain chemicals");
                        if (molecule.proxies.has(item.cid)) {
                            const proxyId = item.cid;
                            item = molecule.proxies.get(proxyId)!;
                            molecule.proxies.delete(proxyId);
                            value[index] = item;
                        }
                        item.formula.state = this.chemical.formula.state;
                    })
                }
                this._chemical.formula.state[this.bid] = symbolize(value);
                return value;
            },
            set: (value: any) => {
                if (this._chemical.crystalized) return;
                if (this.bound) {
                    if (!(value instanceof $Chemical || Array.isArray(value) || value === undefined))
                        throw new Error(`Expected a chemical or chemical array, got ${value}`);
                    if (Array.isArray(value)) {
                        throw new Error("Cannot assign a bound array. Modify the array instead");
                    }
                    if (value instanceof $Chemical) {
                        this._chemical.molecule.bonds.set(this.binding, value.cid);
                    } else {
                        this._chemical.molecule.bonds.set(this.binding, -1);
                    }
                }
                setValue(value);
            },
            enumerable: true,
            configurable: true,
            writable: !(descriptor.get && !descriptor.set)
        });
    }
}

export function $<T extends $Chemical>(type: $Type<T> | (() => $Type<T>)): T;
export function $<T extends $Chemical>(type: $Type<T> | (() => $Type<T>), array: '[]'): T[];
export function $<T extends $Chemical>(type: $Type<T> | (() => $Type<T>), array?: '[]'): any {
    type = resolveType(type);
    const many = Array.isArray(type);
    type = Array.isArray(type) ? type[0] : type;
    return [new $Binding('parent', many ? 'many' : 'one'), type] as any;
}

function isReactiveProperty(instance: any, key: string, value: any): boolean {
    if (!key || key.length == 0 || typeof key === 'symbol' || key.startsWith('_')) return false;
    if (key.length > 1 && key[0] == '$') return true;
    if (instance.getType() === $Chemical) return false;
    if (typeof value === 'function') return false;
    return true;
}

function resolveType(type: $Type | (() => $Type)): $Type {
    const $type$ = type as any;
    if (type.prototype && type.prototype.constructor === type) return $type$;
    return $type$();
}

function symbolize(value: any): string {
    return stringify(value, function(this: any, key: string, val: any): any {
        if (key === '') return val;
        if (val instanceof $Chemical) return val.cid;
        if (this instanceof $Chemical) return this.cid;
        if (typeof val === 'function') return undefined;
        if (val?.constructor?.name === 'Proxy') return '[Proxy]';
        return val;
    });
}

class $Book extends $Chemical {
    first!: $<'div'>;
    second = $($Chemical);
    third = $($Chemical, '[]');
    rest: $<any>[] = [];
    $Book(first: $<'div'>, second: $Chemical, third: $Chemical[], ...rest: $<any>[]) {
        this.first = first;
        this.second = second;
        this.third = third;
        this.rest = rest;
    }
}