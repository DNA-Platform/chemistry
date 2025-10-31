// app/tests/async/loading-tests.tsx
'use client'
import { $Chemical, $lookup, $load, $use, $Atom, $is } from '@/chemistry';
import React, { ReactNode, useState, useEffect } from 'react';

// Base entry class
export class $DictionaryEntry extends $Chemical {
    title = '';
    examples: string[] = [];
    $parent = $is($Dictionary);
    
    set dictionary(value: $Dictionary) { 
        this.$parent = value;
    }
    
    definition(): ReactNode {
        return <p>No definition provided.</p>;
    }
    
    view() {
        return (
            <div>
                <h4>{this.title}</h4>
                {this.definition()}
            </div>
        );
    }
}

// Dictionary component
export class $Dictionary extends $Chemical {
    entries: $DictionaryEntry[] = [];
    expanded: Record<string, boolean> = {};
    
    constructor(entries: $DictionaryEntry[] = []) {
        super();
        this.entries = entries.sort((a, b) => a.title.localeCompare(b.title));
        this.entries.forEach((entry, i) => { 
            entry.$parent = this; 
            this.expanded[`entry-${i}`] = false;
        });
    }
    
    toggleEntry(index: number) {
        const key = `entry-${index}`;
        this.expanded[key] = !this.expanded[key];
    }
    
