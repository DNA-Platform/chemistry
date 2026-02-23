import React, { Fragment, ReactNode } from 'react';
import {//Particle 
    $cid$, $symbol$, $type$, $prototype$, $template$, $isTemplate$, $derived$, $particlar$, $children$, $apply$, $bond$, $$template$$, $$getNextCid$$, $$createSymbol$$, $$isSymbol$$, $$parseCid$$
} from "../symbols";
import { $$Component, $Props } from "../types";

export class $Particle {
    [$cid$]: number;
    [$type$]: typeof this;
    [$symbol$]: string;
    [$children$]: ReactNode;
    [$template$]: this;
    [$particlar$] = false;
    static [$$template$$]: $Particle;
    get [$isTemplate$]() { return this == (this as any)[$type$][$$template$$]; }
    get [$prototype$]() { return Object.getPrototypeOf(this); }
    get [$derived$]() { return this == this[$template$]; }

    constructor(particular?: object) {
        let $this: any = this;
        this[$cid$] = $Particle[$$getNextCid$$]();
        this[$type$] = this.constructor as any;
        if (!$this[$type$][$$template$$] || 
        !($this[$type$][$$template$$] instanceof $this[$type$]))
            $this[$type$][$$template$$] = $this;
        this[$template$] = this;
        this[$symbol$] = $Particle[$$createSymbol$$](this);
        const isParticle = particular instanceof $Particle;
        if (particular && !isParticle) {
            Object.setPrototypeOf(particular, this);
            this[$particlar$] = true;
            $this = particular;
        }
        $this.use($this.view);
        return $this;
    }

    view(): ReactNode {
        return this.toString();
    }

    use<A extends [] = []>(view: () => ReactNode): $$Component<this>;
    use<A extends any[]>(view: (...args: A) => ReactNode, args: A): $$Component<this>;
    use<A extends any[]>(view: (...args: A) => ReactNode, args?: A): $$Component<this> {
        const $view$ = view as any;
        let $this = this;
        if ($view$.$view || !Object.hasOwn(this as any, 'view')) {
            $this = Object.create(this) as this;
            $this[$cid$] = $Particle[$$getNextCid$$]();
            $this[$symbol$] = $Particle[$$createSymbol$$]($this);
        }
        const $view = (props?: $Props): ReactNode => {
            let $$view = $view;
            if ($$view.$this[$isTemplate$])
                $$view = $$view.$this.use($$view.$this.view) as any;
            const $$this = $$view.$this as $Particle;
            const view = $$view.$view;
            $$this[$apply$](props);
            $$this[$bond$]();
            return view.apply($$this, args || []);
        };
        $view.$view = $view$.$view ?? $view$;
        $view.$this = $this;
        $this.view = $view;
        return $this.view as any;
    }

    toString() {
        if (this[$symbol$]) return this[$symbol$];
        return $Particle[$$createSymbol$$](this);
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

    static [$$getNextCid$$](): number { return $Particle.#nextCid++; }
    static #nextCid = 1;

    static [$$createSymbol$$](particle: $Particle) {
        const type = particle[$type$] as any
        return `$Chemistry.${type.name}[${particle[$cid$]}]`;
    }

    static [$$isSymbol$$](symbol: string): boolean {
        return symbol.startsWith('$Chemistry.');
    }

    static [$$parseCid$$](symbol: string): number | undefined {
        if (!$Particle[$$isSymbol$$](symbol)) return undefined;
        const match = symbol.match($Particle.#symbolPattern);
        if (!match) throw new Error(`Invalid chemical symbol: ${symbol}`);
        return Number(match[1]);
    }

    static #symbolPattern = /\[(\d+)\]$/;
}

export const Particle = new $Particle();
export default Particle;
