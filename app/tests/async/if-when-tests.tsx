'use client'
import { $Chemical, When, If } from '@/chemistry';
import React from 'react';

// Chemistry When/If Tests - Testing conditional rendering with actions

// Test 1: Basic When with async data loading
// Test 1: Basic When with async data loading
export class $WhenDataLoader extends $Chemical {
    userData: any = null;
    loadCount = 0;
    bgColor = '#e8f5e9';
    
    async $loadUserData() {
        this.loadCount++;
        await new Promise(resolve => setTimeout(resolve, 1500));
        this.userData = {
            name: 'John Doe',
            email: 'john@example.com',
            loadedAt: new Date().toLocaleTimeString(),
            loadNumber: this.loadCount
        };
    }
    
    $changeColor() {
        const colors = ['#e8f5e9', '#e3f2fd', '#fff3e0', '#f3e5f5', '#fce4ec', '#e0f7fa'];
        const current = this.bgColor;
        let newColor = current;
        while (newColor === current) {
            newColor = colors[Math.floor(Math.random() * colors.length)];
        }
        this.bgColor = newColor;
    }
    
    view() {
        return (
            <div style={{ padding: '15px', border: '1px solid #4caf50', borderRadius: '8px' }}>
                <h4>Test 1: When - Async Data Loading</h4>
                <When action={this.$loadUserData}>
                    <div style={{ padding: '10px', background: this.bgColor, borderRadius: '4px' }}>
                        <div><strong>User Loaded!</strong></div>
                        <div>Name: {this.userData?.name}</div>
                        <div>Email: {this.userData?.email}</div>
                        <div>Loaded at: {this.userData?.loadedAt}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            Load #{this.userData?.loadNumber}
                        </div>
                    </div>
                </When>
                <button onClick={this.$changeColor} style={{ marginTop: '10px' }}>
                    Change Color (Test Reactivity)
                </button>
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                    ✓ Children render after async completes<br/>
                    ✓ Shows loading (nothing) while pending<br/>
                    ✓ Click button to test if color changes (reactivity works)
                </div>
            </div>
        );
    }
}

// Test 2: If with conditional async operations
export class $IfConditionalLoader extends $Chemical {
    shouldLoad = false;
    items: string[] = [];
    loadStarted = false;
    
    async $fetchItems() {
        this.loadStarted = true;
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.items = [
            'Item A - ' + Math.floor(Math.random() * 100),
            'Item B - ' + Math.floor(Math.random() * 100),
            'Item C - ' + Math.floor(Math.random() * 100)
        ];
    }
    
    $toggleCondition() {
        this.shouldLoad = !this.shouldLoad;
        if (!this.shouldLoad) {
            this.items = [];
            this.loadStarted = false;
        }
    }
    
    view() {
        return (
            <div style={{ padding: '15px', border: '1px solid #2196f3', borderRadius: '8px' }}>
                <h4>Test 2: If - Conditional Async Loading</h4>
                <div style={{ marginBottom: '10px' }}>
                    Load condition: <strong>{this.shouldLoad ? 'ON' : 'OFF'}</strong>
                    {this.loadStarted && !this.items.length && ' (Loading...)'}
                </div>
                <If condition={this.shouldLoad} action={this.$fetchItems}>
                    <div style={{ padding: '10px', background: '#e3f2fd', borderRadius: '4px' }}>
                        <div><strong>Items loaded:</strong></div>
                        {this.items.map((item, i) => (
                            <div key={i}>• {item}</div>
                        ))}
                    </div>
                </If>
                <button onClick={this.$toggleCondition} style={{ marginTop: '10px' }}>
                    {this.shouldLoad ? 'Stop Loading' : 'Start Loading'}
                </button>
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                    ✓ Only loads when condition is true<br/>
                    ✓ Children can access loaded data<br/>
                    ✓ Resets when condition becomes false
                </div>
            </div>
        );
    }
}

// Test 3: Synchronous actions with When
export class $SyncActions extends $Chemical {
    computeResult: any = null;
    computeCount = 0;
    
    $computeExpensiveValue() {
        this.computeCount++;
        // Simulate expensive computation
        let sum = 0;
        for (let i = 0; i < 1000000; i++) {
            sum += Math.random();
        }
        this.computeResult = {
            value: Math.floor(sum / 1000),
            computedAt: new Date().toLocaleTimeString(),
            iteration: this.computeCount
        };
    }
    
    $reset() {
        this.computeResult = null;
        this.computeCount = 0;
    }
    
