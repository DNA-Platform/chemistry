"use client"
import React, { ReactNode, ReactElement, useState, useRef, useEffect, JSX } from 'react';
import stringify from 'fast-safe-stringify';

type $Constructor<T = {}> = new (...args: any[]) => T;
export type $Type<T = any> = $Constructor<T>;
export type $State = Record<string, any>;

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

export type $React<T> = 
    0 extends (1 & T) ? ReactNode :
    T extends readonly (infer U)[] ? $React<U>[] :
    T extends keyof JSX.IntrinsicElements ? React.ReactElement<JSX.IntrinsicElements[T]> :
    T extends React.ComponentType<any> ? React.ReactElement<React.ComponentProps<T>> :
    T extends string ? string :
    T extends number ? number :
    T extends boolean ? boolean :
    T extends undefined ? undefined :
    T extends null ? null :
    T extends object ? T :
    ReactNode;

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

export type $Component<T extends $Chemical> = React.FC<$Properties<T>>;

interface $BondType {
    cid?: number;
    property?: string;
    type: $Type<$Chemical>;
    plurality: 'one' | 'many';
    source: 'view' | 'children';
}

interface Binding {
    cid: number;
    property: string;
    index?: number;
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

    get reactive() { return this._reactive; }
    get inactive() { return !this._reactive; }
    reactivate() { this._reactive = true; }
    deactivate() { this._reactive = false; }
    private _reactive = false;

    get children() { return this._children; }
    private _children: ReactNode;

    constructor() {
        this._cid = $Chemical.getNextCid();
        const type = this.getType();
        if (!type._template) 
            type._template = this;
        this._template = this;
        this._formula = new $Formula(this);
    }

    view(): ReactNode {
        // Default implementation shows the existing children from the props
        return this.children;
    }

    $Chemical(...children: $React<any>[]) {
        // Bind the children
    }

    private getType<T extends $Type<$Chemical> = typeof $Chemical>(): T {
        return this.constructor as any;
    }

    private __create(parent?: $Chemical): this {
        const template = this.getType()._template;
        const chemical = Object.create(template) as this;

        chemical._parent = parent;
        chemical._cid = $Chemical.getNextCid();
        chemical._formula = new $Formula(chemical);
        return chemical as this;
    }

    private __createMolecule() {
        return React.createContext<{
            root: $Chemical;
            chemicals: Map<number, $Chemical>;
            bonds: Map<Binding, number>
        }>({
            root: null as any,
            chemicals: new Map(),
            bonds: new Map()
        });
    }

    private __createComponent(): $Component<this> {
        if (this._component) 
            throw new Error(`The Component for ${this.getType().name}[${this.cid}] has already been created`);
        
        const template = this.getType().template as this;
        const isTemplate = this === template;
        if (!template.__crystallized) {
            template.__configureBindings();
            template.__crystallize();
        }

        const Component: $Component<this> = props => {
            const nullId = -1;
            const [id, setId] = useState(nullId);
            
            let chemical = this;
            if (id == nullId) {
                chemical = this.__create();
                chemical._component = Component;
                chemical.reactivate();

                setId(chemical.cid);
                chemicalRegistry.set(chemical.cid, chemical);
            } else {
                chemical = chemicalRegistry.get(id) as any;
            }

            const chemical$: any = chemical;
            const props$: $Properties<any> = props;
            const binding = (props as any)['__binding'] as $BondType;

            if (binding) {
                const parent = chemicalRegistry.get(id);
                const parent$ = parent as any;
                chemical._parent = parent;
                if (!parent)
                    throw new Error(`Could not find parent $Chemical[${binding.cid} to bind to ${this.getType().name}[${this.cid}]`)

                if (binding.plurality == 'one') {
                    const value = parent$[binding.property!] as $Chemical;
                    if (!(value instanceof $Chemical)) parent$[binding.property!] = chemical;
                    else if (value.cid !== chemical.cid) {
                        parent.__unbind(binding, value);
                        parent?.__bind(binding, chemical);
                        parent$[binding.property!] = chemical;
                    }
                } else {
                    const value = parent$[binding.property!] as $Chemical[];
                    if (!Array.isArray(value)) {
                        parent?.__bind(binding, chemical);
                        parent$[binding.property!] = [chemical];
                    } else if (!value.find(c => c.cid === chemical.cid)) {
                        parent?.__bind(binding, chemical);
                        value.push(chemical);
                    }
                }
            }

            useEffect(() => {
                setId(chemical.cid);
                return () => {
                    if (chemical._component)
                        chemicalRegistry.delete(chemical.cid);
                };
            }, []);

            // Bind the props to the associated fields that are prefixed with $
            chemical.__bindProps(props$);

            // Bind the child components passed in by the caller
            // chemical.bindImplicit(props);

            // Render the view
            let view = chemical.view();

            return view
        }

        if (isTemplate)
            template._component = Component;
        if (!this._component)
            this._component = Component;

        return Component;
    }

