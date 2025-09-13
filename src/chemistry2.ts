"use client"
import React, { ReactNode, ReactElement, useState, useRef, useEffect, JSX } from 'react';
import stringify from 'fast-safe-stringify';

const console = { log: (message: string) => {} };

// Core framework types
type Constructor<T = {}> = new (...args: any[]) => T;
export type Type<T = any> = Constructor<T>;
export type Component<T = any> = React.FC<Properties<T>>;
export type Properties<T = any> = {
    [K in keyof T as K extends `$${infer Rest}` ? Rest : never]: T[K]
};

type TransformChild<T> = 
    T extends readonly (infer U)[] ? TransformChild<U>[] :
    T extends keyof JSX.IntrinsicElements ? ReactElement<JSX.IntrinsicElements[T]> :
    T extends $Chemical ? ReactElement<Properties<T>> :  // THIS handles $Empty instance type
    T extends new (...args: any[]) => infer Instance ?
        Instance extends $Chemical ? 
            ReactElement<Properties<Instance>> : 
            never :
    T extends React.ComponentType<infer P> ? ReactElement<P> :
    T extends string ? string :
    T extends number ? number :
    T extends boolean ? boolean :
    T extends null ? null :
    T extends undefined ? undefined :
    never;

// Children type with automatic ReactNode spread and explicit undefined
export type Children<T extends readonly unknown[] = []> = [
    ...{ [K in keyof T]: TransformChild<T[K]> }
] | undefined;

type Formula<T extends $Chemical> = $Formula & {
    [K in keyof T as 
        K extends `_${string}` ? never : 
        K extends symbol ? never :
        K extends 'constructor' ? never :
        K]: T[K] extends (...args: any[]) => any ?
        T extends { [P in K]: T[K] } ? $Bond<T extends $Chemical ? T : never, T[K]> : never
        : $Bond<T extends $Chemical ? T : never, T[K]>
};
interface Setter<T extends $Chemical = $Chemical> {
    (value: T): void;
    instance?: $Chemical;  // The instance that owns this setter
}

// Symbols on $Chemical
const decoratorsKey = Symbol('decoratorsField');

// Global registry for Chemical instances by key
const chemicalRegistry = new Map<number, $Chemical>();

class DecoratorCache {
    $: Map<string, { type: Type, expecting: '?' | '!' | '[]' }> = new Map();
    parent: Map<string, Type> = new Map();
    inert: Map<string, boolean> = new Map();
    dynamic: Map<string, ((value: any) => any) | undefined> = new Map();
    reactive: Map<string, boolean> = new Map();  // New!
}

export function $Array(type: Type<$Chemical>): Type<$Chemical>[] {
    return [type];
}

