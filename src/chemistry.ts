import React, { ReactNode, ReactElement, useState, useRef, useEffect, JSX, useContext } from 'react';
import stringify from 'fast-safe-stringify'; 

export type $Type<T = any> = $Constructor<T>;
export type $Constructor<T = {}> = new (...args: any[]) => T;
type $State = Record<string, any> & { cid: number, render: number };

export type Props = {
    [key: string]: any;
    children?: ReactNode;
}

export type $Properties<T> = {
    [K in keyof T as K extends `$${infer First}${infer Rest}` ? 
        (First extends Lowercase<First> ?
            (First extends '_' | '$' ? never :
            (K extends keyof $Chemical ? never : 
            (T[K] extends Function ? never : `${First}${Rest}`))) : never) : never]: 
        T[K]
} & {
    [K in keyof T as K extends `$${infer First}${infer Rest}` ? 
        (First extends Lowercase<First> ?
            (First extends '_' | '$' ? never :
            (K extends keyof $Chemical ? never : 
            (T[K] extends Function ? `${First}${Rest}` : never))) : never) : never]?: 
        T[K]
};

export type $$Properties<T> = {
    [K in keyof T as K extends `$${infer First}${infer Rest}` ? 
        (First extends Lowercase<First> ?
            (First extends '_' | '$' ? never :
            (K extends keyof $Chemical ? never : 
            (T[K] extends Function ? never : `${First}${Rest}`))) : never) : never]?: 
        T[K]
} & {
    [K in keyof T as K extends `$${infer First}${infer Rest}` ? 
        (First extends Lowercase<First> ?
            (First extends '_' | '$' ? never :
            (K extends keyof $Chemical ? never : 
            (T[K] extends Function ? `${First}${Rest}` : never))) : never) : never]?: 
        T[K]
};

export type $Component<T extends $Chemical = $Chemical> = React.FC<$Properties<T>> & Component<T>;
export type $$Component<T extends $Chemical = $Chemical> = React.FC<$$Properties<T>> & Component<T>;

export interface Component<T extends $Chemical> {
    get $template(): T;
    get $bound(): boolean;
    get $chemical(): T;
    $?(): $$Component<T>;
    $bind(parent?: $Chemical, chemical?: T): $$Component<T>;
}

export type $Function<P> = $$Function<P> & {
    [K in keyof P as K extends 'children' ? never : `$${string & K}`]: P[K];
};

export interface $ {
    (props: Record<string, any> & { children?: ReactNode}): ReactNode | Promise<ReactNode>;
    <P>(Component: React.FC<P>): $Function<P>;  
}

export type $$<T> = 
    T extends $Chemical ? $$Component<T> :
    T extends React.FC<infer P> ? $Function<P> : 
    T extends keyof JSX.IntrinsicElements ? JSX.IntrinsicElements[T] :
    T;

// Global registry for Chemical instances by key
const $chemicalRegistry = new Map<number, $Chemical>();

// Symbols to support shared state
const $state = Symbol("$Chemical.state");
const $decorators = Symbol("$Chemical.decorators");

class $Decorators {
    parent: Set<string> = new Set();
    inert: Map<string, boolean> = new Map();
    reactive: Map<string, boolean> = new Map();
    static on(chemical: $Chemical): $Decorators {
        if (chemical[$decorators]) return chemical[$decorators];
        chemical[$decorators] = new $Decorators();
        return chemical[$decorators];
    }
}

// A decorator for reassigning the parent property
export function parent() {
    return function (chemical: $Chemical, property: string) {
        const decorators = $Decorators.on(chemical);
        decorators.parent.add(property);
    };
}

// Reactive decorator for methods
export function reactive() {
    return function (chemical: $Chemical, property: string) {
        const decorators = $Decorators.on(chemical);
        decorators.reactive.set(property, true);
    };
}

