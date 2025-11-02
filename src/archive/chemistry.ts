import React, { ReactNode, useState, useEffect, JSX, useLayoutEffect } from 'react';

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
        (K extends '$parent' ? never :  // Add this check
        First extends Lowercase<First> ?
            (First extends '_' | '$' ? never :
            (K extends keyof $Chemical ? never : 
            (T[K] extends Function ? never : `${First}${Rest}`))) : never) : never]: 
        T[K]
} & {
    [K in keyof T as K extends `$${infer First}${infer Rest}` ? 
        (K extends '$parent' ? never :  // Add this check
        First extends Lowercase<First> ?
            (First extends '_' | '$' ? never :
            (K extends keyof $Chemical ? never : 
            (T[K] extends Function ? `${First}${Rest}` : never))) : never) : never]?: 
        T[K]
} & {
    children?: React.ReactNode;
};

export type $$Properties<T> = {
    [K in keyof T as K extends `$${infer First}${infer Rest}` ? 
        (K extends '$parent' ? never :  // Add this check
        First extends Lowercase<First> ?
            (First extends '_' | '$' ? never :
            (K extends keyof $Chemical ? never : 
            (T[K] extends Function ? never : `${First}${Rest}`))) : never) : never]?: 
        T[K]
} & {
    [K in keyof T as K extends `$${infer First}${infer Rest}` ? 
        (K extends '$parent' ? never :  // Add this check
        First extends Lowercase<First> ?
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
    $bind(parent?: $Chemical): $$Component<T>;
}

export type $Function<T> = T extends React.FC<infer P> 
    ? $Function$<P> & {
        [K in keyof P as K extends 'children' ? never : `$${string & K}`]: P[K];
      }
    : never;

export type $Html<T extends keyof JSX.IntrinsicElements = any> = 
    $Html$<T> & {
        [K in keyof JSX.IntrinsicElements[T] as K extends 'children' ? never : `$${string & K}`]?: JSX.IntrinsicElements[T][K];
    }

export type $ParameterType = 
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

export class $Reflection {
    chemical: $Chemical;
    property: string;

    get reactive(): boolean { 
        if ($Reflection.isSpecial(this.property)) return true;
        const reactiveGenerally = $Reflection.isReactive(this.property);
        return reactiveGenerally ?
            !$Reflection.inertSpecifically(this.chemical, this.property, reactiveGenerally) :
            !!$Reflection.reactiveSpecifically(this.chemical, this.property, reactiveGenerally);
    };

    constructor(chemical: $Chemical, property: string) {
        this.chemical = chemical;
        this.property = property;
    }

    static inertDecorators: Map<$Chemical, Set<string>> = new Map();
    static reactiveDecorators: Map<$Chemical, Set<string>> = new Map();

    static inertSpecifically(chemical: $Chemical, property: string, reactiveGenerally: boolean): boolean | undefined {
        if (!reactiveGenerally) return true;
        if (chemical === $Chemical.prototype) return undefined;
        const map = this.inertDecorators.get(chemical);
        return !map ? 
            this.inertSpecifically(Object.getPrototypeOf(chemical), property, reactiveGenerally) :
            map.has(property);
    }

    static reactiveSpecifically(chemical: $Chemical, property: string, reactiveGenerally: boolean): boolean | undefined {
        if (reactiveGenerally) return true;
        if (chemical === $Chemical.prototype) return undefined;
        const map = this.reactiveDecorators.get(chemical);
        return !map ? 
            this.reactiveSpecifically(Object.getPrototypeOf(chemical), property, reactiveGenerally) :
            map.has(property);
    }

    static isReactive(property: string): boolean {
        if (property === "constructor") return false;
        if (property.startsWith('_')) return false;
        if (!property.startsWith("$")) return true;
        return this.isSpecial(property);
    }

    static isSpecial(property: string): boolean {
        return property.length > 2 && 
            property[0] === '$' && 
            property[1] !== "$" && 
            property[1] !== "_" &&
            property[1] === property[1].toLowerCase();
    }
}

// Decorator to mark a field as inert (non-reactive)
export function inert() {
    return function (prototype: $Chemical, property: string) {
        let properties = $Reflection.inertDecorators.get(prototype)!;
        if (!properties) {
            properties = new Set();
            $Reflection.inertDecorators.set(prototype, properties);
        }
        properties.add(property);
    };
}

// Reactive decorator for methods
export function reactive() {
    return function (prototype: $Chemical, property: string) {
        let properties = $Reflection.reactiveDecorators.get(prototype)!;
        if (!properties) {
            properties = new Set();
            $Reflection.reactiveDecorators.set(prototype, properties);
        }
        properties.add(property);
    };
}

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
const $isTemplate = Symbol("$Chemical.isTemplate");
const $isBound = Symbol("$Chemical.bound");
const $catalyst = Symbol("$Chemical.catalyst");
const $isCatalyst = Symbol("$Chemical.catalyst");
const $parent$ = Symbol("$Chemical.parent");
const $parent = Symbol("$Chemical.$parent");
const $orchestrator = Symbol("$Chemical.orchestrator");
const $component = Symbol("$Chemical.component");
const $children = Symbol("$Chemical.children");
const $props = Symbol("$Chemical.props");
const $lastProps = Symbol("$Chemical.lastProps");
const $render = Symbol("$Chemical.render");
const $createComponent = Symbol("$Chemical.createComponent");
const $destroy = Symbol("$Chemical.destroy");

const $$template = Symbol("$Chemical.static.template");
const $$getNextCid = Symbol("$Chemical.static.template");
const $$createSymbol = Symbol("$Chemical.static.template");
const $$isSymbol = Symbol("$Chemical.static.template");
const $$parseCid = Symbol("$Chemical.static.template");

export class $Chemical {
    [$remove] = false;
    [$destroyed] = false;
    [$decorators]!: $Reflection;
    [$cid]: number;
    [$symbol]: string;
    [$type]: typeof $Chemical;
    [$molecule]: $Molecule;
    [$reaction]: $Reaction;
    [$$reaction]: $Reaction | undefined;
    [$component]?: $Component<this>;
    [$orchestrator]: $BondOrchestrator<this>;
    [$children]: ReactNode;
    [$lastProps]: any;
    [$template]: this;

    static [$$template]: $Chemical;
    get [$isTemplate]() { return this == this[$type][$$template]; }
    get [$isBound]() { return this == this?.[$component]?.$chemical; }

    [$catalyst]: $Chemical;
    get [$isCatalyst]() { return this == this[$catalyst]; }

    [$parent$]: $Chemical;
    get parent(): $Chemical { return this[$parent$]; }
    set parent(parent: $Chemical) {
        parent = parent || this;
        const wasCatalyst = this[$isCatalyst];
        this[$parent$] = parent; 
        if (!wasCatalyst && this[$parent$] == this) {
            this[$catalyst] = this;
            this[$reaction] = new $Reaction(this);
        } else {
            this[$catalyst] = parent[$catalyst];
            this[$catalyst][$reaction].add(this);
        }
    }

    get children() { return this[$children]; }

    get Component(): $Component<this> {
        if (!this[$component]) {
            if (!this[$template][$component])
                this[$template][$component] = this[$template][$createComponent]();
        }
        return this[$component] ?? this[$template][$component] as any;
    }

    get $Component(): $$Component<this> {
        return this.Component as any;
    }

    constructor() {
        this[$cid] = $Chemical[$$getNextCid]();
        this[$type] = this.constructor as any;
        if (!this[$type][$$template]) 
            this[$type][$$template] = this;
        this[$parent$] = this;
        this[$template] = this;
        this[$catalyst] = this;
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
        return $Chemical[$$createSymbol](this);
    }

    async mount() { return this[$reaction].mount(); } 
    async render() { return this[$reaction].render(); } 
    async layout() { return this[$reaction].layout(); } 
    async effect() { return this[$reaction].effect(); } 
    async unmount() { return this[$reaction].unmount(); } 

    [$render](props: any): ReactNode {
        return this[$orchestrator].render(props);
    }

    [$props](): any {
        this[$molecule].reactivate();
        const props: Record<string, any> = this.children ? 
            { key: this[$symbol], children: this.children } : 
            { key: this[$symbol] };
        for (const bond of this[$molecule].bonds.values())
            if (bond.isProp && bond._lastSeenValue) 
                props[bond.property.slice(1)] = bond._lastSeenValue;
        return props;
    }

    [$destroy]() {
        if (this[$isTemplate] || this[$isBound]) return;
        this[$parent$] = undefined as any
        this[$molecule]?.destroy();
        this[$reaction]?.destroy();
        this[$destroyed] = true;
    }

    protected [$createComponent](): $Component<this> {
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

    static [$$getNextCid](): number { return $Chemical.nextCid++; }
    private static nextCid = 1;

    static [$$createSymbol](chemical: $Chemical) {
        return `$Chemistry.${chemical[$type].name}[${chemical[$cid]}]`;
    }

    static [$$isSymbol](symbol: string): boolean {
        return symbol.startsWith('$Chemistry.');
    }

    static [$$parseCid](symbol: string): number | undefined {
        if (!$Chemical[$$isSymbol](symbol)) return undefined;
        const match = symbol.match($Chemical.symbolPattern);
        if (!match) throw new Error(`Invalid chemical symbol: ${symbol}`);
        return Number(match[1]);
    }

    private static symbolPattern = /\[(\d+)\]$/;
}

const $formed = Symbol("$Arom.formed");
const $formation = Symbol("$Arom.formation");
const $remembered = Symbol("$Arom.remembered");

export class $Atom extends $Chemical {
    constructor() {
        super();
        if (this == this[$type][$$template]) {
            this[$molecule].reactivate();
            this[$component] = this[$createComponent]().$bind(this);
        }
        return this[$type][$$template] as this;
    }

    static particle<T extends $Atom = $Atom>(): T {
        try {
            if (!this[$$template]) new this();
        } catch (error) { 
            console.error(error); 
        }
        return this[$$template] as any;
    }
}

export class $Persistent extends $Atom {
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

    constructor() {
        super();
        if (this == this[$type][$$template]) {
            if (!this[$component])
                this[$component] = this[$createComponent]().$bind(this);
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
        return this[$type][$$template] as this;
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

export class $Function$<P = any> extends $Chemical {
    private _component: React.FC<P>;

    /** @internal */
    get __$Function() { return this._component; }

    /** @internal */
    get __name() { return this.__$Function.name; }

    constructor(component: React.FC<P>) {
        super();
        this._component = component;
        this[$component] = new $Component$(this) as any;
    }

    view() { 
        return React.createElement(this._component as any, this[$props]());
    }
}

export class $Html$<T extends keyof JSX.IntrinsicElements = any> extends $Chemical { 
    @inert()
    get type() { return this._type; }
    protected _type: T;
    
    constructor(type: T) {
        super();
        this._type = type;
    }

    view() {
        return React.createElement(this._type, this[$props]());
    }
}

export class $Include extends $Chemical {
    view(): ReactNode {
        return this.children;
    }
}

export class $Exclude extends $Chemical {
    view(): ReactNode {
        return undefined;
    }
}

export class $Component$<T extends $Chemical> {
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

            let newChemical = false;
            let chemical = this._chemical!;
            if (!this.$bound) {
                newChemical = cid === initialCid;
                chemical = newChemical ? this.createChemical(this._chemical || this._template) : $Reaction.find(cid) as T;
                if (!chemical) throw new Error(`$Chemical[${cid}] not found`);
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
                        else if (!chemical[$destroyed]) chemical[$destroy]();
                    }
                };
            }, [chemical]);

            useLayoutEffect(() => {
                reaction.resolve('layout');
            }, [chemical, token]);

            useEffect(() => {
                reaction.resolve('effect');
            }, [chemical, token]);

            return chemical[$render](props);
        }) as any;

        if (this._chemical) 
            this._chemical[$component] = this.Component;
        
        Object.setPrototypeOf(this.Component, this);
        return this.Component as any;
    }

    $?(): $$Component<T> { return this.Component as any; }
    
    $bind(parent?: $Chemical): $$Component<T> {
        let template = this._chemical || this._template;
        let chemical = this.createChemical(template, parent);
        chemical[$component] = new $Component$(chemical[$template], chemical) as any;
        chemical[$molecule].reactivate();
        return chemical.$Component;
    }

    private createChemical(template: T, parent?: $Chemical): T {
        let chemical = Object.create(template) as T;
        return $Component$.configureChemical(chemical, template, parent);
    }

    static configureChemical<T extends $Chemical>(chemical: T, template: T, parent?: $Chemical): T {
        chemical[$template] = template;
        chemical[$type] = template[$type];
        chemical[$cid] = $Chemical[$$getNextCid]();
        chemical[$symbol] = $Chemical[$$createSymbol](chemical);
        chemical[$molecule] = new $Molecule(chemical);
        chemical[$orchestrator] = new $BondOrchestrator(chemical);
        chemical.parent = parent || chemical || chemical[$parent];
        return chemical;
    }
}

