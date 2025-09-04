"use client"
import React, { ReactNode, ReactElement, useState, useRef, useEffect } from 'react';
import stringify from 'fast-safe-stringify';
import { BuildManifest } from 'next/dist/server/get-page-files';

// [Symbols remain the same]
const reactivated = Symbol('reactivated');
const backingFields = Symbol('backingFields');
const originalValues = Symbol('originalValues');
const deactivated = Symbol('deactivated');
const comparerSymbol = Symbol('comparer');
const updateSymbol = Symbol('update');

// Global registry for Chemical instances by key
const chemicalRegistry = new Map<string, $Chemical>();

type Properties<T> = {
    [K in keyof T as K extends `$${infer Rest}` ? Rest : never]: T[K]
} & {
    children?: ReactNode;
};

/**
 * Base class for Chemical components
 */
export class $Chemical {
    @inert()
    private childPositionCounts?: Map<any, number>;

    @inert()
    private _isSetup: boolean = false;

    @inert()
    private _id: number = 0;

    @inert()
    private get _prototype(): $Chemical {
        const constructor = this.constructor as typeof $Chemical;
        return constructor.chemicalPrototype;
    }

    // Public inert properties
    @inert()
    public Component!: React.FC<Properties<this>>;

    @inert()
    public parent?: $Chemical;

    @inert()
    public children?: ReactNode;

    // Constructor
    constructor() {
        this._id = $Chemical._getNextId();
        const constructor: any = this.constructor as typeof $Chemical;
        if (!constructor.chemicalPrototype) {
            constructor.chemicalPrototype = this;
            this.Component = this.createComponent();
        } else {
            this.Component = constructor.chemicalPrototype.Component;
        }
    }

    // Public method - subclasses override this to control rendering
    view(): ReactNode {
        // Default implementation - subclasses should override
        return this.children;
    }

    /**
     * Creates a React component that preserves Chemical instances across re-renders
     * by caching them in a global registry keyed by React's key prop
     */
    private createComponent(): React.FC<Properties<this>> {
        const prototype = this._prototype;
        const ChemicalComponent: React.FC<Properties<this>> = (props: any) => {
            // Use Chemical ID from props if provided, otherwise generate stable one
            const chemicalId = props._chemicalId || prototype._id;
            
            // Look up or create instance based on ID
            let instance = chemicalRegistry.get(chemicalId);
            if (!instance) {
                instance = this.createInstance();
                instance._id = chemicalId;
                chemicalRegistry.set(chemicalId, instance);
            }
            
            // Set up this component's update function
            const [, update] = useState({});
            (instance as any)[updateSymbol] = () => update({});
            
            // Clean up on unmount
            useEffect(() => {
                return () => {
                    // Don't delete from registry - preserve for next mount
                    (instance as any)[updateSymbol] = undefined;
                };
            }, []);

            if (props.children) {
                const modifiedChildren = $Chemical.modifyChildren(instance, props.children);
                instance.children = modifiedChildren;
            }

            return instance.view();
        };

        (ChemicalComponent as any).isChemical = true;
        return ChemicalComponent;
    }

    private createInstance(): $Chemical {
        const prototype = this._prototype;
        const instance = Object.create(prototype);
        instance._isSetup = false;

        // Give each instance its own copy of bindable properties
        const bindings = getBindings(this);
        for (const binding of bindings) {
            if (binding.property !== 'children') {
                const self = this as any;
                const protoValue = self[binding.property];

                // Just copy whatever the @child decorator set up on the prototype
                // Don't create new objects that overwrite the placeholder Chemicals
                if (protoValue !== undefined) {
                    if (Array.isArray(protoValue)) {
                        instance[binding.property] = [];
                    } else {
                        // Copy the prototype value as-is (it's already a placeholder Chemical)
                        instance[binding.property] = protoValue;
                    }
                }
            }
        }

        return instance;
    }

    private static _nextId = 0;
    private static chemicalPrototype: $Chemical;
    private static _getNextId(): number { return this._nextId++; }

