'use client'
import { $Chemical } from '@/chemistry';
import React from 'react';

// Test 1: Async $ method directly in onClick
export class $AsyncButton extends $Chemical {
    clickCount = 0;
    lastMessage = 'Click to start';
    loading = false;
    
    async $handleClick() {
        this.loading = true;
        this.lastMessage = 'Processing...';
        
        // Simulate async work
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.clickCount++;
        this.lastMessage = `Completed click ${this.clickCount}`;
        this.loading = false;
    }
    
    view() {
        return (
            <div style={{ padding: '15px', border: '1px solid #4caf50', borderRadius: '8px' }}>
                <h4>Test 1: Async $ Method in onClick</h4>
                <div>Count: {this.clickCount}</div>
                <div>Status: {this.lastMessage}</div>
                <button 
                    onClick={this.$handleClick}
                    disabled={this.loading}
                    style={{ marginTop: '10px', padding: '8px 16px' }}
                >
                    {this.loading ? 'Working...' : 'Click Me'}
                </button>
            </div>
        );
    }
}

// Test 2: Constructor AND view calling async methods
export class $AutoLoader extends $Chemical {
    data: any = null;
    loaded = false;
    loadTime: string | null = null;
    viewLoadData: any = null;
    viewLoadTime: string | null = null;

    $AutoLoader() {
        this.$loadData();
    }
    
    async $loadData() {
        if (this.data) return;

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Update properties - this triggers re-render
        this.data = { 
            message: 'Auto-loaded on mount',
            value: Math.floor(Math.random() * 100)
        };
        this.loaded = true;
        this.loadTime = new Date().toLocaleTimeString();
    }
    
    async $loadViewData() {
        if (this.viewLoadData) return;
        
        // Simulate another API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        this.viewLoadData = {
            viewMessage: 'Loaded from view method',
            viewValue: Math.floor(Math.random() * 50)
        };
        this.viewLoadTime = new Date().toLocaleTimeString();
    }
    
    async $refresh() {
        this.loaded = false;
        this.data = null;
        this.viewLoadData = null;
        await this.$loadData();
    }
    
    view() {
        // Call async method in view - should be idempotent
        this.$loadViewData();
        
        return (
            <div style={{ padding: '15px', border: '1px solid #2196f3', borderRadius: '8px' }}>
                <h4>Test 2: Async in Constructor & View</h4>
                
                <div style={{ marginBottom: '10px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
                    <strong>Constructor Load:</strong>
                    {!this.loaded ? (
                        <div>⏳ Loading...</div>
                    ) : (
                        <>
                            <div>Message: {this.data?.message}</div>
                            <div>Value: {this.data?.value}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                                Loaded at: {this.loadTime}
                            </div>
                        </>
                    )}
                </div>
                
                <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
                    <strong>View Load:</strong>
                    {!this.viewLoadData ? (
                        <div>⏳ Loading view data...</div>
                    ) : (
                        <>
                            <div>Message: {this.viewLoadData?.viewMessage}</div>
                            <div>Value: {this.viewLoadData?.viewValue}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                                Loaded at: {this.viewLoadTime}
                            </div>
                        </>
                    )}
                </div>
                
                <button onClick={this.$refresh} style={{ marginTop: '10px', padding: '5px 10px' }}>
                    Refresh All
                </button>
            </div>
        );
    }
}

// Test 3: Multiple async $ methods
export class $MultiAsync extends $Chemical {
    step1Done = false;
    step2Done = false;
    step3Done = false;
    processing = false;
    
    async $step1() {
        this.processing = true;
        await new Promise(resolve => setTimeout(resolve, 500));
        this.step1Done = true;
        this.processing = false;
    }
    
    async $step2() {
        this.processing = true;
        await new Promise(resolve => setTimeout(resolve, 700));
        this.step2Done = true;
        this.processing = false;
    }
    
    async $step3() {
        this.processing = true;
        await new Promise(resolve => setTimeout(resolve, 600));
        this.step3Done = true;
        this.processing = false;
    }
    
    async $runAll() {
        this.processing = true;
        this.step1Done = false;
        this.step2Done = false;
        this.step3Done = false;
        
        await this.$step1();
        await this.$step2();
        await this.$step3();
    }
    
    async $reset() {
        this.step1Done = false;
        this.step2Done = false;
        this.step3Done = false;
        this.processing = false;
    }
    
    view() {
        return (
            <div style={{ padding: '15px', border: '1px solid #ff9800', borderRadius: '8px' }}>
                <h4>Test 3: Multiple Async $ Methods</h4>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                    <div>Step 1: {this.step1Done ? '✅' : '⭕'}</div>
                    <div>Step 2: {this.step2Done ? '✅' : '⭕'}</div>
                    <div>Step 3: {this.step3Done ? '✅' : '⭕'}</div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={this.$step1} disabled={this.processing}>Step 1</button>
                    <button onClick={this.$step2} disabled={this.processing}>Step 2</button>
                    <button onClick={this.$step3} disabled={this.processing}>Step 3</button>
                    <button onClick={this.$runAll} disabled={this.processing}>Run All</button>
                    <button onClick={this.$reset}>Reset</button>
                </div>
            </div>
        );
    }
}

// Test 4: Error handling with async $ methods
export class $ErrorHandler extends $Chemical {
    attempts = 0;
    success = false;
    error: string | null = null;
    processing = false;
    
    async $tryRiskyOperation() {
        this.processing = true;
        this.error = null;
        this.success = false;
        this.attempts++;
        
        try {
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    // Succeed on even attempts
                    if (this.attempts % 2 === 0) {
                        resolve('Success!');
                    } else {
                        reject(new Error('Operation failed'));
                    }
                }, 1000);
            });
            
            this.success = true;
        } catch (e: any) {
            this.error = e.message;
        } finally {
            this.processing = false;
        }
    }
    
    view() {
        return (
            <div style={{ padding: '15px', border: '1px solid #9c27b0', borderRadius: '8px' }}>
                <h4>Test 4: Async Error Handling</h4>
                <div>Attempts: {this.attempts}</div>
                <div style={{ marginTop: '8px' }}>
                    {this.processing && <div>⏳ Processing...</div>}
                    {this.success && <div style={{ color: '#4caf50' }}>✅ Success!</div>}
                    {this.error && <div style={{ color: '#f44336' }}>❌ Error: {this.error}</div>}
                </div>
                <button 
                    onClick={this.$tryRiskyOperation}
                    disabled={this.processing}
                    style={{ marginTop: '10px', padding: '5px 10px' }}
                >
                    Try Operation (fails on odd attempts)
                </button>
            </div>
        );
    }
}

