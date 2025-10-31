// app/tests/dependencies/member-tests.tsx
'use client'
import { $Chemical, $use, $check, $is } from '@/chemistry';
import React from 'react';

// ============================================
// TEST CHEMICALS
// ============================================

class $DataChemical extends $Chemical {
    $value = 'initial';
    id = Math.random().toString(36).substr(2, 9);
    $parent = $is($Chemical);
    
    increment() {
        this.$value = `Updated ${Date.now()}`;
    }
    
    view() {
        const hasParent = !!this.$parent;
        const parentKey = this.$parent?.toString() || 'none';
        const parentType = this.$parent?.constructor.name || 'none';
        
        return (
            <div style={{ 
                padding: '10px', 
                background: hasParent ? '#e8f5e9' : '#ffebee',
                border: `2px solid ${hasParent ? '#4caf50' : '#f44336'}`,
                borderRadius: '4px',
                marginBottom: '5px',
                fontFamily: 'monospace',
                fontSize: '12px'
            }}>
                <div>ID: {this.id}</div>
                <div>Value: {this.$value}</div>
                <div>Parent: {hasParent ? `✅ ${parentType}[${parentKey}]` : '❌ NONE (is catalyst)'}</div>
            </div>
        );
    }
}

// ============================================
// TEST 1: FIELD ASSIGNMENT WITH WRONG CATALYST
// ============================================

class $FieldCatalystTest extends $Chemical {
    // The parent property
    $parent = $is($Chemical);

    // These will be set from bond constructor
    originalDep!: $DataChemical;
    
    // This will hold the wrong-catalyst version
    fieldMember?: $DataChemical;
    
    // Track the states
    originalHadParent = false;
    wrongVersionHadNoParent = false;
    
    $FieldCatalystTest(dep: $DataChemical) {
        this.originalDep = $check(dep, $DataChemical);
        // Record that original had parent
        this.originalHadParent = !!this.originalDep.$parent;
    }
    
    breakAndAssignToField() {
        console.log("breakAndAssignToField", "this", this)
        // Use YOUR method to create a version with NO parent (new catalyst)
        const wrongCatalyst = new $DataChemical();
        wrongCatalyst.id = "New id from an unbound $DataChemical"
        
        // Verify it has NO parent now
        this.wrongVersionHadNoParent = !wrongCatalyst.$parent;
        
        // Modify it to prove it's different
        wrongCatalyst.$value = 'Broken catalyst version';
        
        // Assign to field - bondSet should FIX this
        this.fieldMember = wrongCatalyst;
    }
    
    view() {
        const Original = $use(this.originalDep);
        const FieldMember = $use(this.fieldMember);
        
        return (
            <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
                <h3>Field Assignment - Catalyst Correction Test</h3>
                
                <div style={{ marginBottom: '15px', background: '#e3f2fd', padding: '15px', borderRadius: '4px' }}>
                    <span>Test Process:</span>
                    <ol style={{ margin: '10px 0' }}>
                        <li>We received a dependency with correct parent from bond constructor</li>
                        <li>We use <code>dep.Component.$bind().$chemical</code> to create version with NO parent</li>
                        <li>We assign this wrong version to a field</li>
                        <li><code>bondSet</code> should detect and fix the catalyst mismatch</li>
                    </ol>
                </div>
                
                <button 
                    onClick={this.breakAndAssignToField}
                    style={{ marginBottom: '15px', padding: '10px 20px' }}
                >
                    Break Catalyst & Assign to Field
                </button>
                
                <div style={{ marginBottom: '15px', padding: '10px', background: '#fff', borderRadius: '4px' }}>
                    <strong>Verification:</strong>
                    <div>1. Original from constructor had parent: {this.originalHadParent ? '✅ YES' : '❌ NO'}</div>
                    <div>2. After .$bind().$chemical had NO parent: {this.wrongVersionHadNoParent ? '✅ CORRECT (was catalyst)' : '❓ Not tested'}</div>
                    <div>3. Field member now has THIS as parent: {this.fieldMember?.$parent === this ? '✅ FIXED BY BONDSET!' : '❓ Check below'}</div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <strong>Original (from constructor):</strong>
                        <Original />
                    </div>
                    <div>
                        <strong>Field Member (should be fixed):</strong>
                        {FieldMember ? <FieldMember /> : <div>Not assigned yet</div>}
                    </div>
                </div>
            </div>
        );
    }
}

