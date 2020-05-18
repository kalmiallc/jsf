import { JsfProp, JsfPropJsonValue, JsfPropValue } from './index';
import { JsfAbstractProp }                         from '../abstract/abstract-prop';
import { JsfHandlerObject }                        from '../../handlers';
import { DefExtends, DefLayout, DefProp, DefCategory }          from '../../jsf-for-jsf/decorators';


export interface JsfPropObjectValue {
  [propertyName: string]: JsfPropValue;
}

export interface JsfPropObjectJsonValue {
  [propertyName: string]: JsfPropJsonValue;
}

@DefLayout({
  type : 'div',
  items: [
    {
      key: 'required'
    }
  ]
})
@DefExtends('JsfAbstractProp')
export class JsfPropObject extends JsfAbstractProp<JsfPropObjectValue, 'object', JsfHandlerObject> {


  /**
   * The value of "properties" MUST be an object. Each value of this object MUST be a valid JSON Schema.
   *
   * This keyword determines how child instances validate for objects, and does not directly validate the immediate
   * instance itself.
   *
   * Validation succeeds if, for each name that appears in both the instance and as a name within this keyword's value,
   * the child instance for that name successfully validates against the corresponding schema.
   *
   * Omitting this keyword has the same behavior as an empty object.
   */
  properties?: { [propertyName: string]: JsfProp };

  /**
   * The value of this keyword MUST be an array. Elements of this array, if any, MUST be strings, and MUST be unique.
   *
   * An object instance is valid against this keyword if every item in the array is the name of a property in the
   * instance.
   *
   * Omitting this keyword has the same behavior as an empty array.
   */
  @DefProp({
    type : 'array',
    title: 'Required',
    items: []
  })
  required?: string[];

  constructor(data: JsfPropObject) {
    super();
    Object.assign(this, data);
  }
}
