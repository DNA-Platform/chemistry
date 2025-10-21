import { exec } from 'child_process';
import React, { ReactNode, ReactElement, useState, useEffect, JSX } from 'react';

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

export class $Html<T extends keyof JSX.IntrinsicElements = any> { 
    element!: T; 
    attributes!: JSX.IntrinsicElements[T];
    content?: ReactNode
    constructor(element: T, attributes: JSX.IntrinsicElements[T]) {
        this.element = element;
        this.attributes = attributes;
        this.content = this.attributes.children;
    }
}

type $ParameterType = 
    | $Constructor<$Chemical>
    | React.FC
    | Function
    | StringConstructor
    | NumberConstructor
    | BooleanConstructor
    | FunctionConstructor
    | ObjectConstructor
    | null
    | undefined
    | keyof JSX.IntrinsicElements
    | 'any'
    | [$ParameterType]
    | [[$ParameterType]]
    | [[[$ParameterType]]];

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
const $orchestrator = Symbol("$Chemical.orchestrator");
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
    [$parent]: $Chemical | undefined;

    /** @internal */
    [$component]?: $Component<this>;

    /** @internal */
    [$orchestrator]: $BondOrchestrator<this>;

    /** @internal */
    [$reactive] = true;

    /** @internal */
    [$children]: ReactNode;

    /** @internal */
    static [$template]: $Chemical;

    /** @internal */
    get __template(): this {
        return this[$type][$template] as any;
    }

    /** @internal */
    get __isTemplate() { 
        return this === this.__template; 
    }

    /** @internal */
    get __isBound() { 
        return this?.[$component]?.$chemical == this; 
    }

    get parent(): $Chemical | undefined { return this[$parent]; }
    set parent(chemical: $Chemical) { this[$parent] = chemical; }

    get children() { return this[$children]; }

    /** @internal */
    get Component(): $Component<this> {
        if (!this[$component]) {
            if (!this.__template[$component])
                this.__template[$component] = this.__template.__createComponent();
        }
        return this[$component] ?? this.__template[$component]!;
    }

    /** @internal */
    get $Component(): $$Component<this> {
        return this.Component as any;
    }

    $key?: string;
    get key() { return this[$cid]; }

    constructor() {
        this[$cid] = $Chemical.getNextCid();
        this[$type] = this.constructor as any;
        if (!this[$type][$template]) 
            this[$type][$template] = this;
        this[$formula] = new $Formula(this);
        this[$orchestrator] = new $BondOrchestrator(this);
    }

    view(): ReactNode {
        return this.children;
    }

    toString() {
        return `${this[$type].name}[${this[$cid]}]`;
    }

    /** @internal */
    __render(props: any): ReactNode | Promise<ReactNode> {
        const binder = this[$orchestrator];
        binder.bond(props);
        return binder.render();
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
    protected __createComponent(): $Component<this> {
        if (this[$component]) 
            throw new Error(`The Component for ${this} has already been created`);

        this.assertViewConstructors();
        this.__template[$formula].init();
        return new $ComponentFunction(this.__template) as any;
    }

    private assertViewConstructors(prototype?: any, childConstructor?: any) {
        if (!prototype) prototype = Object.getPrototypeOf(this.__template);
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
    static getNextCid(): number { return $Chemical.nextCid++; }
    private static nextCid = 1;
}

const $formed = Symbol("$Arom.formed");
const $formation = Symbol("$Arom.formation");
const $remembered = Symbol("$Arom.remembered");

export class $Atom extends $Chemical {

    /** @internal */
    [$formed] = false;

    /** @internal */
    [$formation]!: Promise<void>;

    protected get formed() { return this[$formed]; }
    async formation() {
        if (!this[$formed])
            await this[$formation];
    }

    /** @internal */
    [$remembered] = false;
    get remembered() { return this[$remembered]; }

    protected constructor() {
        super();
        if (this.__isTemplate) {
            if (!this[$component])
                this[$component] = this.__createComponent().$bind(this.parent, this);
            this[$formation] = this.reform().then(async (remembered) => {
                this[$formed] = remembered;
                this[$remembered] = remembered;
                if (!this[$formed])
                    await this.form();
                    await this.remember();
                    this[$formula].init();
                    
                    this[$formed] = true;
            })
        }
        return this.__template;
    }

    protected async form() { }

    protected async reform(): Promise<boolean> {
        try {
            const key = `chemistry.atom.${this[$type].name}`;
            const stored = localStorage.getItem(key);
            if (stored) {
                const diagram = JSON.parse(stored);
                this[$formula].read(diagram);
                return true;
            }
        } catch (e) {
            console.error(`Failed to reform ${this[$type].name}:`, e);
        }
        return false;
    }

    protected async remember(): Promise<void> {
        try {
            const key = `chemistry.atom.${this[$type].name}`;
            const diagram = this[$formula].diagram;
            localStorage.setItem(key, diagram);
        } catch (e) {
            console.error(`Failed to remember ${this[$type].name}:`, e);
        }
    }

    static particle<T extends $Atom = $Atom>(): T {
        if (!this[$template]) new this();
        return this[$template] as any;
    }

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

    /** @internal */
    get __$Function() { return this._component; }

    /** @internal */
    get __name() { return this.__$Function.name; }

    /** @internal */
    get __props() { return this.gatherProps(); }

    constructor(component: React.FC<P>) {
        super();
        this._component = component;
        this[$component] = new $ComponentFunction(this) as any;
    }

    view() { 
        return React.createElement(this._component as any, this.__props);
    }

    protected gatherProps(): any {
        this[$formula].init();
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

            const [__, update] = useState({});
            const [_, setState] = useState($Represent.symbolize({ cid: chemical[$cid] }, 'fast'));
            chemical[$formula].bindUpdate(setState, () => update({}));

            useEffect(() => {
                const orchestrator = chemical[$orchestrator];
                orchestrator.activate();
                while (orchestrator.actions.length > 0) {
                    const action = orchestrator.actions.shift()!;
                    action();
                }

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
        return new $ComponentFunction(chemical.__template, chemical, parent ?? this._parent) as any;
    }

    private createChemical(parent?: $Chemical): T {
        this.$template[$formula].refresh();
        const chemical = Object.create(this.$template) as T;
        chemical[$parent] = parent;
        chemical[$cid] = $Chemical.getNextCid();
        chemical[$formula] = new $Formula(chemical);
        chemical[$orchestrator] = new $BondOrchestrator(chemical);
        chemical[$formula].init();
        chemical[$reactive] = true;
        return chemical;
    }

    private ensureChemical(chemical: T): T {
        if (!chemical[$formula]) {
            chemical[$formula] = new $Formula(chemical);
            chemical[$orchestrator] = new $BondOrchestrator(chemical);
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
    
    get state() { return $Represent.symbolize(this._state, 'fast'); }
    private _state: $State;

    get diagram(): string {
        const result: Record<string, any> = {};
        for (const [property, bond] of this._bonds) {
            if (bond.isMethod) continue; 
            result[property] = $Represent.symbolize(bond.getter ? bond.getter() : bond.backingField);
        }
        return $Represent.symbolize(result, 'fast');
    }
    
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

        const template = this.chemical.__template;
        if (!this.chemical.__isTemplate && !template[$formula]._initialized)
            template[$formula].init();

        this.chemical[$reactive] = false;
        this._createBonds();
        this._initialized = true;
        this.chemical[$reactive] = true;
    }

    read(diagram: string) {
        this.refresh();
        const symnbolized = JSON.parse(diagram);
        const literalized = $Represent.literalize(symnbolized);
        
        if (!literalized || typeof literalized !== 'object')
            throw new Error(`Could not read the specified diagram: ${diagram}`);
        
        for (const [property, value] of Object.entries(literalized)) {
            const bond = this._bonds.get(property);
            if (bond) {
                if (bond.setter) {
                    bond.setter(value);
                } else if (!bond.getter && !bond.setter) {
                    bond.backingField = value;
                }
            } else {
                const descriptor = {
                    value: value,
                    writable: true,
                    enumerable: true,
                    configurable: true
                };
                const newBond = new $Bond(this._chemical, property, descriptor);
                this._bonds.set(property, newBond);
                newBond.init();
            }
        }
    }

    track() {
        this._bonds.forEach(bond => bond.accessed = false);
    }

    check() {
        const $chemical$ = this.chemical as any;
        this._bonds.forEach(bond => {
            if (bond.accessed) {
                console.log($chemical$.toString(), bond.property)
                const value = $chemical$[bond.property];
                if (value instanceof $Chemical)
                    value[$formula].check();
            }
            bond.accessed = false;
        })
    }
 
    refresh() {
        if (this._destroyed) return;
        if (!this._initialized) {
            this.init();
            return;
        }

        this.chemical[$reactive] = false;
        const chain = [Object.getPrototypeOf(this._chemical), this._chemical.__template, this._chemical];
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
    accessed = false;
    getter?: () => any;
    setter?: (value: any) => void;
    action?: Function;
    isMethod = false;
    backingField: any;
    propertyDescriptor?: PropertyDescriptor;
    private _unbind = () => {};

    private _bid?: string;
    get bid() { 
        if (!this._bid) 
            this._bid = `${this._chemical[$type].name}[${this.chemical[$cid]}].${this._property}`; 
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

    constructor(chemical: T, property: string, descriptor: PropertyDescriptor) {
        this._chemical = chemical;
        this._property = property;
        this._descriptor = descriptor;
        this._isProp = isProp(property, descriptor);
    }

    init() {
        const property = this._property;
        const descriptor = this._descriptor;

        this.isMethod = typeof descriptor.value === 'function' && !descriptor.get && !descriptor.set;
        if (this.isMethod) {
            this.action = descriptor.value.bind(this._chemical);
            this.propertyDescriptor = {
                value: (...args: any[]) => {
                    return this.bondCall(this._chemical, ...args);
                },
                writable: true,
                enumerable: true,
                configurable: true,
            };
        } else {
            this.getter = descriptor.get?.bind(this._chemical);
            this.setter = descriptor.set?.bind(this._chemical);
            this.backingField = descriptor.value;
            this.propertyDescriptor = {
                get: () => this.bondGet(),
                set: (value: any) => this.bondSet(value),
                enumerable: true,
                configurable: true,
            };
        }

        if (!this._chemical.__isTemplate || this instanceof $Atom)
            Object.defineProperty(this._chemical, property, this.propertyDescriptor);
    }

    unbind() {
        this._unbind();
    }

    cleanup() {
        if (this.isMethod) return;
        if (this.backingField instanceof $Chemical)
            this.backingField = undefined;
        if (this.getter && this.setter) {
            const value = this.getter();
            if (value instanceof $Chemical)
                this.setter(undefined);
        }
    }

    private bondGet() {
        this.accessed = true;
        const state = this._chemical[$state];
        let value = this.getter ? this.getter() : this.backingField;
        if (value instanceof $Chemical && value[$destroyed]) {
            if (this.setter) this.setter(value);
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
            if (state) {
                const wasReactive = this._chemical[$reactive];
                this._chemical[$reactive] = false;
                state[this.bid] = $Represent.symbolize(value);
                this._chemical[$reactive] = wasReactive;
            }
        }

        return value;
    }

    private bondSet(value: any) {
        if (value instanceof $Chemical && value[$destroyed]) value = undefined;
        if (this.setter) this.setter(value);
        else if (this.getter) throw new Error(`${this._property} property not settable`);
        else this.backingField = value;
        this.bondGet();
    }

    private bondCall(chemical: $Chemical, ...args: any[]): any {
        let id: string | undefined;
        const context = $Bond.context;
        const formula = chemical[$formula];
        if (context) {
            // Handle idempotency of reactive functions
            id = $BondExecutionContext.executionId(chemical, this);
            if (context.actions.has(id)) {
                if (context.resolved.get(id) && !context.reacted.get(id)) {
                    // Update when the promise resolves, but don't call the idempotent function again 
                    context.react(id!);
                    return;
                } else if (context.reacted.get(id)) {
                    // During that update, if this method is called, simply remove and assume it's idempotent
                    console.log("bondCall: context: removed");
                    context.remove(id);
                    return;
                }
                return;
            }
        }

        formula.bindState();
        formula.track()
        let result = this.action!(...args);

        const isAsync = result instanceof Promise;
        if (!isAsync) {
            formula.updateState();
        }

        formula.unbind();
        if (!isAsync) return result;
        if (!context) {
            result.then(() => {
                console.log("bondCall: context-free: update");
                formula.update();
            });
            return;
        }

        id = $BondExecutionContext.executionId(chemical, this);
        context.add(this, result.then(() => {
            console.log("bondCall: context: async complete");
            this.schedule(chemical, context, () => {
                context.resolve(id!);
            });
        }));
    }

    private bondForm(value: $Chemical) {
        value[$formula].track();
        const lastState = value[$lastState];
        value[$lastState] = value[$state];
        value[$state] = this._chemical[$state];
        let unbind = this._unbind;
        this._unbind = () => {
            value[$state] = lastState;
            this._unbind = unbind;
        }
    }

    private schedule(chemical: $Chemical, context: $BondExecutionContext, action: () => void) {
        console.log("schedule", chemical.toString(), action);
        const orchestrator = chemical[$orchestrator];
        !orchestrator.active ? 
            orchestrator.actions.push(action) :
            action();
    }

    static context?: $BondExecutionContext;
}

class $BondExecutionContext {
    chemical: $Chemical;
    actions: Map<string, Promise<void>> = new Map();
    resolved: Map<string, boolean> = new Map();
    reacted: Map<string, boolean> = new Map();
    unresolved = false;

    constructor(chemical: $Chemical) {
        this.chemical = chemical;
    }

    add(bond: $Bond, action: Promise<void>) {
        const id = $BondExecutionContext.executionId(this.chemical, bond);
        if (this.actions.has(id)) return;
        this.actions.set(id, action);
        this.resolved.set(id, false);
        this.reacted.set(id, false);
        this.unresolved = true;
    }

    after(action: () => void) {
        const ids: string[] = [];
        const pending: Promise<void>[] = [];
        for (const [id, promise] of this.actions.entries()) {
            if (!this.resolved.get(id)) {
                ids.push(id);
                pending.push(promise.then(action));
                this.resolve(id);
            }
        }
        Promise.all(pending).then(() => {
            ids.forEach(id => this.react(id));
        });
    }

    resolve(id: string) {
        this.resolved.set(id, true);
    }

    react(id: string) {
        this.reacted.set(id, true);
    }

    remove(id: string) {
        this.actions.delete(id);
        this.resolved.delete(id);
        this.reacted.delete(id);
    }

    clean() {
        this.reacted.entries()
            .filter(([_, reacted]) => reacted)
            .forEach(([id, _]) => this.remove(id));
    }

    static executionId(chemical: $Chemical, bond: $Bond): string {
        return `${chemical.toString()}[${bond.property}]`;
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
        props = chemical[$orchestrator].bond(props, this);
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
    private _active = false;
    private _chemical: T;
    private _bondConstructor?: Function;
    private _parameters: { isArray: boolean, isSpread: boolean }[] = [];
    private _rendered: Map<Function, ReactElement> = new Map();
    private _lastAguments?: $BondArguments;
    private _executionContext: $BondExecutionContext;
    private _actions: (() => void)[] = [];

    get active() { return this._active; }
    get actions() { return this._actions; }
    get executionContext() { return this._executionContext; }

    constructor(chemical: T) {
        this._chemical = chemical;
        const name = chemical[$type].name;
        this._bondConstructor = (chemical as any)[name];
        this.parseBondConstructor();
        this._executionContext = new $BondExecutionContext(chemical);
    }

    activate() { this._active = true; }

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

        $Bond.context = this._executionContext;
        if (this._bondConstructor && context.argsValid) {
            if (!this._lastAguments || !$BondArguments.equals(this._lastAguments, context.arguments)) {
                paramValidation.reset();
                paramValidation.chemical = this._chemical;
                paramValidation.paramCount = this._parameters.length;
                this._bondConstructor!.apply(this._chemical, context.arguments.values);
                this._lastAguments = context.arguments;
                paramValidation.eval();
            }
        }

        $Bond.context = undefined;
        chemical[$formula].refresh();
        return props;
    }

    render(): ReactNode {
        const chemical = this._chemical;
        const formula = chemical[$formula];
        const executionContext = this._executionContext;

        $Bond.context = executionContext;
        let view = chemical.view();
        view = this.augmentView(view);
        $Bond.context = undefined;

        executionContext.after(() => {
            formula.update()
        });

        return view;
    }

    private parseBondConstructor() {
        if (!this._bondConstructor) return;
        
        const match = this._bondConstructor.toString().match(/\(([^)]*)\)/);
        if (!match) throw new Error(`Cannot parse constructor for ${this._chemical[$type].name}`);
        
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
            let lastContext = context;
            context = context.next(child);
            if (context.isElement) {
                this.processElement(child as React.ReactElement<any>, context)
            } else if (Array.isArray(child)) {
                const arrayContext = context.array();
                this.processArray(child, arrayContext);
            } else if (typeof child === 'string') {
                context = lastContext; 
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
            //console.log(this._chemical.toString(), type?.name || type)
            let component: $$Component = type; 
            if (!component.$bind) {
                let func = type as React.FC;
                component = $wrap(func).$Component;
            }
            if (!component.$bound) {
                component = component.$bind(this._chemical);
            }

            //console.log("bonds", component.$chemical[$formula].bonds.values().map(b => b.property).toArray());
            component.$chemical[$parent] = this._chemical;

            const chemical = component.$chemical;
            const props = context.child(chemical, element.props);
            const key = `${chemical[$cid]}`;
            context.args.push(chemical);
            //console.log(this._chemical.toString(), context.args[context.args.length-1])
            if (props !== element.props || key !== element.key) {
                context.children.push({ type: component, props: props, key: `${chemical[$cid]}` });
                context.isModified = true;
            }
        } else if (Array.isArray(element)) {
            const arrayContext = context.array();
            this.processArray(element, arrayContext);
        } else if (typeof type === 'string') {
            // Intrinsic HTML elements (div, span, input, etc.)
            const intrinsicElement = new $Html(type as any, element.props);
            context.args.push(intrinsicElement);
            context.children.push(element);
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
                    `Chemistry Error: ${invalidType} cannot be used as child in ${this._chemical[$type].name}. ` +
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

class $ParamValidation {
    paramIndex = 0;
    paramCount = -1;
    paramTypes: string[] = [];
    paramErrors: string[] = [];
    chemical: $Chemical | null = null;
    validated = false;

    reset() {
        this.paramIndex = 0;
        this.paramCount = -1;
        this.paramTypes = [];
        this.paramErrors = [];
        this.chemical = null;
        this.validated = false;
    }

    eval() {
        if (this.validated) return;
        this.validated = true;
        
        if (this.paramErrors.length === 0) {
            this.reset();
            return;
        }
        
        const className = this.chemical ? this.chemical.constructor.name : 'Unknown';
        
        let message = `\n$Chemistry Constructor Validation Failed: ${className}\n\n`;
        message += `Expected signature:\n`;
        message += `  ${className}(\n`;
        this.paramTypes.forEach((type, i) => {
            message += `    ${type}${i < this.paramTypes.length - 1 ? ',' : ''}\n`;
        });
        message += `  )\n\n`;
        message += this.paramErrors.join('\n');
        
        this.reset();
        throw new Error(message);
    }

    static describeType(type: any): string {
        if (Array.isArray(type)) {
            // Handle nested arrays recursively
            return `${$ParamValidation.describeType(type[0])}[]`;
        }
        if (type === 'any') return 'any';
        if (type === undefined) return 'undefined';
        if (type === null) return 'null';
        if (type === String) return 'string';
        if (type === Number) return 'number';
        if (type === Boolean) return 'boolean';
        if (type === Function) return 'function';
        if (type === Object) return 'object';
        
        // Handle HTML element types
        if (typeof type === 'string') {
            // Check if it's a primitive type name or an HTML element
            if ($ParamValidation.isPrimitiveType(type)) {
                return type;
            } else {
                // It's an HTML element type like 'div', 'span', etc.
                return `$Html<'${type}'>`;
            }
        }
        
        if (type?.prototype instanceof $$Function) return type.$Function.name;
        if (type?.prototype instanceof $Chemical) return type.name;
        if (typeof type === 'function') return type.name;
        return 'unknown';
    }

    static describeActual(arg: any, depth: number = 0): string {
        if (arg === null) return 'null';
        if (arg === undefined) return 'undefined';
        
        if (Array.isArray(arg)) {
            if (arg.length === 0) return '[]';
            
            // For nested arrays, don't go too deep
            if (depth > 2) return `array(${arg.length})`;
            
            // Sample first few elements to describe the array
            const maxSample = 3;
            const samples = arg.slice(0, maxSample).map(el => {
                // Recursive call for nested arrays
                return $ParamValidation.describeActual(el, depth + 1);
            });
            
            // Check if all elements are same type
            const allSame = samples.every(s => s === samples[0]);
            
            if (allSame && arg.length <= maxSample) {
                // Short array, all same type
                return `${samples[0]}[${arg.length}]`;
            } else if (allSame && arg.length > maxSample) {
                // Long array, all sampled elements same type
                return `${samples[0]}[${arg.length}]`;
            } else {
                // Mixed types - show what we found
                const preview = samples.join(', ');
                if (arg.length > maxSample) {
                    return `[${preview}, ...](${arg.length} total)`;
                } else {
                    return `[${preview}]`;
                }
            }
        }

        if (arg instanceof $$Function) return `${arg.__$Function?.name || '[Function]'}>`;
        if (arg instanceof $Chemical) return arg.constructor.name;
        if (arg instanceof $Html) return `$Html<'${arg.element}'>`; 
        if (React.isValidElement(arg)) {
            const elementType = arg.type;
            if (typeof elementType === 'string') return `<${elementType}>`;
            if (typeof elementType === 'function') return `<${elementType.name || 'Component'}>`;
            return 'ReactElement';
        }
        
        if (typeof arg === 'object') {
            const constructor = arg?.constructor?.name;
            if (constructor && constructor !== 'Object') {
                return `${constructor}`;
            }
            return 'object';
        }
        
        // For primitives in arrays, just return the type
        if (typeof arg === 'string' && depth > 0) return 'string';
        if (typeof arg === 'number' && depth > 0) return 'number';
        if (typeof arg === 'boolean' && depth > 0) return 'boolean';
        
        return typeof arg;
    }

    static isPrimitiveType(type: string): boolean {
        return ['string', 'number', 'boolean', 'object', 'function', 'undefined', 'bigint', 'symbol'].includes(type);
    }

    static isValidReactNode(arg: any): boolean {
        if (arg === null || arg === undefined) return true;
        if (typeof arg === 'string' || typeof arg === 'number') return true;
        if (typeof arg === 'boolean' || typeof arg === 'bigint') return true;
        if (arg instanceof $Chemical) return true;
        if (arg instanceof $$Function) return true;
        if (arg instanceof $Html) return true;
        if (React.isValidElement(arg)) {
            // We accept most React elements, but the processElement method 
            // in BondOrchestrator will handle specific rejections
            return true;
        }
        if (Array.isArray(arg)) return arg.every($ParamValidation.isValidReactNode);
        return false;
    }

    static validateArgument(arg: any, type: any): boolean {
        if (Array.isArray(type)) {
            if (!Array.isArray(arg)) return false;
            const elementType = type[0];
            
            // Handle nested array types
            if (Array.isArray(elementType)) {
                // Type is [[T]] or deeper - validate each element as [T]
                return arg.every(el => $ParamValidation.validateArgument(el, elementType));
            }
            
            // Handle single array level
            if (elementType === 'any') {
                return arg.every(el => $ParamValidation.isValidReactNode(el));
            } else if (elementType === String || elementType === Number || elementType === Boolean || 
                    elementType === Function || elementType === Object) {
                return arg.every(el => $ParamValidation.validatePrimitive(el, elementType));
            } else if (typeof elementType === 'string') {
                // Either primitive type name or HTML element
                if ($ParamValidation.isPrimitiveType(elementType)) {
                    return arg.every(el => typeof el === elementType);
                } else {
                    // HTML element - check props object
                    return arg.every(el => el instanceof $Html && el.element === elementType);
                }
            } else if (elementType?.prototype instanceof $Chemical) {
                return arg.every(el => el instanceof elementType);
            } else if (typeof elementType === 'function') {
                // Check if each element is a $Function wrapping the specific function component
                return arg.every(el => el instanceof $$Function && el.__$Function === elementType);
            }
        } else if (type === 'any') {
            return $ParamValidation.isValidReactNode(arg);
        } else if (type === undefined) {
            return arg === undefined;
        } else if (type === null) {
            return arg === null;
        } else if (type === String || type === Number || type === Boolean || 
                type === Function || type === Object) {
            return $ParamValidation.validatePrimitive(arg, type);
        } else if (typeof type === 'string') {
            // Either primitive type name or HTML element
            if ($ParamValidation.isPrimitiveType(type)) {
                return typeof arg === type;
            } else {
                // HTML element - check if arg is $Html with matching element
                return arg instanceof $Html && arg.element === type;
            }
        } else if (type?.prototype instanceof $Chemical) {
            return arg instanceof type;
        } else if (typeof type === 'function') {
            // Check if arg is a $Function wrapping the specific function component
            return arg instanceof $$Function && arg.__$Function === type;
        }
        return false;
    }
        
    static validatePrimitive(arg: any, type: any): boolean {
        if (type === String) return typeof arg === 'string';
        if (type === Number) return typeof arg === 'number';
        if (type === Boolean) return typeof arg === 'boolean';
        if (type === Function) return typeof arg === 'function' || arg instanceof $$Function;
        if (type === Object) return typeof arg === 'object' && arg !== null;
        return false;
    }
}

class $Represent {
    static symbolize(value: any, mode: 'safe' | 'fast' = 'safe'): string {
        return mode === 'fast' 
            ? JSON.stringify(value, $Represent.replacer)
            : $Represent.safe(value);
    }
    
    static literalize<T = any>(symbolization: string): T {
        const parsed = JSON.parse(symbolization);
        
        // Check for ref structure ['$Symbol', constructor, unique, refs]
        if (Array.isArray(parsed) && parsed[0] === '$Symbol') {
            const [, constructorName, unique, refs] = parsed;
            const resolved = new Map<string, any>();
            
            // Create shells (use prototype if constructor provided)
            for (const [key, val] of Object.entries(refs)) {
                if (Array.isArray(val)) {
                    resolved.set(key, []);
                } else if (typeof val === 'object' && val !== null) {
                    // Try to use constructor prototype if available, fallback to plain object
                    let proto = null;
                    if (constructorName && constructorName !== 'Object') {
                        proto = (globalThis as any)[constructorName]?.prototype;
                    }
                    resolved.set(key, proto ? Object.create(proto) : {});
                } else {
                    resolved.set(key, val);
                }
            }
            
            // Fill shells
            for (const [key, val] of Object.entries(refs)) {
                const target = resolved.get(key)!;
                if (Array.isArray(val)) {
                    for (let i = 0; i < val.length; i++)
                        target[i] = $Represent.resolve(val[i], unique, resolved);
                } else if (typeof val === 'object' && val !== null) {
                    for (const k in val)
                        target[k] = $Represent.resolve((val as any)[k], unique, resolved);
                }
            }
            
            // Return last ref (root) - refs should never be empty
            const keys = Object.keys(refs);
            if (keys.length === 0) 
                throw new Error('Invalid serialization: empty refs object');
            return resolved.get(keys[keys.length - 1]);
        }
        
        return $Represent.processLiteral(parsed);
    }
    
    private static safe(value: any): string {
        const stack: any[] = [];
        const seen = new Map<any, string>();
        let unique: string | undefined;
        let refs: Record<string, any> | undefined;
        let counter = 0;
        let constructorName: string | undefined;
        
        const processed = process(value);
        
        // Return with ['$Symbol', constructor, unique, refs] format
        if (refs) {
            return JSON.stringify(['$Symbol', constructorName || 'Object', unique, refs]);
        }
        return JSON.stringify(processed);
        
        function process(val: any): any {
            if (val === null || typeof val !== 'object') 
                return typeof val === 'function' ? undefined : val;
            
            // Chemical reference
            if (val instanceof $Chemical) 
                return val.toString();
            
            if (val?.constructor?.name === 'Proxy') return '[Proxy]';
            
            // Check if seen (already has ref)
            const existing = seen.get(val);
            if (existing) return existing;
            
            // Check constructor for non-basic objects
            const ctor = val.constructor?.name;
            if (!refs && ctor && !$Represent.isBasicConstructor(ctor)) {
                unique = `[${Date.now()},${Math.random()}]`;
                refs = {};
                constructorName = ctor;
            }
            
            // Check if circular
            for (const obj of stack) {
                if (obj === val) {
                    // Init refs if needed
                    if (!refs) {
                        unique = `[${Date.now()},${Math.random()}]`;
                        refs = {};
                    }
                    const ref = `${unique}[${counter++}]`;
                    seen.set(val, ref);
                    refs[ref] = null; // Will be filled later
                    return ref;
                }
            }
            
            stack.push(val);
            
            let hasRefs = false;
            const result = Array.isArray(val) 
                ? val.map(v => {
                    const processed = process(v);
                    if (typeof processed === 'string' && unique && processed.startsWith(unique))
                        hasRefs = true;
                    return processed === null ? undefined : processed;
                  })
                : (() => {
                    const res: any = {};
                    for (const k in val) {
                        const processed = process(val[k]);
                        if (processed !== undefined) {
                            res[k] = processed;
                            if (typeof processed === 'string' && unique && processed.startsWith(unique))
                                hasRefs = true;
                        }
                    }
                    return res;
                  })();
            
            stack.pop();
            
            // Store ref if contains refs or has custom constructor
            if (refs && (hasRefs || constructorName)) {
                const ref = `${unique}[${counter++}]`;
                seen.set(val, ref);
                refs[ref] = result;
                return ref;
            }
            
            return result;
        }
    }
    
    private static basicConstructors = new Set(['Object', 'Array', 'Date', 'RegExp', 'Map', 'Set', 
                                                  'WeakMap', 'WeakSet', 'Error', 'Promise']);
    
    private static isBasicConstructor(name: string): boolean {
        return $Represent.basicConstructors.has(name);
    }
    
    private static iterate(val: any, fn: (item: any) => any): any {
        if (Array.isArray(val)) return val.map(fn);
        const res: any = {};
        for (const k in val) {
            const v = fn(val[k]);
            if (v !== undefined) res[k] = v;
        }
        return res;
    }
    
    private static resolve(val: any, unique: string, resolved: Map<string, any>): any {
        if (typeof val === 'string' && val.startsWith(unique)) {
            if (!resolved.has(val))
                throw new Error(`Invalid serialization: reference ${val} not found in refs`);
            return resolved.get(val);
        }
        return $Represent.processLiteral(val);
    }
    
    private static processLiteral(val: any): any {
        if (val === null || typeof val !== 'object') 
            return typeof val === 'string' ? $Represent.getChemical(val) : val;
        
        return $Represent.iterate(val, v => $Represent.processLiteral(v));
    }
    
    private static chemicalPattern = /^$(\w+)\[(\d+)\]$/;
    
    private static getChemical(str: string): any {
        const match = str.match($Represent.chemicalPattern);
        if (!match) return str;
        const cid = parseInt(match[2]);
        return $chemicalRegistry.get(cid) || str;
    }
    
    private static replacer(key: string, val: any): any {
        if (key === '') return val;
        if (val instanceof $Chemical) return val.toString();
        if (typeof val === 'function') return undefined;
        if (val?.constructor?.name === 'Proxy') return '[Proxy]';
        return val;
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

function $wrap<P>(Component: React.FC<P>): $Function<React.FC<P>> {
    if (!(typeof Component === "function")) 
        throw new Error(`Expected a function component, got ${Component}`);
    const func = new $$Function(Component) as any;
    return func;
}

export function $use<T extends $Chemical>(chemical: T): $$Component<T>
export function $use<T extends $Chemical>(chemical?: T): $$Component<T>
export function $use<T extends $Chemical>(chemical: T, key: 'key'): [$$Component<T>, string]
export function $use<T extends $Chemical>(chemical?: T, key?: 'key'): [$$Component<T> | undefined, string | undefined] | ($$Component<T> | undefined) {
    if (!chemical) return key == 'key' ? [undefined, undefined] : undefined;
    if (!chemical.$Component) throw new Error(`Chemical ${chemical.constructor.name} has no $Component`);
    return key == 'key' ? [chemical.$Component, `${chemical[$cid]}`] : chemical.$Component;
}

export function $check<T>(arg: T, ...types: $ParameterType[]): T {
    const paramNumber = paramValidation.paramIndex++;
    const typeDescription = types.map(type => {
        if (Array.isArray(type))
            return `${$ParamValidation.describeType(type[0])}[]`;
        return $ParamValidation.describeType(type);
    }).join(' | ');
    
    paramValidation.paramTypes[paramNumber] = typeDescription;
    let valid = false;
    
    for (const type of types) {
        if ($ParamValidation.validateArgument(arg, type)) {
            valid = true;
            break;
        }
    }
    
    if (!valid) {
        paramValidation.paramErrors.push(
            `Parameter ${paramNumber + 1}: expected ${typeDescription}, received ${$ParamValidation.describeActual(arg)}`
        );
    }
    
    // Auto-evaluate on last parameter
    if (paramValidation.paramCount !== -1 && 
        paramValidation.paramIndex === paramValidation.paramCount)
        paramValidation.eval();

    return arg;
}

/**
 * Looks up Chemistry classes from JavaScript modules and instantiates them.
 * Automatically detects ES modules, CommonJS, and bundler formats.
 * 
 * @example
 * // Single module
 * import AppleModule from './apple';
 * const apple = $lookup<$Apple>(AppleModule, '{}');
 * 
 * @example
 * // Vite
 * const modules = import.meta.glob('./entries/*.tsx', { eager: true });
 * const entries = $lookup<$DictionaryEntry>(modules, '[]');
 * 
 * @example
 * // Webpack/Next.js
 * const ctx = require.context('./entries', false, /\.tsx$/);
 * const entries = $lookup<$DictionaryEntry>(ctx, '[]');
 * 
 * @example
 * // Plain ESM
 * const modules = {
 *   'apple': await import('./apple.js'),
 *   'banana': await import('./banana.js')
 * };
 * const entries = $lookup<$DictionaryEntry>(modules, '[]');
 * 
 * @param moduleOrModules - Single module, Webpack context, or Record<path, module> 
 * @param type - '{}' for single result, '[]' for array
 * @param parent - Optional parent Chemical for binding
 */
export function $lookup<T extends $Chemical>(module: any, type: '{}', parent?: $Chemical): T;
export function $lookup<T extends $Chemical>(modules: any, type: '[]', parent?: $Chemical): T[];
export function $lookup<T extends $Chemical>(modules: any, type: string, parent?: $Chemical): T | T[] {
    // Force single result
    if (type === '{}') {
        // Check if it's require.context first
        if (typeof modules === 'function' && modules.keys) {
            const keys = modules.keys();
            if (keys.length > 1) {
                throw new Error(`Expected single module but found ${keys.length} modules`);
            }
            if (keys.length === 0) {
                throw new Error('No modules found');
            }
            const module = modules(keys[0]);
            const chemical = extract(module, parent);
            if (!chemical) throw new Error('No Chemical class found in module');
            return chemical as T;
        }
        
        // If it's a collection, extract first and error if multiple
        const results: T[] = [];
        
        if (typeof modules === 'function' && modules.keys) {
            // Webpack context
            for (const key of modules.keys()) {
                const module = modules(key);
                const chemical = extract(module, parent);
                if (chemical) {
                    results.push(chemical as T);
                }
            }
        } else if (typeof modules === 'object') {
            // Record of modules
            for (const [path, module] of Object.entries(modules)) {
                const chemical = extract(module, parent);
                if (chemical) {
                    results.push(chemical as T);
                }
            }
        }
        
        if (results.length > 1) {
            throw new Error(`Expected single module but found ${results.length} modules`);
        }
        if (results.length === 0) {
            throw new Error('No Chemical class found in module');
        }
        return results[0];
    }
    
    // Force array result
    if (type === '[]') {
        const chemicals: T[] = [];
        
        // Webpack require.context
        if (typeof modules === 'function' && modules.keys) {
            for (const key of modules.keys()) {
                const module = modules(key);
                const chemical = extract(module, parent);
                if (chemical) {
                    chemicals.push(chemical as T);
                }
            }
            return chemicals;
        }
        
        // Record of modules
        if (typeof modules === 'object') {
            for (const [path, module] of Object.entries(modules)) {
                const chemical = extract(module, parent);
                if (chemical) {
                    chemicals.push(chemical as T);
                }
            }
        }
        
        return chemicals;
    }
    
    throw new Error(`Invalid type parameter: ${type}`);
}

/**
 * Asynchronously loads Chemistry classes from modules with lazy loading support.
 * Handles loader functions and promises automatically.
 * 
 * @example
 * // Vite lazy loading
 * const loaders = import.meta.glob('./entries/*.tsx');
 * const entries = await $load<$DictionaryEntry>(loaders, '[]');
 * 
 * @example
 * // Webpack/Next.js with async loader
 * const ctx = require.context('./entries', false, /\.tsx$/);
 * const entries = await $load<$DictionaryEntry>(ctx, '[]');
 * 
 * @example
 * // Dynamic imports
 * const modules = {
 *   'apple': () => import('./apple.js'),
 *   'banana': () => import('./banana.js')
 * };
 * const entries = await $load<$DictionaryEntry>(modules, '[]');
 */
export async function $load<T extends $Chemical>(module: any, type: '{}', parent?: $Chemical): Promise<T>;
export async function $load<T extends $Chemical>(modules: any, type: '[]', parent?: $Chemical): Promise<T[]>;
export async function $load<T extends $Chemical>(moduleOrModules: any, type: '{}' | '[]', parent?: $Chemical): Promise<T | T[]> {
    // Handle single loader function
    if (typeof moduleOrModules === 'function' && !moduleOrModules.keys) {
        const module = await moduleOrModules();
        if (type === '{}') {
            return $lookup<T>(module, '{}', parent);
        } else {
            return $lookup<T>({ 'single': module }, '[]', parent);
        }
    }
    
    // Handle Webpack require.context (already sync, just pass through)
    if (typeof moduleOrModules === 'function' && moduleOrModules.keys) {
        if (type === '{}') {
            return $lookup<T>(moduleOrModules, '{}', parent);
        } else {
            return $lookup<T>(moduleOrModules, '[]', parent);
        }
    }
    
    // Handle objects that might contain loader functions
    if (typeof moduleOrModules === 'object' && 
        !moduleOrModules.default && 
        !moduleOrModules.prototype) {
        const keys = Object.keys(moduleOrModules);
        if (keys.length > 0) {
            // Resolve any loader functions
            const resolved: Record<string, any> = {};
            for (const [path, moduleOrLoader] of Object.entries(moduleOrModules)) {
                if (typeof moduleOrLoader === 'function') {
                    resolved[path] = await moduleOrLoader();
                } else {
                    resolved[path] = moduleOrLoader;
                }
            }
            if (type === '{}') {
                return $lookup<T>(resolved, '{}', parent);
            } else {
                return $lookup<T>(resolved, '[]', parent);
            }
        }
    }
    
    // Already resolved - direct module
    if (type === '{}') {
        return $lookup<T>(moduleOrModules, '{}', parent);
    } else {
        // Wrap single module in object for array return
        const wrapped = { 'module': moduleOrModules };
        return $lookup<T>(wrapped, '[]', parent);
    }
}

function extract(module: any, parent?: $Chemical): $Chemical | null {
    let Component: Component<any> | null = null;
    
    // Check for default export (Component)
    if (module?.default?.$bind) {
        Component = module.default;
    }
    // Check if module itself is a Component
    else if (module?.$bind) {
        Component = module;
    }
    // Check named exports for Components
    else {
        const keys = module ? Object.keys(module) : [];
        for (const key of keys) {
            if (module[key]?.$bind) {
                Component = module[key];
                break;
            }
        }
    }
    
    // If we found a Component, bind it and get the chemical
    if (Component) {
        const bound = Component.$bind(parent);
        return bound.$chemical;
    }
    
    return null;
}

const paramValidation = new $ParamValidation();
export const List = new $List().Component; 
export const Undefined = new $Undefined().Component;