export class $Reaction {
    private _reactions = new Map<number, $Reaction>();
    private _update?: React.Dispatch<React.SetStateAction<{}>>;
    private _updateScheduled = false;
    private _mount: (() => void)[] = [];
    private _render: (() => void)[] = [];
    private _layout: (() => void)[] = [];
    private _effect: (() => void)[] = [];
    private _unmount: (() => void)[] = [];
    private _renderCount = 0;

    get chemical() { return this._chemical; }
    private _chemical: $Chemical;

    get system() { return this._system; }
    private _system: $Reaction;

    get isActive() { return this.active == this;  }
    get active(): $Reaction | undefined { 
        return this.system._active.length > 0 ? 
            this.system._active[0] : 
            undefined; 
    }
    private _active: $Reaction[] = [];

    get phase(): $Phase { return this._phase; }
    private _phase: $Phase = 'setup';

    get state() { return this._state; }
    private _state: $State;

    get tracking() { return this._state.tracking; }

    constructor(chemical: $Chemical, system?: $Reaction) {
        this._chemical = chemical;
        this._state = new $State(chemical);
        this._system = system || this;
        this._system._reactions.set(chemical[$cid], this);
        $Reaction._chemicals.set(chemical[$cid], chemical);
    }

    add(chemical: $Chemical) {
        chemical[$reaction] = new $Reaction(chemical, this._system);
        this.system._reactions.set(chemical[$cid], this);
    }

