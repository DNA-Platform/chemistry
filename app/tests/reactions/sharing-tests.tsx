// app/tests/dependencies/sharing-tests.tsx
'use client'
import { $Chemical, $use, $check } from '@/chemistry';
import React from 'react';

// ============================================
// SIMPLE TITLE COMPONENT
// ============================================

class $Title extends $Chemical {
    $value = 'Title';
    
    view() {
        return (
            <div style={{ 
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '10px',
                color: '#333'
            }}>
                {this.$value}
            </div>
        );
    }
}

// ============================================
// SIMPLE CARD COMPONENT
// ============================================

class $Card extends $Chemical {
    // Simple properties that can be overridden via TSX
    $background? = '#e3f2fd';  // Light blue default - optional in TSX
    $name? = 'Card';      // Optional in TSX
    $text? = 'Text';      // Optional in TSX
    $border? = '2px solid #1976d2';  // Optional in TSX
    
    // Track instance (not TSX properties, no $)
    id = Math.random().toString(36).substr(2, 5);
    updateCount = 0;
    
    changeBackground() {
        // Generate a light random color
        const hue = Math.floor(Math.random() * 360);
        this.$background = `hsl(${hue}, 70%, 90%)`;
        this.updateCount++;
    }
    
    changeName() {
        let name = this.$name || '';
        if (name.length < 2) name = "Card"
        this.$name = `${name[name.length-1].toUpperCase()}${name.slice(0, name.length-1).toLowerCase()}`;
    }

    changeText() {
        this.$text = `Text Updated ${this.updateCount++}`;
    }
    
    changeBorder() {
        const styles = ['solid', 'dashed', 'dotted', 'double'];
        const currentStyle = this.$border!.split(' ')[1];
        const nextIndex = (styles.indexOf(currentStyle) + 1) % styles.length;
        this.$border = `2px ${styles[nextIndex]} #1976d2`;
        this.updateCount++;
    }
    
    view() {
        return (
            <div style={{ 
                padding: '20px',
                background: this.$background,
                border: this.$border,
                borderRadius: '8px',
                marginBottom: '10px',
                position: 'relative'
            }}>
                <div style={{ 
                    position: 'absolute', 
                    top: '5px', 
                    right: '5px',
                    fontSize: '10px',
                    color: '#666',
                    background: 'white',
                    padding: '2px 5px',
                    borderRadius: '3px'
                }}>
                    ID: {this.id}
                </div>
                
                <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '16px' }}>
                    {this.$name}
                </div>
                
                <div style={{ fontSize: '11px', color: '#444', marginBottom: '10px' }}>
                    <div>Updates: {this.updateCount}</div>
                    <div>Text: {this.$text}</div>
                    <div>Border: {this.$border}</div>
                    <div>Background: {this.$background}</div>
                </div>
                
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    <button 
                        onClick={this.changeName}
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                    >
                        Change Name
                    </button>
                    <button 
                        onClick={this.changeText}
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                    >
                        Change Text
                    </button>
                    <button 
                        onClick={() => this.changeBackground()}
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                    >
                        Change BG
                    </button>
                    <button 
                        onClick={this.changeBorder}
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                    >
                        Change Border
                    </button>
                </div>
            </div>
        );
    }
}

// ============================================
// CARD CONTAINER - Takes ONE card
// ============================================

class $CardContainer extends $Chemical {
    title!: $Title;
    card!: $Card;
    
    $CardContainer(title: $Title, card: $Card) {
        this.title = $check(title, $Title);
        this.card = $check(card, $Card);
    }
    
    view() {
        const Title = $use(this.title);
        const Card = $use(this.card);
        
        return (
            <div style={{ 
                padding: '15px',
                background: '#f5f5f5',
                border: '2px solid #999',
                borderRadius: '8px',
                marginBottom: '15px'
            }}>
                <Title />
                <Card />
            </div>
        );
    }
}
// ============================================
// TEST 1: SINGLE CARD INSTANCE - RENDERED WITH SHADOWS
// ============================================

class $BoundSharingTest extends $Chemical {
    card!: $Card;
    
    $BoundSharingTest(card: $Card) {
        this.card = $check(card, $Card);
    }
    
    view() {
        const Card = $use(this.card);
        
        return (
            <div style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h3>Test 1: Same Bound Instance - Shadowing Demo</h3>
                
                <div style={{ marginBottom: '20px', background: '#e8f5e9', padding: '15px', borderRadius: '4px' }}>
                    <strong>Key Concept:</strong>
                    <p style={{ margin: '10px 0' }}>
                        ONE card instance (ID: {this.card.id}) rendered twice. 
                        Left: no overrides. Right: ONLY background shadowed.
                    </p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                        <div style={{ fontSize: '12px', marginBottom: '5px', color: '#666' }}>
                            ✨ Original (no props)
                        </div>
                        <Card />
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', marginBottom: '5px', color: '#666' }}>
                            🎨 Background override ONLY
                        </div>
                        <Card background="#ffe0b2" />
                    </div>
                </div>
                
                <div style={{ padding: '10px', background: '#fff3cd', borderRadius: '4px' }}>
                    <strong>Try This:</strong> 
                    <ul style={{ margin: '10px 0', paddingLeft: '20px', lineHeight: 1.6 }}>
                        <li>Change background on left → right keeps its override (shadowed)</li>
                        <li>Change border on left → BOTH update (not shadowed)</li>
                        <li>Change text on left → BOTH update (not shadowed)</li>
                        <li>Change anything on right → only right changes (independent layer)</li>
                    </ul>
                </div>
            </div>
        );
    }
}