    private static applyProps(instance: $Chemical, props: any): void {
        if (!props) return;

        for (const key in props) {
            if (props.hasOwnProperty(key) &&
                key !== 'children' &&
                key !== '__parentInstance') {
                this.setProp(instance, key, props[key]);
            }
        }
    }

    private static setProp(instance: $Chemical, key: string, value: any): void {
        const componentKey = '$' + String(key);
        const transformers = instance.constructor.prototype.transformers;

        if (transformers?.has(componentKey)) {
            const transformer = transformers.get(componentKey);
            (instance as any)[componentKey] = transformer(value);
        } else {
            (instance as any)[componentKey] = value;
        }
    }

    private static handleParentBinding(instance: $Chemical, props: any): void {
        if (!props.__parentInstance) {
            return;
        }

        instance.parent = props.__parentInstance;
        if (instance.parent) {
            this.applyBinding(instance, instance.parent);
        }
    }

    private static applyBinding(child: $Chemical, parent: $Chemical): void {
        const bindings = getBindings(parent);
        console.log(`applyBinding: ${parent.constructor.name} has ${bindings.length} bindings`);

        if (!parent.childPositionCounts) {
            parent.childPositionCounts = new Map();
        }

        for (const binding of bindings) {
            if (binding.property === 'children') continue;

            console.log(`applyBinding: Checking binding for property '${binding.property}', expects class: ${binding.class?.name}`);

            if (this.matchesBinding(child, parent, binding)) {
                console.log(`applyBinding: MATCH! Binding ${child.constructor.name} to ${parent.constructor.name}.${binding.property}`);
                this.bindChild(child, parent, binding);
                break;
            } else {
                console.log(`applyBinding: No match for ${binding.property}`);
            }
        }
    }

    private static matchesBinding(child: $Chemical, parent: $Chemical, binding: any): boolean {
        if (!(child instanceof binding.class!)) return false;

        if (binding.position !== undefined) {
            const count = parent.childPositionCounts!.get(binding.class) || 0;
            if (binding.position !== count) {
                parent.childPositionCounts!.set(binding.class!, count + 1);
                return false;
            }
            parent.childPositionCounts!.set(binding.class!, count + 1);
        }

        if (binding.where && !binding.where(child)) return false;

        return true;
    }

    /**
    * Binds a child Chemical to its parent property
    */
    private static bindChild(child: $Chemical, parent: $Chemical, binding: any): void {
        console.log(`bindChild: Binding ${child.constructor.name} to ${parent.constructor.name}.${binding.property}`);

        // Initialize property if undefined
        if ((parent as any)[binding.property] === undefined) {
            const defaultValue = Array.isArray(binding.default) ? [] : createPlaceholderChemical(binding.class);
            (parent as any)[binding.property] = defaultValue;
            console.log(`bindChild: Initialized ${binding.property} with placeholder`);
        }

        // Get the current value
        const currentValue = (parent as any)[binding.property];

        // Handle array properties
        if (Array.isArray(currentValue)) {
            console.log(`bindChild: Adding to array ${binding.property}, current length: ${currentValue.length}`);

            // Replace placeholder if it exists at index 0
            if (currentValue.length > 0 && currentValue[0]._isPlaceholder) {
                currentValue[0] = child;
            } else {
                currentValue.push(child);
            }

            // Trigger update through setter
            (parent as any)[binding.property] = [...currentValue];

        } else {
            // Handle single property
            if (currentValue._isPlaceholder) {
                console.log(`bindChild: Replacing placeholder with real child for ${binding.property}`);
                (parent as any)[binding.property] = child;
            } else if (!currentValue) {
                console.log(`bindChild: Setting single child to ${binding.property}`);
                (parent as any)[binding.property] = child;
            } else {
                console.log(`bindChild: Property ${binding.property} already has a real value, skipping`);
                return;
            }
        }

        // Check if all bindings are now satisfied
        const allSatisfied = checkAllBindingsSatisfied(parent);
        if (allSatisfied) {
            console.log(`bindChild: All bindings satisfied for ${parent.constructor.name}`);

            // Force a re-render to remove hidden elements
            //const updateFn = componentUpdaters.get(parent);
            const update: Function = (parent as any)[updateSymbol];
            if (update) {
                console.log(`bindChild: Triggering final update to remove hidden elements`);
                update();
            } else {
                console.warn(`bindChild: No update function found for parent ${parent.constructor.name}`);
            }
        }
    }

