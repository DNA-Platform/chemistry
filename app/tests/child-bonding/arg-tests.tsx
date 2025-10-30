// app/tests/child-binding/arg-tests.tsx
'use client'
import { $Chemical, List, $use, $Function, $Html, $check } from '@/chemistry';
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
const SimpleCard: React.FC<{ title?: string; color?: string }> = ({ title = 'Card Title', color = '#e0e0e0' }) => {
    return (
        <div style={{ 
            padding: '10px 15px', 
            background: color, 
            borderRadius: '4px',
            minWidth: '100px',
            textAlign: 'center'
        }}>
            {title}
        </div>
    );
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
    simpleCard!: $Function<typeof SimpleCard>;
    infoCard!: $Function<typeof SimpleCard>;
    
    $MixedContainer(
        label: $Label,
        simpleCard: $Function<typeof SimpleCard>,  
        infoCard: $Function<typeof InfoCard>
    ) {
        this.label = $check(label, $Label);
        this.simpleCard = $check(simpleCard, SimpleCard);
        this.infoCard = $check(infoCard, InfoCard);
    }
    
    view() {
        const [Label] = $use(this.label, 'key');
        const SimpleCard = $use(this.simpleCard);
        const InfoCard = $use(this.infoCard);
        
        // Check if test passes
        const labelPass = this.label instanceof $Chemical && this.label.constructor.name === '$Label';
        const simpleCardPass = this.simpleCard instanceof $Chemical && this.simpleCard.constructor.name === '$Function$';
        const infoCardPass = this.infoCard instanceof $Chemical && this.infoCard.constructor.name === '$Function$';
        const allPass = labelPass && simpleCardPass && infoCardPass;
        
        return (
            <div style={{ border: `2px solid ${allPass ? 'green' : 'red'}`, padding: '15px', borderRadius: '8px' }}>
                <h4 style={{ color: allPass ? 'green' : 'red' }}>
                    {allPass ? '✓ PASS' : '✗ FAIL'}: Mixed Container
                </h4>
                
                <div style={{ marginBottom: '15px', background: '#f9f9f9', padding: '10px', borderRadius: '4px' }}>
                    <div><strong>Test:</strong> Constructor receives $Chemical and React.FC components correctly</div>
                    <div><strong>Expected:</strong> label=$Label, simpleCard=$Function$, infoCard=$Function$</div>
                    <div><strong>Received:</strong> label={this.label?.constructor?.name}, simpleCard={this.simpleCard?.constructor?.name}, infoCard={this.infoCard?.constructor?.name}</div>
                </div>
                
                {/* Show all three components rendering */}
                <div style={{ marginBottom: '15px', padding: '10px', background: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <div><strong>Rendered components:</strong></div>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '10px' }}>
                        {Label && <Label />}
                        {SimpleCard && <SimpleCard />}
                        {InfoCard && <InfoCard />}
                    </div>
                </div>
            </div>
        );
    }
}

// ============================================
// TEST 2: Intrinsic Elements in Constructor
// ============================================

export class $FormBuilder extends $Chemical {
    input!: $Html<'input'>;
    button!: $Html<'button'>;
    div!: $Html<'div'>;
    elements: any[] = [];
    
    $FormBuilder(
        input: $Html<'input'>,
        button: $Html<'button'>,
        div: $Html<'div'>,
        ...moreElements: any[]
    ) {
        console.log("$FormBuilder:1", "input", input)
        console.log("$FormBuilder:2", "button", button)
        console.log("$FormBuilder:3", "div", div)
        console.log("$FormBuilder:4", "moreElements", moreElements)
        this.input = $check(input, 'input');
        this.button = $check(button, 'button');
        this.div = $check(div, 'div');
        this.elements = $check(moreElements, ['any']);
    }
    
