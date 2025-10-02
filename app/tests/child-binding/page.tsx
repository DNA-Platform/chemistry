// app > tests > child-binding
'use client'
import { $Chemical, $ } from '@/chemistry';
import React from 'react';

// Test 1: Basic children as constructor arguments
export class $Chapter extends $Chemical {
    $title = 'Default Chapter';
    $page = 1;
    
    view() {
        return (
            <div style={{ 
                padding: '8px', 
                margin: '4px',
                background: '#f0f0f0',
                borderRadius: '4px' 
            }}>
                Chapter: {this.$title} (Page {this.$page})
            </div>
        );
    }
}

export class $Book extends $Chemical {
    chapters: $Chapter[] = [];
    
    $Book(...chapters: $Chapter[]) {
        console.log('$Book constructor called with', chapters.length, 'chapters');
        chapters.forEach(ch => console.log('Chapter title:', ch.$title));
        this.chapters = chapters;
    }
    
    view() {
        return (
            <div style={{ 
                border: '2px solid #333', 
                padding: '15px',
                borderRadius: '8px'
            }}>
                <h3>Book with {this.chapters.length} chapters</h3>
                <div>
                    {this.chapters.map((chapter, i) => {
                        const Chapter = chapter.$Component;
                        return <Chapter key={chapter.$key || chapter.$cid || i} />;
                    })}
                </div>
            </div>
        );
    }
}

// Test 2: Mixed types with structural components
export class $Title extends $Chemical {
    $text = 'Untitled';
    
    view() {
        return <h2 style={{ color: '#444', marginBottom: '10px' }}>{this.$text}</h2>;
    }
}

export class $Footer extends $Chemical {
    $copyright = '© 2024';
    
    view() {
        return (
            <div style={{ 
                marginTop: '15px', 
                paddingTop: '10px',
                borderTop: '1px solid #ccc',
                fontSize: '12px',
                color: '#666'
            }}>
                {this.$copyright}
            </div>
        );
    }
}

export class $Document extends $Chemical {
    title?: $Title;
    chapters: $Chapter[] = [];
    footer?: $Footer;
    
    $Document(title: $Title, chapters: $Chapter[], footer: $Footer) {
        console.log('$Document constructor:', { 
            titleText: title?.$text,
            chapterCount: chapters?.length,
            footerText: footer?.$copyright
        });
        this.title = title;
        this.chapters = chapters || [];
        this.footer = footer;
    }
    
    view() {
        const Title = this.title?.$Component;
        const Footer = this.footer?.$Component;
        
        return (
            <div style={{ 
                border: '2px solid #666',
                padding: '20px',
                borderRadius: '8px',
                background: '#fafafa'
            }}>
                <div style={{ color: 'blue', fontSize: '10px', marginBottom: '10px' }}>
                    Document received: title={this.title ? '✓' : '✗'}, 
                    chapters={this.chapters.length}, 
                    footer={this.footer ? '✓' : '✗'}
                </div>
                {Title && <Title />}
                {this.chapters.map((chapter, i) => {
                    const Chapter = chapter.$Component;
                    return <Chapter key={chapter.$key || chapter.$cid || i} />;
                })}
                {Footer && <Footer />}
            </div>
        );
    }
}

// Test 3: Polymorphism - subclasses as children
export class $FancyChapter extends $Chapter {
    $color = 'gold';
    
    view() {
        return (
            <div style={{ 
                padding: '10px',
                margin: '5px',
                background: this.$color,
                border: '2px solid #888',
                borderRadius: '6px',
                fontWeight: 'bold'
            }}>
                ✨ Fancy Chapter: {this.$title} (Page {this.$page})
            </div>
        );
    }
}

export class $PolyBook extends $Chemical {
    chapters: $Chapter[] = [];
    
    $PolyBook(...chapters: $Chapter[]) {
        console.log('$PolyBook received chapters:', chapters);
        this.chapters = chapters;
        
        this.chapters.forEach((ch, i) => {
            if (ch instanceof $FancyChapter) {
                console.log(`Chapter ${i} is fancy!`);
            }
        });
    }
    
