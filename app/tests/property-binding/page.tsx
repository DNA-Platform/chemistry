'use client'
import { $Chemical, child } from '@/chemistry';

class $Child extends $Chemical {
    $name: string = 'Default Child';
    
    view() {
        return (
            <div style={{ border: '2px solid green', padding: '10px', borderRadius: '4px' }}>
                <h4>Child Component</h4>
                <p>Name: {this.$name}</p>
            </div>
        );
    }
}

class $Parent extends $Chemical {
    @child($Child)
    child!: $Child;
    
    view() {
        console.log('Parent.view() - this.child:', this.child);
        console.log('Parent.view() - this.children:', this.children);
        return (
            <div style={{ border: '2px solid blue', padding: '20px', borderRadius: '8px' }}>
                <h3>Parent Component</h3>
                <div style={{ marginBottom: '10px' }}>
                    <div>✓ Child bound: {this.child ? 'YES' : 'NO'}</div>
                    <div>✓ Child name: {this.child?.$name || 'N/A'}</div>
                </div>
                <div style={{ marginLeft: '20px', marginTop: '20px' }}>
                    {this.child?.view()}
                </div>
            </div>
        );
    }
}

export default function BasicBindingTest() {
    const Parent = new $Parent().Component;  // Access property, not method
    const Child = new $Child().Component;    // Access property, not method
    
    return (
        <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
            <h1>Basic Binding Test</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Tests that a child component is properly bound to its parent using the @child decorator.
            </p>
            
            <div style={{ marginBottom: '20px' }}>
                <h3>Expected Results:</h3>
                <ul>
                    <li>Parent should show "Child bound: YES"</li>
                    <li>Parent should show "Child name: Test Child"</li>
                    <li>Child component should be rendered inside parent</li>
                </ul>
            </div>
            
            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
                <Parent>
                    <Child name="Test Child" />
                </Parent>
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
                    ✓ If you see the child component inside the parent with correct name, the test passes
                </div>
            </div>
        </div>
    );
}