
// app > tests > experiments
'use client'
import { $Formula } from '@/chemistry2';
import { $Chemical, $, $$, $Children, $Properties, $Component, $Type } from '@/chemistry3';
import React, { JSX } from 'react';
import { ReactNode } from 'react';

const Func: React.FC<{ title: string; count: number }> = ({ title, count }) => {
    return <div>{title}: {count}</div>;
};

class $Child1 extends $Chemical { 
    $name = '';
    constructor(first?: typeof Func) {
        super();
    }
}
class $Child2 extends $Chemical {
    constructor(
        div?: 'div',
        func?: typeof Func,
        chem?: $Child1
    ) {
        super();
    }
}

const Child1 = new $Child1().Component;
const Child2 = new $Child2().Component;

class $Parent extends $Chemical {
    child = $($Child1);
    childArray = $$($Child2)

    view() {
        return (
            <>
                <Child1 name='myself'>
                    <Func title='' count={5} />
                </Child1>
            </>
        );
    }
}

// Debug helpers
type Debug1 = $Children<$Child1>;
// Should be: { children?: React.ReactElement<...> }

type Debug2 = $Properties<$Child1>;  
// Should be: { name: string; children?: React.ReactElement<...> }

type Debug3 = $Component<$Child1>;
// Should be: React.FC<{ name: string; children?: React.ReactElement<...> }>

// 1. Component that accepts only a string
const TextOnly: React.FC<{ children: string }> = ({ children }) => {
    return <span>{children}</span>;
};

// 2. Component that accepts only a div element
const DivOnly: React.FC<{ children: React.ReactElement<HTMLDivElement> }> = ({ children }) => {
    return <section>{children}</section>;
};

// 3. A custom component
const Button: React.FC<{ label: string }> = ({ label }) => {
    return <button>{label}</button>;
};

// 4. Component that accepts only Button elements
const ButtonWrapper: React.FC<{ children: React.ReactElement<any, typeof Button> }> = ({ children }) => {
    return <div className="wrapper">{children}</div>;
};

// 5. Component that accepts exactly 2 children: a div and a Button
const TwoKids: React.FC<{ 
    children: [
        React.ReactElement<HTMLDivElement>,
        React.ReactElement<any, typeof Button>
    ]
}> = ({ children }) => {
    return <div>{children}</div>;
};

// Test component showing what compiles and what doesn't
export function Test() {
    return (
        <div>
            {/* These compile */}
            <TextOnly>
                Hello World
            </TextOnly>
            <DivOnly>
                <div>I am a div</div>
            </DivOnly>
            <ButtonWrapper>
                <Button label="Click" />
            </ButtonWrapper>
            <TwoKids>
                <div>First child</div>
                <Button label="Second child" />
            </TwoKids>

            {/* These would NOT compile - uncomment to see errors */}
            {/* <TextOnly><div>Not text</div></TextOnly> */}
            {/* <DivOnly><span>Not a div</span></DivOnly> */}
            {/* <ButtonWrapper><div>Not a Button</div></ButtonWrapper> */}
            {/* <TwoKids><div>Only one child</div></TwoKids> */}
        </div>
    );
}

// Type to remove undefined from optional constructor parameters while preserving tuple
export type $RemoveOptional<T extends $Type> = 
    ConstructorParameters<T> extends readonly [...infer P]
        ? [...{ [K in keyof P]-?: Exclude<P[K], undefined> }]
        : [];

// Convert last array parameter to spread in tuple - fixed version
export type $SpreadLast<T extends readonly unknown[]> = 
    T extends readonly [...infer Rest, infer Last] ?
        [Last] extends [readonly (infer E)[]] ?  // Wrap in tuple to prevent distribution
            [...Rest, ...E[]] :  // Convert last array to spread
            T :  // Keep as-is if last isn't array
    T;  // Return unchanged if can't match

export type $React<T> = 
    0 extends (1 & T) ? ReactNode :
    T extends readonly (infer U)[] ? $React<U>[] :
    T extends { cid: number; } ? React.ReactElement<$Properties<T>> :  // Duck type check
    T extends keyof JSX.IntrinsicElements ? React.ReactElement<JSX.IntrinsicElements[T]> :
    T extends React.ComponentType<any> ? React.ReactElement<React.ComponentProps<T>> :
    T extends string ? string :
    T extends number ? number :
    T extends boolean ? boolean :
    T extends undefined ? undefined :
    T extends null ? null :
    T extends object ? T :
    ReactNode;

export type $Children<T extends $Type> = 
    $RemoveOptional<T> extends readonly [...infer Clean] ?
        $SpreadLast<Clean> extends readonly [...infer Final] ?
            [...{ [K in keyof Final]: $React<Final[K]> }] :
            Clean :  // Return Clean if SpreadTuple fails
        [];  // Return empty if RemoveOptional fails

