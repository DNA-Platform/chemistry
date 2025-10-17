// app/tests/child-binding/validation-tests.tsx
'use client'
import { $Chemical, List, $use, $check, Undefined } from '@/chemistry';
import React, { useState, useEffect } from 'react';

// ============================================
// TEST COMPONENTS
// ============================================

// Simple chemicals for testing
export class $Label extends $Chemical {
    $text? = 'Label';
    $color?: string = '#333';
    
    view() {
        return <span style={{ color: this.$color }}>{this.$text}</span>;
    }
}

export class $Chapter extends $Chemical {
    $title? = 'Chapter';
    $pageCount? = 10;
    
    view() {
        return <div>{this.$title} ({this.$pageCount} pages)</div>;
    }
}

export class $Book extends $Chemical {
    $title? = 'Book';
    chapters: $Chapter[] = [];
    
    $Book(...chapters: $Chapter[]) {
        $check(chapters, [$Chapter]);
        this.chapters = chapters;
    }
    
    view() {
        return <div>{this.$title} with {this.chapters.length} chapters</div>;
    }
}

// Simple functional component for testing
const SimpleCard: React.FC<{ title?: string }> = ({ title = 'Card' }) => {
    return <div style={{ padding: '10px', background: '#e0e0e0' }}>{title}</div>;
};

// ============================================
// COMPLEX VALIDATOR FOR TESTING
// ============================================

export class $ComplexValidator extends $Chemical {
    header?: $Label;
    count?: number;
    items?: $Chapter[];
    config?: Object;
    callback?: Function;
    matrix?: number[][];
    validationError?: string;
    
    $ComplexValidator(
        header: $Label,
        count: number,
        items: $Chapter[],
        config: Object | undefined,
        callback: Function | undefined,
        matrix: number[][]
    ) {
        try {
            $check(header, $Label);
            $check(count, Number);
            $check(items, [$Chapter]);
            $check(config, Object, undefined);
            $check(callback, Function, undefined);
            $check(matrix, [[Number]]);
            
            this.header = header;
            this.count = count;
            this.items = items;
            this.config = config;
            this.callback = callback;
            this.matrix = matrix;
        } catch (e) {
            this.validationError = (e as Error).message;
        }
    }
    
    view() {
        if (this.validationError) {
            return (
                <div style={{ 
                    padding: '10px', 
                    background: '#ffebee',
                    border: '2px solid #f44336',
                    borderRadius: '4px'
                }}>
                    <strong>Validation Error:</strong>
                    <pre style={{ 
                        marginTop: '10px',
                        fontSize: '12px',
                        whiteSpace: 'pre-wrap'
                    }}>
                        {this.validationError}
                    </pre>
                </div>
            );
        }
        
        return (
            <div style={{ padding: '10px', background: '#f0f0f0' }}>
                Valid ComplexValidator Instance
            </div>
        );
    }
}

// ============================================
// TEST CASES
// ============================================

const Label = new $Label().Component;
const Chapter = new $Chapter().Component;
const Book = new $Book().Component;
const ComplexValidator = new $ComplexValidator().Component;

interface TestResult {
    name: string;
    description: string;
    expectedError: string;
    component: React.ReactElement;
}

