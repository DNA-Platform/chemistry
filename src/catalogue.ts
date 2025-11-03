export class $Type<T = any> {
    $ref(): string {
        return '';
    }
}

export class $Catalogue {
    private library = new Map<symbol, Map<string, any>>();
    private catalogues = new Map<symbol, typeof $ref | undefined>();
    private references = new Set<Symbol>();
    ref: symbol;

    constructor($$ref?: any, ref?: symbol) {
        $$ref = $$ref || this.$ref;
        this.ref = Symbol(ref ? `$${ref.description}` : '$ref');
        this.$ref = $$ref.bind(this);
        this.catalogues.set(this.ref, this.$ref);
    }

    $ref(type?: typeof $ref | 'new'): typeof $ref
    $ref<T>(ref: $Type<T>, subject?: symbol): T;
    $ref<T>(ref: $Type<T>, literal: T, subject?: symbol): void;
    $ref(...args: any[]): any {
        const len = args.length;
        let subject1 = args.length >= 1 ? this.$subject(args[1]) : undefined;
        let subject2 = args.length >= 2 ? this.$subject(args[2]) : undefined;
        if (len == 0) {
            return this.$make($ref, this.ref);
        } else if (len == 1 && args[0] == 'new') {
            return this.$make($ref, undefined);
        } else if (len == 1 && this.references.has(args[0])) {
            return this.$make(args[0])
        } else if (len <= 3 && args[0] instanceof $Type) {
            const ref = args[0];
            const type: 'read' | 'write' | undefined = 
                len == 1 || (len == 2 && subject1) ? 'read' :
                len == 2 || (len == 3 && subject2) ? 'write' :
                undefined;
            if (type == 'read') {
                const subject = subject1 || this.ref;
                const literature = this.library.get(subject);
                const literal = literature?.get(ref.$ref());
                if (literal) return literal;
                const $ref = this.catalogues.get(subject);
                return $ref?.(ref);
            } else if (type === 'write') {
                const literal = args[1];
                const subject = subject2 || this.ref;
                const literature = this.library.get(subject);
                literature?.set(ref.$ref(), literal);
            } else {
                throw Error(`$ref(${args.map(arg => arg?.toString())}) ${this.error}`);
            }
        }
    }

    private $make($$ref?: typeof $ref, ref?: symbol): typeof $ref {
        $$ref = $$ref || this.$ref;
        const refref = ref ? 
            Symbol(`$${this.ref.description}`) : 
            Symbol(`${this.ref.description}('new')`);
        this.catalogues.set(refref, $$ref)
        this.references.add(refref);
        const catalogue = new $Catalogue($$ref, refref);
        return catalogue.$ref
    }

    private $subject(ref: any): symbol | undefined {
        if (typeof ref === "undefined") return this.ref;
        if (typeof ref === 'symbol') return ref;
        return undefined;
    }

    private error = 'is not a valid way to create and make use of the $catalogue reference system!';
}

const $catalogue = new $Catalogue();
export const $ref = $catalogue.$ref;