// ============================================
// TEST 2: PROPERTY WITH GETTER/SETTER
// ============================================

class $PropertyCatalystTest extends $Chemical {
    originalDep!: $DataChemical;
    
    private _propMember?: $DataChemical;
    
    originalHadParent = false;
    propWrongHadNoParent = false;
    
    // Property with getter/setter
    get propMember(): $DataChemical | undefined {
        return this._propMember;
    }
    
    set propMember(value: $DataChemical | undefined) {
        this._propMember = value;
    }
    
    $PropertyCatalystTest(dep: $DataChemical) {
        this.originalDep = $check(dep, $DataChemical);
        this.originalHadParent = !!this.originalDep.$parent;
    }
    
    breakAndAssignToProperty() {
        // Create wrong catalyst version using the Component.$bind().$chemical method
        const wrongCatalyst = this.originalDep.Component.$bind().$chemical;
        
        // Verify it has NO parent
        this.propWrongHadNoParent = !wrongCatalyst.$parent;
        
        // Modify to distinguish it
        wrongCatalyst.$value = 'Property broken catalyst';
        
        // Assign to property - bondSet on property should FIX
        this.propMember = wrongCatalyst;
    }
    
    view() {
        const Original = $use(this.originalDep);
        const PropMember = this.propMember ? $use(this.propMember) : null;
        
        return (
            <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
                <h3>Property Assignment - Catalyst Correction Test</h3>
                
                <div style={{ marginBottom: '15px', background: '#fff3cd', padding: '15px', borderRadius: '4px' }}>
                    <strong>Test Process:</strong>
                    <ol style={{ margin: '10px 0' }}>
                        <li>Dependency from constructor has parent</li>
                        <li>Use <code>Component.$bind().$chemical</code> to break parent relationship</li>
                        <li>Assign to getter/setter property</li>
                        <li><code>bondSet</code> on property should fix catalyst</li>
                    </ol>
                </div>
                
                <button 
                    onClick={() => this.breakAndAssignToProperty()}
                    style={{ marginBottom: '15px', padding: '10px 20px' }}
                >
                    Break Catalyst & Assign to Property
                </button>
                
                <div style={{ marginBottom: '15px', padding: '10px', background: '#fff', borderRadius: '4px' }}>
                    <strong>Verification:</strong>
                    <div>1. Original had parent: {this.originalHadParent ? '✅ YES' : '❌ NO'}</div>
                    <div>2. After .$bind().$chemical had NO parent: {this.propWrongHadNoParent ? '✅ CORRECT (was catalyst)' : '❓ Not tested'}</div>
                    <div>3. Property now has THIS as parent: {this.propMember?.$parent === this ? '✅ FIXED BY BONDSET!' : '❓ Check below'}</div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <strong>Original:</strong>
                        <Original />
                    </div>
                    <div>
                        <strong>Property Member (should be fixed):</strong>
                        {PropMember ? <PropMember /> : <div>Not assigned yet</div>}
                    </div>
                </div>
            </div>
        );
    }
}

// ============================================
// TEST 3: METHOD RETURN CORRECTION
// ============================================

class $MethodCatalystTest extends $Chemical {
    originalDep!: $DataChemical;
    methodResult?: $DataChemical;
    
    originalHadParent = false;
    methodCreatedWrongCatalyst = false;
    
