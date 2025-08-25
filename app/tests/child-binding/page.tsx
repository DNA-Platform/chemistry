'use client'
import { $Chemical, child, optional } from '@/chemistry';

// Test 1: Single required child
class $Badge extends $Chemical {
    $label = 'Badge';
    $color = 'blue';

    view() {
        return (
            <span style={{
                padding: '2px 8px',
                background: this.$color,
                color: 'white',
                borderRadius: '4px',
                fontSize: '12px'
            }}>
                {this.$label}
            </span>
        );
    }
}

class $Card extends $Chemical {
    @child($Badge)
    badge!: $Badge;

    $title = 'Card Title';

    view() {
        console.log('Card.view - this.badge:', this.badge);
        return (
            <div style={{
                border: '1px solid #ddd',
                padding: '15px',
                borderRadius: '8px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '10px'
                }}>
                    <h3 style={{ margin: 0 }}>{this.$title}</h3>
                    {this.badge ? (
                        <div>Badge exists: {this.badge.view()}</div>
                    ) : (
                        <div>No badge bound</div>
                    )}
                </div>
                <div>Card content here</div>
            </div>
        );
    }
}

// Test 2: Optional child
class $OptionalCard extends $Chemical {
    @optional()
    @child($Badge)
    badge?: $Badge;

    $title = 'Optional Badge Card';

    view() {
        console.log('Optional Card.view - this.badge:', this.badge);
        return (
            <div style={{
                border: '1px solid #ddd',
                padding: '15px',
                borderRadius: '8px'
            }}>
                <h3>{this.$title}</h3>
                {this.badge ? (
                    <div>Has badge: {this.badge.view()}</div>
                ) : (
                    <div style={{ color: '#999' }}>No badge provided</div>
                )}
            </div>
        );
    }
}

// Test 3: Array of children
class $ListItem extends $Chemical {
    $text = 'Item';

    view() {
        return <li>{this.$text}</li>;
    }
}

class $List extends $Chemical {
    @child($ListItem)
    items: $ListItem[] = [];