// Test 5: Async method updating arrays
export class $ListLoader extends $Chemical {
    items: string[] = [];
    loading = false;
    
    $ListLoader() {
        //this.$loadItems();
    }
    
    async $loadItems() {
        this.loading = true;
        
        // Simulate loading items one by one
        for (let i = 1; i <= 5; i++) {
            await new Promise(resolve => setTimeout(resolve, 300));
            this.items = [...this.items, `Item ${i} loaded at ${new Date().toLocaleTimeString()}`];
        }
        
        this.loading = false;
    }
    
    async $clear() {
        this.items = [];
    }
    
    async $reload() {
        this.items = [];
        await this.$loadItems();
    }
    
    view() {
        return (
            <div style={{ padding: '15px', border: '1px solid #607d8b', borderRadius: '8px' }}>
                <h4>Test 5: Progressive List Loading</h4>
                <div style={{ marginBottom: '10px' }}>
                    Status: {this.loading ? '⏳ Loading items...' : `✅ ${this.items.length} items loaded`}
                </div>
                <div style={{ maxHeight: '150px', overflow: 'auto', background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                    {this.items.length === 0 ? (
                        <div style={{ color: '#999' }}>No items</div>
                    ) : (
                        this.items.map((item, i) => (
                            <div key={i} style={{ fontSize: '12px', padding: '2px 0' }}>{item}</div>
                        ))
                    )}
                </div>
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                    <button onClick={this.$clear} disabled={this.loading}>Clear</button>
                    <button onClick={this.$reload} disabled={this.loading}>Reload</button>
                </div>
            </div>
        );
    }
}

// Test 6: Race conditions - rapid clicks
export class $RaceCondition extends $Chemical {
    clickId = 0;
    results: string[] = [];
    processing = false;
    
    async $slowProcess() {
        this.processing = true;
        const id = ++this.clickId;
        this.results = [...this.results, `Started request ${id}`];
        
        // Random delay to simulate race conditions
        const delay = Math.random() * 2000 + 500;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        this.results = [...this.results, `Completed request ${id} after ${delay.toFixed(0)}ms`];
        this.processing = false;
    }
    
    $clear() {
        this.results = [];
        this.clickId = 0;
    }
    
    view() {
        return (
            <div style={{ padding: '15px', border: '1px solid #ff5722', borderRadius: '8px' }}>
                <h4>Test 6: Race Conditions (Rapid Clicks)</h4>
                <p style={{ fontSize: '12px', color: '#666' }}>
                    Click rapidly to test async handling
                </p>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <button onClick={this.$slowProcess}>
                        Start Async Process
                    </button>
                    <button onClick={this.$clear}>Clear</button>
                </div>
                <div style={{ maxHeight: '150px', overflow: 'auto', background: '#f5f5f5', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
                    {this.results.length === 0 ? (
                        <div style={{ color: '#999' }}>No requests yet</div>
                    ) : (
                        this.results.map((result, i) => (
                            <div key={i}>{result}</div>
                        ))
                    )}
                </div>
            </div>
        );
    }
}

// Test 7: Conditional async in view
export class $ConditionalAsync extends $Chemical {
    mode: 'idle' | 'loading' | 'loaded' = 'idle';
    primaryData: any = null;
    secondaryData: any = null;
    
    async $loadPrimary() {
        if (this.primaryData) return;
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.primaryData = { value: 'Primary loaded' };
    }
    
    async $loadSecondary() {
        if (this.secondaryData) return;
        await new Promise(resolve => setTimeout(resolve, 1200));
        this.secondaryData = { value: 'Secondary loaded' };
    }
    
    $setMode(mode: 'idle' | 'loading' | 'loaded') {
        this.mode = mode;
    }
    
    $reset() {
        this.mode = 'idle';
        this.primaryData = null;
        this.secondaryData = null;
    }
    
    view() {
        // Conditionally call async methods based on state
        if (this.mode === 'loading') {
            this.$loadPrimary();
            if (this.primaryData) {
                this.$loadSecondary();
            }
        }
        
        return (
            <div style={{ padding: '15px', border: '1px solid #00bcd4', borderRadius: '8px' }}>
                <h4>Test 7: Conditional Async in View</h4>
                <div style={{ marginBottom: '10px' }}>
                    Mode: <strong>{this.mode}</strong>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <button onClick={() => this.$setMode('idle')}>Set Idle</button>
                    <button onClick={() => this.$setMode('loading')}>Start Loading</button>
                    <button onClick={() => this.$setMode('loaded')}>Set Loaded</button>
                    <button onClick={this.$reset}>Reset All</button>
                </div>
                <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
                    <div>Primary: {this.primaryData ? this.primaryData.value : 'Not loaded'}</div>
                    <div>Secondary: {this.secondaryData ? this.secondaryData.value : 'Not loaded'}</div>
                </div>
            </div>
        );
    }
}

// Test 8: Nested async calls with parent updates
export class $NestedAsync extends $Chemical {
    parentState = 'initial';
    childResults: string[] = [];
    depth = 0;
    
    async $parentMethod() {
        this.parentState = 'parent processing';
        this.depth = 1;
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await this.$childMethod('from parent');
        
        this.parentState = 'parent complete';
        this.depth = 0;
    }
    
    async $childMethod(source: string) {
        this.childResults = [...this.childResults, `Child called ${source} at depth ${this.depth}`];
        this.depth++;
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (this.depth < 3) {
            await this.$childMethod('recursively');
        }
        
        this.depth--;
    }
    
    $reset() {
        this.parentState = 'initial';
        this.childResults = [];
        this.depth = 0;
    }
    
    view() {
        return (
            <div style={{ padding: '15px', border: '1px solid #795548', borderRadius: '8px' }}>
                <h4>Test 8: Nested Async Calls</h4>
                <div>Parent State: <strong>{this.parentState}</strong></div>
                <div>Current Depth: <strong>{this.depth}</strong></div>
                <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                    <button onClick={this.$parentMethod}>Start Parent Method</button>
                    <button onClick={() => this.$childMethod('directly')} style={{ marginLeft: '10px' }}>
                        Call Child Directly
                    </button>
                    <button onClick={this.$reset} style={{ marginLeft: '10px' }}>Reset</button>
                </div>
                <div style={{ maxHeight: '150px', overflow: 'auto', background: '#f5f5f5', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
                    {this.childResults.length === 0 ? (
                        <div style={{ color: '#999' }}>No child calls yet</div>
                    ) : (
                        this.childResults.map((result, i) => (
                            <div key={i}>{result}</div>
                        ))
                    )}
                </div>
            </div>
        );
    }
}

const AsyncButton = new $AsyncButton().Component;
const AutoLoader = new $AutoLoader().Component;
const MultiAsync = new $MultiAsync().Component;
const ErrorHandler = new $ErrorHandler().Component;
const ListLoader = new $ListLoader().Component;
const RaceCondition = new $RaceCondition().Component;
const ConditionalAsync = new $ConditionalAsync().Component;
const NestedAsync = new $NestedAsync().Component;

export default function BasicTests() {
    return (
        <div style={{ padding: '40px' }}>
            <h1>Async Basic Tests</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Testing Chemistry's async patterns: $ methods work directly with onClick, constructors can call async methods that update properties
            </p>
            
            <div style={{ display: 'grid', gap: '20px' }}>
                <AsyncButton />
                <AutoLoader />
                <MultiAsync />
                <ErrorHandler />
                <ListLoader />
                <RaceCondition />
                <ConditionalAsync />
                <NestedAsync />
            </div>
            
            <div style={{ 
                marginTop: '40px', 
                padding: '20px', 
                background: '#f0f8ff', 
                borderRadius: '8px',
                border: '1px solid #2196f3'
            }}>
                <h3>📝 Key Patterns</h3>
                <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                    <li>Async $ methods can be used directly in onClick - Chemistry handles the Promise</li>
                    <li>Constructors call async methods synchronously - updates trigger re-renders</li>
                    <li>View methods can call async methods - idempotency prevents loops</li>
                    <li>Property updates from async methods automatically update the view</li>
                    <li>Error handling works naturally with try/catch in async methods</li>
                    <li>Arrays and progressive updates work as expected</li>
                    <li>Race conditions from rapid clicks are handled gracefully</li>
                    <li>Conditional async calls in view work with idempotency</li>
                    <li>Nested async methods maintain proper state updates</li>
                </ul>
            </div>
        </div>
    );
}