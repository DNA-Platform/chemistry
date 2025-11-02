import { ReactNode } from "react";
import { $Component$, $Reflection } from "@/archive/chemistry";
import {// $Chemical
    $cid, $symbol, $destroyed, $remove, $decorators, $type, $molecule, $reaction, $$reaction, $template, $isTemplate, $isBound, $parent$, $parent, $orchestrator, $component, $children, $props, $lastProps, $render, $apply, $bond, $createComponent, $destroy, $$template, $$getNextCid, $$createSymbol, $$isSymbol, $$parseCid 
} from "../symbols";
import { $Props } from "@/types";
import { $Chemical } from "./chemical";

export class $Particle {
    [$cid]: number;
    [$symbol]: string;
    [$type]: typeof $Particle;
    [$remove] = false;
    [$destroyed] = false;
    [$decorators]!: $Reflection;
    [$children]: ReactNode;
    [$lastProps]?: $Props;
    [$component]?: $Component$<any>;

    [$template]: this;
    static [$$template]: $Particle;
    get [$isTemplate]() { return this == this[$type][$$template]; }

    constructor() {
        this[$cid] = $Chemical[$$getNextCid]();
        this[$type] = this.constructor as any;
        if (!this[$type][$$template] || 
           !(this[$type][$$template] instanceof this[$type]))
            this[$type][$$template] = this;
        this[$template] = this;
        this[$symbol] = this.toString();
        const descriptor = Object.getOwnPropertyDescriptor(this[$type].prototype, 'view');
        const view = descriptor?.value;
        const $view = function(props?: $Props) {
            $view.$this[$apply](props);
            $view.$this[$bond]();
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
        if (this[$symbol]) return this[$symbol];
        return $Chemical[$$createSymbol](this);
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
}
