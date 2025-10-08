// app/tests/child-binding/arg-tests.tsx
'use client'
import { $Chemical, $, $use, $Arg } from '@/chemistry';
import React from 'react';

// ============================================
// TEST COMPONENTS
// ============================================

// Simple chemical for testing
export class $Label extends $Chemical {
    $text = 'Label';
    $color?: string = '#333';
    
    view() {
        return <span style={{ color: this.$color }}>{this.$text}</span>;
    }
}

// Simple functional components for testing
const SimpleButton: React.FC<{ text?: string }> = ({ text = 'Click' }) => {
    return <button style={{ padding: '5px 10px' }}>{text}</button>;
};

const InfoCard: React.FC<{ title?: string; children?: React.ReactNode }> = ({ title, children }) => {
    return (
        <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
            {title && <h4>{title}</h4>}
            {children}
        </div>
    );
};

// ============================================
// TEST 1: Mixed Chemical and Function Components
// ============================================

export class $MixedContainer extends $Chemical {
    label!: $Label;
    button?: any;  // Will be $Function wrapping SimpleButton
    card?: any;    // Will be $Function wrapping InfoCard
    
    $MixedContainer(
        label: $Label,
        button: any,  
        card: any
    ) {
        console.log('$MixedContainer constructor received:');
        console.log('  label:', label, 'instanceof $Chemical?', label instanceof $Chemical);
        console.log('  button:', button, 'instanceof $Chemical?', button instanceof $Chemical);
        console.log('  button constructor:', button?.constructor?.name);
        console.log('  card:', card, 'instanceof $Chemical?', card instanceof $Chemical);
        console.log('  card constructor:', card?.constructor?.name);
        
        this.label = label;
        this.button = button;
        this.card = card;
    }
    
    view() {
        const [Label] = $use(this.label, 'key');
        const Button = this.button instanceof $Chemical ? $use(this.button) : null;
        const Card = this.card instanceof $Chemical ? $use(this.card) : null;
        
        return (
            <div style={{ border: '2px solid blue', padding: '15px', borderRadius: '8px' }}>
                <h4>Mixed Container</h4>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {Label && <Label />}
                    {Button ? <Button /> : <div>Button not Chemical</div>}
                    {Card ? <Card /> : <div>Card not Chemical</div>}
                </div>
            </div>
        );
    }
}

// ============================================
// TEST 2: Intrinsic Elements in Constructor
// ============================================

export class $FormBuilder extends $Chemical {
    inputEl?: $Arg<'input'>;
    buttonEl?: $Arg<'button'>;
    divEl?: $Arg<'div'>;
    elements: any[] = [];
    
    $FormBuilder(
        input: $Arg<'input'>,
        button: $Arg<'button'>,
        div: $Arg<'div'>,
        ...moreElements: any[]
    ) {
        console.log('$FormBuilder constructor:', {
            input: input ? 'input element' : 'none',
            button: button ? 'button element' : 'none',
            div: div ? 'div element' : 'none',
            moreElements: moreElements.length
        });
        
        this.inputEl = input;
        this.buttonEl = button;
        this.divEl = div;
        this.elements = moreElements;
    }
    