// A decorator for expressing configurable binding
export function $(type: Type | Type[] | (() => Type | Type[]) {
    type = resolveType(type);
    if (!(!type || type === $Chemical || type.prototype instanceof $Chemical))
        throw new Error(`$ decorator expects a $Chemical class instead of ${type?.name}`);
    return function (target: $Chemical, property: string) {
        const dynamicTarget: any = target;
        if (!dynamicTarget[decoratorsKey])
            dynamicTarget[decoratorsKey] = new DecoratorCache();
        const decorators: DecoratorCache = dynamicTarget[decoratorsKey];
        decorators.$.set(property, { type: type, expecting: expecting });
    };
}

// A decorator for reassigning the parent property
export function parent(type?: Type) {
    return function (target: $Chemical, property: string) {
        if (!type) type = $Chemical;
        const dynamicTarget: any = target;
        if (!dynamicTarget[decoratorsKey])
            dynamicTarget[decoratorsKey] = new DecoratorCache();
        const decorators: DecoratorCache = dynamicTarget[decoratorsKey];
        decorators.parent.set(property, type);
    };
}

// Reactive decorator for methods
export function reactive() {
    return function (target: any, property: string) {
        const dynamicTarget: any = target;
        if (!dynamicTarget[decoratorsKey])
            dynamicTarget[decoratorsKey] = new DecoratorCache();
        const decorators: DecoratorCache = dynamicTarget[decoratorsKey];
        decorators.reactive.set(property, true);
    };
}

// Decorator to mark a field as inert (non-reactive)
export function inert() {
    return function (target: any, property: string) {
        const dynamicTarget: any = target;
        if (!dynamicTarget[decoratorsKey])
            dynamicTarget[decoratorsKey] = new DecoratorCache();
        const decorators: DecoratorCache = dynamicTarget[decoratorsKey];
        decorators.inert.set(property, true);
    };
}

// Decorator for properties that should use deep equality comparison
export function dynamic(symbolizer?: (value: any) => any) {
    return function (target: any, property: string) {
        const dynamicTarget: any = target;
        if (!dynamicTarget[decoratorsKey])
            dynamicTarget[decoratorsKey] = new DecoratorCache();
        const decorators: DecoratorCache = dynamicTarget[decoratorsKey];
        decorators.dynamic.set(property, symbolizer || symbolize);
    };
}
export class $Chemical {
    private _formula!: Formula<this>;
    private _updateToken: number = -1;

    @inert()
    get cid() { return this._cid; }
    private _cid: number;

    @inert()
    get example(): this { return this._example; }
    private _example: this;

    @inert()
    get Component(): Component<this> {
        if (!this._component) 
            this.assignComponent();
        return this._component!;
    }
    private _component?: Component<this>;

    @inert()
    get reactive(): boolean { return this._reactive; }
    private _reactive: boolean = true;

    @inert()
    get inert(): boolean { return !this._reactive; }

    @parent()
    get parent() { return this._parent; }
    private _parent: $Chemical | undefined;

    @inert()
    get onReceivingProps() { return this._onReceivingProps; }
    private _onReceivingProps = new Event<this, Properties>(this);

    @inert()
    get onRenderingView() { return this._onRenderingView; }
    private _onRenderingView = new Event<this, { props: Properties, view: ReactNode }>(this);

    @inert()
    get onRenderedView() { return this._onRenderedView; }
    private _onRenderedView = new DelayedEvent<this, { props: Properties, view: ReactNode }>(this);

    @inert()
    get children() { return this._children; }
    private _children?: ReactNode;

    @$(() => $Array($Chemical))
    $children?: any[] = [];

    $on?: Setter;

    constructor() {
        this._cid = $Chemical.getNextCid();
        const type = this.getType();
        if (!type._example) 
            type._example = this;
        this._example = this;
        this._formula = new $Formula(this);
    }

    construct(parent?: $Chemical): this {
        const formula = this.getType()._example;
        const chemical = Object.create(formula) as this;

        chemical._parent = parent;
        chemical._cid = $Chemical.getNextCid(); 
        chemical._formula = new $Formula(chemical);
        return chemical as this;
    }

    // Override this to control rendering
    view(): ReactNode {
        // Default implementation shows the existing children from the props
        return this.children;
    }

    reactivate() {
        this._reactive = true;
        this._formula.$$bonds.forEach(bond => {
            bond.isReactive = true;
            bond.reactivate(this);
        });
    }

    deactivate() {
        this._reactive = false;
        this._onUpdate.cancelUpdate();
        this._formula.$$bonds.forEach(bond => {
            bond.isReactive = false;
        });
    }

    update(): void {
        console.log('Chemical update called, firing onUpdate');
        this.onUpdate.fire(); 
    }

    getType<T extends Type = typeof $Chemical>(): T {
        return this.constructor as any;
    }

    private assignComponent(): Component<this> {
        const formula = this.getType().example as this;
        const isFormula = this === formula;
        if (!isFormula && this._component) return this._component;

        const Component: Component<this> = (props: Properties<this>) => {
            const nullId = -1;
            const [id, setId] = useState(nullId);
            
            let chemical = this;
            if (id == nullId) {
                chemical = this.construct();
                chemical._component = Component;
                chemical.reactivate();

                setId(chemical.cid);
                chemicalRegistry.set(chemical.cid, chemical);
            } else {
                chemical = chemicalRegistry.get(id) as any;
            }

            // Set up this component's update function
            const [, update] = useState({});
            chemical.onUpdate.unsubscribe(chemical._updateToken);
            chemical._updateToken = chemical.onUpdate.subscribe(() => update({}));

            useEffect(() => {
                setId(chemical.cid);
                return () => {
                    chemical._onReceivingProps.clear();
                    chemical._onRenderingView.clear();
                    chemical._onRenderedView.clear();
                    chemical.onUpdate.clear();
                    if (chemical._component)
                        chemicalRegistry.delete(chemical.cid);
                };
            }, []);

            // Give subscribers the ability to weigh in on props
            let props$: Properties<any> = props;
            let newProps = chemical.onReceivingProps.fire(props$);
            props$ = newProps || props;

            // Bind the props to the associated fields that are prefixed with $
            chemical.bindProps(props$);

            // Reactivate the props
            chemical.reactivate();

            // Bind the child components passed in by the caller
            // chemical.bindImplicit(props);

            // Render the iniital view
            let view = chemical.view();

            // Give subscribers the ability to weigh after the view has been rendered
            const result = chemical.onRenderingView.fire({ props: props$, view });
            view = result?.view || view;

            // Bind the components specified by this chemical
            // view = chemical.bindExplicit(props, view);

            // Give subscribers the ability to weigh in after the event loop ends and the UI updates
            chemical.onRenderedView.fire({ props: props$, view });

            return view
        }

        if (isFormula)
            formula._component = Component;
        if (!this._component)
            this._component = Component;

        return Component;
    }

    private bindProps(props: any) {
        console.log(`${this.getType().name}.bindProps`)
        this._children = props.children;        
        for (const key in props) {
            if (key === 'children' || key === 'key' || key === 'ref')
                continue;
            
            // Convention between fields and props
            const propName = '$' + key;
            const value = props[key];
            
            // Check if bond exists, create if not
            let bond = this._formula.$$bonds.get(propName);
            if (!bond) {
                // Discover new property from props
                bond = this._formula.configureBond(propName, value);
                // Need to reactivate this new bond!
                if (this._reactive) {
                    bond.isReactive = true;
                    bond.reactivate(this);
                }
            }
            
            (this as any)[propName] = value;
        }
    }

    static get $set(): Setter { return $Chemical._$set; }
    private static _$set: Setter = (value) => {
        throw new Error('$setter is a placeholder that should be replaced with an actual setter');
    };

    private static _example: $Chemical;
    static get example(): $Chemical { return this._example; }

    private static nextCid = 1;
    private static getNextCid(): number { return $Chemical.nextCid++; }
}
export class $Formula {
    get $$chemical() { return this._$$chemical; }
    private _$$chemical: $Chemical;

    get $$bonds() { return this._$$bonds; }
    private _$$bonds: Map<string, $Bond> = new Map();

    get $$initialized() { return this._$$initialized; }
    private _$$initialized: boolean = false;
    
    get props() { return this.$$bonds.values().filter(b => b.isProp); }
    get chemicals() { return this.$$bonds.values().filter(b => b.isChemical); }

    constructor(chemical: $Chemical) {
        this._$$chemical = chemical;
        this.configureBonds()
    }

    configureBonds() {
        console.log(`Diagram.configureBonds: ${this.$$chemical.getType().name}`)
        if (this._$$initialized) return;
        this._$$initialized = true;
        this._$$bonds = new Map();

        let chemical = this.$$chemical;
        const prototypes: any[] = [];
        while (chemical) {
            prototypes.unshift(chemical);
            if (chemical === $Chemical.prototype) break;
            chemical = Object.getPrototypeOf(chemical);
        }

        for (const prototype of prototypes) {
            // Use Object.getOwnPropertyNames to get ALL properties including getters/setters
            const propertyNames = Object.getOwnPropertyNames(prototype);
            for (const property of propertyNames) {
                const descriptor = Object.getOwnPropertyDescriptor(prototype, property);
                const value = descriptor?.get ? undefined : prototype[property];
                if (!isReactiveProperty(prototype, property, value)) continue;
                this.configureBond(property, value, !this._$$initialized ? prototype[decoratorsKey] : undefined);
            }
        }
    }

    configureBond(property: string, value: any, decorators?: DecoratorCache): $Bond {
        console.log(`Diagram.configureBond[1]: ${this.$$chemical.getType().name}.${property} = ${value}`);
        let bond = this.$$bonds.get(property);
        if (bond) {
            bond.merge(value);
            return bond;
        }

        bond = new $Bond(property);
        this.$$bonds.set(property, bond);

        const parentType = decorators?.parent.get(property);
        if (parentType) {
            bond.type = parentType || $Chemical;
            bond.isParent = true;
            bond.isChemical = true;  // Parent is always Chemical
            bond.isInert = true;
            bond.isSettable = false;
            return bond;
        }

        const descriptor = Object.getOwnPropertyDescriptor(this.$$chemical, property);
        if (descriptor?.get && !descriptor.set) {
            bond.isSettable = false;
            bond.isMutable = true;
            bond.symbolizer = symbolize;
        }

        const representer = decorators?.dynamic.get(property);
        if (representer !== undefined) {
            bond.symbolizer = representer || symbolize;
            bond.isMutable = true;
        }

        const $config = decorators?.$.get(property);
        if ($config) {
            bond.type = $config.type;
            bond.isProp = property.startsWith('$');
            bond.isChemical = true;  // $ decorator only accepts Chemical types
            if (bond.isProp && (this.$$chemical as any)[property.substring(1)] === $Chemical.$set)
                bond.isExplicitlyBound = true;
            else
                bond.isImplicitlyBound = true;
            this.initializeBondValue(bond, $config.expecting, property, value);
        }

        bond.merge(value);
        return bond;
    }

    private initializeBondValue(bond: $Bond, expecting: '?' | '!' | '[]', property: string, value: any) {
        const chemical = this.$$chemical as any;
        if (expecting === '[]') {
            bond.isCollective = true;
            bond.isRequired = true;
            if (value && !Array.isArray(value)) throw new Error(`${property} marked array but isn't`);
            if (!value) chemical[property] = [];
            return;
        }
        bond.isRequired = expecting === '!';
        if (expecting === '?' && Array.isArray(value)) throw new Error(`${property} optional but is array`);
        if (bond.isRequired && bond.isChemical && !value) {
            const formula = (bond.type as any).formula || bond.type!.prototype;
            chemical[property] = Object.create(formula);
            chemical[property]._reactive = false;
        }
    }
}

class $Bond<T extends $Chemical = any, P = any> {
    get id() { return this._id; }
    private _id: string;
    get chemical() { return this._chemical; }
    private _chemical: T;
    get property() { return this._property; }
    private _property: string;
    get type() { return this._type; }
    private _type?: Type;
    
    get isChemical() { return this._isChemical; }
    private _isChemical = false;
    get isCollective() { return this._isCollective; }
    private _isCollective = false;
    get isRequired() { return this._isRequired; }
    private _isRequired = false;
    get isFrozen() { return this._isFrozen; }
    private _isFrozen = false;
    get isProp() { return this._isProp; }
    private _isProp = false;
    get symbolizer() { return this._symbolizer; }
    private _symbolizer!: (value: any) => any;
    
    get onGet() { return this._onGet; }
    private _onGet: BondEvent;

    get value(): P { return (this._chemical as any)[this._property]; }
    set value(value: P) { (this._chemical as any)[this._property] = value; }

    private _backingField: symbol;
    private _isInitialized = false;

    constructor(property: string, chemical: T) {
        this._chemical = chemical;
        this._property = property;
        this._id = $Bond.getNextBondId(chemical, property);
        this._backingField = Symbol(`_${property}`);
        this._onGet = new BondEvent(this);
        this.configure();
    }

    freeze() { this._isFrozen = true; }
    
    activate(chemical: $Chemical): void {
        if (this._isInitialized) return;
        
        const chemical$: any = chemical;
        const bond = this;
        const backingField = this._backingField;
        
        const existingDesc = Object.getOwnPropertyDescriptor(chemical$, this._property);
        const getValue = existingDesc?.get ? 
            () => existingDesc.get!.call(chemical$) : 
            () => chemical$[backingField];
        const setValue = existingDesc?.set ? 
            (v: P) => existingDesc.set!.call(chemical$, v) : 
            (v: P) => { chemical$[backingField] = v; };
        
        if (!existingDesc?.get && chemical$[this._property] !== undefined)
            setValue(chemical$[this._property]);
        
        Object.defineProperty(chemical$, this._property, {
            get() {
                const value = getValue();
                const symbol = bond._symbolizer(value);
                bond._onGet.fire({ value, symbol });
                return value;
            },
            set(value: P) {
                if (bond._isFrozen) throw new Error(`${bond._property} is frozen`);
                if (bond._isRequired && value == null) throw new Error(`${bond._property} is required`);
                
                const previous = getValue();
                setValue(value);
                
                // Handle Chemical binding changes
                if (bond._isChemical && previous !== value) {
                    if (previous instanceof $Chemical) previous.onUpdate.unbind(chemical);
                    if (value instanceof $Chemical) value.onUpdate.bind(chemical);
                }
            },
            enumerable: true,
            configurable: false,
        });
        
        this._isInitialized = true;
    }

    private configure() {
        let proto = this._chemical as any;
        while (proto) {
            const decorators = proto[decoratorsKey];
            if (decorators) {
                const $config = decorators.$.get(this._property);
                if ($config) {
                    this._type = $config.type;
                    this._isChemical = true;
                    this._isProp = this._property.startsWith('$');
                    this._isRequired = $config.expecting === '!';
                    this._isCollective = $config.expecting === '[]';
                }
                
                if (decorators.dynamic.get(this._property))
                    this._symbolizer = decorators.dynamic.get(this._property) || symbolize;
            }
            
            if (proto === $Chemical.prototype) break;
            proto = Object.getPrototypeOf(proto);
        }
        
        // Infer symbolizer from value if not set
        const value = this.value;
        if (!this._symbolizer) {
            if (value instanceof $Chemical) {
                this._isChemical = true;
                this._symbolizer = (v: any) => v?.cid;
            } else if (Array.isArray(value) && value[0] instanceof $Chemical
        ) {
                this._isChemical = true;
                this._isCollective = true;
                this._symbolizer = (v: any[]) => symbolize(v?.map(c => c?.cid));
            } else if (typeof value === 'object') {
                this._symbolizer = symbolize;
            }
        }
    }

    private static nextBondId = 1;
    private static getNextBondId(chemical: any, property: string): string {
        const typeName = chemical.getType ? chemical.getType().name : chemical.constructor.name;
        return `${typeName}[${$Bond.nextBondId++}].${property}`;
    }
}

class Event<Source = any, Target = undefined> {
    private token = 0;
    private tokenMap = new Map<number, Function>();
    private subscriberMap = new Map<Function, number>();
    source: Source;
    subscribers: ((source: Source, target?: Target) => Target | void)[];

    constructor(source: Source, ...subscribers: ((source: Source, target?: Target) => Target | void)[]) {
        this.source = source;
        this.subscribers = subscribers || [];
    }

    subscribe(subscriber: (source: Source, target?: Target) => Target | void): number {
        this.subscribers.push(subscriber);
        const token = this.token++;
        this.tokenMap.set(token, subscriber);
        this.subscriberMap.set(subscriber, token);
        return token;
    }

    unsubscribe(key: ((source: Source, target?: Target) => Target | void) | number) {
        let token = 0;
        let subscriber: (source: Source, target?: Target) => Target | void;
        if (typeof key === "number") {
            token = key; 
            if (!this.tokenMap.has(token)) return;
            subscriber = this.tokenMap.get(token) as any;
            this.tokenMap.delete(token);
        } else {
            subscriber = key;
            if (!this.subscriberMap.has(subscriber)) return;
            token = this.subscriberMap.get(subscriber) as any;
            this.subscriberMap.delete(subscriber);
        }
        const index = this.subscribers.indexOf(subscriber);
        if (index >= 0) this.subscribers.splice(index, 1);
    }

    fire(target?: Target): Target | undefined {
        let result: Target | undefined = undefined;
        for (const subscriber of this.subscribers) {
            const returned = subscriber(this.source, result || target);
            if (returned !== undefined) result = returned;
        }
        return result;
    }

    clear() {
        this.subscribers = [];
    }
}

class BondEvent {
    private bond: $Bond;
    private subscribers: ((chemical: $Chemical, symbol: any) => void)[] = []
    private map = new Map<$Chemical, (chemical: $Chemical, symbol: any) => void>();

    constructor(bond: $Bond) {
        this.bond = bond;
    }
    
    subscribe(chemical: $Chemical, subscriber: (chemical: $Chemical, symbol: any) => void): void {
        this.subscribers.push(subscriber);
        this.map.set(chemical, subscriber);
    }
    
    unsubscribe(chemical: $Chemical): void {
        const subscriber = this.map.get(chemical);
        if (!subscriber) return;
        
        const index = this.subscribers.indexOf(subscriber);
        if (index >= 0) this.subscribers.splice(index, 1);
        this.map.delete(chemical);
    }

    fire(symbol: any): void {
        const chemical = this.bond.chemical;
        for (const subscriber of this.subscribers)
            subscriber(chemical, symbol);
    }
    
    clear() {
        this.map.clear();
    }
}

function resolveType(type: Type | Type[] | (() => Type | Type[])): Type | Type[] {
    // Check if it's a function
    if (typeof type === 'function') {
        // Try to determine if it's a constructor or a regular function
        // Constructors typically have a prototype property with a constructor
        if (type.prototype && type.prototype.constructor === type) {
            // It's a constructor
            return type as Type;
        } else {
            // It's a function that returns a constructor
            return (type as () => Type)();
        }
    }

    throw new Error('Input must be a constructor or a function returning a constructor');
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

function isReactiveProperty(instance: any, key: string, value: any, decorators?: DecoratorCache): boolean {
    if (typeof key === 'symbol' || key.startsWith('_')) return false;
    if (!decorators) decorators = instance[decoratorsKey];
    if (decorators?.inert.get(key)) return false;
    if (typeof value === 'function') return decorators?.reactive.get(key) || false;
    return key !== 'constructor' && key !== 'Component' && key !== 'parent' && 
           key !== 'children' && key !== 'elements';
}