const testCases: TestResult[] = [
    {
        name: "Wrong Chemical type",
        description: "Passing $Book where $Label expected",
        expectedError: "Parameter 1: expected $Label, received $Book",
        component: (
            <ComplexValidator>
                <Book />
                {42}
                <List><Chapter /><Chapter /></List>
                <div>config</div>
                <SimpleCard />
                <List><List>{1}</List><List>{2}</List></List>
            </ComplexValidator>
        )
    },
    {
        name: "String instead of Number",
        description: "Passing string 'not a number' where number expected",
        expectedError: "Parameter 2: expected number, received string",
        component: (
            <ComplexValidator>
                <Label />
                {"not a number"}
                <List><Chapter /><Chapter /></List>
                <div>config</div>
                <Undefined />
                <List><List>{1}</List><List>{2}</List></List>
            </ComplexValidator>
        )
    },
    {
        name: "Mixed types in array",
        description: "Array contains $Label and $Book instead of all $Chapter",
        expectedError: "Parameter 3: expected $Chapter[], received [$Chapter, $Label, $Book]",
        component: (
            <ComplexValidator>
                <Label />
                {42}
                <List>
                    <Chapter />
                    <Label />
                    <Book />
                </List>
                <Undefined />
                <Undefined />
                <List><List>{1}</List><List>{2}</List></List>
            </ComplexValidator>
        )
    },
    {
        name: "Non-object for Object parameter",
        description: "Number passed where Object or undefined expected",
        expectedError: "Parameter 4: expected object | undefined, received number",
        component: (
            <ComplexValidator>
                <Label />
                {42}
                <List><Chapter /><Chapter /></List>
                {123}
                <Undefined />
                <List><List>{1}</List><List>{2}</List></List>
            </ComplexValidator>
        )
    },
    {
        name: "1D array instead of 2D",
        description: "Single-dimensional array where 2D array expected",
        expectedError: "Parameter 6: expected number[][], received [string, string, string]",
        component: (
            <ComplexValidator>
                <Label />
                {42}
                <List><Chapter /><Chapter /></List>
                <div>config</div>
                <Undefined />
                <List>{"1 2 3"}</List>
            </ComplexValidator>
        )
    },
    {
        name: "Missing required parameter",
        description: "Matrix parameter (last required param) is missing",
        expectedError: "Parameter 6: expected number[][], received undefined",
        component: (
            <ComplexValidator>
                <Label />
                {42}
                <List><Chapter /><Chapter /></List>
                <Undefined />
                <Undefined />
                {/* Missing matrix parameter! */}
            </ComplexValidator>
        )
    },
    {
        name: "Wrong function component",
        description: "Chemical passed where Function expected",
        expectedError: "Parameter 5: expected function | undefined, received $Label",
        component: (
            <ComplexValidator>
                <Label />
                {42}
                <List><Chapter /><Chapter /></List>
                <div>config</div>
                <Label />
                <List><List>{1}</List><List>{2}</List></List>
            </ComplexValidator>
        )
    },
    {
        name: "Empty array",
        description: "Empty array for required array parameter",
        expectedError: "Parameter 3: expected $Chapter[], received []",
        component: (
            <ComplexValidator>
                <Label />
                {42}
                <List></List>
                <div>config</div>
                <Undefined />
                <List><List>{1}</List><List>{2}</List></List>
            </ComplexValidator>
        )
    },
    {
        name: "Wrong nested array types",
        description: "Strings in nested arrays instead of numbers",
        expectedError: "Parameter 6: expected number[][], received [string[3], string[2]]",
        component: (
            <ComplexValidator>
                <Label />
                {42}
                <List><Chapter /><Chapter /></List>
                <div>config</div>
                <Undefined />
                <List>
                    <List>{"a"}{"b"}{"c"}</List>
                    <List>{"x"}{"y"}</List>
                </List>
            </ComplexValidator>
        )
    },
    {
        name: "HTML element instead of object",
        description: "HTML div props passed for Object parameter",
        expectedError: "Validation should pass - div props ARE an object",
        component: (
            <ComplexValidator>
                <Label />
                {42}
                <List><Chapter /><Chapter /></List>
                <div>config</div>  {/* This is valid - it's an object */}
                <SimpleCard />
                <List><List>{1}</List><List>{2}</List></List>
            </ComplexValidator>
        )
    }
];

export default function ValidationTests() {
    return (
        <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
            <h1>Validation Error Message Tests</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Each test shows a $ComplexValidator with intentionally wrong arguments.
                The validator catches and displays its own validation errors.
            </p>
            
            <div style={{ 
                marginBottom: '30px', 
                padding: '20px', 
                background: '#e8f5e9',
                borderRadius: '8px',
                border: '1px solid #4caf50'
            }}>
                <h3>Expected $ComplexValidator Signature:</h3>
                <pre style={{ fontFamily: 'monospace', fontSize: '13px' }}>
{`$ComplexValidator(
    header: $Label,
    count: Number,
    items: $Chapter[],
    config: Object | undefined,
    callback: Function | undefined,
    matrix: Number[][]
)`}
                </pre>
            </div>
            
            {testCases.map((test, index) => (
                <div key={index} style={{ 
                    marginBottom: '25px', 
                    border: '2px solid #2196f3',
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}>
                    <div style={{ 
                        padding: '15px',
                        background: '#e3f2fd',
                        borderBottom: '1px solid #ddd'
                    }}>
                        <h3>{test.name}</h3>
                        <p style={{ color: '#666', margin: '5px 0' }}>
                            {test.description}
                        </p>
                        <p style={{ color: '#999', fontSize: '12px' }}>
                            Expected to see error about: {test.expectedError}
                        </p>
                    </div>
                    
                    <div style={{ padding: '15px', background: '#fafafa' }}>
                        <strong>Validator Output:</strong>
                        <div style={{ marginTop: '10px' }}>
                            {test.component}
                        </div>
                    </div>
                </div>
            ))}
            
            <div style={{ 
                marginTop: '40px',
                padding: '20px',
                background: '#f0f8ff',
                borderRadius: '8px',
                border: '1px solid #2196f3'
            }}>
                <h3>How Validation Works</h3>
                <ul>
                    <li>Each $ComplexValidator catches validation errors in its constructor</li>
                    <li>Errors are displayed instead of thrown (React-friendly)</li>
                    <li>The $check function validates each parameter type</li>
                    <li>Clear error messages show what was expected vs received</li>
                </ul>
            </div>
        </div>
    );
}