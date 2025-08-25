"use client"
import React, { ReactNode, ReactElement, useState, useRef, useEffect } from 'react';

// Symbol for tracking reactified objects
const reactivated = Symbol('reactivated');
const backingFields = Symbol('backingFields');
const originalValues = Symbol('originalValues');
const deactivated = Symbol('deactivated');
const comparerSymbol = Symbol('comparer');

// Near the top of the file, with other symbols and constants
const componentUpdaters = new WeakMap<object, () => void>();

/**
 * Interface that allows you to use fields prefixed with $ as props
 */
type Properties<T> = {
    [K in keyof T as K extends `$${infer Rest}` ? Rest : never]: T[K]
} & {
    children?: ReactNode;
};

/**
 * Base class for Chemical components
 */
export class $Chemical {
    // Private fields
    private childPositionCounts?: Map<any, number>;

    // Public inert properties
    @inert()
    public Component!: React.FC<Properties<this>>;

    @inert()
    public parent?: $Chemical;

    @inert()
    public children: $Chemical[] = [];

    @inert()
    public elements?: ReactNode;

    // Constructor
    constructor() {
        this.Component = this.createComponent();
    }

    // Public methods
    view(): ReactNode {
        return this.elements;
    }

    // Private methods
    private createComponent(): React.FC<Properties<this>> {
        const self = this;

        const ChemicalComponent: React.FC<Properties<this>> = (props: any) => {
            const instance = self.createInstance();
            const [, forceUpdate] = useState({});

            useEffect(() => {
                self.setupInstance(instance, props, () => forceUpdate({}));
                return () => self.cleanupInstance(instance);
            }, []);

            self.processChildren(instance, props);
            return instance.view();
        };

        (ChemicalComponent as any).isChemical = true;
        return ChemicalComponent;
    }

    private createInstance(): $Chemical {
        const instance = Object.create(this);
        instance.children = [];
        return instance;
    }

    private setupInstance(instance: $Chemical, props: any, forceUpdate: () => void): void {
        this.applyProps(instance, props);
        this.setupReactivity(instance, forceUpdate);
        this.handleParentBinding(instance, props);
        this.runCatalystMethods(instance);
    }

    private cleanupInstance(instance: $Chemical): void {
        componentUpdaters.delete(instance);
        if (instance.parent) {
            this.unregisterFromParent(instance, instance.parent);
        }
    }

    private applyProps(instance: $Chemical, props: any): void {
        if (!props) return;

        for (const key in props) {
            if (props.hasOwnProperty(key) &&
                key !== 'children' &&
                key !== '__parentInstance') {
                this.setProp(instance, key, props[key]);
            }
        }
    }

    private setProp(instance: $Chemical, key: string, value: any): void {
        const componentKey = '$' + String(key);
        const transformers = instance.constructor.prototype.transformers;

        if (transformers?.has(componentKey)) {
            const transformer = transformers.get(componentKey);
            (instance as any)[componentKey] = transformer(value);
        } else {
            (instance as any)[componentKey] = value;
        }
    }

    private setupReactivity(instance: $Chemical, forceUpdate: () => void): void {
        componentUpdaters.set(instance, forceUpdate);

        decorate(instance, {
            after: (className, memberName, memberType, method, args, result) => {
                if (memberType === 'field') {
                    const updateFn = componentUpdaters.get(instance);
                    if (updateFn) updateFn();
                }
                return result;
            }
        });
    }

    private handleParentBinding(instance: $Chemical, props: any): void {
        console.log('handleParentBinding called', props);
        if (!props.__parentInstance) {
            console.log('No parent instance in props');
            return;
        }

        instance.parent = props.__parentInstance;
        console.log('Registering child with parent: ' + props.__parentInstance);
        if (instance.parent)
            this.registerWithParent(instance, instance.parent);
    }

    private registerWithParent(child: $Chemical, parent: $Chemical): void {
        this.trackChild(parent, child);
        this.applyBinding(child, parent);
    }

    private trackChild(parent: $Chemical, child: $Chemical): void {
        if (!parent.children.includes(child)) {
            parent.children.push(child);
        }
    }

    private untrackChild(parent: $Chemical, child: $Chemical): void {
        const index = parent.children.indexOf(child);
        if (index >= 0) {
            parent.children.splice(index, 1);
        }
    }

    private applyBinding(child: $Chemical, parent: $Chemical): void {
        const bindings = getBindings(parent);
        console.log('applyBinding - bindings:', bindings);
        console.log('applyBinding - child:', child);
        console.log('applyBinding - parent:', parent);

        if (!parent.childPositionCounts) {
            parent.childPositionCounts = new Map();
        }

        for (const binding of bindings) {
            if (binding.property === 'children') continue;

            console.log('Checking binding:', binding);
            if (this.matchesBinding(child, parent, binding)) {
                console.log('Binding matched! Applying...');
                this.bindChild(child, parent, binding);
                break;
            }
        }
    }

