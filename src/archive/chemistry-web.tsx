import { $Atom } from "./chemistry-new";
import {// $Chemical
    $cid$, $symbol$, $destroyed$, $remove$, $decorators$, $type$, $molecule$, $reaction$, $$reaction$$, $template$, $isTemplate$, $isBound$, $$parent$$, $parent$, $orchestrator$, $component$, $children$, $props$, $lastProps$, $render$, $createComponent$, $destroy$, $$template$$, $$getNextCid$$, $$createSymbol$$, $$isSymbol$$, $$parseCid$$ 
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

export class $Persistent extends $Atom {
    /** @internal */
    [$formed$] = false;

    /** @internal */
    [$formation$]!: Promise<void>;
    get formed() { return this[$formed$]; }

    async formation() {
        if (!this[$formed$])
            await this[$formation$];
    }

    /** @internal */
    [$remembered$] = false;
    get remembered() { return this[$remembered$]; }

    constructor() {
        super();
        if (this == this[$type$][$$template$$]) {
            if (!this[$component$])
                this[$component$] = this[$createComponent$]().$new(this) as any;
            this[$formation$] = this.reform().then(async (remembered) => {
                this[$formed$] = remembered;
                this[$remembered$] = remembered;
                if (!this[$formed$])
                    await this.form();
                    await this.reflect();
                    this[$molecule$].reactivate();
                    this[$formed$] = true;
            })
        }
        return this[$type$][$$template$$] as this;
    }

    protected async form() { }

    protected async reform(): Promise<boolean> {
        try {
            const key = `$Chemistry<${this[$type$].name}>`;
            const stored = localStorage.getItem(key);
            if (stored) {
                const diagram = JSON.parse(stored);
                this[$molecule$].read(diagram);
                return true;
            }
        } catch (e) {
            console.error(`Failed to reform ${this[$type$].name}:`, e);
        }
        return false;
    }

    protected async reflect(): Promise<void> {
        try {
            const key = `$Chemistry<${this[$type$].name}>`;
            const diagram = this[$molecule$].formula('self-contained');
            localStorage.setItem(key, diagram);
        } catch (e) {
            console.error(`Failed to remember ${this[$type$].name}:`, e);
        }
    }

    static particle<T extends $Atom = $Atom>(): T {
        if (!this[$$template$$]) new this();
        return this[$$template$$] as any;
    }
}
