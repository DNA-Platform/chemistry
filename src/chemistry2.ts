"use client"
import React, { ReactNode, ReactElement, useState, useRef, useEffect } from 'react';
import stringify from 'fast-safe-stringify';
import { basename } from 'path';
import { GSP_NO_RETURNED_VALUE } from 'next/dist/lib/constants';

// Core framework types
type Constructor<T = {}> = new (...args: any[]) => T;
type Type<T = any> = Constructor<T>;
type Component<T = any> = React.FC<Properties<T>>;
type OptionalComponent<T = any> = React.FC<OptionalProperties<T>>;

type Properties<T = any> = {
    [K in keyof T as K extends `$${infer Rest}` ? Rest : never]: T[K]
} & {
    children?: ReactNode;
};

type OptionalProperties<T = any> = {
    [K in keyof T as K extends `$${infer Rest}` ? Rest : never]?: T[K]
} & {
    children?: ReactNode;
};

interface Setter<T extends $Chemical = $Chemical> {
    (value: T): void;
    instance?: $Chemical;  // The instance that owns this setter
}

// Symbols on $Chemical
const decoratorsKey = Symbol('decoratorsField');

// Global registry for Chemical instances by key
const chemicalRegistry = new Map<Component, $Chemical>();

class DecoratorCache {
    $: Map<string, { type: Type, expecting: '?' | '!' | '[]' }> = new Map();
    parent: Map<string, Type> = new Map();
    inert: Map<string, boolean> = new Map();
    dynamic: Map<string, ((value: any) => any) | undefined> = new Map();
}

