// app/tests/async/page.tsx
'use client'
import { useState } from 'react';
import BasicTests from './basic-tests';
import LoadingTests from './loading-tests';

const subTests = [
    {
        id: 'basics',
        name: 'Basic Tests',
        description: 'Tests that async programming works',
        component: BasicTests
    },
    {
        id: 'loading',
        name: 'Loading Tests',
        description: 'Tests that module works in sync and async contexts',
        component: LoadingTests
    },
];

export default function Tests() {
    const [selectedTest, setSelectedTest] = useState('original');
    
    const TestComponent = subTests.find(t => t.id === selectedTest)?.component || BasicTests;
    
    return (
        <div style={{ fontFamily: 'system-ui' }}>
            {/* Sub-navigation bar */}
            {subTests.length > 1 && (
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
            )}
            
            {/* Test content */}
            <TestComponent />
        </div>
    );
}