    view() {
        return (
            <div style={{ border: '1px solid #ddd', padding: '15px' }}>
                <h4>List ({this.items.length} items)</h4>
                <ul>
                    {this.items.map((item, i) => (
                        <li key={i} style={{ color: i % 2 === 0 ? 'blue' : 'green' }}>
                            {item.$text}
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
}

// Test 4: Polymorphic children
class $TextBlock extends $Chemical {
    $content = 'Text';

    view() {
        return <p>{this.$content}</p>;
    }
}

class $ImageBlock extends $Chemical {
    $url = '/placeholder.png';
    $alt = 'Image';

    view() {
        return (
            <div style={{ background: '#f0f0f0', padding: '20px', textAlign: 'center' }}>
                [Image: {this.$alt}]
            </div>
        );
    }
}

class $Document extends $Chemical {
    @child($Chemical)
    blocks: $Chemical[] = [];

    view() {
        return (
            <div style={{ border: '2px solid #333', padding: '20px' }}>
                <h3>Document with mixed content</h3>
                {this.blocks.map((block, i) => (
                    <div key={i} style={{
                        padding: '10px',
                        background: i % 2 === 0 ? '#f9f9f9' : 'white',
                        borderLeft: block instanceof $ImageBlock ? '4px solid orange' : '4px solid blue'
                    }}>
                        {block instanceof $ImageBlock && <strong>IMAGE: </strong>}
                        {block instanceof $TextBlock && <strong>TEXT: </strong>}
                        {block.view()}
                    </div>
                ))}
            </div>
        );
    }
}

// Test 5: Dynamic Children
class $ExpandableCounter extends $Chemical {
    count = 0;

    increment() {
        this.count++;
    }

    view() {
        return (
            <div style={{
                padding: '10px',
                background: '#e3f2fd',
                borderRadius: '4px',
                marginBottom: '10px'
            }}>
                Counter: {this.count}
            </div>
        );
    }
}

class $ExpandableItem extends $Chemical {
    $index = 0;

    view() {
        return (
            <div style={{
                padding: '8px',
                margin: '4px',
                background: this.$index % 2 === 0 ? '#f5f5f5' : '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px'
            }}>
                Item #{this.$index + 1}
            </div>
        );
    }
}

class $Expandable extends $Chemical {
    @child($ExpandableCounter)
    counter!: $ExpandableCounter;

    @child($ExpandableItem)
    items: $ExpandableItem[] = [];

    incrementAndUpdate() {
        if (this.counter) {
            this.counter.increment();
        }
    }

    view() {
        const itemCount = this.counter ? this.counter.count : 0;

        // Generate items based on counter
        const itemElements = [];
        for (let i = 0; i < itemCount; i++) {
            itemElements.push(<ExpandableItem key={i} index={i} />);
        }

        return (
            <div style={{
                border: '2px solid #333',
                padding: '20px',
                borderRadius: '8px'
            }}>
                <h3>Expandable Component</h3>

                {/* Display the counter */}
                {this.counter && this.counter.view()}

                <button
                    onClick={() => this.incrementAndUpdate()}
                    style={{
                        padding: '8px 16px',
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginBottom: '10px'
                    }}
                >
                    Add Item
                </button>

                <div style={{
                    marginBottom: '10px',
                    fontWeight: 'bold'
                }}>
                    Items array length: {this.items.length}
                </div>

                {/* Render dynamic items */}
                <div style={{
                    border: '1px solid #ccc',
                    padding: '10px',
                    minHeight: '100px',
                    borderRadius: '4px'
                }}>
                    {itemElements}
                </div>
            </div>
        );
    }
}

const Card = new $Card().Component;
const Badge = new $Badge().Component;
const OptionalCard = new $OptionalCard().Component;
const List = new $List().Component;
const ListItem = new $ListItem().Component;
const Document = new $Document().Component;
const TextBlock = new $TextBlock().Component;
const ImageBlock = new $ImageBlock().Component;
const Expandable = new $Expandable().Component;
const ExpandableCounter = new $ExpandableCounter().Component;
const ExpandableItem = new $ExpandableItem().Component;

export default function ChildBindingTest() {


    return (
        <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
            <h1>Child Binding Tests</h1>

            {/* Test 1 */}
            <div style={{ marginBottom: '40px' }}>
                <h2>Test 1: Single Required Child</h2>
                <Card title="Product Card">
                    <Badge label="NEW" color="red" />
                </Card>
                <div style={{ marginTop: '10px', color: '#666' }}>
                    ✓ Pass if badge appears in top-right of card<br />
                    ✗ Fail if badge missing or not bound
                </div>
            </div>

            {/* Test 2 */}
            <div style={{ marginBottom: '40px' }}>
                <h2>Test 2: Optional Child</h2>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div>
                        <h4>With Badge:</h4>
                        <OptionalCard title="Has Badge">
                            <Badge label="OPTIONAL" color="green" />
                        </OptionalCard>
                    </div>
                    <div>
                        <h4>Without Badge:</h4>
                        <OptionalCard title="No Badge" />
                    </div>
                </div>
                <div style={{ marginTop: '10px', color: '#666' }}>
                    ✓ Pass if left shows badge, right shows "No badge provided"<br />
                    ✗ Fail if error or badge appears on right
                </div>
            </div>

            {/* Test 3 */}
            <div style={{ marginBottom: '40px' }}>
                <h2>Test 3: Array of Children</h2>
                <List>
                    <ListItem text="First item" />
                    <ListItem text="Second item" />
                    <ListItem text="Third item" />
                </List>
                <div style={{ marginTop: '10px', color: '#666' }}>
                    ✓ Pass if shows 3 items with alternating colors<br />
                    ✗ Fail if items missing or not styled differently
                </div>
            </div>

            {/* Test 4 */}
            <div style={{ marginBottom: '40px' }}>
                <h2>Test 4: Polymorphic Children (Base Class)</h2>
                <Document>
                    <TextBlock content="This is a text block" />
                    <ImageBlock url="image/chart.png" alt="Chart" />
                    <TextBlock content="Another text block" />
                    <ImageBlock url="image/graph.png" alt="Graph" />
                </Document>
                <div style={{ marginTop: '10px', color: '#666' }}>
                    ✓ Pass if different block types have different borders/labels<br />
                    ✗ Fail if blocks not differentiated by type
                </div>
            </div>

            {/* Test 5 */}
            <div style={{ marginBottom: '40px' }}>
                <h2>Test 5: Dynamic Children</h2>
                <Expandable>
                    <ExpandableCounter />
                </Expandable>
                <div style={{ marginTop: '10px', color: '#666' }}>
                    ✓ Pass if counter increments and items appear dynamically<br />
                    ✓ Pass if items array length stays at 0 (binding happens through hidden div)<br />
                    ✗ Fail if items don't render when counter increases
                </div>
            </div>
        </div>
    );
}