    private static unbindChild(child: $Chemical, parent: $Chemical): void {
        const bindings = getBindings(parent);

        for (const binding of bindings) {
            if (binding.property === 'children') continue;

            const prop = (parent as any)[binding.property];
            if (Array.isArray(prop)) {
                const index = prop.indexOf(child);
                if (index >= 0) prop.splice(index, 1);
            } else if ((parent as any)[binding.property] === child) {
                (parent as any)[binding.property] = undefined;
            }
        }
    }

    // private static unregisterFromParent(child: $Chemical, parent: $Chemical): void {
    //     this.unbindChild(child, parent);
    //     this.untrackChild(parent, child);
    // }

    private static runCatalystMethods(instance: $Chemical): void {
        const methods = instance.constructor.prototype.catalystMethods;
        if (!methods) return;

        for (const methodName of methods) {
            if (typeof (instance as any)[methodName] === 'function') {
                (instance as any)[methodName]();
            }
        }
    }

    private static modifyChildren(instance: $Chemical, children: ReactNode): ReactNode {
        console.log(`modifyChildren for ${instance.constructor.name}:`, children);
        const childrenArray = React.Children.toArray(children);

        return childrenArray.map(child => {
            if (React.isValidElement(child) && (child.type as any).isChemical) {
                return React.cloneElement(child as any, {
                    ...(child.props as any),
                    __parentInstance: instance
                });
            }
            return child;
        });
    }
}

/**
 * Decorator to mark a field as inert (non-reactive)
 */
export function inert() {
    return function (target: any, propertyKey: string) {
        // Create or get the inert properties set
        if (!target[deactivated as any]) {
            target[deactivated as any] = new Set<string>();
        }

        // Add this property to the inert set
        target[deactivated as any].add(propertyKey);
    };
}

/**
 * Decorator to specify a custom equality comparison for a field
 */
export function equate(comparer: (a: any, b: any) => boolean) {
    return function (target: any, propertyKey: string) {
        // Create or get the property comparers map
        if (!target[comparerSymbol as any]) {
            target[comparerSymbol as any] = new Map<string, (a: any, b: any) => boolean>();
        }

        // Add the custom comparer for this property
        target[comparerSymbol as any].set(propertyKey, comparer);
    };
}

/**
 * Decorator for properties that should use deep equality comparison
 * Useful for arrays, collections, and complex objects
 */
export function dynamic() {
    return function (target: any, propertyKey: string) {
        // Create or get the property comparers map
        if (!target[comparerSymbol as any]) {
            target[comparerSymbol as any] = new Map<string, (a: any, b: any) => boolean>();
        }

        // Add a JSON-based deep comparer for this property
        target[comparerSymbol as any].set(propertyKey, (a: any, b: any) => {
            try {
                return stringify(a) === stringify(b);
            } catch (e) {
                // If stringify fails (circular refs, etc.), fall back to reference equality
                return a === b;
            }
        });
    };
}

/**
 * Decorator for methods that should run after component rendering
 */
export function entail() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        // Create or get the catalysts methods set
        if (!target.catalystMethods) {
            target.catalystMethods = new Set<string>();
        }

        // Add this method to the catalysts set
        target.catalystMethods.add(propertyKey);

        // Return the original descriptor
        return descriptor;
    };
}

/**
 * Decorator for properties that should run the value through a transformation function
 */
export function transform(transformer: (value: any) => any) {
    return function (target: any, propertyKey: string) {
        // Create or get the transformers map
        if (!target.transformers) {
            target.transformers = new Map<string, (value: any) => any>();
        }

        // Add the transformer for this property
        target.transformers.set(propertyKey, transformer);
    };
}

/**
 * Interface for binding decorators
 */
interface Binding {
    class?: typeof $Chemical;                    // The class to bind
    optional?: boolean;                         // Whether binding is optional
    position?: number;                          // For @first, @second, etc (0-based)
    where?: (instance: any) => boolean;         // Conditional predicate
    property: string;                           // Property name (for convenience)
}