    view() {
        return (
            <div style={{ padding: '15px', border: '1px solid #4a5568', borderRadius: '8px' }}>
                <h3>Dictionary</h3>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
                    {this.entries.length} entries
                </div>
                <div style={{ display: 'grid', gap: '10px' }}>
                    {this.entries.map((entry, i) => {
                        const isExpanded = this.expanded[`entry-${i}`];
                        const [Entry, k] = $use(entry, 'key')
                        return (
                            <div key={i} style={{ 
                                padding: '10px', 
                                background: '#f7fafc', 
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0'
                            }}>
                                <div 
                                    onClick={() => this.toggleEntry(i)}
                                    style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                                >
                                    <strong>{entry.title}</strong>
                                    <span>{isExpanded ? '−' : '+'}</span>
                                </div>
                                {isExpanded && (
                                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                                        <Entry key={k} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}

// Regular React test components
function SyncLoadTest() {
    const [dictionary, setDictionary] = useState<$Dictionary | null>(null);
    const [loadTime, setLoadTime] = useState(0);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        try {
            const start = Date.now();
            // @ts-ignore
            const ctx = require.context('./entries', false, /\.tsx$/);
            const entries = $lookup<$DictionaryEntry>(ctx, '[]');
            setLoadTime(Date.now() - start);
            setDictionary(new $Dictionary(entries));
        } catch (e) {
            setError((e as Error).message);
        }
    }, []);
    
    if (error) {
        return <div style={{ color: 'red' }}>Sync Load Error: {error}</div>;
    }
    
    if (!dictionary) {
        return <div>Loading...</div>;
    }
    
    const DictionaryComponent = dictionary.Component;
    
    return (
        <div>
            <h4>Sync Load Test (Loaded in {loadTime}ms)</h4>
            <DictionaryComponent />
        </div>
    );
}

function AsyncLoadTest() {
    const [dictionary, setDictionary] = useState<$Dictionary | null>(null);
    const [loadTime, setLoadTime] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [framework, setFramework] = useState<'webpack' | 'vite'>('webpack');
    
    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);
            
            // Small delay to show the loading state
            await new Promise(resolve => setTimeout(resolve, 100));
            
            try {
                const start = Date.now();
                let entries: $DictionaryEntry[] = [];
                
                if (framework === 'webpack') {
                    // @ts-ignore
                    const ctx = require.context('./entries', false, /\.tsx$/);
                    entries = $lookup<$DictionaryEntry>(ctx, '[]');
                    
                } else {
                    // Vite simulation with actual async delays
                    const viteSimulation: Record<string, () => Promise<any>> = {
                        './entries/Apple.tsx': async () => {
                            await new Promise(r => setTimeout(r, 100));
                            return import('./entries/Apple');
                        },
                        './entries/Banana.tsx': async () => {
                            await new Promise(r => setTimeout(r, 150));
                            return import('./entries/Banana');
                        },
                        './entries/Algorithm.tsx': async () => {
                            await new Promise(r => setTimeout(r, 120));
                            return import('./entries/Algorithm');
                        },
                        './entries/Quantum.tsx': async () => {
                            await new Promise(r => setTimeout(r, 80));
                            return import('./entries/Quantum');
                        },
                    };
                    
                    entries = await $load<$DictionaryEntry>(viteSimulation, '[]');
                }
                
                setLoadTime(Date.now() - start);
                setDictionary(new $Dictionary(entries));
            } catch (e) {
                setError((e as Error).message);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [framework]);
    
    return (
        <div>
            <h4>Framework Comparison Test</h4>
            <div style={{ marginBottom: '10px' }}>
                <button 
                    onClick={() => setFramework('webpack')} 
                    style={{ 
                        marginRight: '10px', 
                        padding: '8px 16px',
                        background: framework === 'webpack' ? '#3b82f6' : '#e5e7eb',
                        color: framework === 'webpack' ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Webpack (sync)
                </button>
                <button 
                    onClick={() => setFramework('vite')}
                    style={{ 
                        padding: '8px 16px',
                        background: framework === 'vite' ? '#3b82f6' : '#e5e7eb',
                        color: framework === 'vite' ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Vite (async)
                </button>
            </div>
            
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                {framework === 'webpack' 
                    ? 'Using require.context (synchronous, all bundled)' 
                    : 'Simulating import.meta.glob (async, code-split)'}
                {!loading && ` - Loaded in ${loadTime}ms`}
            </div>
            
            {/* Container with fixed minimum height */}
            <div style={{ position: 'relative', minHeight: '500px' }}>
                {/* Loading overlay */}
                <div style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(243, 244, 246, 0.9)',
                    borderRadius: '8px',
                    opacity: loading ? 1 : 0,
                    pointerEvents: loading ? 'all' : 'none',
                    transition: 'opacity 0.3s',
                    zIndex: 10
                }}>
                    <div>⏳ Loading with {framework}...</div>
                </div>
                
                {/* Dictionary content */}
                <div style={{ 
                    opacity: loading ? 0 : 1,
                    transition: 'opacity 0.3s'
                }}>
                    {dictionary && <dictionary.Component />}
                </div>
                
                {/* Error state */}
                {error && (
                    <div style={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        padding: '20px',
                        color: 'red'
                    }}>
                        Error: {error}
                    </div>
                )}
            </div>
        </div>
    );
}

function SingleEntryTest() {
    const [entry, setEntry] = useState<$DictionaryEntry | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        try {
            // @ts-ignore
            const ctx = require.context('./entries', false, /Apple\.tsx$/);
            const result = $lookup<$DictionaryEntry>(ctx, '{}');
            setEntry(result);
        } catch (e) {
            setError((e as Error).message);
        }
    }, []);
    
    if (error) {
        return <div style={{ color: 'red' }}>Single entry error: {error}</div>;
    }
    
    if (!entry) {
        return <div>No entry loaded</div>;
    }
    
    const EntryComponent = entry.Component;
    
    return (
        <div style={{ padding: '15px', border: '1px solid #4a5568', borderRadius: '8px' }}>
            <h4>Single Entry Test</h4>
            <EntryComponent />
        </div>
    );
}

export default function LoadingTests() {
    return (
        <div style={{ padding: '40px' }}>
            <h1>Module Loading & DI Tests</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Testing $lookup and $load with dependency injection into Dictionary
            </p>
            
            <div style={{ display: 'grid', gap: '30px' }}>
                <SyncLoadTest />
                <AsyncLoadTest />
                <SingleEntryTest />
            </div>
        </div>
    );
}
