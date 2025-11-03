import React, { Fragment, ReactNode } from 'react';
import {//Particle 
    $cid, $symbol, $type, $prototype, $template, $isTemplate, $derived, $children, $apply, $bond, $$template, $$getNextCid, $$createSymbol, $$isSymbol, $$parseCid
} from "../symbols";
import { $Props } from "../types";

export class $Particle {
    [$cid]: number;
    [$type]: typeof this;
    [$symbol]: string;
    [$children]: ReactNode;
    [$template]: this;
    static [$$template]: $Particle;
    get [$isTemplate]() { return this == (this as any)[$type][$$template]; }
    get [$prototype]() { return Object.getPrototypeOf(this); }
    get [$derived]() { return this == this[$template]; }

    constructor() {
        const $this: any = this;
        this[$cid] = $Particle[$$getNextCid]();
        this[$type] = this.constructor as any;
        if (!$this[$type][$$template] || 
           !($this[$type][$$template] instanceof $this[$type]))
            $this[$type][$$template] = $this;
        this[$template] = this;
        this[$symbol] = $Particle[$$createSymbol](this);
        let prototype = Object.getPrototypeOf(this);
        let descriptor = Object.getOwnPropertyDescriptor(prototype, 'view');
        while (!descriptor?.value) {
            prototype = Object.getPrototypeOf(prototype);
            descriptor = Object.getOwnPropertyDescriptor(prototype, 'view');
        }
        const view = descriptor?.value;
        const $view = (props?: $Props): ReactNode => {
            const $this = $view.$this as $Particle;
            const view = $view.$view;
            const $$cid = $this[$cid];
            const $$symbol = $this[$symbol];
            $this[$symbol] = this[$symbol];
            $this[$apply](props);
            $this[$bond]();
            const $result = view.bind($this)();
            $this[$cid] = $$cid;
            $this[$symbol] = $$symbol;
            return $result;
        };
        $view.$this = this;
        $view.$view = view;
        $this.$view = $view;
        this.view = $view;
    }

    view(): ReactNode {
        return this.toString();
    }

    frame($this: this = this): ReactNode {
        return (
            <Fragment key={this[$symbol]}>
                { $this.view() }
            </Fragment>
        );
    }

    toString() {
        if (this[$symbol]) return this[$symbol];
        return $Particle[$$createSymbol](this);
    }

    protected [$apply](props?: $Props) {
        if (!props) return;
        const $this = this as any;
        $this[$children] = props.children;
        for (const prop in props) {
            if (typeof prop === 'symbol' || prop === 'children' || prop === 'key' || prop === 'ref') 
                continue;
            const value = props[prop];
            $this['$' + prop] = value;
        }
    }

    protected [$bond]() {}

    static [$$getNextCid](): number { return $Particle.nextCid++; }
    private static nextCid = 1;

    static [$$createSymbol](particle: $Particle) {
        const type = particle[$type] as any
        return `$Chemistry.${type.name}[${particle[$cid]}]`;
    }

    static [$$isSymbol](symbol: string): boolean {
        return symbol.startsWith('$Chemistry.');
    }

    static [$$parseCid](symbol: string): number | undefined {
        if (!$Particle[$$isSymbol](symbol)) return undefined;
        const match = symbol.match($Particle.symbolPattern);
        if (!match) throw new Error(`Invalid chemical symbol: ${symbol}`);
        return Number(match[1]);
    }

    private static symbolPattern = /\[(\d+)\]$/;
}

export const Particle = new $Particle().view!
export default Particle;