    $MethodCatalystTest(dep: $DataChemical) {
        this.originalDep = $check(dep, $DataChemical);
        this.originalHadParent = !!this.originalDep.$parent;
    }
    
    // Method that returns wrong catalyst
    createWrongCatalyst(): $DataChemical {
        // Use the Component.$bind().$chemical pattern to break catalyst
        const wrong = this.originalDep.Component.$bind().$chemical;
        
        // Track that it has NO parent
        this.methodCreatedWrongCatalyst = !wrong.$parent;
        
        wrong.$value = 'Returned from method';
        
        // Return it - bondCall should FIX this
        return wrong;
    }
    
    callAndStore() {
        // Call method and store result
        this.methodResult = this.createWrongCatalyst();
    }
    
    view() {
        const Original = $use(this.originalDep);
        const MethodResult = this.methodResult ? $use(this.methodResult) : null;
        
        return (
            <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
                <h3>Method Return - Catalyst Correction Test</h3>
                
                <div style={{ marginBottom: '15px', background: '#e8f5e9', padding: '15px', borderRadius: '4px' }}>
                    <strong>Test Process:</strong>
                    <ol style={{ margin: '10px 0' }}>
                        <li>Method uses <code>Component.$bind().$chemical</code> to create wrong catalyst</li>
                        <li>Method returns this wrong chemical</li>
                        <li><code>bondCall</code> should fix the return value</li>
                        <li>Fixed chemical stored and displayed</li>
                    </ol>
                </div>
                
                <button 
                    onClick={() => this.callAndStore()}
                    style={{ marginBottom: '15px', padding: '10px 20px' }}
                >
                    Call Method & Store Result
                </button>
                
                <div style={{ marginBottom: '15px', padding: '10px', background: '#fff', borderRadius: '4px' }}>
                    <strong>Verification:</strong>
                    <div>1. Original had parent: {this.originalHadParent ? '✅ YES' : '❌ NO'}</div>
                    <div>2. Method created catalyst (no parent): {this.methodCreatedWrongCatalyst ? '✅ YES' : '❓ Not tested'}</div>
                    <div>3. Result has THIS as parent: {this.methodResult?.$parent === this ? '✅ FIXED BY BONDCALL!' : '❓ Check below'}</div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <strong>Original:</strong>
                        <Original />
                    </div>
                    <div>
                        <strong>Method Result (should be fixed):</strong>
                        {MethodResult ? <MethodResult /> : <div>Not called yet</div>}
                    </div>
                </div>
            </div>
        );
    }
}

// ============================================
// TEST 4: MULTIPLE DEPENDENCIES
// ============================================

class $MultipleDepsTest extends $Chemical {
    dep1!: $DataChemical;
    dep2!: $DataChemical;
    
    brokenDep1?: $DataChemical;
    brokenDep2?: $DataChemical;
    
    dep1HadParent = false;
    dep2HadParent = false;
    broken1HadNoParent = false;
    broken2HadNoParent = false;
    
    $MultipleDepsTest(dep1: $DataChemical, dep2: $DataChemical) {
        this.dep1 = $check(dep1, $DataChemical);
        this.dep2 = $check(dep2, $DataChemical);
        
        this.dep1HadParent = !!this.dep1.$parent;
        this.dep2HadParent = !!this.dep2.$parent;
    }
    
    breakBothAndAssign() {
        // Break both using Component.$bind().$chemical
        const broken1 = this.dep1.Component.$bind().$chemical;
        const broken2 = this.dep2.Component.$bind().$chemical;
        
        // Verify they have NO parents
        this.broken1HadNoParent = !broken1.$parent;
        this.broken2HadNoParent = !broken2.$parent;
        
        broken1.$value = 'Broken 1';
        broken2.$value = 'Broken 2';
        
        // Assign - both should be fixed
        this.brokenDep1 = broken1;
        this.brokenDep2 = broken2;
    }
    
