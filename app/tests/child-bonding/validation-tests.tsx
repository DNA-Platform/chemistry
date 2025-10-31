// app/tests/child-binding/validation-tests.tsx
'use client'
import { $Chemical, Include, $check, Exclude, $Html, $Function } from '@/chemistry';

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
    chapters!: $Chapter[];  // Non-null - guaranteed by constructor
    
    $Book(...chapters: $Chapter[]) {
        this.chapters = $check(chapters, [$Chapter]);
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
    header!: $Label;       // Non-null - guaranteed by constructor
    count!: number;        // Non-null - guaranteed by constructor
    items!: $Chapter[];    // Non-null - guaranteed by constructor
    config?: $Html<'div'>;       // Optional
    card?: $Function<typeof SimpleCard>;   // Optional
    matrix!: number[][];   // Non-null - guaranteed by constructor
    validationError?: string;
    
    $ComplexValidator(
        header: $Label,
        count: number,
        items: $Chapter[],
        config: $Html<'div'> | undefined,
        card: $Function<typeof SimpleCard> | undefined,
        matrix: number[][]
    ) {
        try {
            this.header = $check(header, $Label);
            this.count = $check(count, Number);
            this.items = $check(items, [$Chapter]);
            this.config = $check(config, 'div', undefined);
            this.card = $check(card, SimpleCard, undefined);
            this.matrix = $check(matrix, [[Number]]);
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
                <div>Header: {this.header.$text}</div>
                <div>Count: {this.count}</div>
                <div>Items: {this.items.length} chapters</div>
                <div>Config: {this.config ? 'provided' : 'none'}</div>
                <div>Callback: {this.card ? 'provided' : 'none'}</div>
                <div>Matrix: {this.matrix.length}x{this.matrix[0]?.length || 0}</div>
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
    // Parameter 1: header tests
    {
        name: "P1: Wrong Chemical type",
        description: "Passing $Book where $Label expected",
        expectedError: "Parameter 1: expected $Label, received $Book",
        component: (
            <ComplexValidator>
                <Book />
                {42}
                <Include><Chapter /><Chapter /></Include>
                <div>config</div>
                <SimpleCard />
                <Include><Include>{1}</Include><Include>{2}</Include></Include>
            </ComplexValidator>
        )
    },
    
    // Parameter 2: count tests
    {
        name: "P2: Label instead of number",
        description: "Passing Label where number expected",
        expectedError: "Parameter 2: expected number, received Label",
        component: (
            <ComplexValidator>
                <Label />
                <Label />
                <Include>
                    <Chapter />
                    <Chapter />
                </Include>
                <div>config</div>
                <SimpleCard />
                <Include><Include>{1}</Include><Include>{2}</Include></Include>
            </ComplexValidator>
        )
    },
    
    // Parameter 3: items array tests
    {
        name: "P3: Mixed types in array",
        description: "Array contains wrong Chemical types",
        expectedError: "Parameter 3: expected $Chapter[], received [$Chapter, $Label, $Book]",
        component: (
            <ComplexValidator>
                <Label />
                {42}
                <Include>
                    <Chapter />
                    <Label />
                    <Book />
                </Include>
                <div>config</div>
                <SimpleCard />
                <Include><Include>{1}</Include><Include>{2}</Include></Include>
            </ComplexValidator>
        )
    },
    
    // Parameter 4: config HTML element tests
    {
        name: "P4: span instead of div",
        description: "Passing a span where a div was expected",
        expectedError: "Parameter 4: expected div | undefined, received span",
        component: (
            <ComplexValidator>
                <Label />
                {42}
                <Include><Chapter /><Chapter /></Include>
                <span>config</span>
                <SimpleCard />
                <Include><Include>{1}</Include><Include>{2}</Include></Include>
            </ComplexValidator>
        )
    },
    
    // Parameter 5: card (Function component) tests
    {
        name: "P5: Chemical instead of Function",
        description: "Passing $Label where Function component expected",
        expectedError: "Parameter 5: expected function | undefined, received $Label",
        component: (
            <ComplexValidator>
                <Label />
                {42}
                <Include><Chapter /><Chapter /></Include>
                <div>config</div>
                <Label />
                <Include><Include>{1}</Include><Include>{2}</Include></Include>
            </ComplexValidator>
        )
    },
    
    // Parameter 6: matrix tests
    {
        name: "P6: Wrong nested array types",
        description: "Strings in nested arrays instead of numbers",
        expectedError: "Parameter 6: expected number[][], received [[string, string], [string]]",
        component: (
            <ComplexValidator>
                <Label />
                {42}
                <Include><Chapter /><Chapter /></Include>
                <div>config</div>
                <SimpleCard />
                <Include>
                    <Include>{"a"}{"b"}</Include>
                    <Include>{"x"}</Include>
                </Include>
            </ComplexValidator>
        )
    },
    
    // Valid test - all parameters correct
    {
        name: "All parameters valid",
        description: "Should display valid instance message",
        expectedError: "No error - should pass",
        component: (
            <ComplexValidator>
                <Label />
                {42}
                <Include><Chapter /><Chapter /></Include>
                <div>config</div>
                <SimpleCard />
                <Include><Include>{1}</Include><Include>{2}</Include></Include>
            </ComplexValidator>
        )
    },
    
    // Optional parameters as undefined
    {
        name: "Optional parameters undefined",
        description: "Testing with undefined for optional params",
        expectedError: "No error - optionals can be undefined",
        component: (
            <ComplexValidator>
                <Label />
                {42}
                <Include><Chapter /><Chapter /></Include>
                <Exclude /> {/* Testing Comments */}
                <Exclude />
                <Include><Include>{1}</Include><Include>{2}</Include></Include>
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
    count: number,
    items: $Chapter[],
    config: $Html<'div'> | undefined,
    card: $Function<typeof SimpleCard> | undefined,
    matrix: number[][]
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
                        <p style={{ color: '#333', margin: '5px 0', fontWeight: 'normal' }}>
                            {test.description}
                        </p>
                        <p style={{ color: '#666', fontSize: '13px' }}>
                            Expected: {test.expectedError}
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