/**
* Decorator for binding a child to a property
*/
export function child(ChildClass: any) {
    return function (target: any, propertyKey: string) {
        // Set up binding metadata
        const constructor = target.constructor as any;
        if (!constructor.__bindingsMap) {
            constructor.__bindingsMap = new Map<string, Binding>();
        }

        // Store metadata about binding
        let binding = constructor.__bindingsMap.get(propertyKey);
        if (!binding) {
            binding = { property: propertyKey };
            constructor.__bindingsMap.set(propertyKey, binding);
        }

        // Mark this property as a Chemical property in metadata
        if (!constructor.__chemicalProperties) {
            constructor.__chemicalProperties = new Set<string>();
        }
        constructor.__chemicalProperties.add(propertyKey);

        binding.class = ChildClass;
        if (binding.optional === undefined) {
            binding.optional = false;
        }

        // Wrap the view method only once for the entire class
        if (!constructor.__viewWrapped) {
            constructor.__viewWrapped = true;
            const originalView = target.view;

            target.view = function () {
                const originalResult = originalView.call(this);

                // Render hidden children if there are any bindings that could receive children
                const hasBindings = getBindings(this).some(b => b.property !== 'children');

                if (hasBindings && this.elements) {
                    return React.createElement(
                        React.Fragment,
                        null,
                        originalResult,
                        React.createElement(
                            'div',
                            {
                                style: { display: 'none' },
                                'aria-hidden': 'true',
                                'data-chemistry-hidden': 'true'
                            },
                            this.elements
                        )
                    );
                }

                return originalResult;
            };
        }

        // Initialize property with placeholder
        if (!target.hasOwnProperty(propertyKey)) {
            const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
            const isArray = descriptor?.value instanceof Array;
            target[propertyKey] =
                isArray ? [] :
                    !binding.optional ? createPlaceholderChemical(ChildClass) :
                        undefined;
        }
        dynamic()(target, propertyKey);
    };
}

/**
 * Decorator for positional child property binding
 */
export function optional() {
    return function (target: any, propertyKey: string) {
        const constructor = target.constructor as any;
        if (!constructor.__bindingsMap) constructor.__bindingsMap = new Map<string, Binding>();

        let binding = constructor.__bindingsMap.get(propertyKey);
        if (!binding) {
            binding = { property: propertyKey };
            constructor.__bindingsMap.set(propertyKey, binding);
        }

        binding.optional = true;
        if (target[propertyKey])
            target[propertyKey] = undefined;
    };
}

/**
 * Decorator for conditional child property binding
 */
export function where(predicate: (instance: $Chemical) => boolean) {
    return function (target: any, propertyKey: string) {
        const constructor = target.constructor as any;
        if (!constructor.__bindingsMap) constructor.__bindingsMap = new Map<string, Binding>();

        let binding = constructor.__bindingsMap.get(propertyKey);
        if (!binding) {
            binding = { property: propertyKey };
            constructor.__bindingsMap.set(propertyKey, binding);
        }

        binding.where = predicate;
        binding.optional = true;
        if (target[propertyKey])
            target[propertyKey] = undefined;
    };
}

/**
 * Decorator for positional child property binding
 */
export function position(n: number) {
    return function (target: any, propertyKey: string) {
        const constructor = target.constructor as any;
        if (!constructor.__bindingsMap) constructor.__bindingsMap = new Map<string, Binding>();

        let binding = constructor.__bindingsMap.get(propertyKey);
        if (!binding) {
            binding = { property: propertyKey };
            constructor.__bindingsMap.set(propertyKey, binding);
        }

        binding.position = n - 1;  // 0-based
    };
}

// Convencience child binding decorators for different positions
export const first = position(1);
export const second = position(2);
export const third = position(3);
export const fourth = position(4);
export const fifth = position(5);

/**
 * Get merged bindings for a Chemical instance
 */
