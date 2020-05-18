import { JsfAbstractProp }                from './abstract-prop';
import { JsfPropRef }                     from '../props';
import { DefExtends, DefLayout, DefProp, DefCategory } from '../../jsf-for-jsf/decorators';

@DefLayout({
  type : 'div',
  items: [
    {
      key: 'required'
    },
  ]
})
@DefExtends('JsfAbstractProp')
export abstract class JsfAbstractPropPrimitive<PrimitiveType, PrimitiveTypeString, Handlers>
  extends JsfAbstractProp<PrimitiveType, PrimitiveTypeString, Handlers> {
  /**
   * The value of this keyword MUST be an array. This array SHOULD have at least one element. Elements in the array
   * SHOULD be unique.
   *
   * An instance validates successfully against this keyword if its value is equal to one of the elements in this
   * keyword's array value.
   *
   * Elements in the array might be of any value, including null.
   */
  @DefProp('PrimitiveType')
  enum?: (PrimitiveType | null)[];

  /**
   * If true property is valid if value is set.
   */
  @DefProp({
    type : 'boolean',
    title: 'Required'
  })
  required?: boolean;

  /**
   * This keyword's value MUST be a non-empty array. Each item of the array MUST be a valid JSON Schema.
   *
   * An instance validates successfully against this keyword if it validates successfully against all
   * schemas defined by this keyword's value.
   */
  @DefProp('JsfAbstractPropPrimitive')
  allOf?: (JsfAbstractPropPrimitive<PrimitiveType, PrimitiveTypeString, Handlers> | JsfPropRef)[];

  /**
   * This keyword's value MUST be a non-empty array. Each item of the array MUST be a valid JSON Schema.
   *
   * An instance validates successfully against this keyword if it validates successfully against at least
   * one schema defined by this keyword's value.
   */
  @DefProp('JsfAbstractPropPrimitive')
  anyOf?: (JsfAbstractPropPrimitive<PrimitiveType, PrimitiveTypeString, Handlers> | JsfPropRef)[];

  /**
   * This keyword's value MUST be a non-empty array. Each item of the array MUST be a valid JSON Schema.
   *
   * An instance validates successfully against this keyword if it validates successfully against exactly
   * one schema defined by this keyword's value.
   */
  @DefProp('JsfAbstractPropPrimitive')
  oneOf?: (JsfAbstractPropPrimitive<PrimitiveType, PrimitiveTypeString, Handlers> | JsfPropRef)[];

  /**
   * This keyword's value MUST be a valid JSON Schema.
   *
   * An instance is valid against this keyword if it fails to validate successfully against the schema defined by this
   * keyword.
   */
  @DefProp('JsfAbstractPropPrimitive')
  not?: (JsfAbstractPropPrimitive<PrimitiveType, PrimitiveTypeString, Handlers> | JsfPropRef)[];
}