    merge(child: $Reaction) {
        if (this._chemical !== child._chemical)
            throw Error("Can only merge reactions with the same chemical");
        this._system._reactions.set(child._chemical[$cid], child);
        child._reactions.values().forEach(reaction => {
            reaction._system = this._system;
            this._system._reactions.set(reaction._chemical[$cid], reaction);
        });
        child._chemical = undefined!;
        child.destroy();
    }

    bind(update: React.Dispatch<React.SetStateAction<{}>>) {
        this._update = update;
    }

    activate(type?: 'existing') {
        this.system._active.unshift(this);
        this.state.track(type);
    }

    deactivate() {
        if (this.active !== this)
            throw new Error("Deactivation failed because the current reaction is not active in the system");
        this.system._active.shift();
        this.state.clear();
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
        this._reactions?.clear();
        $Reaction._chemicals.delete(this._chemical?.[$cid]);
        this._chemical = undefined as any;
    }

    private static _chemicals = new Map<number, $Chemical>();

    static find(cid: number): $Chemical | undefined {
        return this._chemicals.get(cid);
    }
}

export class $State {
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

export class $Molecule {
    get reactive() { return this._reactive; }
    private _reactive = false;

    get destroyed() { return this._destroyed; }
    private _destroyed = false;

    get chemical() { return this._chemical; }
    private _chemical: $Chemical;