// ============================================
// TEST 2: GRAPH TRAVERSAL - Same test through container
// ============================================

class $GraphTraversalTest extends $Chemical {
    container!: $CardContainer;
    
    $GraphTraversalTest(container: $CardContainer) {
        this.container = $check(container, $CardContainer);
    }
    
    view() {
        // Extract card from container via object graph
        const Card = $use(this.container.card);
        
        return (
            <div style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h3>Test 2: Graph Traversal - Shadowing Through Containers</h3>
                
                <div style={{ marginBottom: '20px', background: '#e1f5fe', padding: '15px', borderRadius: '4px' }}>
                    <strong>Key Concept:</strong>
                    <p style={{ margin: '10px 0' }}>
                        Card is owned by Container, but we access it via object graph (container.card).
                        Same shadowing behavior works - ONE card instance (ID: {this.container.card.id}) rendered twice.
                    </p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                        <div style={{ fontSize: '12px', marginBottom: '5px', color: '#666' }}>
                            ✨ Original (no props)
                        </div>
                        <Card />
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', marginBottom: '5px', color: '#666' }}>
                            🎨 Background override ONLY
                        </div>
                        <Card background="#ffe0b2" />
                    </div>
                </div>
                
                <div style={{ padding: '10px', background: '#fff3cd', borderRadius: '4px' }}>
                    <strong>Try This:</strong> 
                    <ul style={{ margin: '10px 0', paddingLeft: '20px', lineHeight: 1.6 }}>
                        <li>Change background on left → right keeps its override (shadowed)</li>
                        <li>Change border on left → BOTH update (not shadowed)</li>
                        <li>Change text on left → BOTH update (not shadowed)</li>
                        <li>Graph traversal doesn't break sharing!</li>
                    </ul>
                </div>
            </div>
        );
    }
}

// ============================================
// CREATE COMPONENTS
// ============================================

const Title = new $Title().Component;
const Card = new $Card().Component;
const CardContainer = new $CardContainer().Component;
const BoundSharingTest = new $BoundSharingTest().Component;
const GraphTraversalTest = new $GraphTraversalTest().Component;

// ============================================
// MAIN TEST COMPONENT
// ============================================

export default function SharingTests() {
    return (
        <div style={{ padding: '40px', fontFamily: 'system-ui', background: '#f0f0f0', minHeight: '100vh' }}>
            <h1>Sharing Tests - Bound Components & Prototypal Inheritance</h1>
            
            <div style={{ 
                marginBottom: '30px', 
                padding: '20px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '8px'
            }}>
                <h2 style={{ marginTop: 0 }}>Understanding Bound vs Unbound</h2>
                <p style={{ fontSize: '18px', lineHeight: 1.6 }}>
                    <strong>Unbound:</strong> {'<Card />'} in JSX creates a NEW instance each time.<br/>
                    <strong>Bound:</strong> Cards passed through bond constructors become specific instances.<br/>
                    <strong>The Magic:</strong> Render the SAME bound instance with different props - 
                    Chemistry creates a prototypal layer for the props while maintaining the original instance.
                </p>
            </div>
            
            <div style={{ display: 'grid', gap: '30px' }}>
                {/* Test 1: Same instance rendered twice */}
                <BoundSharingTest>
                    <Card name="Shared" />
                </BoundSharingTest>
                
                {/* Test 2: Cards in containers, then extracted */}
                <GraphTraversalTest>
                    <CardContainer>
                        <Title value="Container Title" />
                        <Card text="Shared Card" />
                    </CardContainer>
                </GraphTraversalTest>
            </div>
            
            <div style={{ 
                marginTop: '30px',
                padding: '20px', 
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h3>🔬 The Prototypal Inheritance Rules:</h3>
                <ol style={{ lineHeight: 1.8 }}>
                    <li><strong>Props create a layer:</strong> When you pass props to a bound component, 
                        Chemistry creates a prototypal inheritance layer.</li>
                    <li><strong>Non-overridden properties inherit:</strong> Properties not specified in props 
                        still come from the original instance.</li>
                    <li><strong>Changes propagate until shadowed:</strong> Changing a property on the original 
                        affects all renderings that haven't shadowed it.</li>
                    <li><strong>Direct assignment shadows:</strong> When a rendering directly changes a property, 
                        it shadows that property forever.</li>
                    <li><strong>The original is never modified:</strong> The base bound instance remains pure.</li>
                </ol>
            </div>
        </div>
    );
}