import { $Library, $subject as $$subject } from '@/catalogue';
import {// $Referent
    $ref$, $roles$, $role$, $of$, $type$$, $prototype$$, $canonical$, $key$, $value$, $name$, $members$, $membersOwn$, $membersMap$, $method$, $getter$, $setter$, $parameters$, $constructor$
} from '../symbols';

const $$role = Symbol('role');
const $$referent = Symbol('referent');
export const $lib = $$subject('$Reference') as $Library;

export class $Referent {
    [$ref$]!: string;
    [$role$]!: $Referent;
    [$roles$]!: Map<$Referent, $Referent>;

    get $ref() { return this[$ref$]; }
    get $canonical(): $Referent { 
        return this !== $referent ? 
            this[$roles$].get($referent)! : 
            this.$as($referent);
    }

    constructor(ref: string) {
        this[$ref$] = ref;
        let $this = $lib.$find<$Referent>(this);
        if ($this) return $this;
        $lib.$index(this);

        this[$roles$] = new Map();
        const $referent = ref === $$referent.description ? 
            new $Referent($$referent.description!) : 
            this;

        $this = this.$as($referent);
        if (ref === $$role.description)
            $this = this.$as(this);

        return $this;
    }

    $as($role: $Referent): $Referent {
        if (this[$roles$].has($role)) 
            return this[$roles$].get($role)!; 
        const $this = Object.create(this) as $Referent;
        $this[$roles$].set($role, $this);
        return $this;
    }

    $of($part: $Referent): $Referent {
        return $part.$as(this);
    }

    $equals($this: $Referent) {
        return this.$canonical === $this.$canonical;
    }
}

export class $Relation {
    protected _x: $Referent;
    protected _y: $Referent;
    protected _t: $Referent;

    constructor(x: $Referent, y: $Referent, t: $Referent) {
        this._x = x;
        this._y = y;
        this._t = t;
    }
}

export class $Relationship extends $Relation {
    get subject() { return this._x; }
    get object() { return this._y; }
    get relationship() { return this._t; }

    constructor(subject: $Referent, object: $Referent, relationship: $Referent) {
        super(subject.$as($subject), object.$as(object), relationship.$as($relationship));
        if (subject == object || subject === relationship || object === relationship)
            throw Error("All three referents must be different in a relationship")
    }
}

export class $Reference extends $Relation {
    get symbol() { return this._x; }
    get referent() { return this._y; }

    constructor(symbol: $Referent, literal: $Referent) {
        super(symbol.$as($subject), literal.$as($object), symbol.$as($relationship));
        if (symbol == literal)
            throw Error("A symbol cannot be the same as its literal");
    }
}

export class $Representative extends $Relation {
    get representative() { return this._x; }
    get representation() { return this._y; }

    constructor(representative: $Referent, representation: $Referent) {
        super(representative.$as($subject), representation.$as($object), representative.$as($relationship));
        if (representative == representation)
            throw Error("A representative must be different from its representation");
    }
}

export class $Property extends $Relation {
    get property() { return this._t; }
    get object() { return this._y; }

    constructor(property: $Referent, object: $Referent) {
        super(object.$as($object), object.$as($object), property.$as($relationship));
        if (property == object)
            throw Error("A property must be different from its object");
    }
}

export class $Identity extends $Relation {
    get referent() { return this._t; }

    constructor(referent: $Referent) {
        super(referent.$as($object), referent.$as($object), referent.$as($relationship));
    }
}

export const $referent = new $Referent($$referent.description!);
export const $role = new $Referent($$role.description!);
export const $subject = new $Referent('subject');
export const $object = new $Referent('object');
export const $relationship = new $Referent('relationship');