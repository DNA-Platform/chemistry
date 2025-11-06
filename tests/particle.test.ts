import { describe, it, expect } from 'vitest';
import React, { ReactElement } from 'react';
import { $Particle } from '@/chemistry/particle';
import { $View } from '@/types';
import {
    $cid$, $symbol$, $type$, $template$, $isTemplate$, $children$, $apply$, $bond$, $$template$$
} from "@/symbols";

describe('$Particle', () => {
    it('should establish template singleton correctly', () => {
        // The template already exists from module export
        const template = $Particle[$$template$$];
        expect(template).toBeInstanceOf($Particle);
        
        const p1 = new $Particle();
        const p2 = new $Particle();
        
        // Template should remain the same
        expect($Particle[$$template$$]).toBe(template);
        
        // Only the class template is the template
        expect(template[$isTemplate$]).toBe(true);
        expect(p1[$isTemplate$]).toBe(false);
        expect(p2[$isTemplate$]).toBe(false);
        
        // Each instance's $template points to itself (for now)
        expect(p1[$template$]).toBe(p1);
        expect(p2[$template$]).toBe(p2);
    });

    it('should carry instance and implementation on view function', () => {
        const particle = new $Particle();
        const $view = particle.view as $View<$Particle>;
        
        expect($view).toHaveProperty('$this');
        expect($view).toHaveProperty('$view');
        expect($view.$this).toBe(particle);
        expect($view.$view).toBe($Particle.prototype.view);
    });

    it('should have unique symbols for different instances', () => {
        const p1 = new $Particle();
        const p2 = new $Particle();
        
        expect(p1[$symbol$]).toBeDefined();
        expect(p2[$symbol$]).toBeDefined();
        expect(p1[$symbol$]).not.toBe(p2[$symbol$]);
    });

    it('should store constructor as type', () => {
        const particle = new $Particle();
        expect(particle[$type$]).toBe($Particle);
    });
});

describe('$Particle View Swapping', () => {
    it('should allow swapping view implementation', () => {
        const p1 = new $Particle();
        const $view = p1.view as $View<$Particle>;
        
        const customView = function(this: $Particle) {
            return `Custom: ${this[$symbol$]}`;
        };
        
        $view.$view = customView as any;
        const result = p1.view();
        
        expect(result).toContain('Custom:');
        expect(result).toContain(p1[$symbol$]);
    });

    it('should allow swapping view instance', () => {
        const p1 = new $Particle();
        const p2 = new $Particle();
        const $view = p1.view as $View<$Particle>;
        
        $view.$this = p2;
        const result = p1.view();
        
        // Should render p1's symbol (vessel identity) even though using p2 as $this
        expect(result).toBe(p1[$symbol$]);
        expect(result).not.toBe(p2[$symbol$]);
    });

    it('should preserve vessel symbol during render', () => {
        const vessel = new $Particle();
        const content = new $Particle();
        const vesselSymbol = vessel[$symbol$];
        const $view = vessel.view as $View<$Particle>;
        
        $view.$this = content;
        vessel.view();
        
        // Vessel's symbol should be unchanged after render
        expect(vessel[$symbol$]).toBe(vesselSymbol);
    });
});

describe('$Particle Props Application', () => {
    it('should apply props as $ prefixed properties', () => {
        class TestParticle extends $Particle {
            $color?: string;
            $size?: number;
            
            // Override view to ensure it's on the prototype
            view(): React.ReactNode {
                return `Color: ${this.$color}, Size: ${this.$size}`;
            }
        }
        
        const particle = new TestParticle();
        const $view = particle.view as $View<TestParticle>;
        
        // Verify TestParticle has its own template
        expect(TestParticle[$$template$$]).toBe(particle);
        
        $view({ color: 'red', size: 10 });
        
        expect(particle.$color).toBe('red');
        expect(particle.$size).toBe(10);
    });

    it('should handle children separately', () => {
        const particle = new $Particle();
        const $view = particle.view as $View<$Particle>;
        const children = React.createElement('div', null, 'Child Content');
        
        $view({ children });
        
        expect(particle[$children$]).toBe(children);
    });

    it('should ignore React reserved props', () => {
        const particle = new $Particle() as any;
        const $view = particle.view as $View<$Particle>;
        
        $view({ 
            key: 'test-key',
            ref: 'test-ref',
            color: 'blue'
        });
        
        expect(particle.$key).toBeUndefined();
        expect(particle.$ref).toBeUndefined();
        expect(particle.$color).toBe('blue');
    });
});