function getBindings(instance: $Chemical): any[] {
    const constructor = instance.constructor as any;

    // Return cached if available
    if (constructor._mergedBindings) {
        return constructor._mergedBindings;
    }

    // Build merged map
    const mergedMap = new Map<string, any>();

    // Walk up prototype chain, child bindings override parent
    let proto = constructor;
    while (proto && proto !== $Chemical) {
        if (proto.__bindingsMap) {
            proto.__bindingsMap.forEach((binding: any, key: string) => {
                // Only add if not already set by child class
                if (!mergedMap.has(key)) {
                    mergedMap.set(key, { ...binding, property: key });
                }
            });
        }
        proto = Object.getPrototypeOf(proto);
    }

    // Convert to array, filter invalid, and sort
    const bindings: any[] = [];
    mergedMap.forEach(binding => {
        if (!binding.class) {
            console.warn(`Binding for '${binding.property}' missing @child decorator`);
            return;
        }
        bindings.push(binding);
    });

    // Sort: indexed first, then by index value
    bindings.sort((a, b) => {
        if (a.position !== undefined && b.position === undefined) return -1;
        if (b.position !== undefined && a.position === undefined) return 1;
        if (a.position !== undefined && b.position !== undefined) {
            return a.position - b.position;
        }
        return 0;
    });

    // Cache and return
    constructor._mergedBindings = bindings;
    return bindings;
}

/**
 * Reactivates an object, making its properties reactive
 */
function reactivate<T extends object>(instance: T, owner?: $Chemical): T {
    (instance as any)[reactivated] = true;
    const className = (instance as any).constructor?.name || 'Unknown';
    console.log(`reactivate: ${className}`);

    const triggerUpdate = () => {
        const update =
            owner ? (owner as any)[updateSymbol] :
            instance instanceof $Chemical ? (instance as any)[updateSymbol] :
            undefined;

        if (update) {
            console.log(`reactivate: Update triggered for ${className}`);
            update();
        } else {
            console.warn(`reactivate: No update function found for ${className}`);
        }
    };

    decorate(instance, {
        after: (className, memberName, memberType, method, args, result) => {
            if (memberType === 'field') {
                triggerUpdate();
            }
            return result;
        }
    });

    // Count reactive properties
    let reactiveCount = 0;
    for (const key in instance) {
        if (key !== 'constructor' && !key.startsWith('_')) {
            const value = (instance as any)[key];
            if (!(value instanceof $Chemical) && value && typeof value === 'object' && !(value instanceof Date)) {
                reactiveCount++;
            }
        }
    }

    console.log(`reactivate: ${className} has ${reactiveCount} reactive properties`);

    return instance;
}
/**
 * Reactivates a nested data object in an object or field 
 */
function reactivateData(obj: any, owner: $Chemical) {
    if (!obj || typeof obj !== 'object' || obj instanceof $Chemical) return;
    reactivate(obj, owner);
}

/**
 * Deactivates an object, preventing it from triggering updates
 * This is exported for advanced usage but generally should be used via Chemical.deactivate
 */
function deactivate<T extends object>(instance: T): T {
    // Mark as deactivated
    (instance as any)[deactivated] = true;
    return instance;
}

/**
 * Creates a reactive getter for a property
 */
function createReactiveGetter(key: string, className: string, shouldUseDynamic: boolean, config: DecoratorConfig) {
    return function (this: any) {
        const value = this[backingFields][key];

        // Schedule dirty check for dynamic properties
        if (shouldUseDynamic && value) {
            if (!this[backingFields][key + '_checkScheduled']) {
                const snapshot = represent(value);
                this[backingFields][key + '_checkScheduled'] = true;

                setTimeout(() => {
                    try {
                        const current = represent(this[backingFields][key]);
                        if (snapshot !== current) {
                            console.log(`Dirty check detected change in ${key}`);
                            if (config.after) {
                                config.after(className, key, 'field', () => { }, [this[backingFields][key]], undefined);
                            }
                        }
                    } catch (e) {
                        console.error(`Error in dirty check for ${key}:`, e);
                    }
                    this[backingFields][key + '_checkScheduled'] = false;
                }, 0);
            }
        }

        if (config.after) {
            const afterResult = config.after(className, key, 'property', () => { }, [], value);
            return afterResult ?? value;
        }

        return value;
    };
}