    get bonds() { return this._bonds; }
    private _bonds: Map<string, $Bond> = new Map();
    private _inert = new Set<string>();

    constructor(chemical: $Chemical) {
        this._chemical = chemical;
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
                const newBond = $Bond.create(this._chemical, property, descriptor);
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

    reactivate(): void {
        this._reactivate(true);
    }

    $parent = $is($Atom);

    protected _reactivate(refresh: boolean = false): void {
        if (this._destroyed) return;
        if (this._reactive && !refresh) return;
        
        const chemical = this._chemical;
        const template = chemical[$template];
        const properties = new Map<string, PropertyDescriptor>();
        let bonds: $Bond<$Chemical>[] = [];
        if (template !== chemical) {
            template[$molecule]._reactivate(false);
            bonds = template[$molecule].bonds.values().toArray();
        } else if (!this.reactive) {
            this.collectProperties().forEach((descriptor, property) => properties.set(property, descriptor));
        }
        
        const $parent = "$parent";
        const theseProperties = this.selectProperties(chemical);
        if (theseProperties.has($parent)) {
            const descriptor = theseProperties.get($parent)!;
            theseProperties.delete($parent);
            const bond = new $Parent(chemical, $parent, descriptor);
            this._bonds.set($parent, bond);
            bond.form();
        }

        this.selectProperties(chemical).forEach((descriptor, property) => properties.set(property, descriptor));
        properties.forEach((descriptor, property) => {
            if (this._bonds.has(property)) return;
            if (this._inert.has(property)) return;
            const reflect = new $Reflection(chemical, property);
            if (!reflect.reactive) return this._inert.add(property);
            const bond = $Bond.create(chemical, property, descriptor);
            this._bonds.set(property, bond);
            bond.form();
        });

        for (const bond of bonds) {
            if (this._bonds.has(bond.property)) continue;
            const doubleBond = bond.double(chemical);
            this._bonds.set(bond.property, doubleBond);
        }

        this._reactive = true;
    }

    private collectProperties(): Map<string, PropertyDescriptor> {
        const properties = new Map<string, PropertyDescriptor>();
        const chemical = this._chemical;
        const prototypes: any[] = [];
        let prototype = Object.getPrototypeOf(chemical);
        
        while (prototype && prototype !== $Chemical.prototype) {
            prototypes.unshift(prototype);
            prototype = Object.getPrototypeOf(prototype);
        }
        for (const prototype of prototypes)
            this.selectProperties(prototype).forEach((descriptor, property) => properties.set(property, descriptor));
        return properties;
    }

    private selectProperties(chemical: $Chemical): Map<string, PropertyDescriptor> {
        const properties = new Map<string, PropertyDescriptor>();
        const descriptors = Object.getOwnPropertyDescriptors(chemical)
        for (const property in descriptors)
            properties.set(property, descriptors[property]);
        return properties;
    }
}

export class $Bond<T extends $Chemical = $Chemical, P = any> {
    protected _children = new Set<$Bond>();

