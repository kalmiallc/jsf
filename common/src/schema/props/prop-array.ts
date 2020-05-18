import { JsfProp, JsfPropJsonValue, JsfPropValue } from './index';
import { JsfAbstractProp }                         from '../abstract/abstract-prop';
import { JsfHandlerArray }                         from '../../handlers';
import { DefExtends, DefLayout, DefProp, DefCategory }          from '../../jsf-for-jsf/decorators';


export interface JsfPropArrayValue extends Array<JsfPropValue> {}
export interface JsfPropArrayJsonValue extends Array<JsfPropJsonValue> {}

@DefLayout({
  type : 'div',
  items: [
    {
      key: 'uniqueItems'
    },
    {
      key: 'minItems'
    },
    {
      key: 'maxItems'
    }
  ]
})
@DefExtends('JsfAbstractProp')
export class JsfPropArray extends JsfAbstractProp<JsfPropArrayValue[] | null, 'array', JsfHandlerArray> {

  /**
   * Default items value for array.
   */
  default?: any; // FIXME any

  /**
   * The value of "items" MUST be either a valid JSON Schema or an array of valid JSON Schemas.
   *
   * This keyword determines how child instances validate for arrays, and does not directly validate the immediate
   * instance itself.
   *
   * If "items" is a schema, validation succeeds if all elements in the array successfully validate against that
   * schema.
   *
   * If "items" is an array of schemas, validation succeeds if each element of the instance validates against
   * the schema at the same position, if any.
   *
   *
   *  Omitting this keyword has the same behavior as an empty schema.
   */
  items: JsfProp | JsfProp[];

  /**
   * The value of this keyword MUST be a boolean.
   *
   *
   *  If this keyword has boolean value false, the instance validates successfully. If it has boolean value true,
   * the instance validates successfully if all of its elements are unique.
   *
   * Omitting this keyword has the same behavior as a value of false.
   */
  @DefProp({
    title: 'Unique items',
    type : 'boolean'
  })
  uniqueItems?: boolean;

  /**
   * The value of this keyword MUST be a non-negative integer.
   *
   * An array instance is valid against "minItems" if its size is greater than, or equal to, the value of this keyword.
   *
   * Omitting this keyword has the same behavior as a value of 0.
   */
  @DefProp({
    title      : 'Minimum items',
    description: 'The value of this keyword MUST be a non-negative integer.',
    type       : 'integer'
  })
  minItems?: number;

  /**
   * The value of this keyword MUST be a non-negative integer.
   *
   * An array instance is valid against "maxItems" if its size is less than, or equal to, the value of this keyword.
   */
  @DefProp({
    title      : 'Maximum items',
    description: 'The value of this keyword MUST be a non-negative integer.',
    type       : 'integer'
  })
  maxItems?: number;

  /**
   * The value of this keyword MUST be a valid JSON Schema.
   *
   * An array instance is valid against "contains" if at least one of its elements is valid against the given schema.
   */

  contains?: any;

  /**
   * This keyword's value MUST be a valid JSON Schema.
   *
   * This validation outcome of this keyword's subschema has no direct effect on the overall validation result. Rather,
   * it controls which of the "then" or "else" keywords are evaluated.
   *
   * Instances that successfully validate against this keyword's subschema MUST also be valid against the subschema
   * value of the "then" keyword, if present.
   *
   * Instances that fail to validate against this keyword's subschema MUST also be valid against the subschema value of
   * the "else" keyword, if present.
   *
   * If annotations [annotations] are being collected, they are collected from this keyword's subschema in the usual
   * way, including when the keyword is present without either "then" or "else".
   */
  if?: any[];

  /**
   * This keyword's value MUST be a valid JSON Schema.
   *
   * When "if" is present, and the instance successfully validates against its subschema, then valiation succeeds
   * against this keyword if the instance also successfully validates against this keyword's subschema.
   *
   * This keyword has no effect when "if" is absent, or when the instance fails to validate against its subschema.
   * Implementations MUST NOT evaluate the instance against this keyword, for either validation or annotation
   * collection purposes, in such cases.
   */
  then?: any[];

  /**
   * This keyword's value MUST be a valid JSON Schema.
   *
   * When "if" is present, and the instance fails to validate against its subschema, then valiation succeeds against
   * this keyword if the instance successfully validates against this keyword's subschema.
   *
   * This keyword has no effect when "if" is absent, or when the instance successfully validates against its subschema.
   * Implementations MUST NOT evaluate the instance against this keyword, for either validation or annotation
   * collection purposes, in such cases.
   */
  else?: any[];

  constructor(data: JsfPropArray) {
    super();
    Object.assign(this, data);
  }
}