    view() {
        return (
            <div style={{ border: '2px solid green', padding: '15px', borderRadius: '8px' }}>
                <h4>Form Builder</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {this.inputEl && <input placeholder="From constructor" style={{ padding: '5px' }} />}
                    {this.buttonEl && <button style={{ padding: '5px 10px' }}>Constructor Button</button>}
                    {this.divEl && <div style={{ background: '#f0f0f0', padding: '10px' }}>Div from constructor</div>}
                    {this.elements.map((el, i) => (
                        <div key={i} style={{ padding: '5px', background: '#fafafa' }}>
                            Extra element {i + 1}
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

// ============================================
// TEST 3: Arrays of Different Types
// ============================================

export class $CollectionManager extends $Chemical {
    labels: $Label[] = [];
    buttons: any[] = [];  // Will be $Function instances
    mixed: any[] = [];
    
    $CollectionManager(
        labels: $Label[],
        buttons: any[],
        mixed: any[]
    ) {
        console.log('$CollectionManager constructor:');
        console.log('  labels:', labels);
        labels?.forEach((l, i) => console.log(`  label[${i}] instanceof $Chemical:`, l instanceof $Chemical));
        
        console.log('  buttons:', buttons);
        buttons?.forEach((b, i) => console.log(`  button[${i}] instanceof $Chemical:`, b instanceof $Chemical, 'constructor:', b?.constructor?.name));
        
        console.log('  mixed:', mixed);
        mixed?.forEach((m, i) => console.log(`  mixed[${i}] instanceof $Chemical:`, m instanceof $Chemical));
        
        this.labels = labels || [];
        this.buttons = buttons || [];
        this.mixed = mixed || [];
        
        // Modify labels
        this.labels.forEach((label, i) => {
            label.$text = `Label ${i + 1}: ${label.$text}`;
        });
    }
    
    view() {
        return (
            <div style={{ border: '2px solid purple', padding: '15px', borderRadius: '8px' }}>
                <h4>Collection Manager</h4>
                
                <div style={{ marginBottom: '10px' }}>
                    <strong>Labels ({this.labels.length}):</strong>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {this.labels.map(label => {
                            const [Label, key] = $use(label, 'key');
                            return <Label key={key} />;
                        })}
                    </div>
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                    <strong>Buttons ({this.buttons.length}):</strong>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {this.buttons.map((button, i) => {
                            if (button instanceof $Chemical) {
                                const [Button, key] = $use(button, 'key');
                                return <Button key={key} />;
                            }
                            return <div key={i}>Not Chemical</div>;
                        })}
                    </div>
                </div>
                
                <div>
                    <strong>Mixed ({this.mixed.length}):</strong>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {this.mixed.map((item, i) => {
                            if (item instanceof $Chemical) {
                                const [Item, key] = $use(item, 'key');
                                return <Item key={key} />;
                            }
                            return (
                                <div key={i} style={{ padding: '5px', background: '#f0f0f0' }}>
                                    {typeof item === 'object' ? 'Object' : `Item ${i}`}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }
}

// ============================================
// TEST 4: Complex Spread Operations
// ============================================

export class $SpreadCollector extends $Chemical {
    first!: $Label;
    rest: any[] = [];
    
    $SpreadCollector(first: $Label, ...rest: any[]) {
        console.log('$SpreadCollector constructor:', {
            first: first?.$text,
            restCount: rest.length,
            restTypes: rest.map(r => {
                if (r instanceof $Chemical) return r.constructor.name;
                if (typeof r === 'function') return 'Function';
                if (Array.isArray(r)) return `Array(${r.length})`;
                return typeof r;
            })
        });
        
        this.first = first;
        this.rest = rest;
    }
    
    view() {
        const [First, firstKey] = $use(this.first, 'key');
        
        return (
            <div style={{ border: '2px solid orange', padding: '15px', borderRadius: '8px' }}>
                <h4>Spread Collector</h4>
                <div>
                    <strong>First:</strong> {First && <First key={firstKey} />}
                </div>
                <div style={{ marginTop: '10px' }}>
                    <strong>Rest ({this.rest.length} items):</strong>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '5px' }}>
                        {this.rest.map((item, i) => {
                            if (item instanceof $Chemical) {
                                const [Item, key] = $use(item, 'key');
                                return Item ? <Item key={key} /> : null;
                            }
                            return (
                                <div key={i} style={{ 
                                    padding: '5px', 
                                    background: '#e0e0e0',
                                    borderRadius: '3px'
                                }}>
                                    {typeof item === 'function' ? 'Function' : `Item ${i}`}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }
}

// ============================================
// TEST 5: Nested Arrays and Complex Structures
// ============================================

export class $MatrixContainer extends $Chemical {
    header!: $Label;
    rows: any[][] = [];
    footer?: $Arg<typeof InfoCard>;
    
    $MatrixContainer(
        header: $Label,
        rows: any[][],
        footer?: $Arg<typeof InfoCard>
    ) {
        console.log('$MatrixContainer constructor:', {
            header: header?.$text,
            rows: rows?.length || 0,
            totalCells: rows?.reduce((sum, row) => sum + row.length, 0) || 0,
            footer: footer ? 'InfoCard' : 'none'
        });
        
        this.header = header;
        this.rows = rows || [];
        this.footer = footer;
    }
    
    view() {
        const [Header, headerKey] = $use(this.header, 'key');
        const Footer = this.footer ? $use(this.footer) : null;
        
        return (
            <div style={{ border: '2px solid teal', padding: '15px', borderRadius: '8px' }}>
                <h4>Matrix Container</h4>
                {Header && <div style={{ marginBottom: '10px' }}><Header key={headerKey} /></div>}
                
                <div style={{ marginBottom: '10px' }}>
                    <strong>Matrix ({this.rows.length}x{this.rows[0]?.length || 0}):</strong>
                    <div style={{ display: 'table', marginTop: '5px' }}>
                        {this.rows.map((row, i) => (
                            <div key={i} style={{ display: 'table-row' }}>
                                {row.map((cell, j) => (
                                    <div key={j} style={{ 
                                        display: 'table-cell',
                                        padding: '5px 10px',
                                        border: '1px solid #ddd',
                                        background: (i + j) % 2 === 0 ? '#f5f5f5' : 'white'
                                    }}>
                                        {cell instanceof $Chemical ? 
                                            (() => {
                                                const [Cell, cellKey] = $use(cell, 'key');
                                                return Cell ? <Cell key={cellKey} /> : null;
                                            })() :
                                            `${i},${j}`
                                        }
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
                
                {Footer && <Footer />}
            </div>
        );
    }
}

// Export components
const Label = new $Label().Component;
const MixedContainer = new $MixedContainer().Component;
const FormBuilder = new $FormBuilder().Component;
const CollectionManager = new $CollectionManager().Component;
const SpreadCollector = new $SpreadCollector().Component;
const MatrixContainer = new $MatrixContainer().Component;

export default function ArgTests() {
    return (
        <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
            <h1>Constructor Types Tests</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Testing different parameter types in Chemistry constructors: Chemicals, function components, intrinsic elements, arrays, and spread operations.
            </p>
            
            {/* Test 1 */}
            <div style={{ marginBottom: '40px' }}>
                <h2>Test 1: Mixed Chemical and Function Components</h2>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Expected:</strong> Constructor receives $Chemical, React.FC components wrapped by Chemistry
                </div>
                <MixedContainer>
                    <Label text="Chemistry Label" color="blue" />
                    <SimpleButton />
                    <InfoCard />
                </MixedContainer>
                <div style={{ marginTop: '10px', color: '#666' }}>
                    ✓ Label is a $Chemical instance<br/>
                    ✓ SimpleButton is a functional component<br/>
                    ✓ InfoCard is a functional component<br/>
                    ✗ Fail if types aren't properly handled
                </div>
            </div>
            
            {/* Test 2 */}
            <div style={{ marginBottom: '40px' }}>
                <h2>Test 2: Intrinsic Elements</h2>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Expected:</strong> Constructor receives DOM elements like input, button, div
                </div>
                <FormBuilder>
                    <input type="text" />
                    <button>Native Button</button>
                    <div>Native Div</div>
                    <span>Extra 1</span>
                    <span>Extra 2</span>
                </FormBuilder>
                <div style={{ marginTop: '10px', color: '#666' }}>
                    ✓ Input element passed as intrinsic<br/>
                    ✓ Button element passed as intrinsic<br/>
                    ✓ Div element passed as intrinsic<br/>
                    ✓ Rest parameters collect extra elements<br/>
                    ✗ Fail if intrinsic elements not handled
                </div>
            </div>
            
            {/* Test 3 */}
            <div style={{ marginBottom: '40px' }}>
                <h2>Test 3: Arrays of Different Types</h2>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Expected:</strong> Constructor receives arrays of Chemicals, functions wrapped by Chemistry, mixed types
                </div>
                <CollectionManager>
                    <$>
                        <Label text="First" color="red" />
                        <Label text="Second" color="green" />
                        <Label text="Third" color="blue" />
                    </$>
                    <$>
                        <SimpleButton />
                        <SimpleButton />
                    </$>
                    <$>
                        <Label text="Mixed 1" />
                        <SimpleButton />
                        <div>Mixed 3</div>
                    </$>
                </CollectionManager>
                <div style={{ marginTop: '10px', color: '#666' }}>
                    ✓ First array contains $Chemical instances<br/>
                    ✓ Second array contains function components<br/>
                    ✓ Third array contains mixed types<br/>
                    ✗ Fail if arrays not properly typed
                </div>
            </div>
            
            {/* Test 4 */}
            <div style={{ marginBottom: '40px' }}>
                <h2>Test 4: Spread Operations</h2>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Expected:</strong> First parameter typed, rest collected via spread
                </div>
                <SpreadCollector>
                    <Label text="First (typed)" color="purple" />
                    <Label text="Rest 1" />
                    <SimpleButton />
                    <div>Rest 3</div>
                    <Label text="Rest 4" />
                    <InfoCard />
                </SpreadCollector>
                <div style={{ marginTop: '10px', color: '#666' }}>
                    ✓ First parameter is specifically typed as $Label<br/>
                    ✓ Rest parameters collect all remaining children<br/>
                    ✓ Mixed types in rest parameters<br/>
                    ✗ Fail if spread operator doesn't work
                </div>
            </div>
            
            {/* Test 5 */}
            <div style={{ marginBottom: '40px' }}>
                <h2>Test 5: Nested Arrays (Matrix)</h2>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Expected:</strong> Constructor receives 2D array structure
                </div>
                <MatrixContainer>
                    <Label text="Matrix Header" color="#333" />
                    <$>
                        <$>
                            <Label text="1,1" />
                            <Label text="1,2" />
                            <Label text="1,3" />
                        </$>
                        <$>
                            <Label text="2,1" />
                            <Label text="2,2" />
                            <Label text="2,3" />
                        </$>
                        <$>
                            <Label text="3,1" />
                            <Label text="3,2" />
                            <Label text="3,3" />
                        </$>
                    </$>
                    <InfoCard />
                </MatrixContainer>
                <div style={{ marginTop: '10px', color: '#666' }}>
                    ✓ Header as single $Chemical<br/>
                    ✓ 2D array (matrix) of components<br/>
                    ✓ Optional footer parameter<br/>
                    ✗ Fail if nested arrays don't maintain structure
                </div>
            </div>
            
            <div style={{ marginTop: '40px', padding: '20px', background: '#f0f8ff', borderRadius: '8px' }}>
                <h3>🔍 Type System Notes</h3>
                <p>
                    The <code>$Arg&lt;T&gt;</code> type helper allows Chemistry to accept:<br/>
                    • <code>React.FC</code> → wrapped as <code>$Function</code><br/>
                    • Intrinsic elements → typed as <code>JSX.IntrinsicElements</code><br/>
                    • Other types → passed through as-is<br/>
                    <br/>
                    Check console for detailed type information logged by constructors!
                </p>
            </div>
        </div>
    );
}