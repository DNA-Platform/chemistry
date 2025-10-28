import React, { ReactNode, ReactElement, useState, useEffect, JSX, useLayoutEffect, useRef } from 'react';

export type $Type<T = any> = $Constructor<T>;
export type $Constructor<T = {}> = new (...args: any[]) => T;
type $SymbolFeature = 'fast' | 'slow' | 'self-contained' | 'referential';
type $Phase = 'setup' | 'mount' | 'render' | 'layout' | 'effect' | 'unmount';
type $Promise<T = any> = Promise<T> & { 
    result: T, 
    complete: boolean,
    then: <U>(action: (value: T) => U) => $Promise<U>,  
    cancel: (action?: () => any) => any 
}

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
    ? $Function$<P> & {
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

// $Chemical Symbols
const $cid = Symbol("$Chemical.cid");
const $symbol = Symbol("$Chemical.symbol");
const $destroyed = Symbol("$Chemical.destroyed");
const $remove = Symbol("$Chemical.remove");
const $decorators = Symbol("$Chemical.decorators");
const $type = Symbol("$Chemical.type");
const $molecule = Symbol("$Chemical.molecule");
const $reaction = Symbol("$Chemical.reaction");
const $$reaction = Symbol("$Chemical.$reaction");
const $template = Symbol("$Chemical.template");
const $$template = Symbol("$Chemical.static.template");
const $parent = Symbol("$Chemical.parent");
const $orchestrator = Symbol("$Chemical.orchestrator");
const $component = Symbol("$Chemical.component");
const $children = Symbol("$Chemical.children");
const $lastProps = Symbol("$Chemical.lastProps");

// $Atom Symbols
const $formed = Symbol("$Arom.formed");
const $formation = Symbol("$Arom.formation");
const $remembered = Symbol("$Arom.remembered");

export class $Chemical {
    /** @internal */
    [$remove] = false;

    /** @internal */
    [$destroyed] = false;

    /** @internal */
    [$decorators]!: $Decorators;

    /** @internal */
    [$cid]: number;

    /** @internal */
    [$symbol]: string;

    /** @internal */
    [$type]: typeof $Chemical;

    /** @internal */
    [$molecule]: $Molecule;

    /** @internal */
    [$reaction]: $Reaction;

    /** @internal */
    [$$reaction]: $Reaction | undefined;

    /** @internal */
    [$parent]: $Chemical | undefined;

    /** @internal */
    [$component]?: $Component<this>;

    /** @internal */
    [$orchestrator]: $BondOrchestrator<this>;

    /** @internal */
    [$children]: ReactNode;

    /** @internal */
    [$lastProps]: any;

    /** @internal */
    [$template]: this;

    /** @internal */
    static [$$template]: $Chemical;

    /** @internal */
    get __isTemplate() { 
        return this === this[$template]; 
    }

    /** @internal */
    get __isBound() { 
        return this?.[$component]?.$chemical == this; 
    }

    /** @internal */
    get __activeReaction(): $Reaction | undefined { 
        if (!this[$reaction]) return undefined;
        return this[$reaction].active ? this[$reaction] : 
            this[$$reaction] && this[$$reaction].active ? this[$$reaction] :
            this.parent ? this.parent.__activeReaction :
            undefined; 
    }

    get parent(): $Chemical | undefined { 
        const parent = this[$parent];
        if (parent) {
            parent[$$reaction] = 
                this[$reaction].active ? this[$reaction] :
                this[$$reaction] && this[$$reaction].active ? this[$$reaction] :
                undefined;

            if (parent[$$reaction]?.active)
                $Reaction.track(parent);
        }
        return parent;
    }

    /** @internal */
    set parent(chemical: $Chemical) {
        chemical[$$reaction] = this[$parent]?.[$$reaction]
        this[$parent] = chemical; 
    }

    get children() { return this[$children]; }

    /** @internal */
    get Component(): $Component<this> {
        if (!this[$component]) {
            if (!this[$template][$component])
                this[$template][$component] = this[$template].__createComponent();
        }
        return this[$component] ?? this[$template][$component] as any;
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
        if (!this[$type][$$template]) 
            this[$type][$$template] = this;
        this[$template] = this[$type][$$template] as any;
        this[$symbol] = this.toString();
        this[$molecule] = new $Molecule(this);
        this[$reaction] = new $Reaction(this);
        this[$orchestrator] = new $BondOrchestrator(this);
    }

    view(): ReactNode {
        return this.children;
    }

    toString() {
        if (this[$symbol]) return this[$symbol];
        return $Chemical.createSymbol(this);
    }

    async mount() { return this[$reaction].mount(); } 
    async render() { return this[$reaction].render(); } 
    async layout() { return this[$reaction].layout(); } 
    async effect() { return this[$reaction].effect(); } 
    async unmount() { return this[$reaction].unmount(); } 

    /** @internal */
    __render(props: any): ReactNode {
        return this[$orchestrator].render(props);
    }

    /** @internal */
    __destroy() {
        const component = this[$component];
        if (component && component.$bound && component.$chemical == this) return;
        this[$parent] = undefined as any
        this[$molecule]?.destroy();
        this[$reaction]?.destroy();
        this[$destroyed] = true;
    }

    /** @internal */
    protected __createComponent(): $Component<this> {
        if (this[$component]) 
            throw new Error(`The Component for ${this} has already been created`);

        this.assertViewConstructors();
        this[$template][$molecule].reactivate();
        return new $Component$(this[$template]) as any;
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
    static getNextCid(): number { return $Chemical.nextCid++; }
    private static nextCid = 1;

    /** @internal */
    static createSymbol(chemical: $Chemical) {
        return `$Chemistry.${chemical[$type].name}[${chemical[$cid]}]`;
    }

    /** @internal */
    static isSymbol(symbol: string): boolean {
        return symbol.startsWith('$Chemistry.');
    }

    /** @internal */
    static parseCid(symbol: string): number | undefined {
        if (!$Chemical.isSymbol(symbol)) return undefined;
        const match = symbol.match($Chemical.symbolPattern);
        if (!match) throw new Error(`Invalid chemical symbol: ${symbol}`);
        return Number(match[1]);
    }

    private static symbolPattern = /\[(\d+)\]$/;
}

export class $Atom extends $Chemical {
    /** @internal */
    [$formed] = false;

    /** @internal */
    [$formation]!: Promise<void>;

    get formed() { return this[$formed]; }

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
                    await this.reflect();
                    this[$molecule].reactivate();
                    
                    this[$formed] = true;
            })
        }
        return this[$template];
    }

    protected async form() { }

    protected async reform(): Promise<boolean> {
        try {
            const key = `$Chemistry<${this[$type].name}>`;
            const stored = localStorage.getItem(key);
            if (stored) {
                const diagram = JSON.parse(stored);
                this[$molecule].read(diagram);
                return true;
            }
        } catch (e) {
            console.error(`Failed to reform ${this[$type].name}:`, e);
        }
        return false;
    }

    protected async reflect(): Promise<void> {
        try {
            const key = `$Chemistry<${this[$type].name}>`;
            const diagram = this[$molecule].formula('self-contained');
            localStorage.setItem(key, diagram);
        } catch (e) {
            console.error(`Failed to remember ${this[$type].name}:`, e);
        }
    }

    static particle<T extends $Atom = $Atom>(): T {
        if (!this[$$template]) new this();
        return this[$$template] as any;
    }

}