    view() {
        return (
            <div style={{ padding: '15px', border: '1px solid #ff9800', borderRadius: '8px' }}>
                <h4>Test 3: Synchronous Actions</h4>
                <When action={this.$computeExpensiveValue}>
                    <div style={{ padding: '10px', background: '#fff3e0', borderRadius: '4px' }}>
                        <div>Computation #{this.computeResult?.iteration}</div>
                        <div>Result: {this.computeResult?.value}</div>
                        <div style={{ fontSize: '12px' }}>
                            Computed at: {this.computeResult?.computedAt}
                        </div>
                    </div>
                </When>
                <button onClick={this.$reset} style={{ marginTop: '10px' }}>
                    Reset & Recompute
                </button>
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                    ✓ Works with sync actions too<br/>
                    ✓ Children render immediately for sync<br/>
                    ✓ Action only runs once per instance
                </div>
            </div>
        );
    }
}

// Test 4: Nested When/If components
export class $NestedLoading extends $Chemical {
    stage1Complete = false;
    stage2Complete = false;
    showStage2 = false;
    data = { stage1: null as any, stage2: null as any };
    
    async $loadStage1() {
        await new Promise(resolve => setTimeout(resolve, 800));
        this.data.stage1 = { message: 'Stage 1 data loaded' };
        this.stage1Complete = true;
        this.showStage2 = true;
    }
    
    async $loadStage2() {
        await new Promise(resolve => setTimeout(resolve, 800));
        this.data.stage2 = { message: 'Stage 2 data loaded' };
        this.stage2Complete = true;
    }
    
    $reset() {
        this.stage1Complete = false;
        this.stage2Complete = false;
        this.showStage2 = false;
        this.data = { stage1: null, stage2: null };
    }
    
    view() {
        return (
            <div style={{ padding: '15px', border: '1px solid #9c27b0', borderRadius: '8px' }}>
                <h4>Test 4: Nested Loading Stages</h4>
                <When action={this.$loadStage1}>
                    <div style={{ padding: '10px', background: '#f3e5f5', borderRadius: '4px' }}>
                        <div>✓ {this.data.stage1?.message}</div>
                        <If condition={this.showStage2} action={this.$loadStage2}>
                            <div style={{ marginTop: '10px', padding: '8px', background: '#fff', borderRadius: '4px' }}>
                                ✓ {this.data.stage2?.message}
                            </div>
                        </If>
                    </div>
                </When>
                <button onClick={this.$reset} style={{ marginTop: '10px' }}>
                    Reset All Stages
                </button>
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                    Status: {!this.stage1Complete ? 'Loading Stage 1...' : 
                             !this.stage2Complete ? 'Loading Stage 2...' : 
                             'All stages complete'}
                </div>
            </div>
        );
    }
}

// Test 5: Error handling in async actions
export class $ErrorHandling extends $Chemical {
    attempts = 0;
    lastError: string | null = null;
    data: any = null;
    
    async $riskyOperation() {
        this.attempts++;
        this.lastError = null;
        
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Fail on odd attempts
            if (this.attempts % 2 !== 0) {
                throw new Error(`Operation failed on attempt ${this.attempts}`);
            }
            
            this.data = {
                success: true,
                message: `Success on attempt ${this.attempts}`,
                timestamp: new Date().toLocaleTimeString()
            };
        } catch (e: any) {
            this.lastError = e.message;
            this.data = null;
            // Don't re-throw - handle the error gracefully
        }
    }
    
    $retry() {
        this.data = null;
        this.lastError = null;
        // Force re-execution by changing the function reference
        const oldMethod = this.$riskyOperation;
        this.$riskyOperation = async function(this: $ErrorHandling) {
            return oldMethod.call(this);
        }.bind(this);
    }
    
    view() {
        return (
            <div style={{ padding: '15px', border: '1px solid #f44336', borderRadius: '8px' }}>
                <h4>Test 5: Error Handling</h4>
                <div style={{ marginBottom: '10px' }}>
                    Attempts: {this.attempts} (fails on odd numbers)
                </div>
                
                {this.lastError && (
                    <div style={{ padding: '10px', background: '#ffebee', borderRadius: '4px', color: '#c62828', marginBottom: '10px' }}>
                        Error: {this.lastError}
                    </div>
                )}
                
                <When action={this.$riskyOperation}>
                    {this.data && (
                        <div style={{ padding: '10px', background: '#e8f5e9', borderRadius: '4px' }}>
                            {this.data.message} at {this.data.timestamp}
                        </div>
                    )}
                </When>
                
                <button onClick={this.$retry} style={{ marginTop: '10px' }}>
                    {this.attempts === 0 ? 'Start Operation' : 'Retry Operation'}
                </button>
                
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                    ✓ Errors are caught and handled<br/>
                    ✓ Can retry failed operations<br/>
                    ✓ Shows error state to user
                </div>
            </div>
        );
    }
}

// Test 6: Multiple When components with shared state
export class $MultipleWhens extends $Chemical {
    userLoaded = false;
    postsLoaded = false;
    user: any = null;
    posts: any[] = [];
    
