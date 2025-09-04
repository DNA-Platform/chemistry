// app > tests > children
'use client'
import { $Chemical } from '@/chemistry';

// Simple child components
class $Item extends $Chemical {
    $label = 'item';
    
    view() {
        return (
            <div style={{ 
                border: '1px solid #ddd', 
                padding: '8px', 
                margin: '4px',
                borderRadius: '4px',
                background: '#f9f9f9'
            }}>
                {this.$label}
            </div>
        );
    }
}

// Parent with no view override - should show children
class $Container extends $Chemical {
    // No view() override - uses default which returns this.elements
}

// Parent with explicit passthrough view
class $PassthroughContainer extends $Chemical {
    view() {
        console.log('PassthroughContainer.elements:', this.children);
        return this.children;
    }
}

// Parent that wraps children
class $WrapperContainer extends $Chemical {
    $title = 'Wrapper';
    
    view() {
        return (
            <div style={{ border: '2px solid #666', padding: '10px', borderRadius: '4px' }}>
                <h3>{this.$title}</h3>
                {this.children}
            </div>
        );
    }
}

export default function ChildrenTest() {
    const Item = new $Item().Component;
    const Container = new $Container().Component;
    const PassthroughContainer = new $PassthroughContainer().Component;
    const WrapperContainer = new $WrapperContainer().Component;
    
    return (
        <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
            <h1>Children Rendering Test</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Testing how parent components handle children rendering.
            </p>
            
            {/* Test 1 */}
            <div style={{ marginBottom: '40px' }}>
                <h2>Test 1: Container with Default View</h2>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Expected:</strong> Should show all three children
                </div>
                <Container>
                    <Item label="First" />
                    <Item label="Second" />
                    <Item label="Third" />
                </Container>
                <div style={{ marginTop: '10px', color: '#666' }}>
                    ✓ Pass if you see three items<br/>
                    ✗ Fail if nothing appears
                </div>
            </div>
            
            {/* Test 2 */}
            <div style={{ marginBottom: '40px' }}>
                <h2>Test 2: Explicit Passthrough</h2>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Expected:</strong> Should show both children (check console for elements log)
                </div>
                <PassthroughContainer>
                    <Item label="Alpha" />
                    <Item label="Beta" />
                </PassthroughContainer>
                <div style={{ marginTop: '10px', color: '#666' }}>
                    ✓ Pass if you see two items<br/>
                    ✗ Fail if nothing appears
                </div>
            </div>
            
            {/* Test 3 */}
            <div style={{ marginBottom: '40px' }}>
                <h2>Test 3: Wrapper with Children</h2>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Expected:</strong> Should show title and children inside border
                </div>
                <WrapperContainer title="My Container">
                    <Item label="One" />
                    <Item label="Two" />
                </WrapperContainer>
                <div style={{ marginTop: '10px', color: '#666' }}>
                    ✓ Pass if you see title and items inside border<br/>
                    ✗ Fail if children don't appear
                </div>
            </div>
        </div>
    );
}