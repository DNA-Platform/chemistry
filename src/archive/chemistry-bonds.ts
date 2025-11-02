import { $Chemical, $Particle } from "./chemistry-new";

export type $Molecule<T extends $Particle> = {
    [K in keyof T as 
        K extends keyof $Chemical ? never :
        K extends symbol ? never :
        K extends '$Component' | 'Component' ? never :
        K]: 
        T[K] extends (...args: any[]) => infer R
            ? $Bond<T, R> 
            : $Bond<T, T[K]>
};

export class $Bond<T extends $Particle, P> {
    get value(): P { return undefined as any; }
}

class $Test extends $Chemical {
    $field = 5;
    field?: number;
    get $property() { return true; }
    get settableProperty() { return $Chemical; }
    set settableProperty(value: typeof $Chemical) { }
    $method(x: number, y: string) {}
    method(x: 'number', y: [string]): $Test { return undefined as any;}
}

class $Test2 extends $Test {
    $newField = Symbol('10');
    protected protectedField = 10;
}

const x: $Molecule<$Test> = undefined as any;
const y: $Molecule<$Test2> = undefined as any;
y.$field.value