// Decorator to mark a field as inert (non-reactive)
export function inert() {
    return function (chemical: $Chemical, property: string) {
        const decorators = $Decorators.on(chemical);
        decorators.inert.set(property, true);
    };
}
export class $Chemical {
    /** @internal */
    [$state]: $State = { cid: -1, render: -1 };

    /** @internal */
    [$decorators]!: $Decorators;

    /** @internal */ 
    __cid!: number;
    @inert() 
    get cid() { return this.__cid; }

    /** @internal */
    __name?: string;
    @inert()
    get name() { 
        if (!this.__name) 
            this.__name = this.template.getType().name; 
        return this.__name; 
    }

    /** @internal */
    __formula: $Formula;
    @inert() 
    get formula(): $Formula { return this.__formula; }

    /** @internal */
    __template: this;
    @inert() 
    get template(): this { return this.__template; }

    @inert() 
    get isTemplate() { return this.__template == this; }

    /** @internal */
    __parent: $Chemical | undefined;
    @inert() 
    get parent() { return this.__parent; }

    /** @internal */
    __component?: $Component<this>;
    @inert() 
    get Component(): $Component<this> {
        if (this.formula && !this.__component)
            this.template.__component = this.template.__createComponent();
        return this.__component! as any;
    }

    /** @internal */
    __binder: $BondOrchestrator<this>;
    @inert()
    get binder(): $BondOrchestrator<this> { return this.__binder; }

    /** @internal */
    __reactive = false;
    @inert() 
    get reactive() { return this.__reactive; }
    @inert() 
    get inactive() { return !this.__reactive; }
    reactivate() { this.__reactive = true; }
    deactivate() { this.__reactive = false; }

    /** @internal */
    __children: ReactNode;
    @inert() 
    get children() { return this.__children; }

    constructor() {
        this.__cid = $Chemical.getNextCid();
        const type = this.getType();
        if (!type.__template) 
            type.__template = this;
        this.__template = this;
        this.__formula = new $Formula(this);
        this.__binder = new $BondOrchestrator(this);
    }

    view(): ReactNode {
        return this.children;
    }

    /** @internal */
    render(props: any): ReactNode | Promise<ReactNode> {
        const binder = this.__binder;
        binder.bond(props);
        return binder.render();
    }

    getType<T extends $Type<$Chemical> = typeof $Chemical>(): T {
        return this.constructor as any;
    }

    private __createComponent(): $Component<this> {
        if (this.__component) 
            throw new Error(`The Component for ${this.getType().name}[${this.cid}] has already been created`);

        this.assertViewConstructors();
        this.template.formula.init();
        return new $ComponentFunction(this.template) as any;
    }

    private assertViewConstructors(prototype?: any, childConstructor?: any) {
        if (!prototype) prototype = Object.getPrototypeOf(this.template);
        if (!prototype || prototype === $Chemical.prototype) return;
        
        const className = prototype.constructor.name;
        const thisConstructor = prototype[className];
        if (thisConstructor && typeof thisConstructor !== 'function')
            throw new Error(`The ${className} class has property ${className} but it's not a function`);
        if (childConstructor && !thisConstructor)
            throw new Error(`The ${className} class must have a constructor method named ${className} because child class has one`);

        this.assertViewConstructors(Object.getPrototypeOf(prototype), thisConstructor);
    }

    /** @internal */
    static __template: $Chemical;
    static get template(): $Chemical { return this.__template; }

    /** @internal */
    static getNextCid(): number { return $Chemical.nextCid++; }
    private static nextCid = 1;
}

export class $Collection extends $Chemical {
    get elements(): any[] { return this._elements; }
    private _elements: any[] = [];

    get Component(): $Component<this> { return this._component as any; }
    private _component = () => {};

    $Collection(...elements: any[]) {
        this._elements = elements;
    }
}

export class $$Function<P = any> extends $Chemical {
    private FunctionComponent: React.FC<P>;

    get props() { return this.gatherProps(); }

