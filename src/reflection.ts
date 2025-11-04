import { $Type, $Constructor, $Rep } from "./types";
import { $lib, $Subject } from './catalogue';

export interface $FunctionInfo {
    form: 'lambda' | 'function' | 'method' | 'getter' | 'setter' | 'class' | 'unknown';
    name?: string;
    async?: boolean;
    generator?: boolean;
    native?: boolean;
    params?: {
        count: number | undefined;
        rest: boolean | undefined;
    };
}

class $ObjectRep implements $Rep {
    get ref(): string { throw ''; }
    get $literal(): object { throw ''; }
    get $prototype(): $PrototypeRep { throw ''; }
    get asPrototype(): $PrototypeRep { throw ''; }
    get $type(): $TypeRep { throw ''; }
    $members(own: boolean = true): $MemberRep[] { throw ''; }
    $fields(own: boolean = true): $FieldRep[] { throw ''; }
    $properties(own: boolean = true): $PropertyRep[] { throw ''; }
    $methods(own: boolean = true): $MethodRep[] { throw ''; }
    $getField(name: string, own: boolean = true): $FieldRep | undefined { throw ''; }
    $getProperty(name: string, own: boolean = true): $PropertyRep | undefined { throw ''; }
    $getMethod(name: string, own: boolean = true): $MethodRep | undefined { throw ''; }
    
}
class $PrototypeRep implements $Rep {
    get ref(): string { throw ''; }
    get $literal(): object { throw ''; }
    get asObject(): $ObjectRep { throw ''; }
    $members(own: boolean = true): $MemberRep[] { throw ''; }
    $fields(own: boolean = true): $FieldRep[] { throw ''; }
    $properties(own: boolean = true): $PropertyRep[] { throw ''; }
    $methods(own: boolean = true): $MethodRep[] { throw ''; }
    $getField(name: string, own: boolean = true): $FieldRep | undefined { throw ''; }
    $getProperty(name: string, own: boolean = true): $PropertyRep | undefined { throw ''; }
    $getMethod(name: string, own: boolean = true): $MethodRep | undefined { throw ''; }
}
class $PrimitiveRep implements $Rep {
    get ref(): string { throw ''; }
    get $literal(): any { throw ''; }
    get asObject(): $ObjectRep { throw ''; }
}
class $FunctionRep implements $Rep {
    get ref(): string { throw ''; }
    get $literal(): (...args: any[]) => any { throw ''; }
    get $asConstructor(): $ConstructorRep { throw ''; }
    get $asObject(): $ObjectRep { throw ''; }
    get $isGeneric(): boolean { return this.$typeParameters.length == 0; }
    get $asGeneric(): $GenericFunctionRep { throw ''; }
    get $typeParameters(): $TypeParameterRep[] { throw ''; }
    get form(): 'lambda' | 'function' | 'method' | 'getter' | 'setter' | 'class' | 'unknown' { throw ''; }
    get name(): string { throw ''; }
    get async(): boolean { throw ''; }
    get generator(): boolean { throw ''; }
    get native(): boolean { throw ''; }
    get parameters(): $FunctionParameterRep[] { throw ''; }
}
class $GenericFunctionRep implements $Rep {
    get ref(): string { throw ''; }
    get asFunction(): $FunctionRep { throw ''; }
    get arguments(): $TypeRep { throw ''; }
    get $asConstructor(): $ConstructorRep { throw ''; }
}
class $FunctionParameterRep implements $Rep {
    get ref(): string { throw ''; }
    get name(): string { throw ''; }
    get type(): $TypeParameterRep { throw ''; }
    get isRest(): boolean { throw ''; }
}
class $ConstructorRep implements $Rep {
    get ref(): string { throw ''; }
    get $asFunction(): $FunctionRep { throw ''; }
}
class $TypeRep implements $Rep {
    get ref(): string { throw ''; }
    get $literal(): $Type { throw ''; }
    get $baseType(): $TypeRep { throw ''; }
    get $prototype(): $PrototypeRep { throw ''; }
    get $asConstructor(): $ConstructorRep { throw ''; }
    get $isGeneric(): boolean { return this.$parameters.length == 0; }
    get $asGeneric(): $GenericTypeRep { throw ''; }
    get $parameters(): $TypeParameterRep[] { throw ''; }
    asGenericType(...types: $GenericTypeRep[]) { throw ''; }
    $members(own: boolean = false): $MemberRep[] { throw ''; }
    $fields(own: boolean = false): $FieldRep[] { throw ''; }
    $properties(own: boolean = false): $PropertyRep[] { throw ''; }
    $methods(own: boolean = false): $MethodRep[] { throw ''; }
    $getMember(name: string, own: boolean = false): $MemberRep | undefined { throw ''; }
    $getField(name: string, own: boolean = false): $FieldRep | undefined { throw ''; }
    $getProperty(name: string, own: boolean = false): $PropertyRep | undefined { throw ''; }
    $getMethod(name: string, own: boolean = false): $MethodRep | undefined { throw ''; }
}
class $GenericTypeRep implements $Rep {
    get ref(): string { throw ''; }
    get asType(): $TypeRep { throw ''; }
    get arguments(): $TypeRep { throw ''; }
    get $asConstructor(): $ConstructorRep { throw ''; }
}
class $MemberRep implements $Rep {
    get ref(): string { throw ''; }
    get $literal(): PropertyDescriptor { throw ''; }
    get $isField(): boolean { return false; } // Add asserts if possible
    get $asField(): $FieldRep | undefined { return undefined; }
    get $isProperty(): boolean { return false; }
    get $asProperty(): $PropertyRep | undefined { return undefined; }
    get $isMethod(): boolean { return false; }
    get $asMethod(): $MethodRep | undefined { return undefined; }
    get isReadable(): boolean { throw ''; }
    get isWritable(): boolean { throw ''; }
    get isConfigurable(): boolean { throw ''; }
    get isEnumerable(): boolean { throw ''; }
}
class $FieldRep extends $MemberRep { 
    get ref(): string { throw ''; }
    get $isField() { return true; }
    get $asField() { return this; }
}
class $PropertyRep extends $MemberRep { 
    get ref(): string { throw ''; }
    get $isProperty() { return true; }
    get $asProperty() { return this; }
}
class $MethodRep extends $MemberRep { 
    get ref(): string { throw ''; }
    get $isMethod() { return true; }
    get $asMethod() { return this; }
    get $asFunction(): $FunctionRep { throw ''; }
}
class $TypeParameterRep implements $Rep {
    get ref(): string { throw ''; }
    get constraint(): $TypeRep { throw ''; }
    get default(): $TypeRep { throw ''; }
}