class $Function$<P = any> extends $Chemical {
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
        this[$component] = new $Component$(this) as any;
    }

    view() { 
        return React.createElement(this._component as any, this.__props);
    }

    protected gatherProps(): any {
        this[$molecule].reactivate();
        const props: Record<string, any> = this.children ? { children: this.children } : { };
        for (const bond of this[$molecule].bonds.values()) {
            if (bond.isProp) props[bond.property.slice(1)] = bond.value();
        }
        return props;
    }
}

class $Component$<T extends $Chemical> {
    private Component: $Component<T>;

    get $template() { return this._template; };
    private _template: T;

    get $chemical() { return this._chemical; }
    private _chemical?: T;

    get $bound() { return !!this._chemical; }
    
    constructor(template: T, chemical?: T) {
        this._template = template;
        this._chemical = chemical;
        
        this.Component = ((props: any) => {
            const [cid, setChemicalId] = useState(-1);
            const initialCid = -1;

            let chemical: T;
            let newChemical = false;
            if (!this.$bound) {
                newChemical = cid === initialCid;
                chemical = newChemical ? this.createChemical(this._template) : $Reaction.find(cid) as T;
                if (!chemical) throw new Error(`$Chemical[${cid}] not found`);
            } else {
                chemical = this._chemical!;
            }

            if (newChemical)
                setChemicalId(chemical[$cid]);

            const reaction = chemical[$reaction];
            const [token, update] = useState({});
            reaction.bind(update);

            useEffect(() => {
                reaction.resolve('mount');
                return () => {
                    reaction.resolve('unmount');
                    if (!this.$bound) {
                        // Two checks to handle strict mode render after unmount
                        if (!chemical[$remove]) chemical[$remove] = true;
                        else if (!chemical[$destroyed]) chemical.__destroy();
                    }
                };
            }, [chemical]);

            useLayoutEffect(() => {
                reaction.resolve('layout');
            }, [chemical, token]);

            useEffect(() => {
                reaction.resolve('effect');
            }, [chemical, token]);

            return chemical.__render(props);
        }) as any;

        if (this._chemical) 
            this._chemical[$component] = this.Component;
        
        Object.setPrototypeOf(this.Component, this);
        return this.Component as any;
    }

    $?(): $$Component<T> { return this.Component as any; }
    
    $bind(parent?: $Chemical): $$Component<T> {
        let chemical = this.createChemical(this._chemical || this._template, parent);
        return new $Component$(chemical[$template], chemical) as any;
    }

    private createChemical(template: $Chemical, parent?: $Chemical): T {
        let chemical = Object.create(template) as T;
        chemical[$parent] = parent;
        chemical[$template] = template as any;
        chemical[$type] = template[$type];
        chemical[$cid] = $Chemical.getNextCid();
        chemical[$symbol] = $Chemical.createSymbol(chemical);
        chemical[$molecule] = new $Molecule(chemical);
        chemical[$reaction] = new $Reaction(chemical);
        chemical[$orchestrator] = new $BondOrchestrator(chemical);
        return chemical;
    }
}