    constructor(Component: React.FC<P>) {
        super();
        this.FunctionComponent = Component;
    }

    bind(): $Function<P> { return this as any; }

    async view() { return this.FunctionComponent(this.props); }

    protected gatherProps(): any {
        this.formula.init();
        this.formula.refresh();
        const props: Record<string, any> = this.children ? { children: this.children } : { };
        for (const bond of this.formula.bonds.values()) {
            if (bond.isProp) props[bond.property.slice(1)] = bond.value();
        }
        return props;
    }
}

class $ComponentFunction<T extends $Chemical> {
    private Component: $Component<T>;
    private _parent?: $Chemical;

    get $template() { return this._template; };
    private _template: T;

    get $chemical() { return this._chemical; }
    private _chemical?: T;

    get $bound() { return !!this._chemical; }
    
    constructor(template: T, chemical?: T, parent?: $Chemical) {
        this._template = template;
        this._chemical = chemical;
        this._parent = parent;
        const isArray = this._template.getType().name === $Collection.name;

        this.Component = ((props: any) => {
            if (isArray && typeof props === 'function') return new $$Function(props);
            const [cid, setChemicalId] = useState<number>(-1);
            let chemical: T;
            if (!this.$bound) {
                let newChemical = cid === -1;
                chemical = newChemical ? this.createChemical() : $chemicalRegistry.get(cid)! as T;
                if (newChemical) {
                    $chemicalRegistry.set(chemical.cid, chemical);
                    setChemicalId(chemical.cid);
                }
            } else {
                chemical = this._chemical!;
            }

            chemical.formula.clearState();
            const [_, setState] = useState<string>(chemical.formula.state);
            chemical.formula.bindUpdate(setState);

            useEffect(() => {
                chemical.formula.updateState();
                return () => {
                    //You have a memory leak problem, so deal with it later!!
                    $chemicalRegistry.delete(cid);
                };
            }, [chemical]);

            return chemical.render(props);
        }) as any;

        if (this._chemical) {
            this._chemical.__parent = parent;
            this._chemical.__component = this.Component;
        }
        
        Object.setPrototypeOf(this.Component, this);
        return this.Component as any;
    }

    $?(): $$Component<T> { return this.Component as any; }
    
    $bind(parent?: $Chemical, chemical?: T): $$Component<T> {
        if (chemical && chemical === this._chemical) return this.Component as any;
        if (!chemical) chemical = this.createChemical(parent ?? this._parent);
        return new $ComponentFunction(chemical, parent ?? this._parent) as any;
    }

    private createChemical(parent?: $Chemical): T {
        this.$template.formula.refresh();
        const chemical = Object.create(this.$template) as T;
        chemical.__parent = parent;
        chemical.__cid = $Chemical.getNextCid();
        chemical.__formula = new $Formula(chemical);
        chemical.__binder = new $BondOrchestrator(chemical);
        chemical.__formula.init();
        console.log(`${chemical.getType().name}[${chemical.cid}].isTemplate = ${chemical.isTemplate}`)
        return chemical;
    }
}

class $Formula {
    private _initialized = false;

    get chemical() { return this._chemical; }
    private _chemical: $Chemical;

    get bonds() { return this._bonds; }
    private _bonds: Map<string, $Bond> = new Map();
    
    get state() { return symbolize(this._state); }
    private _state: $State = { cid: -1, render: 0 };

    get render() { return this._state.render; }
    set render(value: number) { this._state.render = value; }
    
    private _setState: (state: string) => void = () => {};

    constructor(chemical: $Chemical) {
        this._chemical = chemical;
        this.clearState();
    }

    has(property: string): boolean {
        return this._bonds.has(property);
    }

    get<T extends $Chemical = $Chemical, P = any>(property: string): $Bond<T, P> | undefined {
        return this._bonds.get(property);
    }