describe('$Particle Frame Method', () => {
    it('should use frame owner symbol as key', () => {
        const owner = new $Particle();
        const content = new $Particle();
        
        const result = owner.frame(content);
        const $element = result as ReactElement<any, any>;
        
        expect($element.key).toBe(owner[$symbol$]);
    });

    it('should render passed particle view', () => {
        class TestParticle extends $Particle {
            view() {
                return 'Test Content';
            }
        }
        
        const frame = new $Particle();
        const content = new TestParticle();
        
        const result = frame.frame(content);
        const $element = result as ReactElement<any, any>;
        
        expect($element.props.children).toBe('Test Content');
    });

    it('should handle frame with swapped view', () => {
        const frame = new $Particle();
        const content = new $Particle();
        const $contentView = content.view as $View<$Particle>;
        
        // Give content a custom view
        $contentView.$view = function(this: $Particle) {
            return `Frame Test: ${this[$symbol$]}`;
        } as any;
        
        const result = frame.frame(content);
        const $element = result as ReactElement<any, any>;
        
        expect($element.props.children).toContain('Frame Test:');
        expect($element.props.children).toContain(content[$symbol$]);
    });
});

describe('$Particle Module Export', () => {
    it('should export a universal Particle component', async () => {
        const { Particle } = await import('@/chemistry/particle');
        const $particle = Particle as $View<$Particle>;
        
        expect($particle).toBeDefined();
        expect($particle).toHaveProperty('$this');
        expect($particle).toHaveProperty('$view');
        expect($particle.$this).toBe($Particle[$$template$$]);
    });

    it('should allow using exported Particle as component', async () => {
        const { Particle } = await import('@/chemistry/particle');
        const $particle = Particle as $View<$Particle>;
        
        // Swap what it renders
        $particle.$view = function() {
            return 'Universal Particle';
        } as any;
        
        const result = Particle();
        expect(result).toBe('Universal Particle');
    });
});

describe('$Particle View Cross-swapping', () => {
    it('should handle complex view and instance swapping', () => {
        class Alpha extends $Particle {
            view() { return 'Alpha'; }
        }
        
        class Beta extends $Particle {
            view() { return 'Beta'; }
        }
        
        const alpha = new Alpha();
        const beta = new Beta();
        
        const $alphaView = alpha.view as $View<Alpha>;
        const $betaView = beta.view as $View<Beta>;
        
        // Swap alpha to use beta's instance
        $alphaView.$this = beta as any;
        
        // Swap beta to use alpha's view implementation  
        $betaView.$view = Alpha.prototype.view as any;
        
        const alphaResult = alpha.view();
        const betaResult = beta.view();
        
        // alpha.view() uses beta's instance with Alpha's view = 'Alpha'
        expect(alphaResult).toBe('Alpha');
        
        // beta.view() uses beta's instance with Alpha's view = 'Alpha'  
        expect(betaResult).toBe('Alpha');
    });

    it('should maintain separate view wrappers per instance', () => {
        const p1 = new $Particle();
        const p2 = new $Particle();
        
        const $view1 = p1.view as $View<$Particle>;
        const $view2 = p2.view as $View<$Particle>;
        
        // Each should have its own wrapper
        expect($view1).not.toBe($view2);
        expect($view1.$this).toBe(p1);
        expect($view2.$this).toBe(p2);
    });
});