export function createPrototypeChain<T>(object: object, constructor?: $Constructor<T>): object[] {
    if (constructor && !(object instanceof constructor))
        throw new Error(`[${object}] is not instanceof [${constructor?.name}]`);
    
    let prototype = object;
    const prototypes: object[] = [];
    while (prototype && prototype !== constructor?.prototype) {
        prototypes.unshift(prototype);
        prototype = Object.getPrototypeOf(prototype);
    }

    return prototypes
}

export function parseFunctionInfo(func: Function): $FunctionInfo {
    const str = func.toString();
    let name = func.name || '';
    
    // Check for native code (but don't early return!)
    const hasNativeCode = str.includes('[native code]');
    
    // Single main pattern match
    const pattern = getFunctionPattern();
    const match = pattern.exec(str);
    
    if (!match?.groups) {
        // Can't parse - return unknown with undefined properties
        return { 
            form: 'unknown',
            name,
            async: undefined,
            generator: undefined,
            native: hasNativeCode ? true : undefined,  // Only set true if we found [native code], otherwise undefined
            params: { count: undefined, rest: undefined }
        };
    }
    
    const g = match.groups;
    
    // Check ALL async groups
    const async = !!g.async || !!g.asyncArrow || !!g.async2;
    const generator = !!g.funcStar || !!g.methodStar;
    
    let form: $FunctionInfo['form'];
    if (g.arrow) {
        form = 'lambda';
        // Clear computed names for anonymous arrows (like '0' from array wrapping)
        if (name && /^\d+$/.test(name)) name = '';
    }
    else if (g.class) form = 'class';
    else if (g.get) {
        form = 'getter';
        name = name.replace(/^get /, '');
    }
    else if (g.set) {
        form = 'setter';
        name = name.replace(/^set /, '');
    }
    else if (g.function) form = 'function';
    else if (g.methodName) form = 'method';
    else form = 'unknown';
    
    // Extract ALL parameter groups
    const paramStr = g.arrowParams || g.arrowSingle || g.params || g.params2 || '';
    
    if (!paramStr && form !== 'lambda') {
        return { form, name, async, generator, native: hasNativeCode, params: { count: 0, rest: false } };
    }
    
    // For single arrow param without parens
    if (g.arrowSingle) {
        return { form, name, async, generator, native: hasNativeCode, params: { count: 1, rest: false } };
    }
    
    // Parse parameter list
    const trimmed = paramStr.trim();
    if (!trimmed) {
        return { form, name, async, generator, native: hasNativeCode, params: { count: 0, rest: false } };
    }
    
    // Simple comma split (fast, handles 99% of cases correctly)
    const parts = trimmed.split(',').map(p => p.trim());
    const last = parts[parts.length - 1];
    const rest = last.startsWith('...');
    const count = rest ? parts.length - 1 : parts.length;
    
    return { form, name, async, generator, native: hasNativeCode, params: { count, rest } };
}

let $pattern: RegExp | undefined;
function getFunctionPattern(): RegExp {
    if ($pattern) return $pattern;
    
    const ws = '\\s+';
    const ws0 = '\\s*';
    const id = '[a-zA-Z_$][a-zA-Z0-9_$]*';
    const paramContent = '[^)]*';
    
    // Build pattern with arrow functions FIRST in the alternation
    
    // Arrow function patterns (must come before method pattern!)
    const arrowBranch = 
        `(?:` +
            `(?<asyncArrow>async${ws})?` +
            `(?:` +
                `\\((?<arrowParams>${paramContent})\\)${ws0}(?<arrow>=>)|` +  // Parens arrow
                `(?<arrowSingle>${id})${ws0}=>` +  // Single param arrow
            `)` +
        `)`;
    
    // Traditional patterns
    const traditionalBranch = 
        `(?:` +
            `(?<async>async${ws})?` +
            `(?:` +
                `(?<class>class)|` +
                `(?<get>get)|` +
                `(?<set>set)|` +
                `(?<function>function)${ws0}(?<funcStar>\\*)?` +
            `)${ws0}(?:${id}${ws0})?` +
            `(?:\\((?<params>${paramContent})\\))?` +  // Optional params for class
        `)`;
    
    // Method pattern (must come AFTER arrow check!)
    const methodBranch = 
        `(?:` +
            `(?<async2>async${ws})?` +
            `(?<methodStar>\\*)?` +
            `(?<methodName>${id})${ws0}` +
            `\\((?<params2>${paramContent})\\)` +
        `)`;
    
    // Combine all branches - arrows first!
    $pattern = new RegExp(
        `^(?:${arrowBranch}|${traditionalBranch}|${methodBranch})`
    );
    
    return $pattern;
}