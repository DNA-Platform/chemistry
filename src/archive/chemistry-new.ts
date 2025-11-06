import React, { ReactNode, useState, useEffect, JSX, useLayoutEffect, useRef } from 'react';
import {// $Chemical
    $cid$, $symbol$, $destroyed$, $remove$, $decorators$, $type$, $molecule$, $reaction$, $$reaction$$, $template$, $isTemplate$, $isBound$, $$parent$$, $parent$, $orchestrator$, $component$, $children$, $props$, $lastProps$, $render$, $apply$, $bond$, $createComponent$, $destroy$, $$template$$, $$getNextCid$$, $$createSymbol$$, $$isSymbol$$, $$parseCid$$ 
} from "../symbols";
import {// $Atom
    $formed$, $formation$, $remembered$ 
} from "../symbols";
import {// $Componment$
    $transient$ 
} from "../symbols";
import {// $promise
    $cancelled$ 
} from "../symbols";

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

export type $Props = {
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
    get $bound(): boolean;
    get $chemical(): T;
    $?(): $$Component<T>;
    $new(parent: $Chemical): $$Component<T>;
    $bind(parent: $Chemical): $Component<T>;
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

type $ParameterType = 
    | $Constructor<$Particle>
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

type $Parameter<T = $ParameterType> =
  T extends readonly (infer U)[] ? $Parameter<U>[] :
  T extends $Constructor<infer C> ? (C extends $Chemical ? C : never) :
  T extends React.FC<any> ? $Function<T> :
  T extends StringConstructor ? string :
  T extends NumberConstructor ? number :
  T extends BooleanConstructor ? boolean :
  T extends FunctionConstructor ? Function :
  T extends ObjectConstructor ? object :
  T extends keyof JSX.IntrinsicElements ? $Html<T> :
  T extends 'any' ? any :
  T;

class $Reflection {
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

export class $Particle {
    [$cid$]: number;
    [$symbol$]: string;
    [$type$]: typeof $Particle;
    [$remove$] = false;
    [$destroyed$] = false;
    [$decorators$]!: $Reflection;
    [$children$]: ReactNode;
    [$lastProps$]?: $Props;
    [$component$]?: $Component$<any>;

    [$template$]: this;
    static [$$template$$]: $Particle;
    get [$isTemplate$]() { return this == this[$type$][$$template$$]; }

    constructor() {
        this[$cid$] = $Chemical[$$getNextCid$$]();
        this[$type$] = this.constructor as any;
        if (!this[$type$][$$template$$] || 
           !(this[$type$][$$template$$] instanceof this[$type$]))
            this[$type$][$$template$$] = this;
        this[$template$] = this;
        this[$symbol$] = this.toString();
        const descriptor = Object.getOwnPropertyDescriptor(this[$type$].prototype, 'view');
        const view = descriptor?.value;
        const $view = function(props?: $Props) {
            $view.$this[$apply$](props);
            $view.$this[$bond$]();
            return $view.$view.bind($view.$this)();
        }
        $view.$this = this;
        $view.$view = view;
        this.view = $view;
    }

    view(): ReactNode {
        return undefined;
    }

    toString() {
        if (this[$symbol$]) return this[$symbol$];
        return $Chemical[$$createSymbol$$](this);
    }

    protected [$apply$](props?: $Props) {
        if (!props) return;
        const $this = this as any;
        $this[$children$] = props.children;
        for (const prop in props) {
            if (typeof prop === 'symbol' || prop === 'children' || prop === 'key' || prop === 'ref') 
                continue;
            const value = props[prop];
            $this['$' + prop] = value;
        }
    }

    protected [$bond$]() {}
}

export class $Chemical extends $Particle {
    [$type$]!: typeof $Chemical;
    [$molecule$]: $Molecule;
    [$reaction$]: $Reaction;
    [$orchestrator$]: $BondOrchestrator<this>;
    [$$reaction$$]: $Reaction | undefined;
    static [$$template$$]: $Chemical;

    get [$isBound$]() { return this == this?.[$component$]?.$chemical; }

    [$$parent$$]?: $Chemical;
    get [$parent$](): $Chemical | undefined { return this?.[$$parent$$]; }
    set [$parent$](parent: $Chemical) {
        if (!$parent$)
            throw new Error(`The parent of ${this[$symbol$]} was not specified`);
        if (this[$$parent$$])
            throw new Error(`The parent of ${this[$symbol$]} has already been set`);
        this[$$parent$$] = parent; 
    }

    get children() { return this[$children$]; }

    get Component(): $Component<this> {
        if (!this[$component$]) {
            if (!this[$template$][$component$])
                this[$template$][$component$] = this[$template$][$createComponent$]() as any;
        }
        return this[$component$] ?? this[$template$][$component$] as any;
    }

    get $Component(): $$Component<this> {
        return this.Component as any;
    }

    constructor() {
        super();
        this[$molecule$] = new $Molecule(this);
        this[$reaction$] = new $Reaction(this);
        this[$orchestrator$] = new $BondOrchestrator(this);
        if (this[$isTemplate$]) $set(this[$type$], this);
    }

    view(): ReactNode {
        return this.children;
    }

    async mount() { return this[$reaction$].mount(); } 
    async render() { return this[$reaction$].render(); } 
    async layout() { return this[$reaction$].layout(); } 
    async effect() { return this[$reaction$].effect(); } 
    async unmount() { return this[$reaction$].unmount(); } 

    [$render$](props: $Props): ReactNode {
        return this[$orchestrator$].render(props);
    }

    [$props$](): any {
        this[$molecule$].reactivate();
        const props: Record<string, any> = this.children ? 
            { key: this[$symbol$], children: this.children } : 
            { key: this[$symbol$] };
        for (const bond of this[$molecule$].bonds.values())
            if (bond.isProp && bond.lastValue) 
                props[bond.property.slice(1)] = bond.lastValue;
        return props;
    }

    [$destroy$]() {
        if (this[$isTemplate$] || this[$isBound$]) return;
        this[$$parent$$] = undefined as any
        this[$molecule$]?.destroy();
        this[$reaction$]?.destroy();
        this[$destroyed$] = true;
    }

    protected [$createComponent$](): $Component<this> {
        if (this[$component$]) 
            throw new Error(`The Component for ${this} has already been created`);

        this.assertViewConstructors();
        this[$template$][$molecule$].reactivate();
        return new $Component$(this[$template$]) as any;
    }

    private assertViewConstructors(prototype?: any, childConstructor?: any) {
        if (!prototype) prototype = Object.getPrototypeOf(this[$template$]);
        if (!prototype || prototype === $Chemical.prototype) return;
        
        const className = prototype.constructor.name;
        const thisConstructor = prototype[className];
        if (thisConstructor && typeof thisConstructor !== 'function')
            throw new Error(`The ${className} class has property ${className} but it's not a function`);
        if (childConstructor && !thisConstructor)
            throw new Error(`The ${className} class must have a constructor method named ${className} because child class has one`);

        this.assertViewConstructors(Object.getPrototypeOf(prototype), thisConstructor);
    }

    static [$$getNextCid$$](): number { return $Chemical.nextCid++; }
    private static nextCid = 1;

    static [$$createSymbol$$](chemical: $Particle) {
        return `$Chemistry.${chemical[$type$].name}[${chemical[$cid$]}]`;
    }

    static [$$isSymbol$$](symbol: string): boolean {
        return symbol.startsWith('$Chemistry.');
    }

    static [$$parseCid$$](symbol: string): number | undefined {
        if (!$Chemical[$$isSymbol$$](symbol)) return undefined;
        const match = symbol.match($Chemical.symbolPattern);
        if (!match) throw new Error(`Invalid chemical symbol: ${symbol}`);
        return Number(match[1]);
    }

    private static symbolPattern = /\[(\d+)\]$/;
}

export class $Atom extends $Chemical {
    override set [$parent$](value: $Chemical) {
        this[$$parent$$] = value || this[$$parent$$];
    } 

    constructor() {
        super();
        if (this == this[$type$][$$template$$]) {
            this[$$parent$$] = this;
            this[$component$] = new $Component$(this, this) as any;
            this[$molecule$].reactivate();
        }
        return this[$type$][$$template$$] as this;
    }

    static particle<T extends $Atom = $Atom>(): T {
        try {
            if (!this[$$template$$]) 
                new this();
        } catch (error) { 
            console.error(error); 
        }
        return this[$$template$$] as any;
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
        this[$component$] = new $Component$(this) as any;
    }

    view() { 
        return React.createElement(this._component as any, this[$props$]());
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
        return React.createElement(this._type, this[$props$]());
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

class $Component$<T extends $Chemical> {
    private Component: $Component<T>;
    private _template: T;
    private _chemical?: T;
    private _transient: T;
    get [$transient$]() { return this._transient; }
    
    constructor(template: T, chemical?: T) {
        this._template = template;
        this._chemical = chemical;
        this._transient = this.createChemical(this._template);
        
        this.Component = ((props: any) => {
            const [cid, setChemicalId] = useState(-1);
            const initialCid = -1;

            let newChemical = false;
            let chemical = this._chemical!;
            if (!this.$bound) {
                newChemical = cid === initialCid;
                chemical = newChemical ? this.createChemical(this._template) : $system.find(cid) as T;
                if (!chemical) throw new Error(`$Chemical[${cid}] not found`);
                this._transient = chemical;
            }

            if (newChemical)
                setChemicalId(chemical[$cid$]);

            const reaction = chemical[$reaction$];
            const [token, update] = useState({});
            reaction.bind(update);

            useEffect(() => {
                reaction.resolve('mount');
                return () => {
                    reaction.resolve('unmount');
                    if (!this.$bound) {
                        // Two checks to handle strict mode render after unmount
                        if (!chemical[$remove$]) chemical[$remove$] = true;
                        else if (!chemical[$destroyed$]) chemical[$destroy$]();
                    }
                };
            }, [chemical]);

            useLayoutEffect(() => {
                reaction.resolve('layout');
            }, [chemical, token]);

            useEffect(() => {
                reaction.resolve('effect');
            }, [chemical, token]);

            return chemical[$render$](props);
        }) as any;

        if (this._chemical) 
            this._chemical[$component$] = this.Component as any;
        
        Object.setPrototypeOf(this.Component, this);
        return this.Component as any;
    }

    get $chemical() { return this._chemical; }
    get $bound() { return !!this._chemical; }
    $?(): $$Component<T> { return this.Component as any; }
    
    $bind(parent: $Chemical): $Component<T> {
        if (this.$bound) throw new Error("Only unbound chemicals can be bound.");
        const chemical = this._transient;
        this._transient = this.createChemical(this._template);
        this.assignComponent(chemical, parent);
        return chemical.Component;
    }

    $new(parent: $Chemical): $$Component<T> {
        let template = this._chemical ? this._chemical : this._template;
        const chemical = this.createChemical(template);
        return this.assignComponent(chemical, parent);
    }

    private createChemical(template: T): T {
        let prototype = Object.getPrototypeOf(template[$type$][$$template$$]);
        let chemical = Object.create(prototype) as T;
        chemical[$component$] = this as any;
        chemical[$template$] = template;
        chemical[$type$] = template[$type$];
        chemical[$cid$] = $Chemical[$$getNextCid$$]();
        chemical[$symbol$] = $Chemical[$$createSymbol$$](chemical);
        chemical[$molecule$] = new $Molecule(chemical);
        chemical[$orchestrator$] = new $BondOrchestrator(chemical);
        chemical[$reaction$] = new $Reaction(chemical);
        return chemical;
    }

    private assignComponent(chemical: T, parent: $Chemical) {
        chemical[$parent$] = parent;
        chemical[$component$] = new $Component$(chemical[$template$], chemical) as any;
        chemical[$molecule$].reactivate();
        return chemical.$Component;
    }
}

class $Reaction {
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

    get system() { return $system; }
    get active() { return this.system.active == this;  }

    get phase(): $Phase { return this._phase; }
    private _phase: $Phase = 'setup';

    get state() { return this._state; }
    private _state: $State;

    get tracking() { return this._state.tracking; }

    constructor(chemical: $Chemical, system?: $Reaction) {
        this._chemical = chemical;
        this._state = new $State(chemical);
        this.system.add(this);
    }

    bind(update: React.Dispatch<React.SetStateAction<{}>>) {
        this._update = update;
    }

    activate(type: 'state' | 'change' = 'state') {
        this.system.activate(this);
        this.state.track(type);
    }

    deactivate(): boolean {
        if (this !== this.system.active)
            throw Error("The current reaction is not the reaction being deactivated");
        const changed = this.state.changed();
        //console.log("deactivate", "$Chemical", this.chemical[$symbol], "$State", $system.active?.state.current.toString());
        this.system.deactivate(this);
        const active = this.system.active;
        if (active) {
            const state = this._state;
            const trace = state.type === 'state' ? state.current : state.change;
            const activeTrace = active.state.type === 'state' ? active.state.current : active.state.change;
            for (const [key, value] of trace)
                activeTrace.set(key, value);
        }
        this.state.reset();
        return changed;
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
        this.system.remove(this);
        this._chemical = undefined as any;
    }
}

class $System {
    private _chemicals = new Map<number, $Chemical>();

    get active(): $Reaction | undefined { 
        return this._active.length > 0 ? 
            this._active[0] : 
            undefined; 
    }
    private _active: $Reaction[] = [];

    activate(reaction: $Reaction) {
        this._active.unshift(reaction);
    }

    deactivate(reaction: $Reaction) {
        if (this.active !== reaction)
            throw new Error("Deactivation failed because the current reaction is not active in the system");
        this._active.shift();
    }

    add(reaction: $Reaction) {
        const chemical = reaction.chemical;
        this._chemicals.set(chemical[$cid$], chemical);
    }

    remove(reaction: $Reaction) {
        this._chemicals.delete(reaction.chemical[$cid$]);
    }

    find(cid: number): $Chemical | undefined {
        return this._chemicals.get(cid);
    }
}

class $State {
    private _lastChanged?: boolean;

    get chemical() { return this._chemical; }
    private _chemical: $Chemical;

    get current() { return this._current; }
    private _current = new $Trace();

    get previous() { return this._previous; }
    private _previous = new $Trace();

    get change() { return this._change; }
    private _change = new $Trace();

    get tracking() { return this._tracking; }
    private _tracking = false;

    get type() { return this._type; }
    private _type: 'state' | 'change' = 'state'

    constructor(chemical: $Chemical) {
        this._chemical = chemical;
    }

    track(type: 'state' | 'change' = 'state') {
        if (this.tracking) 
            throw Error("This state is already being tracked")
        this._tracking = true;
        this._type = type;
        this._lastChanged = undefined;
        if (type == 'state') {
            this._previous = this._current;
            this._current = new $Trace();
        } else {
            this._change = new $Trace();
        }
    }

    add(bond: $Bond) {
        this._current.set(bond.chemical[$symbol$], bond);
    }

    reset() {
        this.changed();
        this._tracking = false;
        if (this._type == 'change') {
            for (const [key, value] of this._change)
                this._current.set(key, value);
        }
        this._change = new $Trace();
    }

    changed(): boolean {
        if (this._lastChanged === undefined) {
            this._lastChanged = this._type === 'change' ? 
                this._current.contains(this._change) : 
                this._previous.equals(this._current)
        }
        return this._lastChanged;
    }

    toString() {
        return this._type == 'change' ? this._change?.toString() : this._current?.toString()
    }
}

class $Trace {
    private map = new Map<string, $Bond>();
    private _sorted?: [string, string][];

    get size(): number {
        return this.map.size;
    }

    set(key: string, value: $Bond): void {
        this.map.set(key, value);
        this._sorted = undefined;
    }

    get(key: string): $Bond | string | undefined {
        return this.map.get(key);
    }

    has(key: string): boolean {
        return this.map.has(key);
    }

    delete(key: string): boolean {
        const result = this.map.delete(key);
        if (result) this._sorted = undefined;
        return result;
    }

    clear(): void {
        this.map.clear();
        this._sorted = undefined;
    }

    private getSorted(): [string, string][] {
        if (this._sorted) return this._sorted;
        this._sorted = Array.from(this.map.entries())
            .sort((k, v) => k[0] < v[0] ? -1 : k[0] > v[0] ? 1 : 0)
            .map(([k, v]) => [k, $symbolize(v.value)]);

        return this._sorted;
    }

    equals(other: $Trace): boolean {
        if (this.size !== other.size) return false;
        if (this === other) return true;

        const a = this.getSorted();
        const b = other.getSorted();
        for (let i = 0; i < a.length; i++) {
            if (a[i][0] !== b[i][0]) return false;
            if (a[i][1] !== b[i][1]) return false;
        }
        return true;
    }

    contains(other: $Trace): boolean {
        if (other.size > this.size) return false;
        if (other.size === 0) return true;
        for (const [key, value] of other.map) {
            if (!this.map.has(key)) return false;
            const $value = value instanceof $Bond ? $symbolize(value.lastValue) : value;
            const $otherValue = $symbolize(this.map.get(key)?.lastValue);
            if ($value!== $otherValue) return false;
        }
        return true;
    }

    *[Symbol.iterator](): IterableIterator<[string, $Bond]> {
        yield* this.map.entries();
    }

    *keys(): IterableIterator<string> {
        yield* this.map.keys();
    }

    *values(): IterableIterator<$Bond> {
        yield* this.map.values();
    }

    toString() {
        return $symbolize(this.getSorted(), 'fast');
    }

    static from(entries: [string, $Bond][]): $Trace {
        const store = new $Trace();
        for (const [key, value] of entries) {
            store.map.set(key, value);
        }
        return store;
    }
}

class $Molecule {
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

    $parent = $a($Atom);

    protected _reactivate(refresh: boolean = false): void {
        if (this._destroyed) return;
        if (this._reactive && !refresh) return;
        
        const chemical = this._chemical;
        const template = chemical[$template$];
        const properties = new Map<string, PropertyDescriptor>();
        let bonds: $Bond<$Chemical>[] = [];
        if (template !== chemical) {
            template[$molecule$]._reactivate(false);
            bonds = template[$molecule$].bonds.values().toArray();
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

class $Bond<T extends $Chemical = $Chemical, P = any> {
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
            this._bid = `${this._chemical[$type$].name}[${this.chemical[$cid$]}].${this._property}`; 
        return this._bid 
    }
    
    get chemical() { return this._chemical; }
    protected _chemical: T;

    get template(): T | undefined { 
        if (this._template)
            return this._template;
        if (this._chemical !== this._chemical[$template$])
            this._template = this._chemical[$template$];
        return this._template as any; 
    }
    protected _template?: T | undefined;

    get parentBond(): $Bond<T, P> | undefined {
        if (!this._parentBond && this.template)
            this._parentBond = this.template?.[$molecule$].bonds.get(this.property) as any;
        return this._parentBond;
    }
    protected _parentBond?: $Bond<T, P>;

    get reaction(): $Reaction | undefined { return $system.active; }
    
    get property() { return this._property; }
    protected _property: string;
    
    get descriptor() { return this._descriptor; }
    protected _descriptor: PropertyDescriptor;

    get bondDescriptor() { return this._bondDescriptor; }
    protected _bondDescriptor!: PropertyDescriptor;
    
    get lastArgs() { return this._lastArgs; }
    set lastArgs(value: string | undefined) { this._lastArgs = value; }
    protected _lastArgs?: string = undefined;
    
    get lastValue() { return this._lastValue; }
    protected _lastValueHere: P | undefined;
    protected _lastValue?: P;

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

    get value(): P { return this.replaceIf(this.isField ? this._backingField : this._getter?.()); }

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
            const value = this.bindIf($chemical$[this.property]);
            this._backingField = value;
            this._lastValue = this.backingField;
        } else if (this.isReadable) {
            const value = this.bindIf(this.getter!.apply(chemical));
            this._lastValue = value;
        }

        this.describe();
    }

    double(chemical: $Chemical) {
        const bond = Object.create(this) as $Bond;
        bond._chemical = chemical;
        bond._children = new Set();
        bond._bid = undefined;
        bond._backingField = undefined;
        bond.describe();
        this._children.add(bond);
        return bond;
    }

    destroy() {
        this._lastValue = undefined;
        this._lastArgs = undefined;
        this._backingField = undefined as any;
        this.setter?.(undefined);
    }

    protected bondGet() {
        let value: any = undefined;
        if (this.isField) {
            value = this._backingField;
        } else if (this.isProperty && this.isReadable) {
            value = this._getter!.apply(this._chemical);
            this._chemical[$molecule$].reactivate();
        }

        const parent = this.parentBond;
        let parentValue: any = parent ? 
            parent!.bondGet() :
            undefined;

        this._lastValue = this.bindIf(value === undefined ? parentValue : value);
        this._lastValueHere = this.bindIf(value);

        this.update();
        console.log("$Bond get", this._chemical[$symbol$], this._lastValue)
        return this._lastValue;
    }

    protected bondSet(value: any) {
        const chemical = this._chemical;
        const parent = this.parentBond;
        value = this.replaceIf(value);

        if (value !== undefined && parent)
            parent!._children.delete(this);
        else if (value === undefined && this.parentBond)
            parent!._children.add(this);
        
        if (this.isField) {
            this._backingField = value;
        } else if (this.isWritable) {
            this.setter!.apply(chemical, [value]);
            chemical[$molecule$].reactivate();
        } else {
            throw new Error(`${this._property} property on ${this._chemical[$type$].name} not settable`);
        }

        this._lastValue = value;
        if (!this.isMethod)
            this.bondGet();
        
        console.log("$Bond set", this._chemical[$symbol$], this._lastValue)
        for (const child of this._children)
            child.bondSet(value);
    }

    protected update() {
        const chemical = this._chemical;
        let reaction = this.reaction!;
        const updateRequired = reaction === undefined; 

        if (updateRequired) {
            reaction = chemical[$reaction$];
            reaction.activate('change');
        }
        if (reaction) {
            reaction.state.add(this);
        }
        if (updateRequired) {
            reaction.deactivate();
            reaction.updateIf();
        }
    }

    protected describe() {
        this._bondDescriptor = {
            get: () => this.bondGet(),
            set: (value: any) => this.bondSet(value),
            enumerable: true,
            configurable: false,
        };
        Object.defineProperty(this._chemical, this._property, this._bondDescriptor);
    }

    protected replaceIf(dependency: any) {
        const isChemical = dependency instanceof $Chemical;
        const isArray = Array.isArray(dependency);
        if (!isChemical && !isArray) return dependency;
        if (isChemical) return dependency[$destroyed$] ? undefined : this.bindIf(dependency);
        if (isArray) this.bindIf(dependency);
        return dependency;
    }

    protected bindIf(dependency: any): any {
        if (this.isUnboundChemical(dependency))
            dependency.Component.$bind(this._chemical);
        if (this.hasUnboundChemical(dependency))
            dependency.forEach(item => this.bindIf(item));
        return dependency;
    }

    protected isUnboundChemical(dependency: any): dependency is $Chemical {
        return (dependency instanceof $Chemical) && !dependency[$isBound$];
    }

    protected hasUnboundChemical(dependency: any): dependency is $Chemical[] {
        return Array.isArray(dependency) && dependency.some(item => this.isUnboundChemical(item));
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

class $Bonding<T extends $Chemical = any, P = any> extends $Bond<T, P> {
    get lastSeenActive() { return this._lastSeenActive; }
    protected _lastSeenActive?: $Promise<any>;
    protected _lastSeenRender?: $Promise<any>;

    override get value(): P { return this._lastValue as any; }

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
            configurable: false,
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
            if (this.lastArgs == argSymbol)
                return this._isAsync ? 
                    this._lastSeenActive :
                    this.lastValue;
            this._lastArgs = argSymbol;
        }

        const chemical = this._chemical;
        let actualArgs = args.filter(arg => !$Represent.isEvent(arg));
        
        if (this._isAsync) {
            const chemical = this._chemical;
            return this.handleAsync(
                $promise(resolve => { resolve(); })
                .then(async () => this.action!.apply(chemical, actualArgs))
            );
        }
        
        let reaction = this.reaction;
        const updateRequired = reaction === undefined || !reaction.tracking; 

        if (updateRequired) {
            reaction = chemical[$reaction$];
            reaction.activate('change');
        }

        try {
            let result = this.action!.apply(chemical, actualArgs);
            chemical[$molecule$].reactivate();
            if (!(result instanceof Promise)) {
                result = this.replaceIf(result);
                this._lastValue = result;
                if (result !== undefined)
                    this.update();
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
            result = this.replaceIf(result);
            this._chemical[$molecule$].reactivate();
            $action.result = result;
            if (this._lastSeenActive !== $action) 
                return result;

            this._lastSeenRender = this.chemical.render() as any;
            await this._lastSeenRender;

            if (this._lastValue !== result)
                this.update();

            return this.lastValue;
        }) as $Promise<any>;

        const assign = () => $action.then(result => { 
            if (result !== undefined && 
                this._lastValue !== result) 
                this.update();
            this._lastValue = result;
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

    child(chemical: $Chemical, props: $Props): $Props {
        if (chemical[$lastProps$] === props) return props;
        props = chemical[$orchestrator$].bond(props, this);
        chemical[$lastProps$] = props;
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
    
    get viewSymbol() { return `$${this._chemical[$symbol$]}`; }

    isViewSymbol(symbol: string): boolean { 
        return symbol.startsWith('$$Chemistry.');
    }

    constructor(chemical: T) {
        this._chemical = chemical;
        const name = chemical[$type$].name;
        this._bondConstructor = (chemical as any)[name];
        this.parseBondConstructor();
    }

    render(props: $Props): ReactNode {
        const chemical = this._chemical;
        const molecule = chemical[$molecule$];
        const reaction = chemical[$reaction$];

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

    bond(props: $Props, parentContext?: $BondOrchestrationContext): $Props {
        const chemical = this._chemical;
        let children: ReactNode = props.children;
        const context = new $BondOrchestrationContext(chemical, this._parameters);
        parentContext?.childContexts.push(context);
        
        this.bindProps(chemical, props);
        
        this.process(children, context);
        if (context.isModified) {
            children = context.build();
            props = { ...props, children: children || [] };
        }

        chemical[$children$] = props.children;

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
        if (!match) throw new Error(`Cannot parse constructor for ${this._chemical[$type$].name}`);
        
        const paramString = match[1].trim();
        if (!paramString) return;
        
        this._parameters = paramString.split(',')
            .map(p => p.trim())
            .map(p => ({ 
                isSpread: p.startsWith('...'), 
                isArray: false 
            }));
    }

    private bindProps(chemical: $Chemical, props: $Props) {
        const $chemical$: any = chemical;
        const lastProps = chemical[$lastProps$] || {};
        for (const prop in props) {
            if (typeof prop === 'symbol' || prop === 'children' || prop === 'key' || prop === 'ref') 
                continue;
            const value = props[prop];
            if (prop in lastProps && lastProps[prop] == value) 
                continue; 
            $chemical$['$' + prop] = value;
        }

        chemical[$molecule$].reactivate();
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
            const cid = $Chemical[$$parseCid$$](key.slice(1))!;
            const chemical = $system.find(cid)!;
            context.args.push(chemical);
            context.children.push(element);
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
            if (component.$chemical?.[$$parent$$] !== parent) {
                component = component.$bind(parent);
            }
            const chemical = component.$chemical;
            const props = context.child(chemical, element.props);
            const key = `${chemical[$cid$]}`;
            context.args.push(chemical);
            if (props !== element.props || key !== element.key) {
                context.children.push({ type: component, props: props, key: chemical[$symbol$] });
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
                key: chemical[$symbol$] 
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
                    `Chemistry Error: ${invalidType} cannot be used as child in ${this._chemical[$type$].name}. ` +
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
        const chemical = this._chemical;
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
        const props = element.props as $Props;
        const type = element.type;

        let $element = element;
        let $props = props;
        let $type = type as $Component;
        let $children: ReactNode;
        let $key = element.key;

        if (typeof $type === 'function' && $type.$bound) {
            $props = $type.$chemical[$lastProps$] || {};
            $props = { ...$props };
            if (Object.keys(props).length > 0) {
                if ($type.$chemical !== chemical)
                    $type = $type.$bind(chemical);
                for (const prop in props)
                    $props[prop] = props[prop];
                if (!first)
                    $props.key = $type.$chemical[$symbol$];
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

class $Parent<T extends $Chemical, P extends $Chemical> extends $Bond<T, P> {
    private _type?: $Type;

    constructor(chemical: T, property: string, descriptor: PropertyDescriptor) {
        super(chemical, property, descriptor);
        const type = descriptor.value || descriptor.get?.();
        if (typeof type === "function")
            this._type = type;
    }

    form(): void {
        this._isParent = true;
        this._isProp = false;
        this._backingField = undefined as any;
        this._getter = () => {
            const parent = this._chemical[$parent$]; 
            return this._type && parent instanceof this._type ? parent : undefined;
        }
        this._setter = () => { throw new Error("The parent cannot be set directly"); };
    }

    protected describe(): void {
        this._bondDescriptor = {
            get: this._getter,
            set: this._setter,
            enumerable: true,
            configurable: false,
        };
        Object.defineProperty(this._chemical, this._property, this._bondDescriptor);
    }

    protected override bondGet(): P | undefined {
        return this._getter?.();
    }

    protected override bondSet(value: any): void {
        this._setter?.(value);
    }

    override destroy(): void {
        this._setter = undefined;
        super.destroy();
    }
}

class $ParamValidation {
    index = 0;
    count = -1;
    types: string[] = [];
    errors: string[] = [];
    chemical?: $Chemical;
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
        this.chemical = undefined;
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

class $Represent {
    static symbolize(value: any, ...features: $SymbolFeature[]): string {
        const mode = features.find(f => f === 'fast') ? 'fast' : 'safe';
        const closure = features.find(f => f === 'self-contained') ? 'self-contained' : 'referential'; 
        const replacer = $Represent.replacer(closure === 'referential')
        const symbol = mode === 'fast' ? 
            JSON.stringify(value, replacer) : 
            $Represent.safe(value, replacer);
        return symbol === "null" ? 'undefined' : symbol; 
    }
    
    static literalize<T = any>(symbolization: string): T {
        const parsed = JSON.parse(symbolization);
        
        // Check for ref structure ['$Symbol', constructor, unique, refs]
        if (Array.isArray(parsed) && parsed[0] === '$Symbol') {
            const [, constructorName, unique, refs] = parsed;
            const resolved = new Map<string, any>();
            
            // Create shells (use prototype if constructor provided)
            for (const [key, value] of Object.entries(refs)) {
                if (Array.isArray(value)) {
                    resolved.set(key, []);
                } else if (typeof value === 'object' && (value !== null && value !== undefined)) {
                    // Try to use constructor prototype if available, fallback to plain object
                    let proto = undefined;
                    if (constructorName && constructorName !== 'Object') {
                        proto = (globalThis as any)[constructorName]?.prototype;
                    }
                    resolved.set(key, proto ? Object.create(proto) : {});
                } else {
                    resolved.set(key, value);
                }
            }
            
            // Fill shells
            for (const [key, value] of Object.entries(refs)) {
                const target = resolved.get(key)!;
                if (Array.isArray(value)) {
                    for (let i = 0; i < value.length; i++)
                        target[i] = $Represent.resolve(value[i], unique, resolved);
                } else if (typeof value === 'object' && (value !== null && value !== undefined)) {
                    for (const k in value)
                        target[k] = $Represent.resolve((value as any)[k], unique, resolved);
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
            val = replacer(val);
            if (val === null || val === undefined || typeof val !== 'object') 
                return typeof val === 'function' ? undefined : val;
            
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
                    refs[ref] = undefined; // Will be filled later
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
                    return processed === undefined ? undefined : processed;
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
    
    private static processLiteral(value: any): any {
        if (value === null || value === undefined || typeof value !== 'object') 
            return typeof value === 'string' ? $Represent.getChemical(value) : value;
        
        return $Represent.iterate(value, v => $Represent.processLiteral(v));
    }
    
    private static chemicalPattern = /^$(\w+)\[(\d+)\]$/;
    
    private static getChemical(str: string): any {
        const match = str.match($Represent.chemicalPattern);
        if (!match) return str;
        const cid = parseInt(match[2]);
        return $system.find(cid) || str;
    }
    
    static replacer(referential: boolean): (key: string, value: any) => any {
        return (key: string, value: any) => {
            if (key === '') return value;
            if (value === null) return undefined;
            if (value instanceof $Chemical) return referential ? value[$symbol$] : undefined;
            if (React.isValidElement(value)) return referential ? value.key : undefined;
            if (typeof value === 'function') return value.name;
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

export class $Catalogue {
    private dependencies = new Map<symbol, Map<any, any>>();
    private references = new Set<Symbol>();
    private canonical = Symbol("$Catalogue.canonical");

    $get<T extends $ParameterType>(type: T, reference?: symbol): $Parameter<T> | undefined {
        reference = reference || this.canonical;
        let dependencies = this.dependencies.get(reference)!;
        if (!dependencies) return undefined;
        const $type = $symbolize(type);
        return dependencies.get($type);
    }

    $set<T extends $ParameterType>(type: T, dependency: $Parameter<T>, reference?: symbol) {
        reference = reference || this.canonical;
        const $type = this.symbolize(type);
        if (!this.check(type, dependency))
            throw new Error(`${$type} is not a valid type reference for ${dependency}`);

        let dependencies = this.dependencies.get(reference)!;
        if (!dependencies) {
            dependencies = new Map();
            this.references.add(reference);
            this.dependencies.set(reference, dependencies);
        }

        dependencies.set($type, dependency);
    }

    protected symbolize(type: $ParameterType): any {
        if (typeof type === 'string') return type;
        if (typeof type === 'function')
            return type.name ? type.name : type.toString();
        return $symbolize(type);
    }

    protected check(type: $ParameterType, dependency: any): boolean {
        if (typeof type === 'string') return true;
        if (typeof type === 'function') return true;
        return $ParamValidation.validateArgument(dependency, type);
    }
}

const $catalogue = new $Catalogue();
export const $get = $catalogue.$get.bind($catalogue);
export const $set = $catalogue.$set.bind($catalogue);
export function $<T extends keyof JSX.IntrinsicElements>(type: T) {
    let $type: string = type as any;
    let element: $Html<T> = $get(type) as any;
    if (!element) {
        element = new $Html$($type as any) as $Html<T>;
        $set(type, element as any);
    }
    return (element as $Html<T>).$Component;
}

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
            if (err === $cancelled$) return undefined as T;
            throw err;
        }) as $Promise<T>;
    
    const then = promise.then.bind(promise);
    promise.complete = false;
    promise.cancel = (action?: () => any) => { reject?.($cancelled$); action?.(); }
    promise.then = (<U>(fulfilled?: (value: T) => U, rejected?: any) => {
        const next = $promise<U>(resolve => {
            then(
                value => {
                    if (!fulfilled) return resolve(value as any);
                    const result = fulfilled(value);
                    Promise.resolve(result).then(resolve);
                },
                err => {
                    if (err === $cancelled$) return reject?.(err);
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
    return key == 'key' ? [chemical.$Component, `${chemical[$symbol$]}`] : chemical.$Component;
}

export function $await(future: Promise<void>): void
export function $await<T>(future: Promise<T>): T | undefined
export function $await(future: Promise<any>): any {
    return (future as $Promise<any>).result;
}

export function $a<T>(ctor: abstract new (...args: any[]) => T): T | undefined {
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

function extract(module: any, parent?: $Chemical): $Chemical | undefined {
    let Component: Component<any> | undefined = undefined;
    
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
        const $Component = Component as $Component$<$Chemical>;
        return parent ? Component.$bind(parent).$chemical : $Component[$transient$];
    }
    
    return undefined;
}

const $system = new $System();
const $particle = new $Particle();
export const Chemical = new $Chemical().Component;
$Chemical[$$template$$][$molecule$].reactivate();

export const Atom = new $Atom().Component;
$Atom[$$template$$][$molecule$].reactivate();

new $Html$('span').Component;
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