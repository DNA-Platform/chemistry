'use client'
import { $Chemical, child } from '@/chemistry';

class $TodoItem extends $Chemical {
    $text: string = 'Todo Item';
    $priority: 'low' | 'medium' | 'high' = 'medium';
    completed: boolean = false;
    
    toggle() {
        this.completed = !this.completed;
    }
    
    view() {
        const priorityColors = {
            low: '#28a745',
            medium: '#ffc107',
            high: '#dc3545'
        };
        
        return (
            <div style={{ 
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                background: this.completed ? '#f0f0f0' : 'white',
                border: '1px solid #ddd',
                borderRadius: '4px'
            }}>
                <input
                    type="checkbox"
                    checked={this.completed}
                    onChange={() => this.toggle()}
                    style={{ marginRight: '10px' }}
                />
                <span style={{ 
                    flex: 1,
                    textDecoration: this.completed ? 'line-through' : 'none',
                    color: this.completed ? '#999' : '#333'
                }}>
                    {this.$text}
                </span>
                <span style={{ 
                    padding: '2px 8px',
                    background: priorityColors[this.$priority],
                    color: 'white',
                    borderRadius: '3px',
                    fontSize: '12px'
                }}>
                    {this.$priority}
                </span>
            </div>
        );
    }
}

class $TodoList extends $Chemical {
    @child($TodoItem)
    items: $TodoItem[] = [];
    
    view() {
        const completedCount = this.items.filter(item => item.completed).length;
        
        return (
            <div style={{ 
                border: '2px solid teal', 
                padding: '20px',
                borderRadius: '8px'
            }}>
                <h3>Todo List Component</h3>
                <div style={{ marginBottom: '15px' }}>
                    <div>Total items: <strong>{this.items.length}</strong></div>
                    <div>Completed: <strong>{completedCount}</strong></div>
                    <div>Pending: <strong>{this.items.length - completedCount}</strong></div>
                </div>
                
                {this.items.length === 0 ? (
                    <p style={{ color: '#999' }}>No items bound</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {this.items.map((item, i) => (
                            <li key={i} style={{ marginBottom: '8px' }}>
                                {item.view()}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }
}

export default function ArrayBindingTest() {
    const TodoList = new $TodoList().Component;
    const TodoItem = new $TodoItem().Component;
    
    return (
        <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
            <h1>Array Binding Test</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Tests that multiple child components can be bound to an array property.
            </p>
            
            <div style={{ marginBottom: '20px' }}>
                <h3>Expected Results:</h3>
                <ul>
                    <li>All TodoItem components should be bound to the items array</li>
                    <li>Total should show 5 items</li>
                    <li>Each item should be interactive (checkbox works)</li>
                    <li>Completed count should update when items are checked</li>
                </ul>
            </div>
            
            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
                <TodoList>
                    <TodoItem text="Write tests" priority="high" />
                    <TodoItem text="Fix bugs" priority="high" />
                    <TodoItem text="Update documentation" priority="medium" />
                    <TodoItem text="Review PR" priority="medium" />
                    <TodoItem text="Clean up code" priority="low" />
                </TodoList>
            </div>
            
            <div style={{ marginTop: '30px' }}>
                <h3>Test Status:</h3>
                <div style={{ 
                    padding: '10px', 
                    background: '#d4edda',
                    color: '#155724',
                    border: '1px solid #c3e6cb',
                    borderRadius: '4px'
                }}>
                    ✓ If all 5 items appear and checkboxes update the counts, array binding works
                </div>
            </div>
        </div>
    );
}