class $Reaction {
    // Add state management to this
    private _chemical: $Chemical;
    private _update?: React.Dispatch<React.SetStateAction<{}>>;
    private _updateScheduled = false;
    private _mount: (() => void)[] = [];
    private _render: (() => void)[] = [];
    private _layout: (() => void)[] = [];
    private _effect: (() => void)[] = [];
    private _unmount: (() => void)[] = [];
    private _renderCount = 0;

    get active() { return this._activeCount > 0; }
    private _activeCount = 0;

    get phase(): $Phase { return this._phase; }
    private _phase: $Phase = 'setup';

    get state() { return this._state; }
    private _state: $State;

    get tracking() { return this._state.tracking; }

    constructor(chemical: $Chemical) {
        this._chemical = chemical;
        this._state = new $State(chemical);
        $Reaction._system.set(chemical, this);
        $Reaction._chemicals.set(chemical[$cid], chemical);
    }

    bind(update: React.Dispatch<React.SetStateAction<{}>>) {
        this._update = update;
    }

    activate(type?: 'existing') {
        this._activeCount++;
        this.state.track(type);
    }

    deactivate() {
        this._activeCount--;
        if (!this.active) {
            this.state.clear();
            $Reaction._parents.forEach(parent => parent[$$reaction] = undefined);
            $Reaction._parents = new Set();
        }
    }

    updateIf(): boolean {
        const changed = this.state.changed(); 
        if (changed) this.update();
        return changed;
    }

    update() {
        if (this._updateScheduled) return;
        if (this._phase === 'setup') return;
        if (this._phase === 'unmount') return;
        if (this._renderCount == 0) return;
        if (this.phase == 'effect') {
            this._updateScheduled = true;
            this._update!({});
        }

        // During construction/formation, defer updates
        if (this._phase === 'render') {
            queueMicrotask(() => {
                if (this._updateScheduled) return;
                this._updateScheduled = true;
                this._update!({});
            });
            return;
        }
        
        this._updateScheduled = true;
        this._update!({});
    }

    resolve(phase: $Phase) {
        if (phase === 'setup') return;
        if (phase === 'effect') {
            this._renderCount++;
            this._updateScheduled = false;
        }

        const actions = 
            phase === 'mount' ? this._mount :
            phase === 'render' ? this._render :
            phase === 'layout' ? this._layout :
            phase === 'effect' ? this._effect :
            phase === 'unmount' ? this._unmount : 
            undefined;

        this._phase = phase;
        if (this._phase === 'mount') 
            this._phase = 'effect';

        if (!actions)
            return;

        while (actions.length > 0) 
            actions.shift()!();
    }

    async mount() {
        if (this.phase === 'unmount') 
            return Promise.reject();
        if (this._renderCount == 1 && this._phase === 'effect') 
            return Promise.resolve();
        if (this._renderCount < 1)
            return this.effect();
        return Promise.reject();
    }

    async render() {
        if (this.phase == 'setup')
            return Promise.reject();
        if (this.phase === 'unmount') 
            return Promise.reject();
        if (this.phase === 'render')
            return Promise.resolve();
        return this.effect().then(() => this.update());
    }

    async layout() {
        if (this.phase === 'unmount') 
            return Promise.reject();
        if (this._phase === 'layout') 
            return Promise.resolve();
        if (this.phase === 'effect')
            return this.effect().then(() => this.update());
        return $promise(resolve => {
            this._layout.push(resolve);
        });
    }

    async effect() {
        if (this.phase === 'unmount') 
            return Promise.reject();
        if (this._phase === 'effect') 
            return Promise.resolve();
        return $promise(resolve => {
            this._effect.push(resolve)
        });
    }

    async unmount() {
        if (this._phase === 'unmount') 
            return Promise.resolve();
        return $promise(resolve => {
            this._unmount.push(resolve)
        });
    }

    destroy() {
        $Reaction._system.delete(this._chemical);
        $Reaction._chemicals.delete(this._chemical[$cid]);
    }

    private static _chemicals = new Map<number, $Chemical>();
    private static _system = new Map<$Chemical, $Reaction>();
    private static _parents = new Set<$Chemical>();

    static find(cid: number): $Chemical | undefined {
        return this._chemicals.get(cid);
    }

    static track(parent: $Chemical) {
        this._parents.add(parent);
    }
}

class $State {
    get chemical() { return this._chemical; }
    private _chemical: $Chemical;

    private _current: Record<string, any> & { cid: string } = $State.empty;
    private _previous: Record<string, any> & { cid: string } = $State.empty;

    get current(): string { return $State.symbolize(this._current); }
    get previous(): string { return $State.symbolize(this._previous); }

    get tracking() { return this._tracking; }
    private _tracking = false;

    constructor(chemical: $Chemical) {
        this._chemical = chemical;
        this._current
    }

    track(type?: 'existing') {
        if (this.tracking) return;
        this._tracking = true;
        this._previous = this._current;
        this._current = type === 'existing' ? 
            Object.assign({}, this._current) : 
            { cid: $symbolize(this._chemical[$cid]) };
    }

    clear() {
        this._tracking = false;
    }

    changed(): boolean {
        return this.current !== this.previous;
    }

    add(bond: $Bond, value: any) {
        this._current[bond.bid] = $symbolize(value);
    }

    private static symbolize(state: Record<string, any> & { cid: string }) {
        return $symbolize(state);
    }