    get formed() { return this._formed; }
    protected _formed = false;

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

    get template(): T | undefined { 
        if (this._template)
            return this._template;
        if (this._chemical !== this._chemical[$template])
            this._template = this._chemical[$template];
        return this._template as any; 
    }
    protected _template?: T | undefined;

    get parentBond(): $Bond<T, P> | undefined {
        if (!this._parentBond && this.template)
            this._parentBond = this.template?.[$molecule].bonds.get(this.property) as any;
        return this._parentBond;
    }
    protected _parentBond?: $Bond<T, P>;
    
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
    _lastSeenValueHere: P | undefined;
    get lastSeenValue() { return this._lastSeenArgs; }

    get isParent() { return this._isParent; }
    protected _isParent = false;

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

    get reaction(): $Reaction | undefined { 
        return this._chemical[$reaction].active;
    }

    protected constructor(chemical: T, property: string, descriptor: PropertyDescriptor) {
        this._property = property;
        this._chemical = chemical;
        this._descriptor = descriptor;
        this._isProp = $Reflection.isSpecial(property);
    }

    form() {
        if (this.formed) return;
        this._formed = true;
        
        const chemical = this._chemical;
        const descriptor = this._descriptor;        
        this._getter = descriptor.get;
        this._setter = descriptor.set;
        this._backingField = descriptor.value;
        if (this.isField) {
            const $chemical$ = this.chemical as any;
            this._backingField = $chemical$[this.property];
            this._lastSeenValue = this.backingField;
        } else if (this.isReadable) {
            this._lastSeenValue = this.getter!.apply(chemical);
        }
        if (this._lastSeenValue instanceof $Chemical)
            this._lastSeenValue = this.replaceIf(this._lastSeenValue, true) as any;

        this.describe();
    }

    double(chemical: $Chemical) {
        const bond = Object.create(this) as $Bond;
        bond._chemical = chemical;
        bond._children = new Set();
        bond._bid = undefined;
        bond._backingField = undefined;
        bond._lastSeenValue = undefined;
        bond._lastSeenValueHere = undefined;
        bond._lastSeenArgs = undefined;
        bond.describe();
        this._children.add(bond);
        return bond;
    }

    destroy() {
        this._lastSeenValue = undefined;
        this._lastSeenArgs = undefined;
        this._backingField = undefined as any;
        this.setter?.(undefined);
    }

    protected bondGet() {
        let value: any = undefined;
        if (this.isField) {
            value = this._backingField;
        } else if (this.isProperty && this.isReadable) {
            value = this._getter!.apply(this._chemical);
            this._chemical[$molecule].reactivate();
        }

        const parent = this.parentBond;
        let parentValue: any = parent ? 
            parent!.bondGet() :
            undefined;

        this._lastSeenValue = value === undefined ? parentValue : value;
        this._lastSeenValueHere = value;
        
        // Deal with arrays later
        if (this._lastSeenValue instanceof $Chemical)
            this._lastSeenValue = this.replaceIf(this._lastSeenValue, true) as any;

        this.update();
        return this._lastSeenValue;
    }

    protected bondSet(value: any) {
        const chemical = this._chemical;
        const parent = this.parentBond;

        if (value !== undefined && parent)
            parent!._children.delete(this);
        else if (value === undefined && this.parentBond)
            parent!._children.add(this);
        
        // Handle arrays
        if (value instanceof $Chemical) 
            value = this.replaceIf(value, false);
        if (this.isField) {
            this._backingField = value;
        } else if (this.isWritable) {
            this.setter!.apply(chemical, [value]);
            chemical[$molecule].reactivate();
        } else {
            throw new Error(`${this._property} property on ${this._chemical[$type].name} not settable`);
        }

        if (!this.isMethod)
            this.bondGet();
        
        for (const child of this._children)
            child.bondSet(value);
    }

    protected update() {
        const chemical = this._chemical;
        let reaction = this.reaction!;
        const updateRequired = reaction === undefined; 

        if (updateRequired) {
            reaction = chemical[$reaction];
            reaction.activate('existing');
        }
        if (reaction) {
            reaction.state.add(this, this._lastSeenValue);
        }
        if (updateRequired) {
            reaction.deactivate();
            reaction.updateIf();
        }
    }