// A decorator for expressing configurable binding
export function $(type: Type, expecting: '?' | '!' | '[]' = '!') {
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
    private _diagram!: Diagram;
    private _updateToken?: number;

    @inert()
    get chemicalId() { return this._id; }
    private _id: number;

    @inert()
    get formula(): this { return this.getType()._formula as any; }

    @inert()
    get formulaId() { return this.formula.chemicalId; }

    @inert()
    get Component(): Component<this> {
        // Ensure that the formula creates a new model every time
        if (this.formula === this) 
            this._component = undefined;
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

    @inert()
    get children() { return this._children; }
    private _children?: ReactNode;

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
    get onUpdate() { return this._onUpdate; }
    private _onUpdate = new UpdateEvent(this);

    $on?: Setter;

    constructor() {
        this._id = $Chemical.getNextChemicalId();
        const type = this.getType();
        if (!type._formula) {
            type._formula = this;
        }
        this._diagram = new Diagram(this);
    }

    construct(parent?: $Chemical): this {
        const formula = this.getType()._formula;
        const chemical = Object.create(formula) as this;

        chemical._parent = parent;
        chemical._id = $Chemical.getNextChemicalId(); 
        chemical._diagram = new Diagram(chemical);
        return chemical as this;
    }

    // Override this to control rendering
    view(): ReactNode {
        // Default implementation shows the existing children from the props
        return this.children;
    }

    reactivate() {
        this._reactive = true;
        this._diagram.bonds.forEach(bond => {
            bond.isReactive = true;
            bond.reactivate(this);
        });
    }

    deactivate() {
        this._reactive = false;
        this._onUpdate.cancelUpdate();
        this._diagram.bonds.forEach(bond => {
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

    private assignComponent(): void {
        const formula = this.getType().formula as this;
        const isFormula = this === formula;
        if (!isFormula && this._component) return

        let hasMounted = false;
        const Component = (props: Properties) => {
            let chemical = chemicalRegistry.get(Component) as this;
            let newChemical = false;
            if (!chemical || isFormula) {
                chemical = this.construct();
                chemical._component = Component;
                chemical.reactivate();
                chemicalRegistry.set(Component as any, chemical);
                newChemical = true;
            }

            // Cleanup the old subscription
            if (chemical._updateToken)
                chemical.onUpdate.unsubscribe(chemical._updateToken);

            // Set up this component's update function
            const [, update] = useState({});
            chemical._updateToken = chemical.onUpdate.subscribe(() => update({}));

            useEffect(() => {
                return () => {
                    chemical._onReceivingProps.clear();
                    chemical._onRenderingView.clear();
                    chemical._onRenderedView.clear();
                    chemical.onUpdate.clear();
                    if (chemical._component)
                        chemicalRegistry.delete(Component as any);
                };
            }, []);

            // Give subscribers the ability to weigh in on props
            let newProps = chemical.onReceivingProps.fire(props);
            props = newProps || props;

            // Bind the props to the associated fields that are prefixed with $
            chemical.bindProps(props);

            // Reactivate the props
            chemical.reactivate();

            // Bind the child components passed in by the caller
            // chemical.bindImplicit(props);

            // Render the iniital view
            let view = chemical.view();

            // Give subscribers the ability to weigh after the view has been rendered
            const result = chemical.onRenderingView.fire({ props, view });
            view = result?.view || view;

            // Bind the components specified by this chemical
            // view = chemical.bindExplicit(props, view);

            // Give subscribers the ability to weigh in after the event loop ends and the UI updates
            chemical.onRenderedView.fire({ props, view });

            return view
        }

        if (isFormula)
            formula._component = Component;
        if (!this._component)
            this._component = Component;
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
            let bond = this._diagram.bonds.get(propName);
            if (!bond) {
                // Discover new property from props
                bond = this._diagram.configureBond(propName, value);
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

    private static _formula: $Chemical;
    static get formula(): $Chemical { return this._formula; }

    private static nextChemicalId = 1;
    private static getNextChemicalId(): number { return $Chemical.nextChemicalId++; }
}

class Diagram {
    chemical: $Chemical;
    bonds: Map<string, Bond> = new Map();
    initialized: boolean = false;
    get props() { return this.bonds.values().filter(b => b.isProp); }
    get chemicals() { return this.bonds.values().filter(b => b.isChemical); }

    constructor(chemical: $Chemical) {
        this.chemical = chemical;
        this.configureBonds()
    }

    configureBonds() {
        console.log(`Diagram.configureBonds: ${this.chemical.getType().name}`)
        if (this.initialized) return;
        this.initialized = true;
        this.bonds = new Map();

        let chemical = this.chemical;
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
                this.configureBond(property, value, !this.initialized ? prototype[decoratorsKey] : undefined);
            }
        }
    }

    configureBond(property: string, value: any, decorators?: DecoratorCache): Bond {
        console.log(`Diagram.configureBond[1]: ${this.chemical.getType().name}.${property} = ${value}`);
        let bond = this.bonds.get(property);
        if (bond) {
            bond.merge(value);
            return bond;
        }

        bond = new Bond(property);
        this.bonds.set(property, bond);

        const parentType = decorators?.parent.get(property);
        if (parentType) {
            bond.type = parentType || $Chemical;
            bond.isParent = true;
            bond.isChemical = true;  // Parent is always Chemical
            bond.isInert = true;
            bond.isSettable = false;
            return bond;
        }

        const descriptor = Object.getOwnPropertyDescriptor(this.chemical, property);
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
            if (bond.isProp && (this.chemical as any)[property.substring(1)] === $Chemical.$set)
                bond.isExplicitlyBound = true;
            else
                bond.isImplicitlyBound = true;
            this.initializeBondValue(bond, $config.expecting, property, value);
        }

        bond.merge(value);
        return bond;
    }

    private initializeBondValue(bond: Bond, expecting: '?' | '!' | '[]', property: string, value: any) {
        const chemical = this.chemical as any;
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

class Bond {
    private _id: number;
    get id() { return this._id; }
    type?: Type;  // Only for Chemical types, undefined otherwise
    property: string;
    isInitialized: boolean;
    
    isParent = false;           // Represents a property which returns the parent of the chemical
    isChemical = false;         // Property holds a chemical
    isMutable = false;          // Object/array that can change without reference change
    isValue = false;            // Has value semantics
    isCollective = false;       // Is a collection of chemicals 
    isSettable = true;          // Is a field, or a property with both a get and set method
    isRequired = false;         // Must not be null or undefinmed
    isInert = false;            // Never reactive
    isProp = false;             // Non-chemical property that Starts with $
    isDelayed = false           // Uses set-timeout to check if a value was changed after being accessed
    isImplicitlyBound = false;  // Chemical without setter
    isExplicitlyBound = false;  // Has $set setter
    symbolizer: (value: any) => any = (value) => value;
    
    private _isReactive = true;
    get isReactive() { return this.isInert ? false : this._isReactive; }
    set isReactive(value: boolean) { this._isReactive = value; }
    get isPolled() { return this.isMutable || !this.isSettable; }

    constructor(property: string, type?: Type) {
        this._id = Bond.getNextBondId();
        this.property = property;
        this.type = type;
        this.isInitialized = false;
        this.isReactive = false;
    }

    deactivate(chemical: $Chemical) {
        if (chemical === chemical.getType().formula)
            throw new Error('Formulas should not have activated properties');

        this.isReactive = false;
    }

    reactivate(chemical: $Chemical): any {
        if (chemical === chemical.getType().formula)
            throw new Error('Formulas should not have activated properties');

        if (this.isInitialized) {
            this.isReactive = true;
            return;
        }

        if (this.isParent) {
            console.log(`Creating ${chemical.getType().name}.${this.property} as parent`)
            Object.defineProperty(chemical, this.property, {
                get() { return chemical.parent; },
                enumerable: true,
                configurable: false,
            });
            this.isInitialized = true;
            return;
        }

        // Create getters and setters
        const thisBond = this;
        const chemical$: any = chemical;
        const backingField = Symbol(`_${this.property}${this.id}`);
        const descriptor = Object.getOwnPropertyDescriptor(chemical$, this.property);
        const getValue = descriptor?.get ? () => descriptor!.get!.call(chemical) : () => chemical$[backingField];
        const setValue = descriptor?.set ? (value: any) => descriptor!.set!.call(chemical, value) : ((value: any) => { chemical$[backingField] = value; });
        if (!descriptor?.get) setValue(chemical$[this.property]);

        // Create reactive properties
        console.log(`Creating ${chemical.getType().name}.${this.property}`)
        Object.defineProperty(chemical$, this.property, {
            get() {
                const value = getValue();
                console.log(`Getting value ${value} from property ${this.property}`)
                if (!thisBond.isReactive || !thisBond.isPolled) return value;
                
                const symbol = thisBond.symbolizer(value);
                setTimeout(() => {
                    if (!thisBond.isReactive) return;
                    const previousValue = getValue();
                    const previousSymbol = thisBond.symbolizer(previousValue);
                    if (previousSymbol !== symbol)
                        chemical.update();
                });
                return value;
            },
            set(value: any) {
                console.log(`Setting value ${value} from property ${this.property}`)
                if (!thisBond.isSettable)
                    throw new Error(`${thisBond.property} is not settable`);
                if (thisBond.isRequired && value == null)
                    throw new Error(`${thisBond.property} is required`);
                
                thisBond.merge(value);
                if (thisBond.isChemical) thisBond.checkType(value);

                const previous = getValue();
                setValue(value);

                if (previous != value) {
                    if (previous instanceof $Chemical) previous.onUpdate.unbind(chemical);
                    if (value instanceof $Chemical) value.onUpdate.bind(chemical);
                }

                if (!thisBond.isReactive) return;
                if (thisBond.symbolizer(previous) !== thisBond.symbolizer(value)) {
                    chemical.update();
                }
            },
            enumerable: true,
            configurable: false,
        });

        this.isInitialized = true;
        this.isReactive = true;
    }

    merge(value: any): void {
        if (value === null || value === undefined) return;
        
        if (value instanceof $Chemical) {
            if (this.isMutable) 
                throw new Error(`${this.property} was mutable, now Chemical`);
            this.isChemical = true;
            this.isValue = true;
            this.isMutable = false;
            this.symbolizer = (v) => v;
            this.type = value.constructor as Type;
            return;
        }
        
        const valueType = typeof value;
        if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
            if (!this.isValue && !this.isMutable) {
                this.isValue = true;
                this.symbolizer = (v) => v;
            }
            return;
        }
        
        if (valueType === 'object') {
            if (this.isCollective && !Array.isArray(value))
                throw new Error(`${this.property} is collective but got non-array`);
            if (!this.isCollective && Array.isArray(value) && this.isRequired)
                throw new Error(`${this.property} got unexpected array`);
            
            if (!this.isMutable) {
                this.isMutable = true;
                this.isValue = false;
                this.symbolizer = symbolize;
            }
        }
    }

    equivalent(first: any, second: any) {
        return this.symbolizer(first) === this.symbolizer(second);
    }

    private checkType(value: any): void {
        if (!this.type || !this.isChemical || value === null || value === undefined) return;
        if (!(value instanceof this.type))
            throw new Error(`${this.property} must be an instance of ${this.type.name}`);
    }

    private static nextBondId = 1;
    private static getNextBondId(): number { return Bond.nextBondId++; }
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

class DelayedEvent<Source = any, Target = undefined> extends Event<Source, Target> {
    fire(target?: Target): undefined {
        setTimeout(() => {
            let result: Target | undefined = undefined;
            for (const subscriber of this.subscribers) {
                const returned = subscriber(this.source, result || target);
                if (returned !== undefined) result = returned;
            }
        });
        return undefined;
    }
}

class UpdateEvent<T extends $Chemical> extends Event<T> {
    private _updating = false;
    get updating() { return this._updating; }

    beginUpdate() { this._updating = true; }
    cancelUpdate() { this._updating = false; }

    fire(): undefined {
        if (this.source.inert) return;
        super.fire();
        this._updating = false;
    }

    bind(chemical: $Chemical): void {
        if (this.source === chemical) return;
        chemical.onUpdate.clear();
        chemical.onUpdate.subscribe(this.source.update)
    }

    unbind(chemical: $Chemical): void {
        chemical.onUpdate.unsubscribe(this.source.update);
    }
}

function resolveType(type: Type | (() => Type)): Type {
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
    return stringify(value, function (this: any, property: string, value: any): any {
        if (property === '') return value;
        if (this instanceof $Chemical && !isReactiveProperty(this, property, value))
            return undefined;

        // Only keep the Proxy check if Next.js proxies cause issues
        // Otherwise, fast-safe-stringify handles most edge cases
        if (value?.constructor?.name === 'Proxy') return '[NextProxy]';
        return value;
    });
}

function isReactiveProperty(instance: any, key: string, value: any): boolean {
    // Skip symbols, functions, underscore properties
    if (typeof key === 'symbol' ||
        typeof value === 'function' ||
        key.startsWith('_'))
        return false;
    return true;
}