import React, { ReactNode, ReactElement, useState, useRef, useEffect, JSX, useContext } from 'react';
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

export interface $Chemistry {
    (props: Record<string, any> & { children?: ReactNode}): ReactNode;
    <P>(Component: React.FC<P>): $Function<P>;  
}

export type $$<T> = 
    T extends $Chemical ? $$Component<T> :
    T extends React.FC<infer P> ? $Function<P> :
    T extends keyof JSX.IntrinsicElements ? JSX.IntrinsicElements[T] :
    T;

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
const $destroyed = Symbol("$Chemical.destroyed");
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
    [$reactive] = false;

    /** @internal */
    [$children]: ReactNode;

    get parent() { return this[$parent]; }

    get children() { return this[$children]; }

    /** @internal */
    get Component(): $Component<this> {
        if (this[$formula] && !this[$component])
            this[$template][$component] = this[$template].createComponent();
        return this[$component]! as any;
    }

    /** @internal */
    get $Component(): $$Component<this> {
        return this[$component]! as any;
    }

    // For arrays
    $key?: string | number;

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

    /** @internal */
    __render(props: any): ReactNode | Promise<ReactNode> {
        const binder = this[$binder];
        binder.bond(props);
        return binder.render();
    }

    /** @internal */
    __destroy() {
        this[$state] = undefined as any;
        this[$lastState] = undefined as any;
        this[$parent] = undefined as any
        this[$formula]?.cleanup();
        this[$formula] = undefined as any;
        this[$destroyed] = true;
        $chemicalRegistry.delete(this[$cid]);
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

class $Collection extends $Chemical {
    get elements(): any[] { return this._elements; }
    private _elements: any[] = [];

    get Component(): $Component<this> { return this._component as any; }
    private _component = () => {};

    $Collection(...elements: any[]) {
        this._elements = elements;
    }
}

class $$Function<P = any> extends $Chemical {
    private FunctionComponent: React.FC<P>;

    get props() { return this.gatherProps(); }

    constructor(Component: React.FC<P>) {
        super();
        this.FunctionComponent = Component;
    }

    bind(): $Function<P> { return this as any; }

    async view() { return this.FunctionComponent(this.props); }

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
        const isArray = this._template.__getType().name === $Collection.name;

        this.Component = ((props: any) => {
            if (isArray && typeof props === 'function') return new $$Function(props);
            const [cid, setChemicalId] = useState<number>(-1);
            let chemical: T;
            if (!this.$bound) {
                let newChemical = cid === -1;
                chemical = newChemical ? this.createChemical() : $chemicalRegistry.get(cid)! as T;
                if (newChemical) {
                    $chemicalRegistry.set(chemical[$cid], chemical);
                    setChemicalId(chemical[$cid]);
                }
            } else {
                chemical = this._chemical!;
            }

            const [_, update] = useState({});
            const [__, setState] = useState(chemical[$formula].state);
            chemical[$formula].bindUpdate(setState, () => update({}));

            useEffect(() => {
                chemical[$formula].updateState();
                return () => {
                    chemical.__destroy();
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
        if (!chemical) chemical = this.createChemical(parent ?? this._parent);
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
        console.log(`${chemical.__getType().name}[${chemical[$cid]}].isTemplate = ${chemical == chemical[$template]}`)
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
        const chain = [Object.getPrototypeOf(this._chemical), this._chemical[$template], this._chemical];
        this._createBonds(chain);
    }

    bindState() {
        this._chemical[$lastState] = this._chemical[$state];
        this._chemical[$state] = this._state;
    }

    unbind() {
        const state = this._chemical[$state];
        const lastState = this._chemical[$lastState];
        if (state == lastState) return;
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
        console.log(`updateState: ${this.state}`);
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
        for (const bond of this._bonds.values())
            bond.cleanup();

        this._bonds = undefined as any;
        this._state = undefined as any;
        this._chemical = undefined as any;
        this._setState = undefined;
        this._update = undefined;
    }

    private _createBonds(chain?: any[]) {
        if (!chain) chain = this._getDescendancyChain();
        const properties = this._findProperties(chain);
        for (const [property, descriptor] of properties) {
            if (this._bonds.has(property)) continue;
            const bond = new $Bond(this._chemical, property, descriptor);
            this._bonds.set(property, bond);
            bond.init();
            console.log(`Bond initialized: ${this._chemical[$type].name}.${property}`)
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

        const isMethod = typeof descriptor.value === 'function' && !descriptor.get && !descriptor.set;
        if (isMethod) {
            console.log(`${this.property}: ${this.descriptor.value}`);
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
        this._getter = undefined;
        this._setter = undefined;
        this._action = undefined;
        this._backingField = undefined;
        this._propertyDescriptor = undefined;;
        this._unbind = () => {};
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
            if (this.reactive && state) 
                state[this.bid] = symbolize(value);
        }

        return value;
    }

    private bondSet(value: any) {
        if (value instanceof $Chemical && value[$destroyed]) value = undefined;
        if (this._setter) this._setter(value);
        else if (this._getter) throw new Error(`${this._property} property not settable`);
        else this._backingField = value;
    }

    private bondCall(chemical: $Chemical, ...args: any[]): any {
        if (chemical[$destroyed]) return;
        chemical[$formula]?.bindState();
        let result = this._action!(...args);
        chemical[$formula].updateState();
        chemical[$formula].unbind();
        if (result instanceof Promise) {
            result = result.then(() => {
                chemical[$formula].update();
            })
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

class $BondOrchestrationContext {
    private parameters?: $BondParameter[];
    private parameterIndex = -1;
    chemical: $Chemical;
    node: any = undefined;
    args: any[] = [];
    key: number = 0;
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

    constructor(chemical: $Chemical, parameters?: $BondParameter[]) {
        this.chemical = chemical;
        this.parameters = parameters;
    }

    next(node: any) {
        const context = this.clone();
        context.node = node;
        context.key = this.key++;
        if (!context.parameter && context.parameterIndex == -1) {
            if (context.parameters!.length > 0) {
                context.parameterIndex = 0;
                context.parameter = context.parameters![context.parameterIndex];
            } else {
                context.argsValid = false;
            }
        } else if (context.parameter && !context.parameter.isSpread) {
            if (context.parameters!.length > context.parameterIndex) {
                context.parameter = context.parameters![context.parameterIndex++];
                if (context.parameter.isSpread) {
                    const spreadArg: any[] = [];
                    this.args.push(spreadArg);
                    context.args = [...this.args, spreadArg];
                }
            } else {
                context.argsValid = false;
            }
        }
        return context;
    }

    array() {
        const context = this.clone();
        context.parent = this;
        context.args = [];
        this.args.push(context.args);
        context.parameter = { isArray: true, isSpread: false }

        context.children = []
        this.children.push(context.children);
        context.isModified = true;
        context.key = 0;
        return context;
    }

    child(chemical: $Chemical, props?: any): any {
        return chemical[$binder].bond(props, this);
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
    private _lastProps?: any;

    constructor(chemical: T) {
        this._chemical = chemical;
        const name = chemical.__getType().name;
        this._bondConstructor = (chemical as any)[name];
        this.parseBondConstructor();
    }

    bond(props: any, parentContext?: $BondOrchestrationContext): any {
        const chemical = this._chemical;
        let children: ReactNode = props.children;
        const context = new $BondOrchestrationContext(chemical, this._parameters);
        parentContext?.childContexts.push(context);
        if (props === this._lastProps) 
            return this._lastProps;
        
        chemical[$reactive] = false;
        this.bindProps(chemical, props);
        
        this.process(children, context);
        if (context.isModified) {
            children = context.build();
            props = { ...props, children: children };
        }

        chemical[$children] = props.children;
        this._lastProps = props;

        if (this._bondConstructor && context.argsValid)
            this.callConstructor(context.args);
        
        chemical[$formula].refresh();
        chemical[$reactive] = true;
        return props;
    }

    render(): ReactNode {        
        let view = this._chemical.view();
        view = this.augmentView(view, this._chemical.Component);        
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
        childArray.map((child, key) => {
            context = context.next(child);
            if (context.isElement) {
                this.processElement(child as React.ReactElement<any>, context)
            } else {
                context.args.push(child);
                context.children.push(child);
            }
        });
    }

    private processElement(element: React.ReactElement<any>, context: $BondOrchestrationContext, key?: number) {
        let type = element.type as any;
        if (type === React.Fragment && element.key?.toString().startsWith('chem-')) {
            const cid = parseInt(element.key.toString().replace('chem-', ''));
            const chemical = $chemicalRegistry.get(cid)!;
            context.args.push(chemical);
            context.children.push({ type: chemical.Component, props: {}, key: element.key })
        } else if (type === $) {
            const items: ReactNode[] = [];
            context = context.array();
            React.Children.map(element.props?.children || [], item => {
                context.isModified = true;
                context = context.next(item);
                if (context.isElement) {
                    this.processElement(item as React.ReactElement<any>, context, key)
                } else {
                    context.args.push(item);
                    context.children.push(item);
                }
            });
        } else if (typeof type === 'function') {
            let component: $$Component = type.$bind ? type : $(type);
            if (!component.$bound)
                component = component.$bind(this._chemical);

            const chemical = component.$chemical;
            chemical.$key = context.key;
            const props = context.child(chemical, element.props);
            context.args.push(chemical);
            if (props !== element.props) {
                context.children.push({ type: component, props: { ...props, key: context.key }, key: element.key });
                context.isModified = true;
            }
        } else {
            context.args.push(element.props);
            context.children.push(element);
        }
    }

    private callConstructor(args: any[]) {
        const paramCount = this._parameters.filter(p => !p.isSpread).length;
        const hasRest = this._parameters.length > 0 && 
            this._parameters[this._parameters.length - 1].isSpread;
        
        if (hasRest) {
            const regular = args.slice(0, paramCount);
            const rest = args.slice(paramCount);
            this._bondConstructor!.apply(this._chemical, [...regular, ...rest]);
        } else {
            this._bondConstructor!.apply(this._chemical, args);
        }
    }

    private augmentView(view: ReactNode, component: $Component<T>): ReactNode {
        return React.createElement(
            React.Fragment,
            { key: `chem-${this._chemical[$cid]}` },
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
        if (val instanceof $Chemical) return val[$cid];
        if (this instanceof $Chemical) return this[$cid];
        if (typeof val === 'function') return undefined;
        if (val?.constructor?.name === 'Proxy') return '[Proxy]';
        return val;
    });
}

const Collection = new $Collection().Component; 
export const $ = (Collection as any) as $Chemistry;