    protected replaceIf(dependency: $Chemical, update: boolean) {
        const chemical = this._chemical;
        let $dependency = dependency[$destroyed] ? undefined : 
            dependency[$catalyst] !== chemical[$catalyst] ?
            dependency.Component.$bind(chemical[$parent$] || chemical).$chemical :
            dependency;
        
        if (update && dependency !== $dependency)
            this.bondSet($dependency);

        return $dependency;
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

    static isMethod(descriptor: PropertyDescriptor) {
        return typeof descriptor.value === 'function';
    }

    static create<T extends $Chemical>(chemical: T, property: string, descriptor: PropertyDescriptor): $Bond<T> {
        return $Bond.isMethod(descriptor) ? 
            new $Bonding(chemical, property, descriptor) : 
            new $Bond(chemical, property, descriptor);
    }
}

export class $Bonding<T extends $Chemical = any, P = any> extends $Bond<T, P> {
    get lastSeenActive() { return this._lastSeenActive; }
    protected _lastSeenActive?: $Promise<any>;
    protected _lastSeenRender?: $Promise<any>;

    constructor(chemical: T, method: string, descriptor: PropertyDescriptor) {
        super(chemical, method, descriptor);
        this._isProp = false;
        this._isMethod = true;
        this._isPure = $Reflection.isSpecial(method);
    }

    form() {
        if (this.formed) return;
        this._formed = true;
        this._action = this._descriptor.value;
        this._isAsync = this._action instanceof $Bonding.AsyncFunction;
        this.describe();
    }

    describe() {
        this._bondDescriptor = {
            value: (...args: any[]) => {
                return this.bondCall(...args);
            },
            enumerable: true,
            configurable: true,
        };
        Object.defineProperty(this._chemical, this._property, this._bondDescriptor);
    }

    double(chemical: $Chemical): $Bond<T, P> {
        const bondFormation = super.double(chemical) as this;
        bondFormation._lastSeenRender = undefined;
        bondFormation._lastSeenActive = undefined;
        return bondFormation;
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
            const chemical = this._chemical;
            return this.handleAsync(
                $promise(resolve => { resolve(); })
                .then(async () => {
                    const result = this.action!.apply(chemical, actualArgs);
                    chemical[$molecule].reactivate();
                    return result;
                })
            );
        }
        
        let reaction = this.reaction;
        const updateRequired = reaction === undefined || !reaction.tracking; 

        if (updateRequired) {
            reaction = chemical[$reaction];
            reaction.activate('existing');
        }