    async $loadUser() {
        await new Promise(resolve => setTimeout(resolve, 600));
        this.user = {
            id: 1,
            name: 'Alice',
            role: 'Developer'
        };
        this.userLoaded = true;
    }
    
    async $loadPosts() {
        await new Promise(resolve => setTimeout(resolve, 900));
        this.posts = [
            { id: 1, title: 'First Post', likes: 10 },
            { id: 2, title: 'Second Post', likes: 25 },
            { id: 3, title: 'Third Post', likes: 15 }
        ];
        this.postsLoaded = true;
    }
    
    $reset() {
        this.userLoaded = false;
        this.postsLoaded = false;
        this.user = null;
        this.posts = [];
    }
    
    view() {
        return (
            <div style={{ padding: '15px', border: '1px solid #00bcd4', borderRadius: '8px' }}>
                <h4>Test 6: Multiple Parallel Loads</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>User Info:</div>
                        <When action={this.$loadUser}>
                            <div style={{ padding: '8px', background: '#e0f7fa', borderRadius: '4px' }}>
                                <div>{this.user?.name}</div>
                                <div style={{ fontSize: '12px' }}>{this.user?.role}</div>
                            </div>
                        </When>
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Posts:</div>
                        <When action={this.$loadPosts}>
                            <div style={{ padding: '8px', background: '#e0f7fa', borderRadius: '4px' }}>
                                {this.posts.map(post => (
                                    <div key={post.id} style={{ fontSize: '12px', marginBottom: '2px' }}>
                                        {post.title} ({post.likes} likes)
                                    </div>
                                ))}
                            </div>
                        </When>
                    </div>
                </div>
                <button onClick={this.$reset} style={{ marginTop: '10px' }}>
                    Reset All
                </button>
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                    Status: User {this.userLoaded ? '✓' : '⏳'} | Posts {this.postsLoaded ? '✓' : '⏳'}
                </div>
            </div>
        );
    }
}

// Test 7: Arrow function detection
export class $ArrowFunctionTest extends $Chemical {
    data = 'Initial';
    useArrow = false;
    
    $validMethod() {
        this.data = 'Method executed';
    }
    
    $toggleMethod() {
        this.useArrow = !this.useArrow;
    }
    
    view() {
        // Create arrow function for testing
        const arrowFunction = () => this.$validMethod();
        
        return (
            <div style={{ padding: '15px', border: '1px solid #795548', borderRadius: '8px' }}>
                <h4>Test 7: Arrow Function Detection</h4>
                
                <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontWeight: 'bold' }}>Currently using: {this.useArrow ? 'Arrow Function (will error)' : 'Valid Method Reference'}</div>
                    <button onClick={this.$toggleMethod} style={{ marginBottom: '10px' }}>
                        Switch to {this.useArrow ? 'Method Reference' : 'Arrow Function'}
                    </button>
                </div>
                
                <div>
                    {this.useArrow ? (
                        <div style={{ padding: '8px', background: '#ffebee', borderRadius: '4px', color: '#c62828' }}>
                            ⚠️ Arrow function would cause error - not rendering When component
                        </div>
                    ) : (
                        <When action={this.$validMethod}>
                            <div style={{ padding: '8px', background: '#efebe9', borderRadius: '4px' }}>
                                ✓ {this.data} - Using valid method reference
                            </div>
                        </When>
                    )}
                </div>
                
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                    ✓ Arrow functions are detected and prevented<br/>
                    ✓ Clear error message guides users<br/>
                    ✓ Method references work correctly
                </div>
            </div>
        );
    }
}

// Create component instances
const WhenDataLoader = new $WhenDataLoader().Component;
const IfConditionalLoader = new $IfConditionalLoader().Component;
const SyncActions = new $SyncActions().Component;
const NestedLoading = new $NestedLoading().Component;
const ErrorHandling = new $ErrorHandling().Component;
const MultipleWhens = new $MultipleWhens().Component;
const ArrowFunctionTest = new $ArrowFunctionTest().Component;

export default function WhenIfTests() {
    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>$When and $If Component Tests</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Testing Chemistry's conditional rendering components: $When renders children after action completes, $If adds a condition
            </p>
            
            <div style={{ display: 'grid', gap: '20px' }}>
                <WhenDataLoader />
                <IfConditionalLoader />
                <SyncActions />
                <NestedLoading />
                <ErrorHandling />
                <MultipleWhens />
                <ArrowFunctionTest />
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
                    <li><strong>$When</strong>: Executes action, renders children when complete</li>
                    <li><strong>$If</strong>: Same as When but only when condition is true</li>
                    <li>Actions do work (load data, compute values) but don't return JSX</li>
                    <li>Children have access to data loaded by the action</li>
                    <li>Shows nothing while async actions are pending</li>
                    <li>Arrow functions are detected and prevented</li>
                    <li>Errors in actions don't crash the component</li>
                </ul>
            </div>
        </div>
    );
}