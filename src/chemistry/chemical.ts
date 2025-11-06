import { ReactNode } from "react";
import { $BondOrchestrator, $Component$, $Molecule, $Reaction, $Reflection } from "@/archive/chemistry";
import {// $Chemical
    $cid$, $symbol$, $destroyed$, $remove$, $decorators$, $type$, $molecule$, $reaction$, $$reaction$$, $template$, $isTemplate$, $isBound$, $$parent$$, $parent$, $orchestrator$, $component$, $children$, $props$, $lastProps$, $render$, $apply$, $bond$, $createComponent$, $destroy$, $$template$$, $$getNextCid$$, $$createSymbol$$, $$isSymbol$$, $$parseCid$$ 
} from "../symbols";
import { $$Component, $Component, $Props } from "../types";
import { $Particle } from "./particle";

export class $Chemical extends $Particle {
    // [$molecule]: $Molecule;
    // [$reaction]: $Reaction;
    // [$orchestrator]: $BondOrchestrator<any>;
    // [$$reaction]: $Reaction | undefined;
    [$component$]?: $Component<this>;
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

    // get Component(): $Component<any> {
    //     if (!this[$component]) {
    //         if (!this[$template][$component])
    //             this[$template][$component] = this[$template][$createComponent]() as any;
    //     }
    //     return this[$component] ?? this[$template][$component] as any;
    // }

    // get $Component(): $$Component<this> {
    //     return this.Component as any;
    // }

    constructor() {
        super();
        // this[$molecule] = new $Molecule(this);
        // this[$reaction] = new $Reaction(this);
        // this[$orchestrator] = new $BondOrchestrator(this);
        // if (this[$isTemplate]) $set(this[$type], this);
    }

    view(): ReactNode {
        return this.children;
    }

    // async mount() { return this[$reaction].mount(); } 
    // async render() { return this[$reaction].render(); } 
    // async layout() { return this[$reaction].layout(); } 
    // async effect() { return this[$reaction].effect(); } 
    // async unmount() { return this[$reaction].unmount(); } 

    // [$render](props: $Props): ReactNode {
    //     return this[$orchestrator].render(props);
    // }

    // [$props](): any {
    //     this[$molecule].reactivate();
    //     const props: Record<string, any> = this.children ? 
    //         { key: this[$symbol], children: this.children } : 
    //         { key: this[$symbol] };
    //     for (const bond of this[$molecule].bonds.values())
    //         if (bond.isProp && bond.lastValue) 
    //             props[bond.property.slice(1)] = bond.lastValue;
    //     return props;
    // }

    // [$destroy]() {
    //     if (this[$isTemplate] || this[$isBound]) return;
    //     this[$parent$] = undefined as any
    //     this[$molecule]?.destroy();
    //     this[$reaction]?.destroy();
    //     this[$destroyed] = true;
    // }

    // protected [$createComponent](): $Component<this> {
    //     if (this[$component]) 
    //         throw new Error(`The Component for ${this} has already been created`);

    //     this.assertViewConstructors();
    //     this[$template][$molecule].reactivate();
    //     return new $Component$(this[$template]) as any;
    // }

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
}