        try {
            let result = this.action!.apply(chemical, actualArgs);
            chemical[$molecule].reactivate();
            if (!(result instanceof Promise)) {
                if (result instanceof $Chemical) 
                    result = this.replaceIf(result, false);
                this._lastSeenValue = result;
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
        this._isAsync = true;
        const $action = action.then(async result => {
            if (result instanceof $Chemical) 
                result = this.replaceIf(result, false);
            $action.result = result;
            if (this._lastSeenActive !== $action) 
                return result;

            this._lastSeenRender = this.chemical.render() as any;
            await this._lastSeenRender;

            if (this._lastSeenValue !== result)
                this.update();


            return this.lastSeenValue;
        }) as $Promise<any>;

        const assign = () => $action.then(result => { 
            if (result instanceof $Chemical) 
                result = this.replaceIf(result, false);
            if (this._lastSeenValue !== result)
                this.update();
            this._lastSeenValue = result;
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

    private static AsyncFunction = (async function() {}).constructor;
}

export interface $BondParameter {
    isArray: boolean, 
    isSpread: boolean
}

export class $BondArguments {
    values: any[] = [];
    parameters: $BondParameter[] = [];
    parameterIndex = -1;

    constructor(parameters: $BondParameter[]) {
        this.parameters = parameters;
    }
}

export class $BondOrchestrationContext {
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

export class $BondOrchestrator<T extends $Chemical> {
    private _chemical: T;
    private _bondConstructor?: Function;
    private _parameters: { isArray: boolean, isSpread: boolean }[] = [];
    
    get viewSymbol() { return `$${this._chemical[$symbol]}`; }

    isViewSymbol(symbol: string): boolean { 
        return symbol.startsWith('$$Chemistry.');
    }

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
        let children: ReactNode = props.children;
        const context = new $BondOrchestrationContext(chemical, this._parameters);
        parentContext?.childContexts.push(context);
        
        //this._rendered = new Map();
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
            $paramValidation.count = this._parameters.length;
            this._bondConstructor!.apply(this._chemical, context.arguments.values);
            $paramValidation.evaluate();
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

    private bindProps(chemical: $Chemical, props: any) {
        const $chemical$: any = chemical;
        const lastProps = chemical[$lastProps] || {};
        for (const prop in props) {
            if (typeof prop === 'symbol' || prop === 'children' || prop === 'key' || prop === 'ref') 
                continue;
            const value = props[prop];
            if (prop in lastProps && lastProps[prop] == value) 
                continue; 
            $chemical$['$' + prop] = value;
        }

        chemical[$molecule].reactivate();
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
        if (this.isViewSymbol(key)) {
            const cid = $Chemical[$$parseCid](key.slice(1))!;
            const chemical = $Reaction.find(cid)!;
            context.args.push(chemical);
            context.children.push(element);
            //this._rendered.set(chemical.Component, element);
        } else if (type === Include) {
            context.isModified = true;
            const arrayContext = context.array();
            this.processArray(React.Children.toArray(element.props?.children || []), arrayContext);
        } else if (type == Exclude) {
            context.args.push(undefined);
        } else if (typeof type === 'function') {
            let component: $$Component = type; 
            if (!component.$bind) {
                let func = type as React.FC;
                component = $wrap(func).$Component;
            }
            if (component.$chemical?.[$parent$] !== parent) {
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
            let elementType = type as keyof JSX.IntrinsicElements;
            const $type = $(elementType).$bind(parent);
            const chemical = $type.$chemical;
            const props = context.child(chemical, element.props);
            context.isModified = true;
            context.args.push(chemical);
            context.children.push({ 
                type: $type, 
                props: props, 
                key: chemical[$symbol] 
            });
        } else {
            const isFragment = type === React.Fragment;
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
        return this.augmentNode(view, true);
    }

    private augmentNode(node: ReactNode, first: boolean = false): ReactNode {
        let viewSymbol: string | null = null;
        if (first) viewSymbol = this.viewSymbol;
        if (!node) return first ? React.createElement(React.Fragment, { key: viewSymbol }, node) : node;
        if (Array.isArray(node)) {
            let changed = false;
            const augmented = node.map(child => {
                const node = this.augmentNode(child);
                changed = changed || node !== child;
                return node;
            });
            return (changed || first) ? React.createElement(React.Fragment, { key: first ? viewSymbol : undefined }, augmented) : node;
        }
        if (!React.isValidElement(node))
            return first ? React.createElement(React.Fragment, { key: viewSymbol }, node) : node;

        const element = node as React.ReactElement<any>;
        const props = element.props;
        const type = element.type;

        let $element = element;
        let $props = props;
        let $type = type as $Component;
        let $children: ReactNode[] | undefined;
        let $key = element.key;

        if (typeof $type === 'function' && $type.$chemical) {
            //$props = $type.$chemical.__props
            $props = $type.$chemical[$lastProps] || {};
            $props = { ...$props };
            if (Object.keys(props).length > 0) {
                $type = $type.$bind();
                for (const prop in props)
                    $props[prop] = props[prop];
                if (!first)
                    $props.key = $type.$chemical[$symbol];
            }
            if (first) { 
                $key = viewSymbol;
                $props.key = $key;
            }
        }
        if (props.children)
            $children = React.Children.map(props.children, child => this.augmentNode(child));
        if (type !== $type || props !== $props || $children)
            $element = $children ? 
                React.createElement($type, $props, $children) :
                 React.createElement($type, $props);
        if (first && element.key !== $key) 
            $element = React.cloneElement($element, { ...$element.props, key: viewSymbol });

        return $element;
    }
}

export class $Parent<T extends $Chemical, P extends $Chemical> extends $Bond<T, P> {
    private _type?: $Type;

    constructor(chemical: T, property: string, descriptor: PropertyDescriptor) {
        super(chemical, property, descriptor);
        const type = descriptor.value || descriptor.get?.();
        if (type == typeof "function")
            this._type = type;
    }

    form(): void {
        this._isParent = true;
        this._isProp = false;
        this._backingField = undefined as any;
        this._getter = () => this._chemical.parent;
        this._setter = (parent: any) => { 
            if (parent instanceof $Chemical)
                throw new Error(`Expected a $Chemical but got ${typeof parent}: ${parent}`);
            if (this._type && !(parent instanceof this._type))
                throw new Error(`Expected a ${this._type?.name} but got ${typeof parent}: ${parent}`);
            this._chemical.parent = parent; 
        };
    }

    protected describe(): void {
        this._bondDescriptor = {
            get: this._getter,
            set: this._setter,
            enumerable: true,
            configurable: true,
        };
        Object.defineProperty(this._chemical, this._property, this._bondDescriptor);
    }

    protected override bondGet(): P | undefined {
        return this._getter?.();
    }

    protected override bondSet(value: any): void {
        this._setter?.(value);
    }
}

export class $ParamValidation {
    index = 0;
    count = -1;
    types: string[] = [];
    errors: string[] = [];
    chemical: $Chemical | null = null;
    validated = false;

    check<T>(arg: T, ...types: $ParameterType[]): T {
        const paramNumber = this.index++;
        const typeDescription = types.map(type => {
            if (Array.isArray(type))
                return `${$ParamValidation.describeType(type[0])}[]`;
            return $ParamValidation.describeType(type);
        }).join(' | ');
        
        this.types[paramNumber] = typeDescription;
        let valid = false;
        
        for (const type of types) {
            if ($ParamValidation.validateArgument(arg, type)) {
                valid = true;
                break;
            }
        }
        
        if (!valid) {
            this.errors.push(
                `Parameter ${paramNumber + 1}: expected ${typeDescription}, received ${$ParamValidation.describeActual(arg)}`
            );
        }
        
        if (this.count == this.index + 1)
            this.evaluate();

        return arg;
    }

    evaluate() {
        if (this.validated) return;
        if (this.errors.length === 0) {
            this.validated = true;
            return;
        }
        
        const className = this.chemical ? this.chemical.constructor.name : 'Unknown';
        let message = `\n$Chemistry Constructor Validation Failed: ${className}\n\n`;
        message += `Expected signature:\n`;
        message += `  ${className}(\n`;
        this.types.forEach((type, i) => {
            message += `    ${type}${i < this.types.length - 1 ? ',' : ''}\n`;
        });
        message += `  )\n\n`;
        message += this.errors.join('\n');

        this.validated = true;
        throw new Error(message);
    }

    reset() {
        this.index = 0;
        this.count = -1;
        this.types = [];
        this.errors = [];
        this.chemical = null;
        this.validated = false;
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
                return `$${type}'`;
            }
        }
        
        if (type?.prototype instanceof $Html$) return "$Html";
        if (type?.prototype instanceof $Function$) return "$Function";
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

        if (arg instanceof $Html$) return `$${arg.type}`; 
        if (arg instanceof $Function$) return `${arg.__$Function?.name || '[Function]'}>`;
        if (arg instanceof $Chemical) return arg.constructor.name;
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
        if (arg instanceof $Html$) return true;
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
                return arg.every(element => $ParamValidation.validateArgument(element, elementType));
            }
            
            // Handle single array level
            if (elementType === 'any') {
                return arg.every(ellement => $ParamValidation.isValidReactNode(ellement));
            } else if (elementType === String || elementType === Number || elementType === Boolean || 
                    elementType === Function || elementType === Object) {
                return arg.every(element => $ParamValidation.validatePrimitive(element, elementType));
            } else if (typeof elementType === 'string') {
                // Either primitive type name or HTML element
                if ($ParamValidation.isPrimitiveType(elementType)) {
                    return arg.every(element => typeof element === elementType);
                } else {
                    // HTML element - check props object
                    return arg.every(elelement => elelement instanceof $Html$ && elelement.type === elementType);
                }
            } else if (elementType?.prototype instanceof $Chemical) {
                return arg.every(element => element instanceof elementType);
            } else if (typeof elementType === 'function') {
                // Check if each element is a $Function wrapping the specific function component
                return arg.every(element => element instanceof $Function$ && element.__$Function === elementType);
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
                return arg instanceof $Html$ && arg.type === type;
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

export class $Represent {
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

new $Html$('span').Component;
const $elements = new Map<string, $Html<any>>();
export function $<T extends keyof JSX.IntrinsicElements>(type: T) {
    let $type: string = type as any;
    let element: $Html = $elements.get($type) as any;
    if (!element) {
        element = new $Html$($type as any) as any;
        $elements.set($type, element as any);
    }
    return (element as $Html<T>).$Component;
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

export function $is<T>(ctor: abstract new (...args: any[]) => T): T {
    return ctor as any;
}

export function $wrap<P>(Component: React.FC<P>): $Function<React.FC<P>> {
    if (!(typeof Component === "function")) 
        throw new Error(`Expected a function component, got ${Component}`);
    const func = new $Function$(Component) as any;
    return func;
}

const $paramValidation = new $ParamValidation();
export function $check<T>(arg: T, ...types: $ParameterType[]): T {
    return $paramValidation.check(arg, ...types);
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

export const Chemical = new $Chemical().Component;
$Chemical[$$template][$molecule].reactivate();

export const Atom = new $Atom().Component;
$Atom[$$template][$molecule].reactivate();

export const Include = new $Include().Component;
export const Exclude = new $Exclude().Component;

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