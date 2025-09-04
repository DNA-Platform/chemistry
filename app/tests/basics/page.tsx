// app > tests > basics
'use client'
import { $Chemical } from '@/chemistry2';

// Test 1: Most basic - can we pass a prop and see it?
class $Display extends $Chemical {
   $text = 'initial';
   
   view() {
       console.log('Display.view() - $text:', this.$text);
       return (
           <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
               <div>Text: {this.$text}</div>
           </div>
       );
   }
}

// Test 2: Can we update a property and see the change?
class $Counter extends $Chemical {
   count = 0;
   
   increment() {
       console.log('Before increment:', this.count);
       this.count = this.count + 1;
       console.log('After increment:', this.count);
   }
   
   view() {
       return (
           <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
               <div>Count: {this.count}</div>
               <button 
                   onClick={() => this.increment()}
                   style={{ 
                       border: '1px solid #ccc',
                       background: '#f5f5f5',
                       padding: '5px 15px',
                       cursor: 'pointer',
                       borderRadius: '4px',
                       marginTop: '8px'
                   }}
               >
                   Increment
               </button>
           </div>
       );
   }
}

// Test 3: Multiple props
class $MultiProp extends $Chemical {
   $first = 'default1';
   $second = 'default2';
   $third = 0;
   
   view() {
       return (
           <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
               <div>First: {this.$first}</div>
               <div>Second: {this.$second}</div>
               <div>Third: {this.$third}</div>
           </div>
       );
   }
}

class $ComplexProps extends $Chemical {
   // Props (with $)
   $arrayProp = ['default1', 'default2'];
   $objectProp = { name: 'default', value: 0 };
   
   // Regular properties (no $)
   regularArrayCount = 0;
   regularArray = ['initial1', 'initial2', 'initial3'];
   regularObject = { status: 'ready', count: 10 };
   
   // Property with getter/setter
   private _computedValue = 100;
   get computedProp() {
       console.log('Getter called, returning:', this._computedValue * 2);
       return this._computedValue * 2;
   }
   set computedProp(val: number) {
       console.log('Setter called with:', val);
       this._computedValue = val / 2;
   }
   
   modifyRegularArray() {
       console.log('Before push:', this.regularArray);
       this.regularArrayCount++;
       this.regularArray.push('added ' + this.regularArrayCount);
       console.log('After push:', this.regularArray);
   }
   
   modifyRegularObject() {
       console.log('Before modify:', this.regularObject);
       this.regularObject.count++;
       this.regularObject.status = 'modified';
       (this.regularObject as any)['property' + this.regularObject.count] = 'value ' + this.regularObject.count;
       console.log('After modify:', this.regularObject);
   }
   
   modifyComputed() {
       console.log('Before computed change:', this.computedProp);
       this.computedProp = 300;
       console.log('After computed change:', this.computedProp);
   }
   
   view() {
       return (
           <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
               <h3>Complex Property Types</h3>
               
               <div style={{ marginBottom: '20px' }}>
                   <h4>Props (with $):</h4>
                   <div>Array Prop: {JSON.stringify(this.$arrayProp)}</div>
                   <div>Object Prop: {JSON.stringify(this.$objectProp)}</div>
               </div>
               
               <div style={{ marginBottom: '20px' }}>
                   <h4>Regular Properties (no $):</h4>
                   <div>Regular Array: {JSON.stringify(this.regularArray)}</div>
                   <div>Regular Object: {JSON.stringify(this.regularObject)}</div>
                   <button 
                       onClick={() => this.modifyRegularArray()}
                       style={{
                           padding: '5px 10px',
                           marginRight: '10px',
                           border: '1px solid #ccc',
                           background: '#f5f5f5',
                           borderRadius: '4px',
                           cursor: 'pointer'
                       }}
                   >
                       Add to Array
                   </button>
                   <button 
                       onClick={() => this.modifyRegularObject()}
                       style={{
                           padding: '5px 10px',
                           border: '1px solid #ccc',
                           background: '#f5f5f5',
                           borderRadius: '4px',
                           cursor: 'pointer'
                       }}
                   >
                       Modify Object
                   </button>
               </div>
               
               <div style={{ marginBottom: '20px' }}>
                   <h4>Computed Property (getter/setter):</h4>
                   <div>Computed Value: {this.computedProp}</div>
                   <button 
                       onClick={() => this.modifyComputed()}
                       style={{
                           padding: '5px 10px',
                           border: '1px solid #ccc',
                           background: '#f5f5f5',
                           borderRadius: '4px',
                           cursor: 'pointer'
                       }}
                   >
                       Set to 300
                   </button>
               </div>
           </div>
       );
   }
}

export default function BasicsTest() {
   const Display = new $Display().Component;
   const Counter = new $Counter().Component;
   const MultiProp = new $MultiProp().Component;
   const ComplexProps = new $ComplexProps().Component;
   
   return (
       <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
           <h1>Basics Test</h1>
           <p style={{ color: '#666', marginBottom: '30px' }}>
               Testing the absolute fundamentals of the Chemistry framework.
           </p>
           
           {/* Test 1 */}
           <div style={{ marginBottom: '40px' }}>
               <h2>Test 1: Simple Prop Passing</h2>
               <div style={{ marginBottom: '10px' }}>
                   <strong>Expected:</strong> Should show "Hello World" instead of "initial"
               </div>
               <Display text="Hello World" />
               <div style={{ marginTop: '10px', color: '#666' }}>
                   ✓ Pass if you see "Hello World"<br/>
                   ✗ Fail if you see "initial"
               </div>
           </div>
           
           {/* Test 2 */}
           <div style={{ marginBottom: '40px' }}>
               <h2>Test 2: Property Updates</h2>
               <div style={{ marginBottom: '10px' }}>
                   <strong>Expected:</strong> Count should increment when button clicked
               </div>
               <Counter />
               <div style={{ marginTop: '10px', color: '#666' }}>
                   ✓ Pass if count increases on click<br/>
                   ✗ Fail if count stays at 0
               </div>
           </div>
           
           {/* Test 3 */}
           <div style={{ marginBottom: '40px' }}>
               <h2>Test 3: Multiple Props</h2>
               <div style={{ marginBottom: '10px' }}>
                   <strong>Expected:</strong> Should show "One", "Two", and "99"
               </div>
               <MultiProp first="One" second="Two" third={99} />
               <div style={{ marginTop: '10px', color: '#666' }}>
                   ✓ Pass if all three props show correct values<br/>
                   ✗ Fail if any show default values
               </div>
           </div>
           
           {/* Test 4 */}
           <div style={{ marginBottom: '40px' }}>
               <h2>Test 4: Complex Property Types</h2>
               <div style={{ marginBottom: '10px' }}>
                   <strong>Expected:</strong> Arrays and objects as props, regular properties reactive, getter/setter working
               </div>
               <ComplexProps 
                   arrayProp={['passed1', 'passed2', 'passed3']}
                   objectProp={{ name: 'Passed Object', value: 42 }}
               />
               <div style={{ marginTop: '10px', color: '#666' }}>
                   ✓ Pass if arrays/objects show passed values<br/>
                   ✓ Pass if regular properties update on button clicks<br/>
                   ✓ Pass if computed property shows 600 after clicking "Set to 300"<br/>
                   ✗ Fail if props show defaults or properties don't update
               </div>
           </div>
       </div>
   );
}