    init() {
        if (this._initialized) {
            this.refresh();
            return;
        }
        this._createBonds();
        this._initialized = true;
    }

    refresh() {
        if (!this._initialized) {
            this.init();
            return;
        }
        const chain = [Object.getPrototypeOf(this._chemical), this._chemical.template, this._chemical];
        this._createBonds(chain);
    }

    bindState() {
        this._chemical[$state] = this._state;
    }

    bindUpdate(setState: (state: string) => void) {
        this._setState = setState;
        this.bindState();
    }

    clearState() {
        this._state = { cid: this._chemical.cid, render: 0 };
        this._chemical[$state] = this._state;
        this._setState = () => {};
    }

    updateState() {
        console.log(`updateState: ${this.state}`);
        this._setState(this.state); 
    }

    private _createBonds(chain?: any[]) {
        if (!chain) chain = this._getDescendancyChain();
        const properties = this._findProperties(chain);
        for (const [property, descriptor] of properties) {
            if (this._bonds.has(property)) continue;
            const bond = new $Bond(this._chemical, property, descriptor);
            this._bonds.set(property, bond);
            bond.init();
            console.log(`Bond initialized: ${this._chemical.name}.${property}`)
        }
    }

    private _findProperties(chain: any[]) {
        const properties = new Map<string, PropertyDescriptor>();
        for (const chemical of chain) {
            for (const property of Object.getOwnPropertyNames(chemical)) {
                const descriptor = Object.getOwnPropertyDescriptor(chemical, property);
                if (!descriptor) continue;
                if (isReactiveProperty(property, descriptor.value))
                    properties.set(property, descriptor);
            }

            const decorators = chemical[$decorators] as $Decorators | undefined;
            if (!decorators) continue;
            
            decorators.inert.forEach((isInert, prop) => {
                if (isInert) properties.delete(prop);
            });
            
            decorators.reactive.forEach((isReactive, prop) => {
                if (!isReactive) return properties.delete(prop);
                const descriptor = Object.getOwnPropertyDescriptor(chemical, prop);
                if (descriptor) properties.set(prop, descriptor);
            });
        }

        return properties;
    }

    private _getDescendancyChain(): any[] {
        const chain: any[] = [this._chemical];
        let current = Object.getPrototypeOf(this._chemical);
        while (current && current !== $Chemical.prototype) {
            chain.push(current);
            current = Object.getPrototypeOf(current);
        }
        if (current === $Chemical.prototype) chain.push(current);
        chain.reverse();
        return chain;
    }
}

class $Bond<T extends $Chemical = any, P = any> {
    private _getter?: () => any;
    private _setter?: (value: any) => void;
    private _action?: Function;
    private _backingField: any;
    private _propertyDescriptor?: PropertyDescriptor;

    private _bid?: string;
    get bid() { 
        if (!this._bid) 
            this._bid = `${this._chemical.getType().name}[${this.chemical.cid}].${this._property}`; 
        return this._bid 
    }
    
    get chemical() { return this._chemical; }
    private _chemical: T;
    
    get property() { return this._property; }
    private _property: string;
    
    get descriptor() { return this._descriptor; }
    private _descriptor: PropertyDescriptor;

    get value(): P { return (this._chemical as any)[this._property]; }
    set value(value: P) { (this._chemical as any)[this._property] = value; }
    
    get valueType() { return this._valueType; }
    private _valueType: $Type = Object;

    get isProp() { return this._isProp; }
    private _isProp: boolean;

    get reactive() { return this._reactive; }
    get inactive() { return !this._reactive; }
    private _reactive = true;
    reactivate() { this._reactive = true && !this._frozen; }
    deactivate() { this._reactive = false; }

    get frozen() { return this._frozen; }
    crystallize() { this.deactivate(); this._frozen = true;  }
    private _frozen = false;