/**
 * Creates a reactive setter for a property
 */
function createReactiveSetter(key: string, className: string, shouldUseDynamic: boolean, config: DecoratorConfig) {
    return function (this: any, newValue: any) {
        const oldValue = this[backingFields][key];

        // Check if values are equal
        if (oldValue === newValue) {
            return;
        }

        // Check for custom comparer
        const proto = Object.getPrototypeOf(this);
        const hasCustomComparer = proto?.[comparerSymbol as any]?.has(key);

        if (hasCustomComparer) {
            const customComparer = proto[comparerSymbol as any].get(key);
            if (customComparer(oldValue, newValue)) {
                return;
            }
        } else if (shouldUseDynamic) {
            // Use represent for comparison
            // Skip comparison if transitioning from undefined to defined
            if (oldValue !== undefined && newValue !== undefined) {
                try {
                    if (represent(oldValue) === represent(newValue)) {
                        return;
                    }
                } catch (e) {
                    // Continue with update if comparison fails
                }
            }
        }

        let valueToSet = newValue;

        // Apply before interceptor
        if (config.before) {
            const beforeResult = config.before(className, key, 'field', () => { }, [newValue]);
            if (beforeResult?.[1]) {
                valueToSet = beforeResult[1][0];
            }
        }

        // Reactify complex objects
        if (valueToSet && typeof valueToSet === 'object' &&
            !Object.isFrozen(valueToSet) &&
            !Object.isSealed(valueToSet) &&
            Object.isExtensible(valueToSet) &&
            !(valueToSet instanceof $Chemical) &&
            !Array.isArray(valueToSet) &&
            !(valueToSet instanceof Date)) {
            this.reactivateData(valueToSet, this);
        }

        this[backingFields][key] = valueToSet;

        // Apply after interceptor
        if (config.after) {
            config.after(className, key, 'field', () => { }, [valueToSet], undefined);
        }
    };
}

/**
 * Determines if a value should use dynamic dirty-checking
 */
function shouldUseDynamicChecking(value: any): boolean {
    // Undefined values will be handled specially in decorateProperties
    if (value === undefined) {
        return false;  // Will be overridden to true in decorateProperties
    }

    const isChemicalProperty = value instanceof $Chemical ||
        (Array.isArray(value) && value.length > 0 && value[0] instanceof $Chemical);

    return !isChemicalProperty && (Array.isArray(value) ||
        (typeof value === 'object' && value !== null && !(value instanceof Date)));
}

/**
 * Creates a placeholder Chemical that won't crash when accessed
 */
function createPlaceholderChemical(ChildClass: any, isOptional: boolean = false): any {
    if (isOptional) return undefined;
    const placeholder = new ChildClass();
    placeholder._isPlaceholder = true;
    placeholder._optional = isOptional;

    console.log('Created placeholder:', {
        class: ChildClass.name,
        hasView: typeof placeholder.view,
        viewValue: placeholder.view
    });

    return placeholder;
}

/**
* Checks if all required bindings for a Chemical are satisfied
*/
function checkAllBindingsSatisfied(instance: $Chemical): boolean {
    const bindings = getBindings(instance);

    for (const binding of bindings) {
        if (binding.property === 'children') continue;

        const value = (instance as any)[binding.property];

        if (Array.isArray(value)) {
            // Arrays are satisfied if they have at least one real element
            if (value.length === 0 || value.some((v: any) => v._isPlaceholder)) {
                return false;
            }
        } else {
            // For single values:
            // - Required bindings: must have a non-placeholder value
            // - Optional bindings: if present, must be non-placeholder
            if (!binding.optional && (!value || value._isPlaceholder)) {
                return false;
            }
            if (binding.optional && value && value._isPlaceholder) {
                return false;
            }
        }
    }

    return true;
}

// Type definitions for decorator configuration
type MemberType = 'method' | 'property' | 'field';
type DecoratorConfig = {
    before?: (
        className: string,
        memberName: string,
        memberType: MemberType,
        method: Function,
        args: any[]
    ) => [Function, any[]] | undefined;
    after?: (
        className: string,
        memberName: string,
        memberType: MemberType,
        method: Function,
        args: any[],
        result: any
    ) => any | undefined;
    error?: (
        className: string,
        memberName: string,
        memberType: MemberType,
        method: Function,
        args: any[],
        error: any
    ) => any | undefined;
};