    private static get empty() { return { cid: "-1" }; }
}

class $Molecule {
    get initialize() { return this._initialized; }
    private _initialized = false;

    get destroyed() { return this._destroyed; }
    private _destroyed = false;

    get chemical() { return this._chemical; }
    private _chemical: $Chemical;

    get bonds() { return this._bonds; }
    private _bonds: Map<string, $Bond> = new Map();

    constructor(chemical: $Chemical) {
        this._chemical = chemical;
    }

    reactivate(): void {
        this._reactivate(true);
    }

    formula(closure: 'self-contained' | 'referential' = 'referential'): string {
        const result: Record<string, any> = {};
        for (const [property, bond] of this._bonds) {
            if (bond.isMethod) continue; 
            result[property] = $symbolize(bond.getter ? bond.getter() : bond.backingField, closure);
        }
        return $symbolize(result, 'fast');
    }

    read(diagram: string) {
        if (this._destroyed) return;
        this.reactivate();

        const symnbolized = JSON.parse(diagram);
        const literalized = $literalize(symnbolized);
        if (!literalized || typeof literalized !== 'object')
            throw new Error(`Could not read the specified diagram: ${diagram}`);
        
        for (const [property, value] of Object.entries(literalized)) {
            const bond = this._bonds.get(property);
            if (bond) {
                if (bond.isField) {
                    bond.backingField = value;
                } else if (bond.isWritable) {
                    bond.setter?.(value);
                }
            } else {
                const descriptor = {
                    value: value,
                    writable: true,
                    enumerable: true,
                    configurable: true
                };
                const newBond = $Bond.create(this._chemical, property, descriptor, true);
                this._bonds.set(property, newBond);
                newBond.form();
            }
        }
    }

    destroy() {
        for (const bond of this._bonds.values()) 
            bond.destroy();
        this._destroyed = true;
    }

    protected _reactivate(always: boolean = false, reactive: boolean = true): void {
        if (this._destroyed) return;
        if (this._initialized && !always) return;
        this._initialized = true;
        
        const chemical = this._chemical;
        const prototype = Object.getPrototypeOf(chemical);
        const [predecessor, predecessorReactive]: [$Chemical, boolean] = 
            prototype === $Chemical.prototype ? [undefined, false] :
            chemical == chemical[$type][$$template] ? [prototype, chemical instanceof $Atom] :
            [chemical[$template], true]; 
        
        const properties = new Set(Object.getOwnPropertyNames(chemical));
        const doubleBonds: $Bond[] = [];

        let molecule = predecessor?.[$molecule];
        if (predecessor && !molecule) {
            molecule = new $Molecule(predecessor);
            predecessor[$molecule] = molecule;
            predecessor[$type] = predecessor.constructor as any;
            console.log('predecessor', predecessor.constructor?.name)
            predecessor[$cid] = $Chemical.getNextCid();
            predecessor[$symbol] = predecessor.toString();
        }
        
        if (molecule) {
            molecule._reactivate(false, predecessorReactive);
            molecule._bonds.forEach((bond, property) => {
                if (!properties.has(property)) 
                    doubleBonds.push(bond);
            });
        }
  
        for (const property of properties) {
            if (this._bonds.has(property)) continue;
            if (!$Bond.isReactiveProperty(property)) continue;
            if (property === chemical[$type].name) continue;

            console.log("Bond.reactivate:own", chemical[$symbol], property);
            const descriptor = Object.getOwnPropertyDescriptor(chemical, property)!;
            const bond = $Bond.create(chemical, property, descriptor, reactive);
            this._bonds.set(property, bond);
            bond.form();
        }

        for (const bond of doubleBonds) {
            if (this._bonds.has(bond.property)) continue;
            console.log("Bond.reactivate:double", bond.chemical[$symbol], 'to', chemical[$symbol], bond.property);
            const doubleBond = bond.double(chemical, reactive);
            this._bonds.set(bond.property, doubleBond);
        }
    }
}

class $Bond<T extends $Chemical = $Chemical, P = any> {
    protected _parent?: $Bond;
    protected _children = new Set<$Bond>();

    get formed() { return this._formed; }
    protected _formed = false;

    get reactive() { return this._reactive; }
    protected _reactive = false;

    get getter() { return this._getter; }
    protected _getter?: () => any;

    get setter() { return this._setter; }
    protected _setter?: (value: any) => void;

    get action() { return this._action; }
    protected _action?: Function;

    get backingField() { return this._backingField; }
    set backingField(value: P) { this.backingField = value; }
    protected _backingField!: P;
    
    protected _bid?: string;
    get bid() { 
        if (!this._bid) 
            this._bid = `${this._chemical[$type].name}[${this.chemical[$cid]}].${this._property}`; 
        return this._bid 
    }
    
    get chemical() { return this._chemical; }
    protected _chemical: T;

    get template() { return this._template; }
    protected _template?: $Chemical;

    get possesses() { return this._possesses; }
    protected _possesses = false;
    
    get property() { return this._property; }
    protected _property: string;
    
    get descriptor() { return this._descriptor; }
    protected _descriptor: PropertyDescriptor;

    get bondDescriptor() { return this._bondDescriptor; }
    protected _bondDescriptor!: PropertyDescriptor;

