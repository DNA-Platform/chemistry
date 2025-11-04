import { $Rep } from "./types";

export type $Subject = any;
export type $Topc = any;

class $Catalogue {
    #literature = new Map<$Rep, any>();
    #references = new Map<string, $Rep>();
    #subjects = new Set<$Subject>();
    #topics: $Subject[] = [];
    #dereferenced = false;
    #name: string;
    
    readonly $subject: $Subject;
    
    constructor(name: string) {
        // The elegant self-reference - this IS its own subject
        this.#name = name;
        this.$subject = this;
        this.#subjects.add(this);
    }
    
    $empty(): $Catalogue {
        if (this.#dereferenced) return undefined as any;
        const catalogue = new $Catalogue($Catalogue.newName());
        return catalogue;
    }
    
    $new(): $Catalogue {
        if (this.#dereferenced) return undefined as any;
        const catalogue = new $Catalogue(`$${this.#name}`);
        catalogue.#topics.push(this);
        this.#subjects.add(catalogue);
        return catalogue;
    }
    
    $including(...topics: $Subject[]): $Catalogue {
        if (this.#dereferenced) return undefined as any;
        const catalogue = new $Catalogue(`$${this.#name}[${this.#topics.map(topic => topic.toString())},$${this.#name}]`);
        
        // Only add valid catalogues as topics
        for (const topic of topics) {
            if (topic instanceof $Catalogue) {
                catalogue.#topics.push(topic);
            }
        }
        
        catalogue.#topics.push(this);
        this.#subjects.add(catalogue);
        return catalogue;
    }
    
    $find<T = any>(ref: $Rep<T>): T | undefined;
    $find<T = any>(ref: $Rep<T>, subject: $Subject): T | undefined;
    $find<T = any>(ref: $Rep<T>, subject?: $Subject): T | undefined {
        if (this.#dereferenced) return undefined;
        
        // The instanceof check - the internal handshake
        if (subject && subject instanceof $Catalogue && subject !== this) {
            if (this.#subjects.has(subject)) {
                return subject.$find(ref);
            }
            return undefined;
        }
        
        // Check own literature
        const canonical = this.#references.get(ref.ref);
        if (canonical) {
            const value = this.#literature.get(canonical);
            if (value !== undefined) return value;
        }
        
        // Walk the topics chain
        for (const topic of this.#topics) {
            if (topic instanceof $Catalogue) {
                const value = topic.$find(ref);
                if (value !== undefined) return value;
            }
        }
        
        return undefined;
    }
    
    $index<T = any>(ref: $Rep, literal: T): void;
    $index<T = any>(ref: $Rep, literal: T, subject: $Subject): void;
    $index<T = any>(ref: $Rep, literal: T, subject?: $Subject): void {
        if (this.#dereferenced) return;
        
        // The instanceof check - validate the subject
        if (subject && subject instanceof $Catalogue && subject !== this) {
            if (this.#subjects.has(subject)) {
                subject.$index(ref, literal);
                return;
            }
            return;
        }
        
        // Index locally
        let canonical = this.#references.get(ref.ref);
        if (!canonical) {
            canonical = ref;
            this.#references.set(ref.ref, canonical);
        }
        this.#literature.set(canonical, literal);
    }
    
    $deref(): void;
    $deref(subject: $Subject): void;
    $deref(ref: $Rep): void;
    $deref(ref: $Rep, subject: $Subject): void;
    $deref(arg1?: $Rep | $Subject, arg2?: $Subject): void {
        if (this.#dereferenced) return;
        
        if (!arg1 && ! arg2) {
            this.#dereferenced = true;
            this.#references.clear();
            this.#literature.clear();
            this.#subjects.clear();
            this.#topics = [];
            return;
        }
        
        // Check if it's a catalogue to remove from topics
        if (arg1 instanceof $Catalogue) {
            this.#subjects.delete(arg1)
            const index = this.#topics.indexOf(arg1);
            if (index >= 0) {
                this.#topics.splice(index, 1);
            }
            return;
        }
        
        if (arg1?.ref) {
            const ref: $Rep = arg1;
            const subject: $Subject = arg2;
            
            // Delegate to subject if provided and valid
            if (subject && subject instanceof $Catalogue) {
                subject.$deref(ref);
                return;
            }
            
            // Remove from own literature
            const canonical = this.#references.get(ref.ref);
            if (canonical) {
                this.#literature.delete(canonical);
                this.#references.delete(ref.ref);
            }
        }
    }

    $reset() {
        this.$deref();
        this.#references = new Map();
        this.#literature = new Map();
        this.#subjects = new Set();
        this.#topics = [];
        this.#dereferenced = false;
    }

    toString() {
        return this.#name;
    }

    private static lastName = '';
    private static newName() {
        this.lastName = `{${this.lastName}}`;
        return this.lastName;
    }
}

export const $lib = new $Catalogue("$Chemistry");
export function $subject(name: string) { return new $Catalogue(name); }