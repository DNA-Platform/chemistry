// app/tests/child-bonding/page.tsx
'use client'
import { useState } from 'react';
import dynamic from 'next/dynamic';

const subTests = [
    {
        id: 'basics',
        name: 'Basic Tests',
        description: 'Tests that show child-bonding as a proof of concept',
        component: dynamic(() => import('./basic-tests'), {
            loading: () => <TestLoading />,
            ssr: false
        })
    },
    {
        id: 'arg-tests',
        name: 'Arg Tests',
        description: 'Different parameter types',
        component: dynamic(() => import('./arg-tests'), {
            loading: () => <TestLoading />,
            ssr: false
        })
    },
    {
        id: 'dynamic-arg-tests',
        name: 'Dynamic Arg Tests',
        description: 'Dynamic arguments that match the bond constructor signature',
        component: dynamic(() => import('./dynamic-arg-tests'), {
            loading: () => <TestLoading />,
            ssr: false
        })
    },
    {
        id: 'validation-tests',
        name: 'Validation Tests',
        description: 'Using the $check method to validate the arguments of a $Chemical',
        component: dynamic(() => import('./validation-tests'), {
            loading: () => <TestLoading />,
            ssr: false
        })
    },
];

function TestLoading() {
    return (
        <div style={{ 
            padding: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
                <div>Loading test...</div>
            </div>
        </div>
    );
}

export default function Tests() {
    const [selectedTest, setSelectedTest] = useState<string | null>(null);
    
    const TestComponent = subTests.find(t => t.id === selectedTest)?.component;
    
    return (
        <div style={{ fontFamily: 'system-ui' }}>
            {/* Sub-navigation bar */}
            <div style={{ 
                borderBottom: '1px solid #e0e0e0',
                background: '#f5f5f5',
                padding: '10px 40px',
                display: 'flex',
                gap: '20px'
            }}>
                {subTests.map(test => (
                    <button
                        key={test.id}
                        onClick={() => setSelectedTest(test.id)}
                        style={{
                            padding: '8px 16px',
                            background: selectedTest === test.id ? 'white' : 'transparent',
                            borderTop: selectedTest === test.id ? '1px solid #ddd' : '1px solid transparent',
                            borderRight: selectedTest === test.id ? '1px solid #ddd' : '1px solid transparent',
                            borderLeft: selectedTest === test.id ? '1px solid #ddd' : '1px solid transparent',
                            borderBottom: 'none',
                            borderRadius: '4px 4px 0 0',
                            cursor: 'pointer',
                            marginBottom: '-1px',
                            fontWeight: selectedTest === test.id ? 'bold' : 'normal'
                        }}
                    >
                        <div>{test.name}</div>
                        {test.description && (
                            <div style={{ fontSize: '11px', color: '#666', fontWeight: 'normal' }}>
                                {test.description}
                            </div>
                        )}
                    </button>
                ))}
            </div>
            
            {/* Test content */}
            {TestComponent ? (
                <TestComponent />
            ) : (
                <div style={{ 
                    padding: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px',
                    color: '#666'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ color: '#333', marginBottom: '20px' }}>
                            Child Bonding Test Suite
                        </h2>
                        <p style={{ marginBottom: '10px' }}>
                            Select a test from the tabs above to begin
                        </p>
                        <p style={{ fontSize: '14px', color: '#999' }}>
                            These tests demonstrate Chemistry's revolutionary children-as-constructor-arguments pattern
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}