// Test class - all params are optional
class $Test extends $Chemical {
    constructor(
        first?: string,
        second?: number,
        third?: boolean
    ) {
        super();
    }
}

// Debug - pass the constructor type directly
type Debug = $RemoveOptional<typeof $Test>;
// Should be: [string, number, boolean]

// Test function components
const FuncComp: React.FC<{ title: string }> = ({ title }) => <div>{title}</div>;

// Tests
type Test1 = $React<any>;
// Result: ReactNode (special case)

type Test2 = $React<'div'>;
// Result: React.ReactElement<JSX.IntrinsicElements['div']>

type Test3 = $React<typeof FuncComp>;
// Result: React.ReactElement<{ title: string }>

type Test4 = $React<string>;
// Result: string (preserved)

type Test5 = $React<number>;
// Result: number (preserved)

type Test6 = $React<any[]>;
// Result: ReactNode[] (recursive: any → ReactNode, then array)

type Test7 = $React<string[]>;
// Result: string[] (recursive: string → string, then array)

type Test8 = $React<'div'[]>;
// Result: React.ReactElement<JSX.IntrinsicElements['div']>[] (recursive)

type Test9 = $React<object>;
// Result: object (preserved)

type Test10 = $React<{ custom: true }>;
// Result: { custom: true } (objects preserve themselves)

type Test11 = $React<never>;
// Result: ReactNode (falls through to final fallback)

type Test12 = $React<unknown>;
// Result: ReactNode (falls through to final fallback)

type Test13 = $React<'div'[][]>;
// Result: React.ReactElement<JSX.IntrinsicElements['div']>[][] (double recursive)

type Test14 = $React<(string | typeof FuncComp)[]>;
// Result: (string | React.ReactElement<{ title: string }>)[] (mixed array)

// Test with Chemical
class $TestChemical extends $Chemical {
    $title = '';
    constructor(content?: 'div') {
        super();
    }
}

type TestChem1 = $React<$TestChemical>;
// Result: React.ReactElement<$Properties<$TestChemical>>
// Which is: React.ReactElement<{ title: string; children?: React.ReactElement<...> }>

type TestChem2 = $React<$TestChemical[]>;
// Result: React.ReactElement<$Properties<$TestChemical>>[]

// Test cases
type Tests1 = $SpreadLast<[string, number, boolean[]]>;
// Result: [string, number, ...boolean[]]

type Tests2 = $SpreadLast<[string, number[]]>;  
// Result: [string, ...number[]]

type Tests3 = $SpreadLast<[string[]]>;
// Result: [...string[]]

type Tests4 = $SpreadLast<[string, number, boolean]>;
// Result: [string, number, boolean] (no array at end)

type Tests5 = $SpreadLast<[]>;
// Result: []

// Applied to constructor parameters
class $TestSpread extends $Chemical {
    constructor(
        first?: string,
        second?: number,
        items?: boolean[]
    ) {
        super();
    }
}

type CtorParams = ConstructorParameters<typeof $TestSpread>;
// [first?: string, second?: number, items?: boolean[] | undefined]

type WithoutOptional = $RemoveOptional<typeof $TestSpread>;
// [string, number, boolean[]]

type WithSpread = $SpreadLast<WithoutOptional>;
// [string, number, ...boolean[]]

// Test step by step
class $TestChildren extends $Chemical {
    $name = '';
    constructor(
        first?: 'div',
        second?: typeof Func,
        items?: $TestSpread
    ) {
        super();
    }
}

type Step1 = $RemoveOptional<typeof $TestChildren>;
// Should be: [string, number, boolean[]]

type Step2 = $SpreadLast<Step1>;
// Should be: [string, number, ...boolean[]]

type Step3 = $Children<typeof $TestChildren>;
// Should be: [string, number, ...boolean[]]


const Chemical = new $Chemical().Component;

class $SubChemical extends $Chemical {
    $name = '';

    constructor(first?: 'div', second?: typeof Chemical, third?: (typeof Chemical)[]) {
        super();
    }

    view() {
        return (
            <Chemical>
                <div></div>
                <span></span>
            </Chemical>
        );
    }
}

const SubChemical = new $SubChemical().Component;

const Component = () => {
    return (
        <SubChemical name=''>
            <div></div>
            <Chemical>
                <div></div>
                <span></span>
            </Chemical>
            <span></span>
        </SubChemical>
    );
}

type Debug11 = $React<$Chemical>;
type Debug21 = $React<$Chemical[]>;
type Debug31 = $Children<typeof $SubChemical>;