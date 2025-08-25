'use client'
import { $Chemical, child, first, second, third } from '@/chemistry';

class $Box extends $Chemical {
    $label: string = 'Box';
    $color: string = 'gray';
    
    view() {
        return (
            <div style={{ 
                padding: '10px 20px',
                background: this.$color,
                color: 'white',
                borderRadius: '4px',
                fontWeight: 'bold'
            }}>
                {this.$label}
            </div>
        );
    }
}

class $Step extends $Chemical {
    $title: string = 'Step';
    $color: string = '#6c757d';
    
    view() {
        return (
            <div style={{ 
                padding: '15px',
                background: this.$color,
                color: 'white',
                borderRadius: '4px',
                textAlign: 'center'
            }}>
                <strong>{this.$title}</strong>
            </div>
        );
    }
}

class $Wizard extends $Chemical {
    @first @child($Step)
    firstStep?: $Step;
    
    @second @child($Step)
    secondStep?: $Step;
    
    @third @child($Step)
    thirdStep?: $Step;
    
    @child($Step)
    additionalSteps: $Step[] = [];
    
    view() {
        return (
            <div style={{ 
                border: '2px solid indigo', 
                padding: '20px',
                borderRadius: '8px'
            }}>
                <h3>Wizard Component with Positional Binding</h3>
                
                <div style={{ marginBottom: '20px' }}>
                    <h4>Positionally Bound Steps:</h4>
                    <div style={{ paddingLeft: '20px' }}>
                        <div>First Step: {this.firstStep ? this.firstStep.$title : '❌ Not bound'}</div>
                        <div>Second Step: {this.secondStep ? this.secondStep.$title : '❌ Not bound'}</div>
                        <div>Third Step: {this.thirdStep ? this.thirdStep.$title : '❌ Not bound'}</div>
                    </div>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                    <h4>Additional Steps (array):</h4>
                    <div style={{ paddingLeft: '20px' }}>
                        {this.additionalSteps.length > 0 ? (
                            this.additionalSteps.map((step, i) => (
                                <div key={i}>Step {i + 4}: {step.$title}</div>
                            ))
                        ) : (
                            <div>No additional steps</div>
                        )}
                    </div>
                </div>
                
                <div style={{ 
                    display: 'flex', 
                    gap: '10px',
                    marginTop: '20px',
                    flexWrap: 'wrap'
                }}>
                    {this.firstStep && (
                        <div style={{ flex: '1', minWidth: '150px' }}>
                            {this.firstStep.view()}
                        </div>
                    )}
                    {this.secondStep && (
                        <div style={{ flex: '1', minWidth: '150px' }}>
                            {this.secondStep.view()}
                        </div>
                    )}
                    {this.thirdStep && (
                        <div style={{ flex: '1', minWidth: '150px' }}>
                            {this.thirdStep.view()}
                        </div>
                    )}
                    {this.additionalSteps.map((step, i) => (
                        <div key={i} style={{ flex: '1', minWidth: '150px' }}>
                            {step.view()}
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

class $Container extends $Chemical {
    @first @child($Box)
    topBox!: $Box;
    
    @second @child($Box)
    bottomBox!: $Box;
    
    view() {
        return (
            <div style={{ 
                border: '2px solid brown', 
                padding: '20px',
                borderRadius: '8px',
                marginTop: '20px'
            }}>
                <h3>Container with First/Second Binding</h3>
                <div style={{ marginBottom: '10px' }}>
                    <div>First box: {this.topBox ? `✓ ${this.topBox.$label}` : '❌ Not bound'}</div>
                    <div>Second box: {this.bottomBox ? `✓ ${this.bottomBox.$label}` : '❌ Not bound'}</div>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    {this.topBox && (
                        <div>{this.topBox.view()}</div>
                    )}
                    {this.bottomBox && (
                        <div>{this.bottomBox.view()}</div>
                    )}
                </div>
            </div>
        );
    }
}

export default function PositionalBindingTest() {
    const Wizard = new $Wizard().Component;
    const Step = new $Step().Component;
    const Container = new $Container().Component;
    const Box = new $Box().Component;
    
    return (
        <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
            <h1>Positional Binding Test</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Tests @first, @second, @third decorators for positional child binding.
            </p>
            
            <div style={{ marginBottom: '20px' }}>
                <h3>Expected Results:</h3>
                <ul>
                    <li>Setup should bind to firstStep</li>
                    <li>Configure should bind to secondStep</li>
                    <li>Review should bind to thirdStep</li>
                    <li>Deploy and Monitor should go into additionalSteps array</li>
                    <li>Red Box should bind to first position</li>
                    <li>Blue Box should bind to second position</li>
                </ul>
            </div>
            
            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
                <Wizard>
                    <Step title="Setup" color="#28a745" />
                    <Step title="Configure" color="#ffc107" />
                    <Step title="Review" color="#17a2b8" />
                    <Step title="Deploy" color="#dc3545" />
                    <Step title="Monitor" color="#6610f2" />
                </Wizard>
                
                <Container>
                    <Box label="Red Box" color="#dc3545" />
                    <Box label="Blue Box" color="#007bff" />
                    <Box label="Green Box (ignored)" color="#28a745" />
                </Container>
            </div>
            
            <div style={{ marginTop: '30px' }}>
                <h3>Test Status:</h3>
                <div style={{ 
                    padding: '10px', 
                    background: '#d4edda',
                    color: '#155724',
                    border: '1px solid #c3e6cb',
                    borderRadius: '4px'
                }}>
                    ✓ If steps are bound to correct positions as listed above, positional binding works
                </div>
            </div>
        </div>
    );
}