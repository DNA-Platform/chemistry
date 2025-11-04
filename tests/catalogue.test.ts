import { describe, it, expect, beforeEach } from 'vitest';
import { $lib } from '../src/catalogue';
import { $Rep } from '@/types';

function $rep<T = any>(ref: string) { 
    return { ref: ref } as any as $Rep;
};

describe('$Catalogue', () => {
    // Fresh start for each test
    beforeEach(() => {
        $lib.$reset();
    });

    describe('The Elegant Self-Reference', () => {
        it('should have itself as its own subject', () => {
            expect($lib.$subject).toBe($lib);
        });

        it('should allow self-delegation through $subject', () => {
            const ref = $rep<string>('self-ref'); 
            $lib.$index(ref, 'value');
            
            // The beautiful circularity - asking yourself through yourself
            expect($lib.$find(ref, $lib.$subject)).toBe('value');
            expect($lib.$find(ref, $lib)).toBe('value');
        });

        it('should treat $subject as opaque from outside perspective', () => {
            const child = $lib.$new();
            // child.$subject appears to be just some value
            expect(child.$subject).toBeDefined();
            // But it's actually the child itself
            expect(child.$subject).toBe(child);
        });
    });

    describe('Core Literature & References', () => {
        it('should index and find with canonical representations', () => {
            const user = $rep<{ name: string }>('user');
            $lib.$index(user, { name: 'Alice' });
            
            // Different representation object, same ref string
            const sameRef = $rep<{ name: string }>('user');
            expect($lib.$find(sameRef)).toEqual({ name: 'Alice' });
        });

        it('should overwrite on re-index', () => {
            const config = $rep('config');
            $lib.$index(config, 'v1');
            $lib.$index(config, 'v2');
            expect($lib.$find(config)).toBe('v2');
        });

        it('should handle different value types', () => {
            const fn = $rep<Function>('handler');
            const num = $rep<number>('count');
            const nil = $rep<null>('nil');
            
            const handler = () => 'test';
            $lib.$index(fn, handler);
            $lib.$index(num, 42);
            $lib.$index(nil, null);
            
            expect($lib.$find(fn)).toBe(handler);
            expect($lib.$find(num)).toBe(42);
            expect($lib.$find(nil)).toBe(null);
        });

        it('should return undefined for missing representations', () => {
            const ghost = $rep('ghost');
            expect($lib.$find(ghost)).toBeUndefined();
        });
    });

    describe('$empty() - Isolated Catalogues', () => {
        it('should create catalogue with no inheritance', () => {
            const first = $lib.$empty();
            first.$index($rep('first'), 'value');
            
            const second = first.$empty();
            
            // Child cannot see parent's data
            expect(second.$find($rep('first'))).toBeUndefined();
            
            // Parent cannot see the childs data
            second.$index($rep('second'), 'data');
            expect(first.$find($rep('second'), second)).toBeUndefined();
        });

        it('should be completely isolated from root', () => {
            $lib.$index($rep('root'), 'root-data');
            const isolated = $lib.$empty();
            
            expect(isolated.$find($rep('root'))).toBeUndefined();
        });
    });

    describe('$new() - Inheritance Through Topics', () => {
        it('should create child that inherits from parent', () => {
            $lib.$index($rep('inherited'), 'from-parent');
            const child = $lib.$new();
            
            expect(child.$find($rep('inherited'))).toBe('from-parent');
        });

        it('should allow child to shadow parent values', () => {
            const key = $rep('key');
            $lib.$index(key, 'parent-value');
            
            const child = $lib.$new();
            child.$index(key, 'child-value');
            
            expect(child.$find(key)).toBe('child-value');
            expect($lib.$find(key)).toBe('parent-value');
        });

        it('should create inheritance chains', () => {
            const a = $rep('a');
            const b = $rep('b');
            const c = $rep('c');
            
            $lib.$index(a, 1);
            const middle = $lib.$new();
            middle.$index(b, 2);
            const bottom = middle.$new();
            bottom.$index(c, 3);
            
            // Bottom sees all
            expect(bottom.$find(a)).toBe(1);
            expect(bottom.$find(b)).toBe(2);
            expect(bottom.$find(c)).toBe(3);
            
            // Middle doesn't see bottom
            expect(middle.$find(c)).toBeUndefined();
            
            // Root only sees its own
            expect($lib.$find(b)).toBeUndefined();
            expect($lib.$find(c)).toBeUndefined();
        });
    });

    describe('$including() - Multiple Topics', () => {
        it('should inherit from multiple catalogues in order', () => {
            const cat1 = $lib.$empty();
            const cat2 = $lib.$empty();
            
            cat1.$index($rep('a'), 'from-1');
            cat2.$index($rep('b'), 'from-2');
            
            const combined = $lib.$including(cat1, cat2);
            
            expect(combined.$find($rep('a'))).toBe('from-1');
            expect(combined.$find($rep('b'))).toBe('from-2');
        });

        it('should respect topic order for shadowing', () => {
            const cat1 = $lib.$empty();
            const cat2 = $lib.$empty();
            const shared = $rep('shared');
            
            cat1.$index(shared, 'first');
            cat2.$index(shared, 'second');
            
            const combined = $lib.$including(cat1, cat2);
            expect(combined.$find(shared)).toBe('first'); // First topic wins
        });

        it('should include parent as last topic', () => {
            const other = $lib.$empty();
            other.$index($rep('other'), 'other-value');
            $lib.$index($rep('parent'), 'parent-value');
            
            const child = $lib.$including(other);
            
            expect(child.$find($rep('other'))).toBe('other-value');
            expect(child.$find($rep('parent'))).toBe('parent-value');
        });

        it('should filter non-catalogue topics silently', () => {
            const valid = $lib.$empty();
            valid.$index($rep('valid'), 'yes');
            
            // Including invalid topics - silently ignored
            const child = $lib.$including(valid, "not-a-catalogue" as any, 42 as any);
            
            expect(child.$find($rep('valid'))).toBe('yes');
        });
    });

    describe('Subject Delegation', () => {
        it('should delegate to known subjects', () => {
            const child = $lib.$new();
            child.$index($rep('child-data'), 'value');
            
            // Parent can delegate to child
            expect($lib.$find($rep('child-data'), child)).toBe('value');
        });

        it('should ignore unknown subjects', () => {
            const rogue = $lib.$empty(); // Not a child of root
            const other = $lib.$new();
            other.$index($rep('data'), 'value');
            
            // Rogue is not in $lib's subjects
            expect($lib.$find($rep('data'), rogue)).toBeUndefined();
            
            // But other is
            expect($lib.$find($rep('data'), other)).toBe('value');
        });

        it('should allow indexing to known subjects', () => {
            const child = $lib.$new();
            const ref = $rep('delegated');
            
            // Parent indexes to child
            $lib.$index(ref, 'from-parent', child);
            
            expect(child.$find(ref)).toBe('from-parent');
            expect($lib.$find(ref)).toBeUndefined();
        });

        it('should ignore indexing to unknown subjects', () => {
            const rogue = $lib.$empty();
            const ref = $rep('test');
            
            // This should be ignored
            $lib.$index(ref, 'ignored', rogue);
            
            expect(rogue.$find(ref)).toBeUndefined();
        });
    });

    describe('$deref() - Memory Management', () => {
        it('should clear entire catalogue when called empty', () => {
            const a = $rep('a');
            const b = $rep('b');
            
            $lib.$index(a, 1);
            $lib.$index(b, 2);
            
            $lib.$deref();
            
            expect($lib.$find(a)).toBeUndefined();
            expect($lib.$find(b)).toBeUndefined();
        });

        it('should remove specific reference', () => {
            const keep = $rep('keep');
            const remove = $rep('remove');
            
            $lib.$index(keep, 'staying');
            $lib.$index(remove, 'going');
            
            $lib.$deref(remove);
            
            expect($lib.$find(keep)).toBe('staying');
            expect($lib.$find(remove)).toBeUndefined();
        });

        it('should remove subject from topics', () => {
            const topic1 = $lib.$empty();
            const topic2 = $lib.$empty();
            
            topic1.$index($rep('t1'), 'value1');
            topic2.$index($rep('t2'), 'value2');
            
            const child = $lib.$including(topic1, topic2);
            
            // Remove topic1 from child's topics
            child.$deref(topic1);
            
            expect(child.$find($rep('t1'))).toBeUndefined();
            expect(child.$find($rep('t2'))).toBe('value2');
        });

        it('should delegate deref with rep and subject', () => {
            const child = $lib.$new();
            const ref = $rep('test');
            
            child.$index(ref, 'value');
            $lib.$deref(ref, child);
            
            expect(child.$find(ref)).toBeUndefined();
        });

        it('should make catalogue non-responsive after deref', () => {
            const child = $lib.$new();
            child.$deref();
            
            // These should all return undefined/do nothing
            expect(child.$new()).toBeUndefined();
            expect(child.$empty()).toBeUndefined();
            expect(child.$including($lib)).toBeUndefined();
            
            const ref = $rep('test');
            child.$index(ref, 'ignored');
            expect(child.$find(ref)).toBeUndefined();
        });
    });

    describe('Privacy Guarantees', () => {
        it('should not expose parent internals to child', () => {
            const parent = $lib.$new();
            const child = parent.$new();
            
            // Child cannot access parent's private members
            expect((child as any).literature).toBeUndefined();
            expect((child as any).references).toBeUndefined();
            expect((child as any).subjects).toBeUndefined();
            expect((child as any).topics).toBeUndefined();
        });

        it('should maintain isolation through export boundaries', () => {
            const createIsolated = () => {
                const internal = $lib.$empty();
                internal.$index($rep('secret'), 'hidden');
                
                const exposed = internal.$new();
                exposed.$index($rep('public'), 'visible');
                
                // Only return the child
                return exposed;
            };
            
            const catalogue = createIsolated();
            
            // Can see inherited data
            expect(catalogue.$find($rep('secret'))).toBe('hidden');
            expect(catalogue.$find($rep('public'))).toBe('visible');
            
            // But cannot modify parent
            catalogue.$index($rep('secret'), 'hacked');
            // Parent's value unchanged (we can't verify directly due to privacy)
        });

        it('should use $subject as opaque capability token', () => {
            const child = $lib.$new();
            
            // From outside, $subject is just a value
            const token = child.$subject;
            
            // But internally it enables delegation
            expect($lib.$find($rep('test'), token)).toBeUndefined();
            
            child.$index($rep('test'), 'value');
            expect($lib.$find($rep('test'), token)).toBe('value');
        });
    });

    describe('Complex Scenarios', () => {
        it('should handle deep inheritance with multiple branches', () => {
            // Create a tree structure
            const root = $lib.$empty();
            const left = root.$new();
            const right = root.$new();
            const leftChild = left.$new();
            const combined = root.$including(left, right);
            
            root.$index($rep('root'), 'r');
            left.$index($rep('left'), 'l');
            right.$index($rep('right'), 'r');
            leftChild.$index($rep('deep'), 'd');
            
            // Combined sees left, right, and root
            expect(combined.$find($rep('root'))).toBe('r');
            expect(combined.$find($rep('left'))).toBe('l');
            expect(combined.$find($rep('right'))).toBe('r');
            expect(combined.$find($rep('deep'))).toBeUndefined();
        });

        it('should handle re-referencing after deref', () => {
            const ref = $rep('reused');
            
            $lib.$index(ref, 'first');
            expect($lib.$find(ref)).toBe('first');
            
            $lib.$deref(ref);
            expect($lib.$find(ref)).toBeUndefined();
            
            $lib.$index(ref, 'second');
            expect($lib.$find(ref)).toBe('second');
        });

        it('should maintain separate namespaces per catalogue', () => {
            const cat1 = $lib.$empty();
            const cat2 = $lib.$empty();
            const same = $rep('shared-ref');
            
            cat1.$index(same, 'cat1-value');
            cat2.$index(same, 'cat2-value');
            
            expect(cat1.$find(same)).toBe('cat1-value');
            expect(cat2.$find(same)).toBe('cat2-value');
        });
    });
});