    get value(): P { return (this._chemical as any)[this._property]; }
    set value(value: P) { (this._chemical as any)[this._property] = value; }
    
    _lastSeenArgs?: string = undefined;
    get lastSeenArgs() { return this._lastSeenArgs; }
    set lastSeenArgs(value: string | undefined) { this._lastSeenArgs = value; }
    
    _lastSeenValue?: P;
    get lastSeenValue() { return this._lastSeenArgs; }
    set lastSeenValue(value: any) { 
        this._lastSeenValue = value;
        if (!this.reactive) return;
        const [reaction, type] = this.reaction;
        if (type === 'active' || reaction!.tracking)
            reaction!.state.add(this, value);
    }

    get isProp() { return this._isProp; }
    protected _isProp: boolean;

    get isMethod() { return this._isMethod; }
    protected _isMethod = false;

    get isPure() { return this._isPure; }
    protected _isPure = false;

    get isAsync() { return this._isAsync; }
    protected _isAsync = false;

    get isField() { return !this.isProperty && !this.isMethod; }
    get isProperty() { return this.getter !== undefined || this.setter !== undefined; }
    get isReadable() { return this.isField || this.getter !== undefined; }
    get isWritable() { return this.isField || this.setter !== undefined; }
    get isReadOnly() { return this.property && this.getter !== undefined && this.setter === undefined; }
    get isWriteOnly() { return this.property && this.getter === undefined && this.setter !== undefined; }
    get isEditable() { return this.isReadable && this.isWritable; }

    get reaction(): [$Reaction | undefined, 'active' | 'ineactive'] { 
        if (!this._reactive) return [undefined, 'ineactive'];
        const activeReaction = this._chemical.__activeReaction;
        return activeReaction ? [activeReaction, 'active'] : [this._chemical[$reaction], 'ineactive'];
    }

    protected constructor(chemical: T, property: string, descriptor: PropertyDescriptor, reactive: boolean) {
        this._property = property;
        this._descriptor = descriptor;
        this._isProp = $Bond.isSpecial(property);
        this._chemical = chemical;
        this._template = undefined;
        this._possesses = true;
        this._reactive = reactive;
    }

    form() {
        if (this.formed) return;
        this._formed = true;
        
        const property = this._property;
        const descriptor = this._descriptor;
        
        this._getter = descriptor.get;
        this._setter = descriptor.set;
        this._backingField = descriptor.value;
        if (this.isField) {
            const $chemical$ = this.chemical as any;
            this._backingField = $chemical$[this.property];
            this.lastSeenValue = this.backingField;
        } else if (this.isReadable) {
            this.lastSeenValue = this.getter!();
        }

        this.describe();
    }

    double(chemical: $Chemical, reactive: boolean) {
        const bond = Object.create(this) as $Bond;
        this._children.add(bond);
        bond._parent = this;
        bond._template = this._chemical;
        bond._chemical = chemical;
        bond._children = new Set();
        bond._bid = undefined;
        bond._possesses = bond.isMethod;
        bond._reactive = reactive;
        bond.describe();
        return bond;
    }

    destroy() {
        this._lastSeenValue = undefined;
        this._lastSeenArgs = undefined;
        this._backingField = undefined as any;
        this.setter?.(undefined);
    }

    protected bondGet() {
        let value: any = 
            !this._possesses && this._parent ? this._parent.bondGet() :
            this.isProperty && this.isReadable ? this._getter!() :
            this._backingField;
        
        if (value instanceof $Chemical && value[$destroyed]) {
            this.bondSet(undefined);
            return undefined;
        }

        if (!this._isMethod)
            this.lastSeenValue = value;

        return value;
    }

    protected bondSet(value: any) {
        const dependent = !this._possesses;
        this._possesses = true;
        if (dependent)
            this._parent?._children.delete(this);
        
        const chemical = this.chemical;
        if (value instanceof $Chemical && value[$destroyed]) 
            value = undefined;
        if (this.isField)
            this._backingField = value;
        else if (this.isWritable)
            this.setter!.apply(chemical, [value]);
        else
            throw new Error(`${this._property} property not settable`);

        if (this._reactive)
            this.bondGet();
        for (const child of this._children)
            child.bondSet(value);
    }

    protected describe() {
        this._bondDescriptor = {
            get: () => this.bondGet(),
            set: (value: any) => this.bondSet(value),
            enumerable: true,
            configurable: true,
        };
        Object.defineProperty(this._chemical, this._property, this._bondDescriptor);
    }

    static isReactiveProperty(property: string): boolean {
        if (property.startsWith('_')) return false;
        if ($Bond.isSpecial(property)) return true;
        if ($Chemical.prototype.hasOwnProperty(property)) return false;
        return true;
    }

    static isSpecial(property: string): boolean {
        return property.length > 2 && 
            property[0] === '$' && 
            property[1] === property[1].toLowerCase() && 
            property[1] !== "$" && 
            property[1] !== "_";
    }

    static isMethod(descriptor: PropertyDescriptor) {
        return typeof descriptor.value === 'function' && !descriptor.get && !descriptor.set;
    }

    static create<T extends $Chemical>(chemical: T, property: string, descriptor: PropertyDescriptor, reactive: boolean): $Bond<T> {
        return $Bond.isMethod(descriptor) ? 
            new $BondFormation(chemical, property, descriptor, reactive) : 
            new $Bond(chemical, property, descriptor, reactive);
    }
}