    private matchesBinding(child: $Chemical, parent: $Chemical, binding: any): boolean {
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

    private bindChild(child: $Chemical, parent: $Chemical, binding: any): void {
        const prop = (parent as any)[binding.property];

        if (Array.isArray(prop)) {
            prop.push(child);
        } else if (!(parent as any)[binding.property]) {
            (parent as any)[binding.property] = child;
        }
    }

    private unbindChild(child: $Chemical, parent: $Chemical): void {
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

    private unregisterFromParent(child: $Chemical, parent: $Chemical): void {
        this.unbindChild(child, parent);
        this.untrackChild(parent, child);
    }

    private runCatalystMethods(instance: $Chemical): void {
        const methods = instance.constructor.prototype.catalystMethods;
        if (!methods) return;

        for (const methodName of methods) {
            if (typeof (instance as any)[methodName] === 'function') {
                (instance as any)[methodName]();
            }
        }
    }

    private processChildren(instance: $Chemical, props: any): void {
        if (!props?.children) return;

        const modifiedChildren = this.modifyChildren(instance, props.children);
        instance.elements = modifiedChildren;
    }

    private modifyChildren(instance: $Chemical, children: ReactNode): ReactNode {
        console.log('modifyChildren called, instance:', instance);
        const childrenArray = React.Children.toArray(children);
        console.log('childrenArray:', childrenArray);

        return childrenArray.map(child => {
            if (React.isValidElement(child) && (child.type as any).isChemical) {
                console.log('Found Chemical child, adding __parentInstance');
                return React.cloneElement(child as any, {
                    ...(child.props as any),
                    __parentInstance: instance
                });
            }
            return child;
        });
    }

    private createFragment(above?: ReactNode, main?: ReactNode, below?: ReactNode): ReactNode {
        const children: ReactNode[] = [];

        if (above) children.push(above);
        if (main) children.push(main);
        if (below) children.push(below);

        return React.createElement(React.Fragment, null, ...children);
    }
}

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
function reactivate<T extends object>(instance: T, owner?: any): T {
    // Already marked as reactivated in component
    if ((instance as any)[reactivated]) {
        return instance;
    }

    (instance as any)[reactivated] = true;

    const triggerUpdate = () => {
        const updateFn = componentUpdaters.get(owner || instance);
        if (updateFn) updateFn();
    };

    decorate(instance, {
        after: (className, memberName, memberType, method, args, result) => {
            if (memberType === 'field') {
                triggerUpdate();
            }
            return result;
        }
    });

    // Only reactify non-Chemical objects
    for (const key in instance) {
        if (key !== 'constructor' && !key.startsWith('_')) {
            const value = (instance as any)[key];
            // Skip Chemical instances - they manage themselves
            if (!(value instanceof $Chemical) && value && typeof value === 'object' && !(value instanceof Date)) {
                if (Array.isArray(value)) {
                    value.forEach(item => {
                        if (!(item instanceof $Chemical) && item && typeof item === 'object') {
                            reactivateData(item, owner || instance);
                        }
                    });
                } else {
                    reactivateData(value, owner || instance);
                }
            }
        }
    }

    return instance;
}

/**
 * Reactivates a nested data object in an object or field 
 */
function reactivateData(obj: any, owner: any) {
    if (!obj || typeof obj !== 'object' || (obj as any)[reactivated] || obj instanceof $Chemical) {
        return;
    }

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
                return JSON.stringify(a) === JSON.stringify(b);
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
        const constructor = target.constructor as any;
        if (!constructor.__bindingsMap) constructor.__bindingsMap = new Map<string, Binding>();

        let binding = constructor.__bindingsMap.get(propertyKey);
        if (!binding) {
            binding = { property: propertyKey };
            constructor.__bindingsMap.set(propertyKey, binding);
        }

        binding.class = ChildClass;
        if (binding.optional === undefined)
            binding.optional = false;
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
    // Skip if already decorated
    if ((instance as any)[reactivated]) {
        return instance;
    }

    const className: string = instance?.constructor?.name ?? "<UNKNOWN>";

    // Store original values
    (instance as any)[backingFields] = {};
    (instance as any)[originalValues] = {};

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

    for (const key of properties) {
        // Skip internal properties and methods we've already processed
        if (key === 'constructor' ||
            key === String(reactivated) ||
            key === String(backingFields) ||
            key === String(originalValues) ||
            key === 'state' || key === 'props' ||
            typeof instance[key] === 'function' ||
            $Chemical.prototype.hasOwnProperty(key) ||    // Skip Chemical base class properties
            instance[key] instanceof $Chemical) {         // Skip Chemical instances
            continue;
        }

        // Check if this is already an accessor property
        const descriptor = Object.getOwnPropertyDescriptor(instance, key) ||
            Object.getOwnPropertyDescriptor(Object.getPrototypeOf(instance), key);

        if (descriptor && (descriptor.get || descriptor.set)) {
            // Handle accessor property
            decorateAccessorProperty(instance, key, descriptor, className, config);
            continue;
        }

        // Handle regular data property
        // Store original value
        instance[backingFields][key] = instance[key];

        // Replace with getter/setter for regular properties
        Object.defineProperty(instance, key, {
            get: function () {
                const value = this[backingFields][key];

                if (config.after) {
                    const afterResult = config.after(className, key, 'property', () => { }, [], value);
                    return afterResult ?? value;
                }

                return value;
            },
            set: function (newValue) {
                const oldValue = this[backingFields][key];

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

                let valueToSet = newValue;

                // Apply before logic if available
                if (config.before) {
                    const beforeResult = config.before(className, key, 'field', () => { }, [newValue]);
                    if (beforeResult && beforeResult[1]) {
                        valueToSet = beforeResult[1][0];
                    }
                }

                // Handle frozen/sealed objects
                if (valueToSet && typeof valueToSet === 'object') {
                    // Skip reactification for frozen/sealed objects and Chemical instances
                    if (!Object.isFrozen(valueToSet) &&
                        !Object.isSealed(valueToSet) &&
                        Object.isExtensible(valueToSet) &&
                        !(valueToSet instanceof $Chemical)) {
                        // Deep reactify complex objects
                        if (!Array.isArray(valueToSet) && !(valueToSet instanceof Date)) {
                            reactivateData(valueToSet, this);
                        }
                    }
                }

                // Set the new value
                this[backingFields][key] = valueToSet;

                // Apply after logic
                if (config.after) {
                    config.after(className, key, 'field', () => { }, [valueToSet], undefined);
                }
            },
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