/**
 * Decorates an object's methods and properties with interceptors
 */
function decorate<T extends object>(instance: T, config: DecoratorConfig): T {
    // Skip if already decorated - but check individual properties
    // if ((instance as any)[reactivated]) {
    //     return instance;
    // }

    const className: string = instance?.constructor?.name ?? "<UNKNOWN>";

    // Initialize backing fields if not present
    if (!(instance as any)[backingFields]) {
        (instance as any)[backingFields] = {};
    }
    if (!(instance as any)[originalValues]) {
        (instance as any)[originalValues] = {};
    }

    // Process properties and fields
    decorateProperties(instance, className, config);

    // Mark as reactified
    (instance as any)[reactivated] = true;

    return instance;
}

/**
 * Decorates properties of an object with interceptors
 */
function decorateProperties(instance: any, className: string, config: DecoratorConfig): void {
    const properties = getAllProperties(instance);

    // Initialize backing fields if needed
    if (!instance[backingFields]) {
        instance[backingFields] = {};
    }

    for (const key of properties) {
        const value = instance[key];

        // Skip non-reactive properties
        if (!isReactiveProperty(instance, key, value)) {
            continue;
        }

        // Check if THIS INSTANCE already has a reactive property
        const ownDescriptor = Object.getOwnPropertyDescriptor(instance, key);
        if (ownDescriptor && (ownDescriptor.get || ownDescriptor.set)) {
            continue;  // Already reactive on this instance
        }

        // Check if prototype has an accessor property we need to handle
        const protoDescriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(instance), key);
        if (protoDescriptor && (protoDescriptor.get || protoDescriptor.set)) {
            decorateAccessorProperty(instance, key, protoDescriptor, className, config);
            continue;
        }

        // Store current value (could be inherited from prototype)
        instance[backingFields][key] = value;

        // Determine checking strategy
        // Check if this is a Chemical property from binding metadata
        const constructor = instance.constructor as any;
        const isChemicalProperty = constructor.__chemicalProperties?.has(key);

        let shouldUseDynamic: boolean;
        if (isChemicalProperty) {
            // Chemical properties always use reference equality
            shouldUseDynamic = false;
        } else if (value === undefined) {
            // Non-Chemical undefined properties use dynamic
            shouldUseDynamic = true;
        } else {
            // Normal checking for defined values
            shouldUseDynamic = shouldUseDynamicChecking(value);
        }

        // Create reactive property on instance (shadows prototype if inherited)
        Object.defineProperty(instance, key, {
            get: createReactiveGetter(key, className, shouldUseDynamic, config),
            set: createReactiveSetter(key, className, shouldUseDynamic, config),
            enumerable: true,
            configurable: true
        });
    }
}

/**
 * Decorates an accessor property (getter/setter)
 */
function decorateAccessorProperty(
    instance: any,
    key: string,
    descriptor: PropertyDescriptor,
    className: string,
    config: DecoratorConfig
): void {
    const originalGet = descriptor.get;
    const originalSet = descriptor.set;

    Object.defineProperty(instance, key, {
        get: function () {
            // Preserve original getter behavior
            const value = originalGet?.call(this);

            if (config.after) {
                const afterResult = config.after(className, key, 'property', () => { }, [], value);
                return afterResult ?? value;
            }

            return value;
        },
        set: function (newValue) {
            if (!originalSet) return; // Read-only property

            const oldValue = originalGet?.call(this);

            // Skip update if values are equal
            if (oldValue === newValue) {
                return;
            }

            // Check for custom comparer
            const proto = Object.getPrototypeOf(this);
            const hasCustomComparer = proto &&
                proto[comparerSymbol as any] &&
                proto[comparerSymbol as any].has(key);

            if (hasCustomComparer) {
                const customComparer = proto[comparerSymbol as any].get(key);
                if (customComparer(oldValue, newValue)) {
                    return; // Skip update if custom comparer says they're equal
                }
            }

            // Call original setter
            originalSet.call(this, newValue);

            // Apply after logic to trigger updates
            if (config.after) {
                config.after(className, key, 'field', () => { }, [newValue], undefined);
            }
        },
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable
    });
}

