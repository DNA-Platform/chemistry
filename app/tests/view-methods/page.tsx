'use client'
import { $Chemical } from '@/chemistry';

class $ViewSwitcher extends $Chemical {
   $currentView = 0;  // Prop to control which view is shown
   transitionCount = 0;  // Non-prop property that counts transitions
   
   // Three different view methods that also update the counter
   firstView() {
       return (
           <div style={{ padding: '20px', background: '#f0f8ff', borderRadius: '8px' }}>
               <h3>First View</h3>
               <p>This is the first view content.</p>
               <p>This view shows transitions × 2 = {this.transitionCount * 2}</p>
               <button 
                   onClick={() => this.goToNextView()}
                   style={{
                       padding: '8px 16px',
                       border: '1px solid #4a90e2',
                       background: 'white',
                       borderRadius: '4px',
                       cursor: 'pointer'
                   }}
               >
                   Go to Second View
               </button>
           </div>
       );
   }
   
   secondView() {
       return (
           <div style={{ padding: '20px', background: '#f0fff0', borderRadius: '8px' }}>
               <h3>Second View</h3>
               <p>You're now in the second view.</p>
               <p>Transitions squared: {this.transitionCount ** 2}</p>
               <button 
                   onClick={() => this.goToNextView()}
                   style={{
                       padding: '8px 16px',
                       border: '1px solid #5cb85c',
                       background: 'white',
                       borderRadius: '4px',
                       cursor: 'pointer'
                   }}
               >
                   Go to Third View
               </button>
           </div>
       );
   }
   
   thirdView() {
       return (
           <div style={{ padding: '20px', background: '#fff5f0', borderRadius: '8px' }}>
               <h3>Third View</h3>
               <p>This is the final view.</p>
               <p>Transition count mod 3: {this.transitionCount % 3}</p>
               <button 
                   onClick={() => this.goToNextView()}
                   style={{
                       padding: '8px 16px',
                       border: '1px solid #ff7043',
                       background: 'white',
                       borderRadius: '4px',
                       cursor: 'pointer'
                   }}
               >
                   Back to First View
               </button>
           </div>
       );
   }
   
   goToNextView() {
       console.log('Transition count before:', this.transitionCount);
       console.log('Current view before:', this.$currentView);
       
       this.transitionCount++;
       this.$currentView = (this.$currentView + 1) % 3;
       
       console.log('Transition count after:', this.transitionCount);
       console.log('Current view after:', this.$currentView);
   }
   
   view() {
       console.log('ViewSwitcher.view() - currentView:', this.$currentView, 'transitionCount:', this.transitionCount);
       
       // Container wrapper with its own markup
       return (
           <div style={{ 
               border: '2px solid #333',
               borderRadius: '8px',
               overflow: 'hidden'
           }}>
               <div style={{
                   background: '#333',
                   color: 'white',
                   padding: '10px 20px',
                   display: 'flex',
                   justifyContent: 'space-between',
                   alignItems: 'center'
               }}>
                   <span>View Container</span>
                   <span style={{
                       background: 'rgba(255,255,255,0.2)',
                       padding: '4px 8px',
                       borderRadius: '4px',
                       fontSize: '14px'
                   }}>
                       Transitions: {this.transitionCount}
                   </span>
               </div>
               
               <div style={{ padding: '20px' }}>
                   {(() => {
                       switch(this.$currentView) {
                           case 0:
                               return this.firstView();
                           case 1:
                               return this.secondView();
                           case 2:
                               return this.thirdView();
                           default:
                               return this.firstView();
                       }
                   })()}
               </div>
               
               <div style={{
                   background: '#f5f5f5',
                   padding: '10px 20px',
                   borderTop: '1px solid #ddd',
                   fontSize: '12px',
                   color: '#666'
               }}>
                   Current View Index: {this.$currentView}
               </div>
           </div>
       );
   }
}

export default function InteractionTest() {
   const ViewSwitcher = new $ViewSwitcher().Component;
   
   return (
       <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
           <h1>Interaction Test</h1>
           <p style={{ color: '#666', marginBottom: '30px' }}>
               Testing method interactions, nested JSX, and mixed property types.
           </p>
           
           <div style={{ marginBottom: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
               <strong>Expected Behavior:</strong>
               <ul>
                   <li>Container shows transition count in header</li>
                   <li>Each view uses transition count differently in its content</li>
                   <li>Clicking buttons increments both transition count and current view</li>
                   <li>Footer shows current view index</li>
               </ul>
           </div>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
               <div>
                   <h3>Instance 1: Starting at First View</h3>
                   <ViewSwitcher currentView={0} />
               </div>
               
               <div>
                   <h3>Instance 2: Starting at Second View</h3>
                   <ViewSwitcher currentView={1} />
               </div>
           </div>
       </div>
   );
}