class $BondFormation<T extends $Chemical = any, P = any> extends $Bond<T, P> {
    get lastSeenActive() { return this._lastSeenActive; }
    protected _lastSeenActive?: $Promise<any>;
    protected _lastSeenRender?: $Promise<any>;

    constructor(chemical: T, method: string, descriptor: PropertyDescriptor, reactive: boolean) {
        super(chemical, method, descriptor, reactive);
        this._isProp = false;
        this._isMethod = true;
        this._isPure = $Bond.isSpecial(method);
    }

    form() {
        if (this.formed) return;
        this._formed = true;
        
        this._action = this._descriptor.value;
        this._isAsync = this._action?.constructor.name === 'AsyncFunction';
        this.describe();
    }

    describe() {
        this._bondDescriptor = {
            get: () => {
                return (...args: any[]) => {
                    return this.bondCall(...args);
                };
            },
            set: (value: any) => {
                this.bondSet(value);
            },
            enumerable: true,
            configurable: true,
        };
        Object.defineProperty(this._chemical, this._property, this._bondDescriptor);
    }

    protected bondCall(...args: any[]) {
        if (this.isPure) {
            const argSymbol = $symbolize(args || []);
            if (this.lastSeenArgs == argSymbol)
                return this._isAsync ? 
                    this._lastSeenActive :
                    this.lastSeenValue;
            this._lastSeenArgs = argSymbol;
        }

        const chemical = this._chemical;
        let actualArgs = args.filter(arg => !$Represent.isEvent(arg));

        if (this._isAsync) {
            console.log("bondCall: async", this._chemical.toString(), this.property, $symbolize(actualArgs));
            const chemical = this._chemical;
            return this.handleAsync(
                $promise(resolve => { resolve(); })
                .then(async () => {
                    console.log("bondCall:thsn", 'this', this)
                    return this.action!.apply(chemical, actualArgs)
                })
            );
        }
        
        let reaction = this.reactive ? 
            chemical.__activeReaction : 
            undefined;

        const updateRequired = this.reactive &&
            (reaction === undefined ||
             reaction.phase !== 'render'); 
            
        if (updateRequired) {
            reaction = chemical[$reaction];
            reaction.activate('existing');
        }

        console.log("bondCall", this._chemical.toString(), this.property, $symbolize(args), 'updateRequired', updateRequired, 'reaction', reaction);

        try {
            let result = this.action!.apply(chemical, actualArgs);
            if (!(result instanceof Promise)) {
                this.lastSeenValue = result;
                return result;
            }
            return this.handleAsync(result);
        } finally {
            if (updateRequired) {
                reaction!.deactivate();
                reaction!.updateIf();
            }
        }
    }

    protected handleAsync(action: Promise<any>): $Promise<any> {
        console.log("handleAsync", this._chemical.toString(), this.property);
        this._isAsync = true;
        const $action = action.then(async result => {
            console.log("handleAsync:result", this._chemical.toString(), this.property, 'result', result);
            $action.result = result;
            if (this._lastSeenActive !== $action) 
                return result;

            this._lastSeenRender = this.chemical.render() as any;
            await this._lastSeenRender;

            console.log("handleAsync:afterRender", this._chemical.toString(), this.property, 'result', result);
            if (this._lastSeenValue !== result)
                this.lastSeenValue = result;
            return this.lastSeenValue;
        }) as $Promise<any>;

        const assign = () => $action.then(result => { 
            if (this._lastSeenValue !== result)
                this.lastSeenValue = result;
        });
        if (this._lastSeenActive) {
            this._lastSeenActive.cancel?.(assign);
            this._lastSeenActive = undefined;
        }
        if (this._lastSeenRender) { 
            this._lastSeenRender.cancel?.(assign);
            this._lastSeenRender = undefined
        }

        this._lastSeenActive = $action;
        return $action;
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
    parent: $BondOrchestrationContext = this;
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
        context.parent = this;
        return context;
    }
}

class $BondOrchestrator<T extends $Chemical> {
    private _chemical: T;
    private _bondConstructor?: Function;
    private _parameters: { isArray: boolean, isSpread: boolean }[] = [];
    private _rendered: Map<Function, ReactElement> = new Map();

    constructor(chemical: T) {
        this._chemical = chemical;
        const name = chemical[$type].name;
        this._bondConstructor = (chemical as any)[name];
        this.parseBondConstructor();
    }

    render(props: any): ReactNode {
        const chemical = this._chemical;
        const molecule = chemical[$molecule];
        const reaction = chemical[$reaction];

        // Build the chemical
        reaction.activate();
        molecule.reactivate();
        this.bond(props);
        molecule.reactivate();

        // Track the state of the reaction
        const view = this.view();
        reaction.deactivate();
        reaction.updateIf();

        return view;
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
            $paramValidation.reset();
            $paramValidation.chemical = this._chemical;
            $paramValidation.paramCount = this._parameters.length;
            this._bondConstructor!.apply(this._chemical, context.arguments.values);
            $paramValidation.eval();
        }