    constructor(chemical: T, property: string, descriptor: PropertyDescriptor) {
        this._chemical = chemical;
        this._property = property;
        this._descriptor = descriptor;
        this._isProp = isProp(property, descriptor);
    }

    init() {
        const property = this._property;
        const descriptor = this._descriptor;

        const isMethod = typeof descriptor.value === 'function' && !descriptor.get && !descriptor.set;
        if (isMethod) {
            console.log(`${this.property}: ${this.descriptor.value}`);
            this._action = descriptor.value.bind(this._chemical);
            this._propertyDescriptor = {
                value: (...args: any[]) => {
                    this._chemical.formula?.bindState();
                    const result = this._action!(...args);
                    this._chemical.formula.updateState();
                    return result;
                },
                writable: true,
                enumerable: true,
                configurable: true,
            };
        } else {
            this._getter = descriptor.get?.bind(this._chemical);
            this._setter = descriptor.set?.bind(this._chemical);
            this._backingField = descriptor.value;
            this._propertyDescriptor = {
                get: () => this._bondGet(),
                set: (value: any) => this._bondSet(value),
                enumerable: true,
                configurable: true,
            };
        }

        if (!this._chemical.isTemplate)
            Object.defineProperty(this._chemical, property, this._propertyDescriptor);
    }

    private _bondGet() {
        const state = this._chemical[$state];
        let value = this._getter ? this._getter() : this._backingField;
        if (value instanceof $Chemical)
            value[$state] = state;
        else if (Array.isArray(value)) {
            value.forEach(item => { 
                if (item instanceof $Chemical) 
                    item[$state] = state; 
            });
        }
        
        if (this.reactive && state) 
            state[this.bid] = symbolize(value);

        return value;
    }

    private _bondSet(value: any) {
        if (this._setter) this._setter(value);
        else if (this._getter) throw new Error(`${this._property} property not settable`);
        else this._backingField = value;
    }
}

class $BondOrchestrator<T extends $Chemical> {
    private _chemical: T;
    private _bondConstructor?: Function;
    private _parameters: { rest: boolean }[] = [];
    private _lastProps?: any;
    private _lastProcessedChildren?: ReactNode;
    private _lastArgs?: any[];
    
    constructor(chemical: T) {
        this._chemical = chemical;
        const name = chemical.getType().name;
        this._bondConstructor = (chemical as any)[name];
        this.parseBondConstructor();
    }
    
    bond(props: any): any {
        // Cache to avoid reprocessing identical props
        if (props === this._lastProps) {
            return this._lastProps;
        }
        
        let children = props.children;
        let args: any[] = [];
        
        // Only process children if they changed or first time
        if (!this._lastProps || props.children !== this._lastProps.children) {
            [children, args] = this.process(props.children);
            this._lastProcessedChildren = children;
            this._lastArgs = args;
            
            // Constructor is called every time children change
            if (this._bondConstructor) {
                this.validateArgs(args);
                
                const paramCount = this._parameters.filter(p => !p.rest).length;
                const hasRest = this._parameters.length > 0 && this._parameters[this._parameters.length - 1].rest;
                
                if (hasRest) {
                    const regular = args.slice(0, paramCount);
                    const rest = args.slice(paramCount);
                    this._bondConstructor.apply(this._chemical, [...regular, ...rest]);
                } else {
                    this._bondConstructor.apply(this._chemical, args);
                }
            }
        } else {
            // Reuse cached processed children
            children = this._lastProcessedChildren;
        }
        
        const augmentedProps = { ...props, children };
        this._chemical.__children = augmentedProps.children;
        
        // Always update props
        for (const key in augmentedProps) {
            if (typeof key === 'symbol' || key === 'children' || key === 'key' || key === 'ref') continue;
            (this._chemical as any)['$' + key] = augmentedProps[key];
        }
        
        this._chemical.formula.refresh();
        this._lastProps = augmentedProps;
        return augmentedProps;
    }

