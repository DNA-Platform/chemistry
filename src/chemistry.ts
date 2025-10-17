import React, { ReactNode, ReactElement, useState, useEffect, JSX } from 'react';
import stringify from 'fast-safe-stringify'; 

export type $Type<T = any> = $Constructor<T>;
export type $Constructor<T = {}> = new (...args: any[]) => T;
type $State = Record<string, any> & { cid: number };

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
} & {
    children?: React.ReactNode;
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
} & {
    children?: React.ReactNode;
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

export type $Function<T> = T extends React.FC<infer P> 
    ? $$Function<P> & {
        [K in keyof P as K extends 'children' ? never : `$${string & K}`]: P[K];
      }
    : never;

export type $Html<T extends keyof JSX.IntrinsicElements> = JSX.IntrinsicElements[T];

export interface $Chemistry {
    (props: Record<string, any> & { children?: ReactNode}): ReactNode;
    <P>(Component: React.FC<P>): $Function<React.FC<P>>;
}

export function $<P>(Component: React.FC<P>): $Function<React.FC<P>> {
    if (!(typeof Component === "function")) 
        throw new Error(`Expected a function component, got ${Component}`);
    return new $$Function(Component) as any;
}

export function $use<T extends $Chemical>(chemical: T): $$Component<T>
export function $use<T extends $Chemical>(chemical?: T): $$Component<T>
export function $use<T extends $Chemical>(chemical: T, key: 'key'): [$$Component<T>, string]
export function $use<T extends $Chemical>(chemical?: T, key?: 'key'): [$$Component<T> | undefined, string | undefined] | ($$Component<T> | undefined) {
    if (!chemical) return key == 'key' ? [undefined, undefined] : undefined;
    if (!chemical.$Component) throw new Error(`Chemical ${chemical.constructor.name} has no $Component`);
    return key == 'key' ? [chemical.$Component, `${chemical[$cid]}`] : chemical.$Component;
}

// Global registry for Chemical instances by key
const $chemicalRegistry = new Map<number, $Chemical>();

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

// Symbols to support shared state
const $state = Symbol("$Chemical.state");
const $lastState = Symbol("$Chemical.lastState");
const $lastProps = Symbol("$Chemical.lastProps");
const $destroyed = Symbol("$Chemical.destroyed");
const $remove = Symbol("$Chemical.remove");
const $decorators = Symbol("$Chemical.decorators");
const $cid = Symbol("$Chemical.cid");
const $type = Symbol("$Chemical.type");
const $formula = Symbol("$Chemical.formula");
const $template = Symbol("$Chemical.template");
const $parent = Symbol("$Chemical.parent");
const $binder = Symbol("$Chemical.binder");
const $component = Symbol("$Chemical.component");
const $reactive = Symbol("$Chemical.reactive");
const $children = Symbol("$Chemical.children");

export class $Chemical {
    /** @internal */
    [$state]: $State = { cid: -1 };

    /** @internal */
    [$lastState]: $State = { cid: -1 };

    /** @internal */
    [$lastProps]: any = {};

    /** @internal */
    [$remove] = false;

    /** @internal */
    [$destroyed] = false;

    /** @internal */
    [$decorators]!: $Decorators;

    /** @internal */
    [$cid]: number;

    /** @internal */
    [$type]: typeof $Chemical;

    /** @internal */
    [$formula]: $Formula;

    /** @internal */
    [$template]: this;

    /** @internal */
    [$parent]: $Chemical | undefined;

    /** @internal */
    [$component]?: $Component<this>;

    /** @internal */
    [$binder]: $BondOrchestrator<this>;

    /** @internal */
    [$reactive] = true;

    /** @internal */
    [$children]: ReactNode;

    get parent() { return this[$parent]; }

    get children() { return this[$children]; }

    /** @internal */
    get Component(): $Component<this> {
        if (!this[$component]) {
            if (!this[$template][$component])
                this[$template][$component] = this[$template].createComponent();
        }
        return this[$component] ?? this[$template][$component]!;
    }

    /** @internal */
    get $Component(): $$Component<this> {
        return this.Component as any;
    }

    $key?: string;
    get key() { return this[$cid]; }

    constructor() {
        this[$cid] = $Chemical.getNextCid();
        this[$type] = this.__getType();
        if (!(this[$type] as any)[$template]) 
            (this[$type] as any)[$template] = this;
        this[$template] = this;
        this[$formula] = new $Formula(this);
        this[$binder] = new $BondOrchestrator(this);
    }

    view(): ReactNode {
        return this.children;
    }

    check<T extends $Chemical>(chemical: T, type: $Type) {
        if (chemical.__getType() !== type)
            throw new Error(`Expected a ${type.name}, got ${chemical.__getType().name}`);
    }

    toString() {
        return `${this.__getType().name}[${this[$cid]}]`;
    }

    /** @internal */
    __render(props: any): ReactNode | Promise<ReactNode> {
        try {
            const binder = this[$binder];
            binder.bond(props);
            return binder.render();
        } catch (e) {
            console.log(`Error rendering ${this.__getType().name}[${this[$cid]}]:`);
            console.log(e);
        }
    }

    /** @internal */
    __destroy() {
        const component = this[$component];
        if (component && component.$bound && component.$chemical == this) return;
        this[$state] = { cid: this[$cid]};
        this[$lastState] = this[$state];
        this[$parent] = undefined as any
        this[$formula]?.cleanup();
        this[$destroyed] = true;
        $chemicalRegistry.delete(this[$cid]); // Consider replacing with a cleanup phase
    }

    /** @internal */
    __getType<T extends $Type<$Chemical> = typeof $Chemical>(): T {
        return this.constructor as any;
    }

    private createComponent(): $Component<this> {
        if (this[$component]) 
            throw new Error(`The Component for ${this.__getType().name}[${this[$cid]}] has already been created`);

        this.assertViewConstructors();
        this[$template][$formula].init();
        return new $ComponentFunction(this[$template]) as any;
    }

    private assertViewConstructors(prototype?: any, childConstructor?: any) {
        if (!prototype) prototype = Object.getPrototypeOf(this[$template]);
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
    static [$template]: $Chemical;

    /** @internal */
    static getNextCid(): number { return $Chemical.nextCid++; }
    private static nextCid = 1;
}

class $List extends $Chemical {
    view(): ReactNode {
        return this.children;
    }
}

class $Undefined extends $Chemical {
    view(): ReactNode {
        return undefined;
    }
}

class $$Function<P = any> extends $Chemical {
    private _component: React.FC<P>;

    get props() { return this.gatherProps(); }

    constructor(component: React.FC<P>) {
        super();
        this._component = component;
    }

    view() { 
        return React.createElement(this._component as any, this.props);
    }

    protected gatherProps(): any {
        this[$formula].init();
        this[$formula].refresh();
        const props: Record<string, any> = this.children ? { children: this.children } : { };
        for (const bond of this[$formula].bonds.values()) {
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
        
        this.Component = ((props: any) => {
            try {
                const [cid, setChemicalId] = useState(-1);
                const initialCid = -1;

                let chemical: T;
                let newChemical = false;
                if (!this.$bound) {
                    newChemical = cid === initialCid;
                    chemical = newChemical ? this.createChemical() : $chemicalRegistry.get(cid) as T;
                    if (!chemical) throw new Error(`$Chemical[${cid}] not found`);
                    if (newChemical) {
                        $chemicalRegistry.set(chemical[$cid], chemical);
                    }
                } else {
                    chemical = this._chemical!;
                }

                chemical[$formula].refresh();
                if (newChemical)
                    setChemicalId(chemical[$cid]);

                const [_, update] = useState({});
                const [__, setState] = useState(symbolize({ cid: chemical[$cid] }));
                chemical[$formula].bindUpdate(setState, () => update({}));

                useEffect(() => {
                    if (chemical && chemical[$formula])
                        chemical[$formula].updateState();
                    return () => {
                        if (!this.$bound) {
                            // Two checks to handle strict mode render after unmount
                            if (!chemical[$remove]) chemical[$remove] = true;
                            else if (!chemical[$destroyed]) chemical.__destroy();
                        }
                    };
                }, [chemical]);

                return chemical.__render(props);
            } catch (e) {
                console.log(e);
            }
        }) as any;

        if (this._chemical) {
            this._chemical[$parent] = parent;
            this._chemical[$component] = this.Component;
        }
        
        Object.setPrototypeOf(this.Component, this);
        return this.Component as any;
    }

    $?(): $$Component<T> { return this.Component as any; }
    
    $bind(parent?: $Chemical, chemical?: T): $$Component<T> {
        if (chemical && chemical === this._chemical) return this.Component as any;
        if (chemical && parent && !chemical.parent) chemical[$parent] = parent; 
        if (chemical && chemical.parent && !parent) parent = chemical[$parent]; 
        chemical = !chemical ? this.createChemical(parent ?? this._parent) : this.ensureChemical(chemical);
        return new $ComponentFunction(chemical[$template], chemical, parent ?? this._parent) as any;
    }

    private createChemical(parent?: $Chemical): T {
        this.$template[$formula].refresh();
        const chemical = Object.create(this.$template) as T;
        chemical[$parent] = parent;
        chemical[$cid] = $Chemical.getNextCid();
        chemical[$formula] = new $Formula(chemical);
        chemical[$binder] = new $BondOrchestrator(chemical);
        chemical[$formula].init();
        chemical[$reactive] = true;
        return chemical;
    }

    private ensureChemical(chemical: T): T {
        if (!chemical[$formula]) {
            chemical[$formula] = new $Formula(chemical);
            chemical[$binder] = new $BondOrchestrator(chemical);
            chemical[$formula].init();
        }
        return chemical as any;
    }
}

class $Formula {
    private _initialized = false;
    private _destroyed = false;

    get chemical() { return this._chemical; }
    private _chemical: $Chemical;

    get bonds() { return this._bonds; }
    private _bonds: Map<string, $Bond> = new Map();
    
    get state() { return symbolize(this._state); }
    private _state: $State;

    get render() { return this._state.render; }
    set render(value: number) { this._state.render = value; }
    
    private _setState?: (state: string) => void;
    private _update?: () => any;

    constructor(chemical: $Chemical) {
        this._chemical = chemical;
        this._state = { cid: this.chemical[$cid] };
    }

    has(property: string): boolean {
        return this._bonds.has(property);
    }

    get<T extends $Chemical = $Chemical, P = any>(property: string): $Bond<T, P> | undefined {
        return this._bonds.get(property);
    }

    init() {
        if (this._destroyed) return;
        if (this._initialized) {
            this.refresh();
            return;
        }

        this.chemical[$reactive] = false;
        this._createBonds();
        this._initialized = true;
        this.chemical[$reactive] = true;
    }

    refresh() {
        if (this._destroyed) return;
        if (!this._initialized) {
            this.init();
            return;
        }

        this.chemical[$reactive] = false;
        const chain = [Object.getPrototypeOf(this._chemical), this._chemical[$template], this._chemical];
        this._createBonds(chain);
        this.chemical[$reactive] = true;
    }

    bindState() {
        this._chemical[$lastState] = this._chemical[$state];
        this._chemical[$state] = this._state;
    }

    unbind() {
        const state = this._chemical[$state];
        const lastState = this._chemical[$lastState];
        this._chemical[$state] = lastState;
        const formula = this._chemical[$formula];
        for (const bond of formula.bonds.values())
            bond.unbind();
    }

    bindUpdate(setState: (state: string) => void, update: () => any) {
        this._setState = setState;
        this._update = update;
        this.bindState();
    }

    updateState() {
        if (!this._setState)
            throw new Error("The setSetate function has not been bound");
        this._setState(this.state); 
    }

    update() {
        if (!this._update)
            throw new Error("The update function has not been bound");
        this._update();
    }

    cleanup() {
        this._state = { cid: this._chemical[$cid]}
        for (const bond of this._bonds.values()) bond.cleanup();
        this._destroyed = true;
    }

    private _createBonds(chain?: any[]) {
        if (this._destroyed) return;
        if (!chain) chain = this._getDescendancyChain();
        const properties = this._findProperties(chain);
        for (const [property, descriptor] of properties) {
            if (this._bonds.has(property)) continue;
            const bond = new $Bond(this._chemical, property, descriptor);
            this._bonds.set(property, bond);
            bond.init();
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
    private _unbind = () => {};
    private _isMethod = false;

    private _bid?: string;
    get bid() { 
        if (!this._bid) 
            this._bid = `${this._chemical.__getType().name}[${this.chemical[$cid]}].${this._property}`; 
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

        this._isMethod = typeof descriptor.value === 'function' && !descriptor.get && !descriptor.set;
        if (this._isMethod) {
            this._action = descriptor.value.bind(this._chemical);
            this._propertyDescriptor = {
                value: (...args: any[]) => {
                    return this.bondCall(this._chemical, ...args);
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
                get: () => this.bondGet(),
                set: (value: any) => this.bondSet(value),
                enumerable: true,
                configurable: true,
            };
        }

        if (this._chemical[$template] !== this._chemical)
            Object.defineProperty(this._chemical, property, this._propertyDescriptor);
    }

    unbind() {
        this._unbind();
    }

    cleanup() {
        if (this._isMethod) return;
        if (this._backingField instanceof $Chemical)
            this._backingField = undefined;
        if (this._getter && this._setter) {
            const value = this._getter();
            if (value instanceof $Chemical)
                this._setter(undefined);
        }
    }

    private bondGet() {
        const state = this._chemical[$state];
        let value = this._getter ? this._getter() : this._backingField;
        if (value instanceof $Chemical && value[$destroyed]) {
            if (this._setter) this._setter(value);
            return undefined;
        }
        if (this._chemical[$reactive]) {
            if (value instanceof $Chemical)
                this.bondForm(value);

            else if (Array.isArray(value)) {
                value.forEach(item => { 
                    if (item instanceof $Chemical) 
                        this.bondForm(item);
                });
            }
            if (this.reactive && state) {
                const wasReactive = this._chemical[$reactive];
                this._chemical[$reactive] = false;
                
                state[this.bid] = symbolize(value);
                
                this._chemical[$reactive] = wasReactive;
            }
        }

        return value;
    }

    private bondSet(value: any) {
        if (value instanceof $Chemical && value[$destroyed]) value = undefined;
        if (this._setter) this._setter(value);
        else if (this._getter) throw new Error(`${this._property} property not settable`);
        else this._backingField = value;
        this.bondGet();
    }

    private bondCall(chemical: $Chemical, ...args: any[]): any {
        chemical[$formula].bindState();
        let result = this._action!(...args);
        chemical[$formula].updateState();
        
        if (result instanceof Promise) {
            const state = chemical[$formula].state;
            result = result.then(() => {
                const newState = chemical[$formula].state;
                if (state !== newState)
                    chemical[$formula].update();
                chemical[$formula].unbind();
            })
        } else {
            chemical[$formula].unbind();
        }

        return result;
    }

    private bondForm(value: $Chemical) {
        const lastState = value[$lastState];
        value[$lastState] = value[$state];
        value[$state] = this._chemical[$state];
        let unbind = this._unbind;
        this._unbind = () => {
            value[$state] = lastState;
            this._unbind = unbind;
        }
    }
}

interface $BondParameter {
    isArray: boolean, 
    isSpread: boolean
}

class $BondArguments {
    values: any[] = [];
    parameters: $BondParameter[] = [];
    parameterIndex = -1;

    constructor(parameters: $BondParameter[]) {
        this.parameters = parameters;
    }

    static equals(first: $BondArguments | any[], second: $BondArguments | any[]) {
        if (first instanceof $BondArguments) first = first.values;
        if (second instanceof $BondArguments) second = second.values;
        if (first.length == 0 && second.length == 0) return false;
        if (first.length != second.length) return false;
        for (let i = 0; i < first.length; i++) {
            const firstArg = first[i];
            const secondArg = second[i];
            const firstIsArray = Array.isArray(firstArg);
            const secondIsArray = Array.isArray(secondArg);
            if (firstIsArray !== secondIsArray) return false;
            if (!firstIsArray && !secondIsArray && first != second) return false;
            if (firstIsArray && secondIsArray && !$BondArguments.equals(firstArg, secondArg)) return false;
        }
        return true;
    }
}

class $BondOrchestrationContext {
    private parameters: $BondParameter[];
    private parameterIndex = -1;
    arguments: $BondArguments;
    args: any[] = [];
    chemical: $Chemical;
    node: any = undefined;
    children: ReactNode[] = [];
    childContexts: $BondOrchestrationContext[] = [];
    singleton: boolean = false;
    parameter?: $BondParameter;
    argsValid?: boolean = true;
    parent?: $BondOrchestrationContext;
    get isElement() { return React.isValidElement(this.node) }

    private _isModified = false;
    get isModified() { return this._isModified; }
    set isModified(value: boolean) { 
        this._isModified = value;
        if (value) this.parent?.isModified;
     }

    constructor(chemical: $Chemical, parameters: $BondParameter[] = []) {
        this.chemical = chemical;
        this.parameters = parameters;
        this.arguments = new $BondArguments(parameters || []);
        this.args = this.arguments.values;
    }

    next(node: any) {
        const context = this.clone();
        context.node = node;
        
        if (!context.parameter && context.parameterIndex == -1) {
            if (context.parameters && context.parameters.length > 0) {
                context.parameterIndex = 0;
                context.parameter = context.parameters[context.parameterIndex];
            } else {
                context.argsValid = false;
            }
        } else if (context.parameter && context.parameter.isSpread) {
            context.args = context.arguments.values;
        } else if (context.parameter && !context.parameter.isSpread) {
            context.parameterIndex++;
            if (context.parameters && context.parameterIndex < context.parameters.length) {
                context.parameter = context.parameters[context.parameterIndex];
                if (context.parameter && context.parameter.isSpread) {
                    context.args = context.arguments.values;
                }
            } else {
                context.parameter = undefined;
                context.argsValid = false;
            }
        }
        return context;
    }

    array() {
        const context = this.clone();
        context.parent = this;
        context.args = [];
        context.parameters = [];
        context.parameterIndex = -1;
        context.parameter = { isArray: true, isSpread: false };
        this.args.push(context.args);
        
        context.children = [];
        this.children.push(context.children);
        return context;
    }

    child(chemical: $Chemical, props: any): any {
        if (chemical[$lastProps] === props) return props;
        props = chemical[$binder].bond(props, this);
        chemical[$lastProps] = props;
        return props;
    }

    build(): any {
        if (!this.isModified) return undefined;
        return this.singleton && this.children.length === 1 ? 
            this.children[0] : 
            this.children;
    }

    private clone(): this {
        const context = Object.create(Object.getPrototypeOf(this));
        Object.assign(context, this);
        return context;
    }
}

class $BondOrchestrator<T extends $Chemical> {
    private _chemical: T;
    private _bondConstructor?: Function;
    private _parameters: { isArray: boolean, isSpread: boolean }[] = [];
    private _rendered: Map<Function, ReactElement> = new Map();
    private _lastAguments?: $BondArguments;

    constructor(chemical: T) {
        this._chemical = chemical;
        const name = chemical.__getType().name;
        this._bondConstructor = (chemical as any)[name];
        this.parseBondConstructor();
    }

    bond(props: any, parentContext?: $BondOrchestrationContext): any {
        const chemical = this._chemical;
        props = this.checkProps(props);
        let children: ReactNode = props.children;
        const context = new $BondOrchestrationContext(chemical, this._parameters);
        parentContext?.childContexts.push(context);
        
        this._rendered = new Map();
        this.bindProps(chemical, props);
        
        this.process(children, context);
        if (context.isModified) {
            children = context.build();
            props = { ...props, children: children || [] };
        }

        chemical[$children] = props.children;

        if (this._bondConstructor && context.argsValid) {
            if (!this._lastAguments || !$BondArguments.equals(this._lastAguments, context.arguments))
            this._bondConstructor!.apply(this._chemical, context.arguments.values);
            this._lastAguments = context.arguments;
        }

        chemical[$formula].refresh();
        return props;
    }

    render(): ReactNode {        
        let view = this._chemical.view();
        view = this.augmentView(view);
        return view;
    }

    private parseBondConstructor() {
        if (!this._bondConstructor) return;
        
        const match = this._bondConstructor.toString().match(/\(([^)]*)\)/);
        if (!match) throw new Error(`Cannot parse constructor for ${this._chemical.__getType().name}`);
        
        const paramString = match[1].trim();
        if (!paramString) return;
        
        this._parameters = paramString.split(',')
            .map(p => p.trim())
            .map(p => ({ 
                isSpread: p.startsWith('...'), 
                isArray: false 
            }));
    }

    private checkProps(props: any) {
        props = props || {};
        const isEmpty = Object.keys(props).length === 0;
        if (isEmpty) props = this._chemical[$lastProps] || props;
        if (!props.children && this._chemical[$lastProps].children) 
            props.children = this._chemical[$lastProps].children || [];
        return props;
    }

    private bindProps(chemical: $Chemical, props: any) {
        const $chemical$: any = chemical;
        for (const prop in props) {
            if (typeof prop === 'symbol' || prop === 'children' || prop === 'key' || prop === 'ref') continue;
            $chemical$['$' + prop] = props[prop];
        }
        chemical[$formula].refresh();
    }

    private process(children: ReactNode, context: $BondOrchestrationContext) {
        const childArray = React.Children.toArray(children);
        context.singleton = !Array.isArray(children) && childArray.length === 1;
        childArray.map(child => {
            context = context.next(child);
            if (context.isElement) {
                this.processElement(child as React.ReactElement<any>, context)
            } else if (Array.isArray(child)) {
                const arrayContext = context.array();
                this.processArray(child, arrayContext);
            } else {
                context.args.push(child);
                context.children.push(child);
            }
        });
    }

    private processElement(element: React.ReactElement<any>, context: $BondOrchestrationContext) {
        let type = element.type as any;
        if (type === React.Fragment && element.key?.toString().startsWith('chem-')) {
            const cid = parseInt(element.key.toString().replace('chem-', ''));
            const chemical = $chemicalRegistry.get(cid)!;
            context.args.push(chemical);
            context.children.push({ type: chemical.Component, props: {}, key: element.key })
            this._rendered.set(chemical.Component, element);
        } else if (type === List) {
            context.isModified = true;
            const arrayContext = context.array();
            this.processArray(React.Children.toArray(element.props?.children || []), arrayContext);
        } else if (type == Undefined) {
            context.args.push(undefined);
        } else if (typeof type === 'function') {
            let component: $$Component = type; 
            if (!component.$bind) {
                let func = type as React.FC;
                component = $(func).$Component;
            }
            if (!component.$bound)
                component = component.$bind(this._chemical);

            const chemical = component.$chemical;
            const props = context.child(chemical, element.props);
            const key = `${chemical[$cid]}`;
            context.args.push(chemical);
            if (props !== element.props || key !== element.key) {
                context.children.push({ type: component, props: props, key: `${chemical[$cid]}` });
                context.isModified = true;
            }
        } else if (Array.isArray(element)) {
            const arrayContext = context.array();
            this.processArray(element, arrayContext);
        } else {
            const isFragment = type === React.Fragment && !element.key?.toString().startsWith('chem-');
            const isPortal = (element as any).$$typeof === Symbol.for('react.portal');
            const isLazy = type && type.$$typeof === Symbol.for('react.lazy');
            const isIterable = element && typeof (element as any)[Symbol.iterator] === 'function';
            
            if (isFragment || isPortal || isLazy || isIterable) {
                const invalidType = 
                    isFragment ? 'React Fragment' : 
                    isPortal ? 'React Portal' : 
                    isLazy ? 'Lazy/Async Component' : 
                    'Iterable (non-array)';

                throw new Error(
                    `Chemistry Error: ${invalidType} cannot be used as child in ${this._chemical.__getType().name}. ` +
                    `Only Chemistry components, function components, arrays, and primitives are supported.`
                );
            }
            context.args.push(element.props);
            context.children.push(element);
        }
    }

    private processArray(elements: any[], context: $BondOrchestrationContext) {
        elements.map(item => {
            context.isModified = true;
            context = context.next(item);
            if (context.isElement) {
                this.processElement(item as React.ReactElement<any>, context)
            } else if (Array.isArray(item)) {
                context = context.array();
                this.processArray(item, context);
            } else {
                context.args.push(item);
                context.children.push(item);
            }
        });
    }

    private augmentView(view: ReactNode): ReactNode {
        const augmented = this.augmentNode(view);
        return React.createElement(
            React.Fragment,
            { key: `chem-${this._chemical[$cid]}` },
            augmented,
        );
    }

    private augmentNode(node: ReactNode): ReactNode {
        if (!node) return node;
        
        if (React.isValidElement(node)) {
            // Check if we've already rendered this
            const rendered = this._rendered.get(node.type as Function);
            if (rendered) return rendered;
            
            const children = (node.props as any)?.children;
            
            // Only recurse if there are children
            if (children) {
                const augmented = React.Children.map(children, child => this.augmentNode(child));
                if (augmented !== children) {
                    return React.cloneElement(node, {}, augmented);
                }
            }
            
            return node;
        }
        
        if (Array.isArray(node)) {
            let changed = false;
            const augmented = node.map(child => {
                const aug = this.augmentNode(child);
                changed ||= aug !== child;
                return aug;
            });
            return changed ? augmented : node;
        }
        
        return node;
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
    let wasReactive: boolean | undefined;
    if (value instanceof $Chemical) {
        wasReactive = value[$reactive];
        value[$reactive] = false;
    }

    var symbol = stringify(value, function(this: any, key: string, val: any): any {
        if (key === '') return val;
        if (val instanceof $Chemical) return val[$cid];
        if (this instanceof $Chemical) return this[$cid];
        if (typeof val === 'function') return undefined;
        if (val?.constructor?.name === 'Proxy') return '[Proxy]';
        return val;
    });

    if (value instanceof $Chemical && wasReactive !== undefined) {
        value[$reactive] = wasReactive;
    }
    return symbol;
}

export const List = new $List().Component; 
export const Undefined = new $Undefined().Component;