    private __bindProps(props: any) {
        console.log(`${this.getType().name}.bindProps`)
        this._children = props.children;        
        for (const key in props) {
            if (key === 'children' || key === 'key' || key === 'ref')
                continue;
            
            // Convention between fields and props
            const property = '$' + key;
            const value = props[key];
            
            // Check if bond exists, create if not
            let bond = this._formula.bonds.get(property);
            if (!bond) {
                // Discover new property from props
                this._formula.createBond(property, value);
            }
            
            const this$ = this as any;
            this$[property] = value;
        }
    }

    private __bindChildren(props: any) {

    }

    private __configureBindings() {
        // All bindings are directly on 'this' instance
        for (const key in this) {
            const value = this[key];
            
            // Check if it's a binding object
            if (value && typeof value === 'object' && 'type' in value && 'plurality' in value && 'source' in value) {
                const binding = value as $BondType;
                
                // Add cid and property name
                binding.cid = this.cid;
                binding.property = key;
                this.formula.createBond(binding);
                
                console.log(`Configured binding: ${key}`, binding);
            }
        }
    }

    private __bind(binding: $BondType, chemical: $Chemical) {
        //register the chemical
    }

    private __unbind(binding: $BondType, chemical: $Chemical) {
        // unregister the chemical
    }

    private __crystallize() {
        Object.freeze(this);
        this.__crystallized = true;
    }
    private __crystallized = false;

    private static _template: $Chemical;
    static get template(): $Chemical { return this._template; }

    private static nextCid = 1;
    private static getNextCid(): number { return $Chemical.nextCid++; }

    static get $any() { return this._$any; }
    private static _$any = '$any';
}

export class $Formula {
    get chemical() { return this._chemical; }
    private _chemical: $Chemical;

    get bonds() { return this._bonds; } 
    private _bonds: Map<string, $Bond> = new Map();

    get state(): $State { return this._state; }
    private _state: $State = {};

    constructor(chemical: $Chemical) {
        this._chemical = chemical;
        this.configureBonds()
    }

    createBond(binding: $BondType): void
    createBond(property: string, value: any): void
    createBond(property: string | $BondType, value?: any): void {
        throw '';
    }

    private configureBonds() {
        throw '';
    }
}

export function $<T extends $Chemical>(type: $Type<T> | (() => $Type<T>)): T {
    type = resolveType(type);
    const binding: $BondType = { type, plurality: 'one', source: 'children' }; 
    return binding as any as T;
}

export function $$<T extends $Chemical>(type: $Type<T>): T[] {
    type = resolveType(type);
    const binding: $BondType = { type, plurality: 'many', source: 'children' }; 
    return binding as any as T[];
}

class $Bond<T extends $Chemical = any, P = any> {

}

function resolveType(type: $Type | (() => $Type)): $Type {
    // Check if it's a function
    if (typeof type === 'function') {
        // Try to determine if it's a constructor or a regular function
        // Constructors typically have a prototype property with a constructor
        if (type.prototype && type.prototype.constructor === type) {
            // It's a constructor
            return type as $Type;
        } else {
            // It's a function that returns a constructor
            return (type as () => $Type)();
        }
    }

    throw new Error('Input must be a constructor or a function returning a constructor');
}