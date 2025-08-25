'use client'
import { useState } from 'react';

// Test metadata
const tests = [
    {
        id: 'basics',
        name: 'Basic Tests',
        description: 'Test the most basic aspects of chemistry',
        path: '/tests/basics'
    },
    {
        id: 'children',
        name: 'Children Tests',
        description: 'Test viewing the children of a component',
        path: '/tests/children'
    },
    {
        id: 'view-methods',
        name: 'View Method Tests',
        description: 'Tests using multiple methods to display the view',
        path: '/tests/view-methods'
    },
    {
        id: 'child-binding',
        name: 'Child Binding Test',
        description: 'Test simple parent-child binding with @child decorator',
        path: '/tests/child-binding'
    },
];

export default function TestRunner() {
    const [selectedTest, setSelectedTest] = useState<string | null>(null);
    const [testResults, setTestResults] = useState<Record<string, 'pass' | 'fail' | 'pending'>>({});
    
    const handleTestComplete = (testId: string, result: 'pass' | 'fail') => {
        setTestResults(prev => ({ ...prev, [testId]: result }));
    };
    
    const getStatusColor = (testId: string) => {
        const status = testResults[testId];
        if (!status || status === 'pending') return '#gray';
        return status === 'pass' ? 'green' : 'red';
    };
    
    const getStatusSymbol = (testId: string) => {
        const status = testResults[testId];
        if (!status || status === 'pending') return '○';
        return status === 'pass' ? '✓' : '✗';
    };
    
    return (
        <div style={{ 
            display: 'flex', 
            height: '100vh',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            {/* Sidebar */}
            <div style={{ 
                width: '300px', 
                borderRight: '1px solid #e0e0e0',
                padding: '20px',
                background: '#f5f5f5',
                overflowY: 'auto'
            }}>
                <h1 style={{ fontSize: '20px', marginBottom: '20px' }}>
                    Chemistry Test Suite
                </h1>
                
                <div style={{ marginBottom: '20px' }}>
                    <button
                        onClick={() => {
                            // Run all tests
                            tests.forEach(test => {
                                setTestResults(prev => ({ ...prev, [test.id]: 'pending' }));
                            });
                        }}
                        style={{
                            width: '100%',
                            padding: '8px',
                            background: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Run All Tests
                    </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {tests.map(test => (
                        <button
                            key={test.id}
                            onClick={() => setSelectedTest(test.id)}
                            style={{
                                padding: '12px',
                                background: selectedTest === test.id ? '#e3f2fd' : 'white',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ 
                                    color: getStatusColor(test.id),
                                    fontSize: '18px',
                                    fontWeight: 'bold'
                                }}>
                                    {getStatusSymbol(test.id)}
                                </span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                                        {test.name}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                        {test.description}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
                
                {/* Test Summary */}
                <div style={{ 
                    marginTop: '40px', 
                    padding: '12px',
                    background: 'white',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>Summary</h3>
                    <div style={{ fontSize: '12px' }}>
                        <div>Total: {tests.length}</div>
                        <div style={{ color: 'green' }}>
                            Passed: {Object.values(testResults).filter(r => r === 'pass').length}
                        </div>
                        <div style={{ color: 'red' }}>
                            Failed: {Object.values(testResults).filter(r => r === 'fail').length}
                        </div>
                        <div style={{ color: 'gray' }}>
                            Pending: {tests.length - Object.values(testResults).filter(r => r === 'pass' || r === 'fail').length}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Main Content */}
            <div style={{ flex: 1, overflow: 'auto' }}>
                {selectedTest ? (
                    <iframe
                        src={tests.find(t => t.id === selectedTest)?.path}
                        style={{ 
                            width: '100%', 
                            height: '100%',
                            border: 'none'
                        }}
                        title={`Test: ${selectedTest}`}
                    />
                ) : (
                    <div style={{ 
                        padding: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: '#666'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <h2>Welcome to Chemistry Framework Test Suite</h2>
                            <p>Select a test from the sidebar to begin</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}