    view() {
        return (
            <div style={{ 
                border: '3px solid purple',
                padding: '15px',
                borderRadius: '8px'
            }}>
                <h3>Polymorphic Book</h3>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '10px' }}>
                    Regular chapters: {this.chapters.filter(c => !(c instanceof $FancyChapter)).length} | 
                    Fancy chapters: {this.chapters.filter(c => c instanceof $FancyChapter).length}
                </div>
                {this.children}
            </div>
        );
    }
}

// Test 4: Dynamic binding and instance control
export class $Section extends $Chemical {
    $name = 'Section';
    items: string[] = [];
    
    addItem(item: string) {
        console.log(`Adding "${item}" to section ${this.$name}`);
        this.items.push(item);
    }
    
    view() {
        return (
            <div style={{
                padding: '10px',
                margin: '5px',
                border: '1px dashed #999',
                borderRadius: '4px'
            }}>
                <strong>{this.$name}</strong>
                <ul>
                    {this.items.map((item, i) => (
                        <li key={i}>{item}</li>
                    ))}
                </ul>
            </div>
        );
    }
}

export class $Article extends $Chemical {
    sections: $Section[] = [];
    
    $Article(...sections: $Section[]) {
        console.log('$Article constructor with', sections.length, 'sections');
        this.sections = sections;
        
        this.sections.forEach((section, i) => {
            section.addItem(`Auto-added by Article at index ${i}`);
        });
    }
    
    $addToAllSections(text: string) {
        this.sections.forEach(section => {
            section.addItem(text);
        });
    }
    
