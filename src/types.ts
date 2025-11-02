import { JSX, ReactNode } from "react";
import { $Function$, $Html$ } from "./archive/chemistry";
import { $Particle } from "./core/particle";
import { $Chemical } from "./core/chemical";

export type $Type<T = any> = $Constructor<T>;
export type $Constructor<T = {}> = new (...args: any[]) => T;
type $SymbolFeature = 'fast' | 'slow' | 'self-contained' | 'referential';
type $Phase = 'setup' | 'mount' | 'render' | 'layout' | 'effect' | 'unmount';
type $Promise<T = any> = Promise<T> & { 
    result: T, 
    complete: boolean,
    then: <U>(action: (value: T) => U) => $Promise<U>,  
    cancel: (action?: () => any) => any 
}

export type $Props = {
    [key: string]: any;
    children?: ReactNode;
}

export type $Properties<T> = {
    [K in keyof T as K extends `$${infer First}${infer Rest}` ? 
        (K extends '$parent' ? never :  // Add this check
        First extends Lowercase<First> ?
            (First extends '_' | '$' ? never :
            (K extends keyof $Chemical ? never : 
            (T[K] extends Function ? never : `${First}${Rest}`))) : never) : never]: 
        T[K]
} & {
    [K in keyof T as K extends `$${infer First}${infer Rest}` ? 
        (K extends '$parent' ? never :  // Add this check
        First extends Lowercase<First> ?
            (First extends '_' | '$' ? never :
            (K extends keyof $Chemical ? never : 
            (T[K] extends Function ? `${First}${Rest}` : never))) : never) : never]?: 
        T[K]
} & {
    children?: React.ReactNode;
};

export type $$Properties<T> = {
    [K in keyof T as K extends `$${infer First}${infer Rest}` ? 
        (K extends '$parent' ? never :  // Add this check
        First extends Lowercase<First> ?
            (First extends '_' | '$' ? never :
            (K extends keyof $Chemical ? never : 
            (T[K] extends Function ? never : `${First}${Rest}`))) : never) : never]?: 
        T[K]
} & {
    [K in keyof T as K extends `$${infer First}${infer Rest}` ? 
        (K extends '$parent' ? never :  // Add this check
        First extends Lowercase<First> ?
            (First extends '_' | '$' ? never :
            (K extends keyof $Chemical ? never : 
            (T[K] extends Function ? `${First}${Rest}` : never))) : never) : never]?: 
        T[K]
} & {
    children?: React.ReactNode;
};

export type $MethodComponent<T, M extends (...args: any[]) => any> = 
    (props: $$Properties<T> & { call: Parameters<M> }) => ReturnType<M>;

export type $Component<T extends $Chemical = $Chemical> = React.FC<$Properties<T>> & Component<T>;
export type $$Component<T extends $Chemical = $Chemical> = React.FC<$$Properties<T>> & Component<T>;

export interface Component<T extends $Chemical> {
    get $bound(): boolean;
    get $chemical(): T;
    $?(): $$Component<T>;
    $new(parent: $Chemical): $$Component<T>;
    $bind(parent: $Chemical): $Component<T>;
}

export type $Function<T> = T extends React.FC<infer P> 
    ? $Function$<P> & {
        [K in keyof P as K extends 'children' ? never : `$${string & K}`]: P[K];
      }
    : never;

export type $Html<T extends keyof JSX.IntrinsicElements = any> = 
    $Html$<T> & {
        [K in keyof JSX.IntrinsicElements[T] as K extends 'children' ? never : `$${string & K}`]?: JSX.IntrinsicElements[T][K];
    }

type $ParameterType = 
    | $Constructor<$Particle>
    | React.FC
    | Function
    | StringConstructor
    | NumberConstructor
    | BooleanConstructor
    | FunctionConstructor
    | ObjectConstructor
    | null
    | undefined
    | keyof JSX.IntrinsicElements
    | 'any'
    | [$ParameterType]
    | [[$ParameterType]]
    | [[[$ParameterType]]];

type $Parameter<T = $ParameterType> =
  T extends readonly (infer U)[] ? $Parameter<U>[] :
  T extends $Constructor<infer C> ? (C extends $Chemical ? C : never) :
  T extends React.FC<any> ? $Function<T> :
  T extends StringConstructor ? string :
  T extends NumberConstructor ? number :
  T extends BooleanConstructor ? boolean :
  T extends FunctionConstructor ? Function :
  T extends ObjectConstructor ? object :
  T extends keyof JSX.IntrinsicElements ? $Html<T> :
  T extends 'any' ? any :
  T;