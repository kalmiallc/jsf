import {
  nodePropertiesListMetadataKey,
  nodePropertyGetterMetadataKey,
  nodePropertyInternalSetterMetadataKey,
  nodePropertySetterMetadataKey
} from './node.const';
import { NodeState }                                                                                   from './node-state.enum';

import 'reflect-metadata';


function makePropertyMapper<T>(prototype: any, key: string, mapper: (newValue: any, oldValue: any) => T) {

  const values = new Map<any, T>();

  const updateInternalValue = function (newValue) {
    values.set(this, newValue);
  };

  Object.defineProperty(prototype, key, {
    set(firstValue: any) {
      Object.defineProperty(this, key, {
        get() {
          return values.get(this);
        },
        set(value: any) {
          const oldValue = values.get(this);
          values.set(this, value);
          mapper.apply(this, [value, oldValue]);
        },
        enumerable: true
      });
      this[key] = firstValue;
    },
    enumerable  : true,
    configurable: true
  });

  return {
    internalSetter: updateInternalValue
  };
}


/**
 * Define a node property and expose it to the layout.
 *
 * @param dependencies A list of property names which need to be fetched from the display object after the defined property has changed.
 * Example usage of this includes 'width' and 'scaleX' properties, as changing one of them will update the other.
 */
export function NodeProperty(dependencies?: string[]) {

  return (target: Object, propertyName: string): void => {
    // Default setter & getter functions for this node property
    const defaultSetterFunction = function (oldValue?: any) {
      Reflect.set(this.displayObject, propertyName, this[propertyName]);
    };

    const defaultGetterFunction = function (): any {
      return Reflect.get(this.displayObject, propertyName);
    };

    // Save default setter & getter functions if none are defined
    const sFn = Reflect.getMetadata(nodePropertySetterMetadataKey(propertyName), target);
    if (!sFn) {
      Reflect.defineMetadata(nodePropertySetterMetadataKey(propertyName),
        defaultSetterFunction,
        target);
    }

    const gFn = Reflect.getMetadata(nodePropertyGetterMetadataKey(propertyName), target);
    if (!gFn) {
      Reflect.defineMetadata(nodePropertyGetterMetadataKey(propertyName),
        defaultGetterFunction,
        target);
    }

    // Make custom mapper for this property with a setter callback function
    const { internalSetter } = makePropertyMapper(target, propertyName, function (newValue: any, oldValue: any) {
      if (newValue !== oldValue) {
        if (this.state === NodeState.Created || this.state === NodeState.Active || this.state === NodeState.Destroying) {
          let setterFn = Reflect.getMetadata(nodePropertySetterMetadataKey(propertyName), this);
          if (!setterFn) {
            setterFn = defaultSetterFunction;
          }
          // No await on this call here, this will happen at runtime and the order of calls is not guaranteed anyway.
          setterFn.apply(this, [oldValue]);

          // Call getter functions for all dependencies and update internal values
          if (dependencies) {
            for (const dependency of dependencies) {
              const dependencyGetterFn = Reflect.getMetadata(nodePropertyGetterMetadataKey(dependency), this);
              const internalSetterFn = Reflect.getMetadata(nodePropertyInternalSetterMetadataKey(dependency), this);

              internalSetterFn.apply(this, [dependencyGetterFn.apply(this)]);
            }
          }
        }
      }
    });

    // Define internal setter
    Reflect.defineMetadata(nodePropertyInternalSetterMetadataKey(propertyName), internalSetter, target);

    // Save node property name in properties list
    Reflect.defineMetadata(nodePropertiesListMetadataKey,
      [...Reflect.getMetadata(nodePropertiesListMetadataKey, target) || [], propertyName],
      target);
  };

}

/**
 * Define a custom setter for a node property.
 * This function will be called to set the value from the Node class to the PIXI display object instance.
 * @param nodePropertyName Name of the property
 */
export function NodePropertySetter(nodePropertyName: string) {

  return (target: Object, propertyName: string, propertyDescriptor: PropertyDescriptor): PropertyDescriptor => {

    // Save mapper function
    Reflect.defineMetadata(nodePropertySetterMetadataKey(nodePropertyName),
      target[propertyName],
      target);

    return propertyDescriptor;
  };

}

/**
 * Define a custom getter for a node property.
 * This function will be called to get the value from a PIXI display object instance and set it to the class.
 * @param nodePropertyName Name of the property
 */
export function NodePropertyGetter(nodePropertyName: string) {

  return (target: Object, propertyName: string, propertyDescriptor: PropertyDescriptor): PropertyDescriptor => {

    // Save mapper function
    Reflect.defineMetadata(nodePropertyGetterMetadataKey(nodePropertyName),
      target[propertyName],
      target);

    return propertyDescriptor;
  };

}