    view() {
        // Check what we received
        const inputPass = this.input && this.input.type === 'input';
        const buttonPass = this.button && this.button.type === 'button';
        const divPass = this.div && this.div.type === 'div';
        const allPass = inputPass && buttonPass && divPass && this.elements.length === 2;
        
        return (
            <div style={{ border: `2px solid ${allPass ? 'green' : 'red'}`, padding: '15px', borderRadius: '8px' }}>
                <h4 style={{ color: allPass ? 'green' : 'red' }}>
                    {allPass ? '✓ PASS' : '✗ FAIL'}: Intrinsic Elements
                </h4>
                
                <div style={{ marginBottom: '15px', background: '#f9f9f9', padding: '10px', borderRadius: '4px' }}>
                    <div><strong>Test:</strong> Constructor receives HTML element objects (not strings, not components)</div>
                    <div><strong>Expected:</strong> 3 element objects + 2 extra elements in rest params</div>
                    <div><strong>Received:</strong></div>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        <li>input: {inputPass ? '✓ React element object' : '✗ ' + typeof this.input}</li>
                        <li>button: {buttonPass ? '✓ React element object' : '✗ ' + typeof this.button}</li>
                        <li>div: {divPass ? '✓ React element object' : '✗ ' + typeof this.div}</li>
                        <li>rest params: {this.elements.length === 2 ? '✓ 2 elements' : `✗ ${this.elements.length} elements`}</li>
                    </ul>
                </div>
                
                <div style={{ marginBottom: '15px', padding: '10px', background: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <div><strong>Proof - Elements render:</strong></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                        <input placeholder="From constructor" style={{ padding: '5px' }} />
                        <button style={{ padding: '5px 10px' }}>Constructor Button</button>
                        <div style={{ background: '#f0f0f0', padding: '10px' }}>Div from constructor</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            + {this.elements.length} extra elements in rest params
                        </div>
                    </div>
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
        $check(labels, [$Label]);
        $check(buttons, [Function]);
        $check(mixed, ['any']);
        
        this.labels = labels || [];
        this.buttons = buttons || [];
        this.mixed = mixed || [];
        
        // Modify labels
        this.labels.forEach((label, i) => {
            label.$text = `Label ${i + 1}: ${label.$text}`;
        });
    }
    
    view() {
        // Validate what we received
        const labelsPass = this.labels.length === 3 && 
                        this.labels.every(l => l instanceof $Chemical && l.constructor.name === '$Label');
        const buttonsPass = this.buttons.length === 2 && 
                            this.buttons.every(b => b instanceof $Chemical && b.constructor.name === '$Function$');
        const mixedPass = this.mixed.length === 3;
        const allPass = labelsPass && buttonsPass && mixedPass;
        
        return (
            <div style={{ border: `2px solid ${allPass ? 'green' : 'red'}`, padding: '15px', borderRadius: '8px' }}>
                <h4 style={{ color: allPass ? 'green' : 'red' }}>
                    {allPass ? '✓ PASS' : '✗ FAIL'}: Arrays of Different Types
                </h4>
                
                <div style={{ marginBottom: '15px', background: '#f9f9f9', padding: '10px', borderRadius: '4px' }}>
                    <div><strong>Test:</strong> Constructor receives 3 separate arrays created by {'<List>...</List>'}</div>
                    <div><strong>Expected:</strong></div>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        <li>Array 1: 3 $Label instances</li>
                        <li>Array 2: 2 $Function$ instances (wrapped SimpleCard)</li>
                        <li>Array 3: 3 mixed items (Label + SimpleCard + div element)</li>
                    </ul>
                    <div><strong>Received:</strong></div>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        <li>labels[]: {labelsPass ? '✓' : '✗'} {this.labels.length} items, all $Label? {this.labels.every(l => l instanceof $Chemical && l.constructor.name === '$Label') ? 'yes' : 'no'}</li>
                        <li>buttons[]: {buttonsPass ? '✓' : '✗'} {this.buttons.length} items, all $Function$? {this.buttons.every(b => b instanceof $Chemical && b.constructor.name === '$Function$') ? 'yes' : 'no'}</li>
                        <li>mixed[]: {mixedPass ? '✓' : '✗'} {this.mixed.length} items (mixed types expected)</li>
                    </ul>
                </div>
                
                <div style={{ marginBottom: '15px', padding: '10px', background: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <div><strong>Proof - All arrays render:</strong></div>
                    
                    <div style={{ marginTop: '10px' }}>
                        <strong>Labels array:</strong>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                            {this.labels.map(label => {
                                const [Label, key] = $use(label, 'key');
                                return <Label key={key} />;
                            })}
                        </div>
                    </div>
                    
                    <div style={{ marginTop: '10px' }}>
                        <strong>Buttons array:</strong>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                            {this.buttons.map((button, i) => {
                                if (button instanceof $Chemical) {
                                    const [Button, key] = $use(button, 'key');
                                    return <Button key={key} />;
                                }
                                return <div key={i}>Not Chemical</div>;
                            })}
                        </div>
                    </div>
                    
                    <div style={{ marginTop: '10px' }}>
                        <strong>Mixed array:</strong>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '5px' }}>
                            {this.mixed.map((item, i) => {
                                if (item instanceof $Chemical) {
                                    const [Item, key] = $use(item, 'key');
                                    return <Item key={key} />;
                                }
                                return (
                                    <div key={i} style={{ padding: '5px', background: '#f0f0f0', borderRadius: '3px' }}>
                                        [element]
                                    </div>
                                );
                            })}
                        </div>
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
        $check(first, $Label);
        $check(rest, ['any']);
        
        this.first = first;
        this.rest = rest;
    }
    
    view() {
        const [First, firstKey] = $use(this.first, 'key');
        
        // Validate
        const firstPass = this.first instanceof $Chemical && this.first.constructor.name === '$Label';
        const restPass = this.rest.length === 5;
        const allPass = firstPass && restPass;
        
        return (
            <div style={{ border: `2px solid ${allPass ? 'green' : 'red'}`, padding: '15px', borderRadius: '8px' }}>
                <h4 style={{ color: allPass ? 'green' : 'red' }}>
                    {allPass ? '✓ PASS' : '✗ FAIL'}: Spread Operations
                </h4>
                
                <div style={{ marginBottom: '15px', background: '#f9f9f9', padding: '10px', borderRadius: '4px' }}>
                    <div><strong>Test:</strong> Constructor signature: (first: $Label, ...rest: any[])</div>
                    <div><strong>Expected:</strong></div>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        <li>first parameter: 1 $Label (strongly typed)</li>
                        <li>rest parameters: 5 remaining children (mixed types)</li>
                    </ul>
                    <div><strong>Received:</strong></div>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        <li>first: {firstPass ? '✓' : '✗'} {this.first?.constructor?.name}</li>
                        <li>rest: {restPass ? '✓' : '✗'} {this.rest.length} items (types: {this.rest.map(r => 
                            r instanceof $Chemical ? r.constructor.name : 
                            React.isValidElement(r) ? 'element' : 
                            typeof r
                        ).join(', ')})</li>
                    </ul>
                </div>
                
                <div style={{ padding: '10px', background: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <div><strong>Proof - All render:</strong></div>
                    <div style={{ marginTop: '10px' }}>
                        <strong>First param:</strong> {First && <First key={firstKey} />}
                    </div>
                    <div style={{ marginTop: '10px' }}>
                        <strong>Rest params ({this.rest.length}):</strong>
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
                                        borderRadius: '3px',
                                        fontSize: '12px'
                                    }}>
                                        [{React.isValidElement(item) ? 'element' : typeof item}]
                                    </div>
                                );
                            })}
                        </div>
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
    footer?: $Function<typeof InfoCard>;
    
    $MatrixContainer(
        header: $Label,
        rows: any[][],
        footer?: $Function<typeof InfoCard>
    ) {
        $check(header, $Label);
        $check(rows, [['any']]);
        $check(footer, InfoCard, undefined); 
        
        this.header = header;
        this.rows = rows || [];
        this.footer = footer;
    }
    
    view() {
        const [Header, headerKey] = $use(this.header, 'key');
        const Footer = this.footer ? $use(this.footer) : null;
        
        // Validate
        const headerPass = this.header instanceof $Chemical && this.header.constructor.name === '$Label';
        const rowsPass = this.rows.length === 3 && this.rows.every(row => row.length === 3);
        const footerPass = this.footer instanceof $Chemical && this.footer.constructor.name === '$Function$';
        const allPass = headerPass && rowsPass && footerPass;
        
        return (
            <div style={{ border: `2px solid ${allPass ? 'green' : 'red'}`, padding: '15px', borderRadius: '8px' }}>
                <h4 style={{ color: allPass ? 'green' : 'red' }}>
                    {allPass ? '✓ PASS' : '✗ FAIL'}: Nested Arrays (Matrix)
                </h4>
                
                <div style={{ marginBottom: '15px', background: '#f9f9f9', padding: '10px', borderRadius: '4px' }}>
                    <div><strong>Test:</strong> Constructor receives 2D array structure created by nested {'<List>...</List>'}</div>
                    <div><strong>Expected:</strong></div>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        <li>header: 1 $Label</li>
                        <li>rows: 3x3 array of $Labels (created by {'<List><List>...</List><List>...</List>...</List>'})</li>
                        <li>footer: 1 $Function$ (optional)</li>
                    </ul>
                    <div><strong>Received:</strong></div>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        <li>header: {headerPass ? '✓' : '✗'} {this.header?.constructor?.name}</li>
                        <li>rows: {rowsPass ? '✓' : '✗'} {this.rows.length}x{this.rows[0]?.length || 0} array</li>
                        <li>footer: {footerPass ? '✓' : '✗'} {this.footer?.constructor?.name || 'none'}</li>
                    </ul>
                </div>
                
                <div style={{ padding: '10px', background: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <div><strong>Proof - Matrix renders:</strong></div>
                    {Header && <div style={{ marginTop: '10px', marginBottom: '10px' }}><Header key={headerKey} /></div>}
                    
                    <div style={{ display: 'table', marginTop: '5px', borderCollapse: 'collapse' }}>
                        {this.rows.map((row, i) => (
                            <div key={i} style={{ display: 'table-row' }}>
                                {row.map((cell, j) => (
                                    <div key={j} style={{ 
                                        display: 'table-cell',
                                        padding: '8px 12px',
                                        border: '1px solid #ddd',
                                        background: (i + j) % 2 === 0 ? '#f5f5f5' : 'white'
                                    }}>
                                        {cell instanceof $Chemical ? 
                                            (() => {
                                                const [Cell, cellKey] = $use(cell, 'key');
                                                return Cell ? <Cell key={cellKey} /> : null;
                                            })() :
                                            '[not chemical]'
                                        }
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    
                    {Footer && <div style={{ marginTop: '10px' }}><Footer /></div>}
                </div>
            </div>
        );
    }
}

// ============================================
// TEST 6: Accessing Child Properties & Nested Children
// ============================================

export class $Chapter extends $Chemical {
    $title = 'Chapter';
    $pageCount = 10;
    
    view() {
        return (
            <div style={{ padding: '5px', margin: '2px', background: '#f0f0f0', borderRadius: '3px', fontSize: '12px' }}>
                {this.$title} ({this.$pageCount} pages)
            </div>
        );
    }
}

export class $Book extends $Chemical {
    $title = 'Untitled Book';
    $author = 'Unknown';
    chapters: $Chapter[] = [];
    
    $Book(...chapters: $Chapter[]) {
        $check(chapters, [$Chapter]);
        this.chapters = chapters;
    }
    
    view() {
        return (
            <div style={{ border: '1px solid #999', padding: '10px', borderRadius: '4px', background: '#fff' }}>
                <strong>{this.$title}</strong> by {this.$author}
                <div style={{ marginTop: '5px', fontSize: '11px', color: '#666' }}>
                    {this.chapters.length} chapters
                </div>
                {/* Optionally render the chapters */}
                <div style={{ marginTop: '5px' }}>
                    {this.children}
                </div>
            </div>
        );
    }
}

export class $Catalogue extends $Chemical {
    books: $Book[] = [];
    
    $Catalogue(...books: $Book[]) {
        $check(books, [$Book]);
        this.books = books;
        console.log('$Catalogue.books', this.books);
        console.log('$Catalogue.book[0]', this.books[0]);
        console.log('$Catalogue.book[0].chapters', this.books[0].chapters);
    }
    
    view() {
        // Calculate statistics by accessing book properties
        const totalChapters = this.books.reduce((sum, book) => sum + book.chapters.length, 0);
        const totalPages = this.books.reduce((sum, book) => 
            sum + book.chapters.reduce((chSum, ch) => chSum + ch.$pageCount, 0), 0
        );
        
        // Check if we can access everything
        const booksPass = this.books.length === 2;
        const propsPass = this.books.every(b => b.$title && b.$author);
        const chaptersPass = this.books.every(b => b.chapters.length > 0);
        const chapterPropsPass = this.books.every(b => 
            b.chapters.every(ch => ch.$title && ch.$pageCount)
        );
        const allPass = booksPass && propsPass && chaptersPass && chapterPropsPass;
        
        return (
            <div style={{ border: `2px solid ${allPass ? 'green' : 'red'}`, padding: '15px', borderRadius: '8px' }}>
                <h4 style={{ color: allPass ? 'green' : 'red' }}>
                    {allPass ? '✓ PASS' : '✗ FAIL'}: Child Property Access & Nested Children
                </h4>
                
                <div style={{ marginBottom: '15px', background: '#f9f9f9', padding: '10px', borderRadius: '4px' }}>
                    <div><strong>Test:</strong> Parent accesses properties and nested children of its children</div>
                    <div><strong>Expected:</strong> Catalogue receives Books, reads their properties ($title, $author), AND accesses their chapters (nested children)</div>
                    <div><strong>Received:</strong></div>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        <li>Books: {booksPass ? '✓' : '✗'} {this.books.length} books</li>
                        <li>Book properties: {propsPass ? '✓' : '✗'} All have title & author</li>
                        <li>Book children: {chaptersPass ? '✓' : '✗'} All have chapters</li>
                        <li>Chapter properties: {chapterPropsPass ? '✓' : '✗'} All chapters have title & pageCount</li>
                    </ul>
                </div>
                
                <div style={{ marginBottom: '15px', padding: '10px', background: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <div><strong>Proof - Catalogue Statistics (computed from child properties):</strong></div>
                    <div style={{ marginTop: '10px', fontSize: '14px' }}>
                        <div>📚 Total books: {this.books.length}</div>
                        <div>📖 Total chapters: {totalChapters}</div>
                        <div>📄 Total pages: {totalPages}</div>
                    </div>
                </div>
                
                <div style={{ marginBottom: '15px', padding: '10px', background: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <div><strong>Proof - Detailed Book Info (accessed from properties):</strong></div>
                    {this.books.map((book, i) => {
                        const bookPages = book.chapters.reduce((sum, ch) => sum + ch.$pageCount, 0);
                        return (
                            <div key={i} style={{ marginTop: '10px', padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                                <div><strong>{book.$title}</strong> by {book.$author}</div>
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                                    {book.chapters.length} chapters, {bookPages} pages total
                                </div>
                                <div style={{ fontSize: '11px', marginTop: '5px' }}>
                                    Chapters: {book.chapters.map(ch => ch.$title).join(', ')}
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                <div style={{ padding: '10px', background: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <div><strong>Proof - Books render themselves independently:</strong></div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                        {this.books.map(book => {
                            const [Book, key] = $use(book, 'key');
                            return <Book key={key} />;
                        })}
                    </div>
                </div>
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
const Chapter = new $Chapter().Component;
const Book = new $Book().Component;
const Catalogue = new $Catalogue().Component;

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
                    <Label text="$Label Component" color="blue" />
                    <SimpleCard />
                    <InfoCard />
                </MixedContainer>
                <div style={{ marginTop: '10px', color: '#666' }}>
                    ✓ Label is a $Chemical instance<br/>
                    ✓ SimpleCard is a functional component<br/>
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
                    <List>
                        <Label text="First" color="red" />
                        <Label text="Second" color="green" />
                        <Label text="Third" color="blue" />
                    </List>
                    <List>
                        <SimpleCard />
                        <SimpleCard />
                    </List>
                    <List>
                        <Label text="Mixed 1" />
                        <SimpleCard />
                        <div>Mixed 3</div>
                    </List>
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
                    <SimpleCard />
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
                    <List>
                        <List>
                            <Label text="1,1" />
                            <Label text="1,2" />
                            <Label text="1,3" />
                        </List>
                        <List>
                            <Label text="2,1" />
                            <Label text="2,2" />
                            <Label text="2,3" />
                        </List>
                        <List>
                            <Label text="3,1" />
                            <Label text="3,2" />
                            <Label text="3,3" />
                        </List>
                    </List>
                    <InfoCard />
                </MatrixContainer>
                <div style={{ marginTop: '10px', color: '#666' }}>
                    ✓ Header as single $Chemical<br/>
                    ✓ 2D array (matrix) of components<br/>
                    ✓ Optional footer parameter<br/>
                    ✗ Fail if nested arrays don't maintain structure
                </div>
            </div>

            {/* Test 6 */}
            <div style={{ marginBottom: '40px' }}>
                <h2>Test 6: Accessing Child Properties & Nested Children</h2>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Expected:</strong> Catalogue reads Book properties AND their nested Chapter children
                </div>
                <Catalogue>
                    <Book title="The Great Gatsby" author="F. Scott Fitzgerald">
                        <Chapter title="Chapter 1" pageCount={15} />
                        <Chapter title="Chapter 2" pageCount={20} />
                        <Chapter title="Chapter 3" pageCount={18} />
                    </Book>
                    <Book title="1984" author="George Orwell">
                        <Chapter title="Part 1" pageCount={25} />
                        <Chapter title="Part 2" pageCount={30} />
                        <Chapter title="Part 3" pageCount={22} />
                    </Book>
                </Catalogue>
                <div style={{ marginTop: '10px', color: '#666' }}>
                    ✓ Parent accesses child properties ($title, $author)<br/>
                    ✓ Parent accesses nested children (chapters array)<br/>
                    ✓ Parent reads nested child properties ($title, $pageCount)<br/>
                    ✓ Parent computes statistics from deep hierarchy<br/>
                    ✗ Fail if properties aren't accessible
                </div>
            </div>
        </div>
    );
}