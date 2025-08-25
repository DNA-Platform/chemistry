'use client'
import { $Chemical } from '@/chemistry';

class $Counter extends $Chemical {
    count: number = 0;
    lastAction: string = 'none';
    
    increment() {
        this.count++;
        this.lastAction = 'increment';
    }
    
    decrement() {
        this.count--;
        this.lastAction = 'decrement';
    }
    
    reset() {
        this.count = 0;
        this.lastAction = 'reset';
    }
    
    view() {
        return (
            <div style={{ 
                border: '2px solid orange', 
                padding: '30px', 
                borderRadius: '8px',
                textAlign: 'center'
            }}>
                <h2 style={{ fontSize: '48px', margin: '20px 0' }}>
                    {this.count}
                </h2>
                <p style={{ color: '#666', marginBottom: '20px' }}>
                    Last action: {this.lastAction}
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button 
                        onClick={() => this.decrement()}
                        style={{
                            padding: '10px 20px',
                            fontSize: '20px',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        -
                    </button>
                    <button 
                        onClick={() => this.reset()}
                        style={{
                            padding: '10px 20px',
                            fontSize: '16px',
                            background: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Reset
                    </button>
                    <button 
                        onClick={() => this.increment()}
                        style={{
                            padding: '10px 20px',
                            fontSize: '20px',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        +
                    </button>
                </div>
            </div>
        );
    }
}

class $InputTest extends $Chemical {
    text: string = '';
    charCount: number = 0;
    
    updateText(value: string) {
        this.text = value;
        this.charCount = value.length;
    }
    
    view() {
        return (
            <div style={{ 
                border: '2px solid blue', 
                padding: '20px', 
                borderRadius: '8px',
                marginTop: '20px'
            }}>
                <h3>Input Reactivity Test</h3>
                <input
                    type="text"
                    value={this.text}
                    onChange={(e) => this.updateText(e.target.value)}
                    placeholder="Type something..."
                    style={{
                        width: '100%',
                        padding: '8px',
                        fontSize: '16px',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                    }}
                />
                <div style={{ marginTop: '10px' }}>
                    <p>You typed: <strong>{this.text || '(nothing)'}</strong></p>
                    <p>Character count: <strong>{this.charCount}</strong></p>
                </div>
            </div>
        );
    }
}

export default function ReactivityTest() {
    const Counter = new $Counter().Component;
    const InputTest = new $InputTest().Component;
    
    return (
        <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
            <h1>Reactivity Test</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Tests that property changes automatically trigger UI updates.
            </p>
            
            <div style={{ marginBottom: '20px' }}>
                <h3>Expected Behavior:</h3>
                <ul>
                    <li>Counter should update immediately when buttons are clicked</li>
                    <li>Last action should show which button was pressed</li>
                    <li>Input field should update as you type</li>
                    <li>Character count should update automatically</li>
                </ul>
            </div>
            
            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
                <Counter />
                <InputTest />
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
                    ✓ If the counter and input update immediately when interacted with, reactivity is working
                </div>
            </div>
        </div>
    );
}