    view() {
        return (
            <div style={{
                border: '2px solid green',
                padding: '15px',
                borderRadius: '8px'
            }}>
                <h3>Article with Dynamic Sections</h3>
                <button 
                    onClick={() => this.$addToAllSections(`Added at ${new Date().toLocaleTimeString()}`)}
                    style={{
                        padding: '8px 16px',
                        marginBottom: '10px',
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Add to All Sections
                </button>
                <div>
                    {this.sections.map(section => {
                        const Section = section.$Component;
                        return <Section />;
                    })}
                </div>
            </div>
        );
    }
}

// Test 5: Constructor validation
export class $StrictContainer extends $Chemical {
    header?: $Title;
    content: $Chapter[] = [];
    
    $StrictContainer(header: $Title, ...content: $Chapter[]) {
        console.log('$StrictContainer validating inputs...');
        
        if (!header) {
            console.error('Warning: No header provided!');
        }
        
        if (content.length === 0) {
            console.error('Warning: No content provided!');
        }
        
        if (content.length > 3) {
            console.warn('Warning: More than 3 chapters, only taking first 3');
            this.content = content.slice(0, 3);
        } else {
            this.content = content;
        }
        
        this.header = header;
    }
    
    view() {
        const Header = this.header?.$Component;
        
        return (
            <div style={{
                border: '2px solid red',
                padding: '15px',
                borderRadius: '8px',
                background: '#fff5f5'
            }}>
                <div style={{ color: 'red', fontSize: '11px', marginBottom: '10px' }}>
                    Strict Container - Header: {this.header ? '✓' : '✗ MISSING'} | 
                    Content: {this.content.length} items
                </div>
                {Header && <Header />}
                {this.content.map(chapter => {
                    const Chapter = chapter.$Component;
                    return <Chapter />;
                })}
            </div>
        );
    }
}

// Test 6: Nested arrays
export class $NestedChild extends $Chemical {
    $value = '';
    
    view() {
        return (
            <span style={{
                padding: '2px 6px',
                margin: '2px',
                background: '#e0e0e0',
                borderRadius: '3px',
                display: 'inline-block'
            }}>
                {this.$value}
            </span>
        );
    }
}

export class $NestedContainer extends $Chemical {
    groups: any[][] = [];
    
    $NestedContainer(...groups: any[]) {
        console.log('$NestedContainer received:', groups);
        // Arrays of Chemicals from $ structural component
        this.groups = groups.filter(g => Array.isArray(g));
        console.log('Filtered to', this.groups.length, 'groups');
        
        // Log what's in each group
        this.groups.forEach((group, i) => {
            console.log(`Group ${i}:`, group.map(item => 
                item instanceof $Chemical ? `${item.constructor.name}[${item.$cid}]` : typeof item
            ));
        });
    }
    
    view() {
        return (
            <div style={{
                border: '2px solid teal',
                padding: '15px',
                borderRadius: '8px'
            }}>
                <h3>Nested Container</h3>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '10px' }}>
                    Groups: {this.groups.length} | 
                    Total items: {this.groups.reduce((acc, g) => acc + g.length, 0)}
                </div>
                <div>
                    {this.groups.map((group, i) => (
                        <div key={i} style={{
                            margin: '5px',
                            padding: '5px',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                        }}>
                            <div>Group {i + 1}: {group.length} items</div>
                            <div style={{ marginTop: '5px' }}>
                                {group.map((item, j) => {
                                    if (item instanceof $Chemical) {
                                        const ItemComponent = item.Component;
                                        return <ItemComponent key={j} />;
                                    }
                                    return <span key={j}>{String(item)}</span>;
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

// Export components the Chemistry way
const Chapter = new $Chapter().Component;
const Book = new $Book().Component;
const Title = new $Title().Component;
const Footer = new $Footer().Component;
const Document = new $Document().Component;
const FancyChapter = new $FancyChapter().Component;
const PolyBook = new $PolyBook().Component;
const Section = new $Section().Component;
const Article = new $Article().Component;
const StrictContainer = new $StrictContainer().Component;
const NestedChild = new $NestedChild().Component;
const NestedContainer = new $NestedContainer().Component;

export default function ChildBindingTest() {
    return (
        <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
            <h1>Child Binding Tests</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Testing Chemistry's revolutionary children-as-constructor-arguments system.
            </p>
            
            {/* Test 1: Basic children binding */}
            <div style={{ marginBottom: '40px' }}>
                <h2>Test 1: Basic Children as Constructor Args</h2>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Expected:</strong> Book receives 3 Chapter instances in constructor
                </div>
                <Book>
                    <Chapter title="Introduction" page={1} />
                    <Chapter title="Main Content" page={10} />
                    <Chapter title="Conclusion" page={100} />
                </Book>
                <div style={{ marginTop: '10px', color: '#666' }}>
                    ✓ Check console - should log "3 chapters"<br/>
                    ✓ Book should display all chapters<br/>
                    ✗ Fail if chapters don't appear or constructor not called
                </div>
            </div>
            
            {/* Test 2: Mixed types with $Array */}
            <div style={{ marginBottom: '40px' }}>
                <h2>Test 2: Mixed Types with $ (Array) Structural Component</h2>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Expected:</strong> Document receives title, array of chapters, and footer
                </div>
                <Document>
                    <Title text="My Document" />
                    <$>
                        <Chapter title="Chapter 1" page={1} />
                        <Chapter title="Chapter 2" page={20} />
                        <Chapter title="Chapter 3" page={40} />
                    </$>
                    <Footer copyright="© 2024 Chemistry Framework" />
                </Document>
                <div style={{ marginTop: '10px', color: '#666' }}>
                    ✓ Document shows it received all three argument types<br/>
                    ✓ Chapters grouped as array via {'<$>'}<br/>
                    ✗ Fail if structure isn't parsed correctly
                </div>
            </div>
            
            {/* Test 3: Polymorphism */}
            <div style={{ marginBottom: '40px' }}>
                <h2>Test 3: Polymorphic Children</h2>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Expected:</strong> PolyBook accepts both Chapter and FancyChapter subclasses
                </div>
                <PolyBook>
                    <Chapter title="Regular 1" page={1} />
                    <FancyChapter title="Special" page={50} color="gold" />
                    <Chapter title="Regular 2" page={100} />
                    <FancyChapter title="Premium" page={150} color="silver" />
                </PolyBook>
                <div style={{ marginTop: '10px', color: '#666' }}>
                    ✓ Book accepts mixed Chapter types<br/>
                    ✓ Console logs detection of FancyChapter instances<br/>
                    ✓ Each renders with correct appearance<br/>
                    ✗ Fail if polymorphism doesn't work
                </div>
            </div>
            
            {/* Test 4: Dynamic binding */}
            <div style={{ marginBottom: '40px' }}>
                <h2>Test 4: Parent Manipulating Children</h2>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Expected:</strong> Article can call methods on Section children
                </div>
                <Article>
                    <Section name="Introduction" />
                    <Section name="Methods" />
                    <Section name="Results" />
                </Article>
                <div style={{ marginTop: '10px', color: '#666' }}>
                    ✓ Each section auto-populated by Article constructor<br/>
                    ✓ Button adds to all sections simultaneously<br/>
                    ✓ Parent maintains references to children<br/>
                    ✗ Fail if parent can't control children
                </div>
            </div>
            
            {/* Test 5: Constructor validation */}
            <div style={{ marginBottom: '40px' }}>
                <h2>Test 5: Constructor Validation</h2>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Expected:</strong> StrictContainer validates its inputs
                </div>
                <StrictContainer>
                    <Chapter title="Only Content" page={1} />
                    <Chapter title="No Header Warning" page={2} />
                </StrictContainer>
                <div style={{ marginTop: '10px', color: '#666' }}>
                    ✓ Console warns about missing header<br/>
                    ✓ Container shows validation state<br/>
                    ✗ Fail if validation doesn't run
                </div>
                
                <div style={{ marginTop: '20px' }}>
                    <strong>With too many chapters:</strong>
                </div>
                <StrictContainer>
                    <Title text="Valid Header" />
                    <Chapter title="Ch1" page={1} />
                    <Chapter title="Ch2" page={2} />
                    <Chapter title="Ch3" page={3} />
                    <Chapter title="Ch4 - Should be ignored" page={4} />
                    <Chapter title="Ch5 - Should be ignored" page={5} />
                </StrictContainer>
                <div style={{ marginTop: '10px', color: '#666' }}>
                    ✓ Console warns about too many chapters<br/>
                    ✓ Only first 3 chapters used
                </div>
            </div>
            
            {/* Test 6: Nested arrays */}
            <div style={{ marginBottom: '40px' }}>
                <h2>Test 6: Nested Arrays with Multiple $ Groups</h2>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Expected:</strong> Container receives multiple array groups
                </div>
                <NestedContainer>
                    <$>
                        <NestedChild value="Group1-Item1" />
                        <NestedChild value="Group1-Item2" />
                        <NestedChild value="Group1-Item3" />
                    </$>
                    <$>
                        <NestedChild value="Group2-Item1" />
                        <NestedChild value="Group2-Item2" />
                    </$>
                    <$>
                        <NestedChild value="Group3-Item1" />
                    </$>
                </NestedContainer>
                <div style={{ marginTop: '10px', color: '#666' }}>
                    ✓ Container receives 3 separate arrays<br/>
                    ✓ Each $ creates a new array argument<br/>
                    ✓ Arrays maintain their grouping<br/>
                    ✗ Fail if arrays merge or structure breaks
                </div>
            </div>
            
            <div style={{ marginTop: '40px', padding: '20px', background: '#f0f8ff', borderRadius: '8px' }}>
                <h3>🔍 Check Console for Detailed Logs</h3>
                <p>
                    The constructor methods log their arguments to help verify the binding system works correctly.
                    Open the browser console to see how children are transformed into constructor arguments!
                </p>
            </div>
        </div>
    );
}