    render(): ReactNode {        
        let view = this._chemical.view();
        view = this.augmentView(view, this._chemical.Component);        
        return view;
    }
    
    private parseBondConstructor() {
        if (!this._bondConstructor) return;
        
        const match = this._bondConstructor.toString().match(/\(([^)]*)\)/);
        if (!match) throw new Error(`Cannot parse constructor for ${this._chemical.getType().name}`);
        
        const paramString = match[1].trim();
        if (!paramString) return;
        
        this._parameters = paramString.split(',').map(p => p.trim()).map(p => ({ rest: p.startsWith('...') }));
    }
    
    private validateArgs(args: any[]) {
        if (!this._bondConstructor) return;
        
        const paramCount = this._parameters.filter(p => !p.rest).length;
        const hasRest = this._parameters.length > 0 && this._parameters[this._parameters.length - 1].rest;
        const expected = hasRest ? `at least ${paramCount}` : `${paramCount}`;
        
        if ((hasRest && args.length < paramCount) || (!hasRest && args.length !== paramCount))
            throw new Error(`${this._chemical.getType().name} expects ${expected} arguments, got ${args.length}`);
    }

    private process(children: ReactNode): [ReactNode, any[]] {
        const args: any[] = [];
        
        const augmented = React.Children.map(children, child => {
            if (!React.isValidElement(child)) {
                args.push(child);
                return child;
            }
            
            const [augmented, arg] = this.processElement(child as React.ReactElement<any>);
            if (arg !== undefined) args.push(arg);
            return augmented;
        });
        
        return [augmented, args];
    }
    
    private processElement(element: React.ReactElement<any>): [ReactNode, any] {
        // Chemistry Fragment - extract the Component
        if (element.type === React.Fragment && element.key?.toString().startsWith('chem-')) {
            const cid = parseInt(element.key.toString().replace('chem-', ''));
            const chemical = $chemicalRegistry.get(cid)!;
            return [element, chemical.Component];
        }
        
        const type = element.type as any;
        if (type === $) return this.processArray(element);
        if (typeof type === 'string') return [element, element];
        return this.processComponent(element, type);
    }
    
    private processArray(element: React.ReactElement<any>): [ReactNode, any] {
        const [inner, innerArgs] = this.process(element.props.children);
        return [inner, innerArgs];
    }
    
    private processComponent(element: React.ReactElement<any>, type: any): [ReactNode, any] {
        if (typeof type === 'function' && !type.$template) type = $(type);
        if (!type?.$template || !(type.$template instanceof $Chemical)) 
            return [element, element];
        
        const component: $$Component<$Chemical> = type;
        if (!component.$bound) {
            const bound = component.$bind(this._chemical);
            return [
                React.createElement(bound, {
                    ...element.props,
                    key: element.key,
                    children: element.props.children
                }),
                bound 
            ];
        }
        
        return [element, component];
    }

    private augmentView(view: ReactNode, component: $Component<T>): ReactNode {
        return React.createElement(
            React.Fragment,
            { key: `chem-${this._chemical.cid}` },
            view,
        );
    }
}

function isReactiveProperty(property: string, value?: any): boolean {
    if (property.startsWith('_')) return false;
    if (isSpecial(property)) return true;
    if ($Chemical.prototype.hasOwnProperty(property)) return false;
    if (typeof value === 'function') return false;
    return true;
}

function isSpecial(property: string): boolean {
    return property.length > 2 && 
        property[0] === '$' && 
        property[1] === property[1].toLowerCase() && 
        property[1] !== "$" && 
        property[1] !== "_";
}

function isProp(property: string, value: any | PropertyDescriptor): boolean {
    const isDescriptor = value & (value.get || value.set || value.value);
    if (isDescriptor) {
        if (value.get || value.set) return false;
        value = value.value;
    }
    return isSpecial(property) && typeof value !== 'function';
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

const Collection = new $Collection().Component; 
export const $ = (Collection as any) as $;