        return props;
    }

    view(): ReactNode {
        const chemical = this._chemical;

        let view = chemical.view();
        view = this.augmentView(view);

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
        if (!props.children && this._chemical[$lastProps]?.children) 
            props.children = this._chemical[$lastProps].children || [];
        return props;
    }

    private bindProps(chemical: $Chemical, props: any) {
        const $chemical$: any = chemical;
        for (const prop in props) {
            if (typeof prop === 'symbol' || prop === 'children' || prop === 'key' || prop === 'ref') continue;
            $chemical$['$' + prop] = props[prop];
        }
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
            } else if (typeof child === 'string') {
                context = context.parent; 
            } else {
                context.args.push(child);
                context.children.push(child);
            }
        });
    }

    private processElement(element: React.ReactElement<any>, context: $BondOrchestrationContext) {
        const parent = this._chemical;
        let type = element.type as any;
        let key = element.key?.toString() || '';
        if (type === React.Fragment && $Chemical.isSymbol(key)) {
            const cid = $Chemical.parseCid(key)!;
            const chemical = $Reaction.find(cid)!;
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
                component = $wrap(func).$Component;
            }
            if (component.$chemical?.[$parent] !== parent) {
                component = component.$bind(parent);
            }

            const chemical = component.$chemical;
            const props = context.child(chemical, element.props);
            const key = `${chemical[$cid]}`;
            context.args.push(chemical);
            if (props !== element.props || key !== element.key) {
                context.children.push({ type: component, props: props, key: chemical[$symbol] });
                context.isModified = true;
            }
        } else if (Array.isArray(element)) {
            const arrayContext = context.array();
            this.processArray(element, arrayContext);
        } else if (typeof type === 'string') {
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
            { key: this._chemical[$symbol] },
            augmented,
        );
    }

    private augmentNode(node: ReactNode): ReactNode {
        if (!node) return node;
        if (Array.isArray(node)) {
            let changed = false;
            const augmented = node.map(child => {
                const aug = this.augmentNode(child);
                changed = changed || aug !== child;
                return aug;
            });
            return changed ? augmented : node;
        }
        
        if (!React.isValidElement(node)) 
            return node;
        
        const element = node as React.ReactElement;
        const type = element.type as any;
        
        // Fix key for Chemistry components
        let elementToProcess = element;
        if (typeof type === 'function' && type.$chemical) {
            const correctKey = type.$chemical[$symbol];
            if (element.key !== correctKey) {
                elementToProcess = React.cloneElement(element, { key: correctKey });
            }
        }
        
        // Process children
        const children = (elementToProcess.props as any)?.children;
        if (!children) return elementToProcess;
        
        const augmentedChildren = React.Children.map(children, child => this.augmentNode(child));
        if (augmentedChildren === children) return elementToProcess;
        
        return React.cloneElement(elementToProcess, undefined, augmentedChildren);
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
        
        if (type?.prototype instanceof $Function$) return type.$Function.name;
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

        if (arg instanceof $Function$) return `${arg.__$Function?.name || '[Function]'}>`;
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
        if (arg instanceof $Function$) return true;
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
                return arg.every(el => el instanceof $Function$ && el.__$Function === elementType);
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
            return arg instanceof $Function$ && arg.__$Function === type;
        }
        return false;
    }
        
    static validatePrimitive(arg: any, type: any): boolean {
        if (type === String) return typeof arg === 'string';
        if (type === Number) return typeof arg === 'number';
        if (type === Boolean) return typeof arg === 'boolean';
        if (type === Function) return typeof arg === 'function' || arg instanceof $Function$;
        if (type === Object) return typeof arg === 'object' && arg !== null;
        return false;
    }
}