    view() {
        const Dep1 = $use(this.dep1);
        const Dep2 = $use(this.dep2);
        const Broken1 = this.brokenDep1 ? $use(this.brokenDep1) : null;
        const Broken2 = this.brokenDep2 ? $use(this.brokenDep2) : null;
        
        return (
            <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
                <h3>Multiple Dependencies - Catalyst Correction</h3>
                
                <div style={{ marginBottom: '15px', background: '#e1f5fe', padding: '15px', borderRadius: '4px' }}>
                    <strong>Test Process:</strong>
                    <p>Tests that multiple dependencies all get corrected when broken with <code>.$bind().$chemical</code></p>
                </div>
                
                <button 
                    onClick={() => this.breakBothAndAssign()}
                    style={{ marginBottom: '15px', padding: '10px 20px' }}
                >
                    Break Both & Assign
                </button>
                
                <div style={{ marginBottom: '15px', padding: '10px', background: '#fff', borderRadius: '4px' }}>
                    <strong>Verification:</strong>
                    <div>Original Dep1 had parent: {this.dep1HadParent ? '✅' : '❌'} | Broken had none: {this.broken1HadNoParent ? '✅' : '❓'} | Fixed: {this.brokenDep1?.$parent === this ? '✅' : '❓'}</div>
                    <div>Original Dep2 had parent: {this.dep2HadParent ? '✅' : '❌'} | Broken had none: {this.broken2HadNoParent ? '✅' : '❓'} | Fixed: {this.brokenDep2?.$parent === this ? '✅' : '❓'}</div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    <div>
                        <strong>Original Dependencies:</strong>
                        <Dep1 />
                        <Dep2 />
                    </div>
                    <div>
                        <strong>Broken & Fixed:</strong>
                        {Broken1 && <Broken1 />}
                        {Broken2 && <Broken2 />}
                    </div>
                </div>
            </div>
        );
    }
}

// ============================================
// CREATE COMPONENTS
// ============================================

const DataChemical = new $DataChemical().Component;
const FieldCatalystTest = new $FieldCatalystTest().Component;
const PropertyCatalystTest = new $PropertyCatalystTest().Component;
const MethodCatalystTest = new $MethodCatalystTest().Component;
const MultipleDepsTest = new $MultipleDepsTest().Component;

// ============================================
// MAIN TEST COMPONENT
// ============================================

export default function MemberTests() {
    return (
        <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
            <h1>Catalyst Correction Tests - Using Component.$bind().$chemical</h1>
            
            <div style={{ 
                marginBottom: '30px', 
                padding: '20px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '8px'
            }}>
                <h2 style={{ marginTop: 0 }}>The Magic of Bond Catalyst Correction</h2>
                <p style={{ fontSize: '18px' }}>
                    These tests prove that <code>bondGet</code>, <code>bondSet</code>, and <code>bondCall</code> 
                    automatically fix catalyst mismatches.
                </p>
                <p>
                    <strong>The Pattern:</strong> We receive dependencies with correct parents from the bond constructor,
                    then deliberately break them using <code>chemical.Component.$bind().$chemical</code> which creates
                    a new instance with NO parent (making it a catalyst). When we assign these broken chemicals or
                    return them from methods, the bond system transparently fixes them.
                </p>
            </div>
            
            <div style={{ display: 'grid', gap: '30px' }}>
                <FieldCatalystTest>
                    <DataChemical value="Dependency for Field Test" />
                </FieldCatalystTest>
                
                <PropertyCatalystTest>
                    <DataChemical value="Dependency for Property Test" />
                </PropertyCatalystTest>
                
                <MethodCatalystTest>
                    <DataChemical value="Dependency for Method Test" />
                </MethodCatalystTest>
                
                <MultipleDepsTest>
                    <DataChemical value="First Dependency" />
                    <DataChemical value="Second Dependency" />
                </MultipleDepsTest>
            </div>
        </div>
    );
}