/**
 * Creates a string representation for comparison
 */
function represent(value: any): string {
    return stringify(value, function (this: any, key: string, val: any): any {
        // Root object
        if (key === '') return val;

        // The 'this' context in replacer is the parent object containing the property
        // Check if parent is a Chemical and if this property should be excluded
        if (this && this instanceof $Chemical) {
            if (!isReactiveProperty(this, key, val)) {
                return undefined;
            }
        }

        // Special handling for Chemical values
        if (val instanceof $Chemical) {
            const simplified: Record<string, any> = { _chemical: val.constructor.name };
            // Only include $ props for Chemical instances
            for (const prop in val) {
                if (prop.startsWith('$') && typeof (val as any)[prop] !== 'function') {
                    simplified[prop] = (val as any)[prop];
                }
            }
            return simplified;
        }

        // Skip functions
        if (typeof val === 'function') {
            return undefined;
        }

        // Handle Next.js proxies
        if (val && typeof val === 'object') {
            try {
                if (val.constructor?.name === 'Proxy') {
                    return '[NextProxy]';
                }
            } catch {
                return '[Inaccessible]';
            }
        }

        return val;
    });
}

/**
 * Determines if a property should be reactive (tracked for changes)
 */
function isReactiveProperty(instance: any, key: string, value: any): boolean {
    // Skip internal symbols and backing fields
    if (key === String(reactivated) ||
        key === String(deactivated) ||
        key === String(backingFields) ||
        key === String(originalValues) ||
        key === String(comparerSymbol) ||
        key === String(updateSymbol)) {
        return false;
    }


    // Skip standard excluded properties
    if (key === 'constructor' ||
        key === 'state' ||
        key === 'props' ||
        key === 'Component' ||
        key === 'parent' ||
        key === 'children' ||
        key === 'elements' ||
        key === '__parentInstance' ||
        key === '_isSetup') {
        return false;
    }

    // Skip functions
    if (typeof value === 'function') {
        return false;
    }

    // Skip properties from $Chemical prototype
    if ($Chemical.prototype.hasOwnProperty(key)) {
        return false;
    }

    // Skip if marked as @inert
    const proto = Object.getPrototypeOf(instance);
    if (proto && proto[deactivated as any]?.has(key)) {
        return false;
    }

    // Skip Chemical instances (they're handled specially)
    if (value instanceof $Chemical) {
        return false;
    }

    return true;
}

/**
 * Checks if an object is a base object method
 */
function isBaseObjectMethod(methodName: string): boolean {
    return Object.prototype.hasOwnProperty.call(Object.prototype, methodName);
}

/**
 * Gets all methods from an object and its prototype chain
 */
function getAllMethods(obj: any): { [key: string]: Function } {
    const methods: { [key: string]: Function } = {};
    let proto = obj;

    while (proto && proto !== Object.prototype) {
        for (const key in proto) {
            if (methods[key]) continue;
            if (
                typeof proto[key] === "function" &&
                !key.startsWith("_") && // Skip private methods
                !isBaseObjectMethod(key)
            ) {
                methods[key] = proto[key];
            }
        }
        proto = proto.__proto__;
    }

    return methods;
}

/**
 * Gets all properties from an object
 */
function getAllProperties(obj: any): string[] {
    const properties = new Set<string>();

    // Get own properties
    Object.getOwnPropertyNames(obj).forEach(prop => {
        properties.add(prop);
    });

    // Get properties from prototype chain
    let proto = Object.getPrototypeOf(obj);
    while (proto && proto !== Object.prototype) {
        Object.getOwnPropertyNames(proto).forEach(prop => {
            if (!prop.startsWith('_') && prop !== 'constructor') {
                properties.add(prop);
            }
        });
        proto = Object.getPrototypeOf(proto);
    }

    return Array.from(properties);
}