class $Represent {
    static symbolize(value: any, ...features: $SymbolFeature[]): string {
        const mode = features.find(f => f === 'fast') ? 'fast' : 'safe';
        const closure = features.find(f => f === 'self-contained') ? 'self-contained' : 'referential'; 
        const replacer = $Represent.replacer(closure === 'referential')
        return mode === 'fast' 
            ? JSON.stringify(value, replacer)
            : $Represent.safe(value, replacer);
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
    
    private static safe(value: any, replacer: (key: string, val: any) => any): string {
        const stack: any[] = [];
        const seen = new Map<any, string>();
        let unique: string | undefined;
        let refs: Record<string, any> | undefined;
        let counter = 0;
        let constructorName: string | undefined;
        
        const processed = process(value, value => replacer('_', value));
        
        // Return with ['$Symbol', constructor, unique, refs] format
        if (refs) {
            return JSON.stringify(['$Symbol', constructorName || 'Object', unique, refs]);
        }
        return JSON.stringify(processed);
        
        function process(val: any, replacer: (val: any) => any): any {
            if (val === null || val === undefined || typeof val !== 'object') 
                return typeof val === 'function' ? undefined : val;
            
            const replaced = replacer(val);
            if (val !== replaced)
                return replaced;
            
            // Check if seen (already has ref)
            const existing = seen.get(val);
            if (existing) return existing;
            
            // Check constructor for non-basic objects
            const ctor = val?.constructor?.name;
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
                    const processed = process(v, replacer);
                    if (typeof processed === 'string' && unique && processed.startsWith(unique))
                        hasRefs = true;
                    return processed === null ? undefined : processed;
                  })
                : (() => {
                    const res: any = {};
                    for (const k in val) {
                        const processed = process(val[k], replacer);
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
        return $Reaction.find(cid) || str;
    }
    
    static replacer(referential: boolean): (key: string, value: any) => any {
        return (key: string, value: any) => {
            if (key === '') return value;
            if (value instanceof $Chemical) return referential ? value[$symbol] : undefined;
            if (React.isValidElement(value)) return referential ? value.key : undefined;
            if (typeof value === 'function') return undefined;
            if (value?.constructor?.name === 'Proxy') return referential ? '[Proxy]' : undefined;
            if ($Represent.isEvent(value)) {
                return $Represent.symbolize({
                    type: value.type,
                    reactEvent: true,
                    timeStamp: value.timeStamp
                }, 'fast');
            }
            return value;
        }
    }

    static isEvent(value: any): boolean {
        return value && typeof value === 'object' && '_reactName' in value;
    }
}

export function $symbolize(value: any, ...features: $SymbolFeature[]): string {
    return $Represent.symbolize(value, ...features);
}
    
export function $literalize<T = any>(symbolization: string): T {
    return $Represent.literalize(symbolization);
}

const $cancelled = Symbol('$promise.cancelled');
export function $promise<T = any>(executor: (resolve: (value?: T) => void) => void): $Promise<T> {
    let reject: ((reason?: any) => void) | undefined;
    let promise = new Promise<T>((res, rej) => {
        reject = rej;
        executor(res as any);
    }) as $Promise<T>;
    
    promise = promise
        .then(value => { 
            promise.complete = true;
            promise.result = value; 
            return value; 
        }).catch(err => {
            promise.complete = true;
            if (err === $cancelled) return undefined as T;
            throw err;
        }) as $Promise<T>;
    
    const then = promise.then.bind(promise);
    promise.complete = false;
    promise.cancel = (action?: () => any) => { reject?.($cancelled); action?.(); }
    promise.then = (<U>(fulfilled?: (value: T) => U, rejected?: any) => {
        const next = $promise<U>(resolve => {
            then(
                value => {
                    if (!fulfilled) return resolve(value as any);
                    const result = fulfilled(value);
                    Promise.resolve(result).then(resolve);
                },
                err => {
                    if (err === $cancelled) return reject?.(err);
                    if (rejected) return rejected(err);
                    throw err;
                }
            );
        });
        
        const cancel = next.cancel;
        next.cancel = (action?: () => any) => {
            cancel(action);
            promise.cancel(action);
        };
        return next;
    }) as any;
    return promise;
}

export function $use<T extends $Chemical>(chemical: T): $$Component<T>
export function $use<T extends $Chemical>(chemical?: T): $$Component<T>
export function $use<T extends $Chemical>(chemical: T, key: 'key'): [$$Component<T>, string]
export function $use<T extends $Chemical>(chemical?: T, key?: 'key'): [$$Component<T> | undefined, string | undefined] | ($$Component<T> | undefined) {
    if (!chemical) return key == 'key' ? [undefined, undefined] : undefined;
    if (!chemical.$Component) throw new Error(`Chemical ${chemical.constructor.name} has no $Component`);
    return key == 'key' ? [chemical.$Component, `${chemical[$symbol]}`] : chemical.$Component;
}

export function $await(future: Promise<void>): void
export function $await<T>(future: Promise<T>): T | undefined
export function $await(future: Promise<any>): any {
    return (future as $Promise<any>).result;
}

function $wrap<P>(Component: React.FC<P>): $Function<React.FC<P>> {
    if (!(typeof Component === "function")) 
        throw new Error(`Expected a function component, got ${Component}`);
    const func = new $Function$(Component) as any;
    return func;
}

export function $check<T>(arg: T, ...types: $ParameterType[]): T {
    const paramNumber = $paramValidation.paramIndex++;
    const typeDescription = types.map(type => {
        if (Array.isArray(type))
            return `${$ParamValidation.describeType(type[0])}[]`;
        return $ParamValidation.describeType(type);
    }).join(' | ');
    
    $paramValidation.paramTypes[paramNumber] = typeDescription;
    let valid = false;
    
    for (const type of types) {
        if ($ParamValidation.validateArgument(arg, type)) {
            valid = true;
            break;
        }
    }
    
    if (!valid) {
        $paramValidation.paramErrors.push(
            `Parameter ${paramNumber + 1}: expected ${typeDescription}, received ${$ParamValidation.describeActual(arg)}`
        );
    }
    
    // Auto-evaluate on last parameter
    if ($paramValidation.paramCount !== -1 && 
        $paramValidation.paramIndex === $paramValidation.paramCount)
        $paramValidation.eval();

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

const $paramValidation = new $ParamValidation();

export class $List extends $Chemical {
    view(): ReactNode {
        return this.children;
    }
}

export class $Undefined extends $Chemical {
    view(): ReactNode {
        return undefined;
    }
}

export const List = new $List().Component; 
export const Undefined = new $Undefined().Component;

// function compose(Chemical: typeof $Chemical, name: string, bondConstructor: Function) {
//     const NewChemical = {
//         [name]: class extends Chemical {
//             [name](...args: any[]) {
//                 bondConstructor.call(this, ...args);
//             }
//         }
//     }[name];
    
//     Object.setPrototypeOf(NewChemical, Chemical);
//     NewChemical.prototype.constructor = NewChemical;
//     return NewChemical;
// }