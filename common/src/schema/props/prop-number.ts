/**
 * for numbers, including floating numbers
 */
import { JsfAbstractPropPrimitive }            from '../abstract/abstract-prop-primitive';
import { JsfHandlerInteger, JsfHandlerNumber } from '../../handlers';
import { DefExtends, DefLayout, DefProp, DefCategory }      from '../../jsf-for-jsf/decorators';

@DefLayout({
  type : 'div',
  items: [
    {
      key: 'multipleOf'
    },
    {
      key: 'minimum'
    },
    {
      key: 'maximum'
    }
  ]
})

@DefExtends('JsfAbstractPropPrimitive')
abstract class JsfAbstractNumberBase<TypeString, Handler> extends JsfAbstractPropPrimitive<number, TypeString, Handler> {

  /**
   * The value of "multipleOf" MUST be a number, strictly greater than 0.
   *
   * A numeric instance is valid only if division by this keyword's value results in an integer.
   */
  @DefProp({
    title: 'Multiple of',
    type : 'number'
  })
  multipleOf?: number;

  /**
   * The value of "minimum" MUST be a number, representing an inclusive lower limit for a numeric instance.
   *
   * If the instance is a number, then this keyword validates only if the instance is greater than or exactly equal to
   * "minimum".
   */
  @DefProp({
    title      : 'Minimum value',
    description: 'The value of "minimum" MUST be a number, representing an inclusive lower limit for a numeric instance.',
    type       : 'number'
  })
  minimum?: number;

    /**
   * The value of "maximum" MUST be a number, representing an inclusive upper limit for a numeric instance.
   *
   * If the instance is a number, then this keyword validates only if the instance is less than or exactly equal to
   * "maximum".
   */
  @DefProp({
    title      : 'Maximum value',
    description: 'The value of "maximum" MUST be a number, representing an inclusive upper limit for a numeric instance.',
    type       : 'number'
  })
  maximum?: number;

}

@DefLayout({
  type : 'div',
  items: [
    {
      key: 'exclusiveMinimum'
    },
    {
      key: 'exclusiveMaximum'
    }
  ]
})
/**
 * For numbers (floating point)
 */
@DefExtends('JsfAbstractNumberBase')
export class JsfPropNumber extends JsfAbstractNumberBase<'number', JsfHandlerNumber> {

  /**
   * The value of "exclusiveMinimum" MUST be number, representing an exclusive lower limit for a numeric instance.
   *
   * If the instance is a number, then the instance is valid only if it has a value strictly greater than (not equal
   * to) "exclusiveMinimum".
   */
  @DefProp({
    title      : 'Exclusive minimum value',
    description: 'The value of "exclusiveMinimum" MUST be number, representing an exclusive lower limit for a numeric instance.',
    type       : 'number'
  })
  exclusiveMinimum?: number;

  /**
   * The value of "exclusiveMaximum" MUST be number, representing an exclusive upper limit for a numeric instance.
   *
   * If the instance is a number, then the instance is valid only if it has a value strictly less than (not equal to)
   * "exclusiveMaximum".
   */
  @DefProp({
    title      : 'Exclusive maximum value',
    description: 'The value of "exclusiveMaximum" MUST be number, representing an exclusive upper limit for a numeric instance.',
    type       : 'number'
  })
  exclusiveMaximum?: number;

  // /**
  //  * The minimum number of integer digits before the decimal point. Default is 1.
  //  */
  // @DefProp({
  //   title      : 'Minimum number of integer digits',
  //   description: 'The minimum number of integer digits before the decimal point. Default is 1.',
  //   type       : 'number'
  // })
  // minIntegerDigits?: number;

  /**
   * The minimum number of digits after the decimal point. Default is 0.
   */
  @DefProp({
    title      : 'Minimum decimal digits',
    description: 'The minimum number of digits after the decimal point. Default is 0.',
    type       : 'number'
  })
  minDecimalDigits?: number;

  /**
   * The maximum number of digits after the decimal point. Default is unlimited.
   * Note: JS uses float so you do not have unlimited fractions.
   */
  @DefProp({
    title      : 'Maximum decimal digits',
    description: 'The maximum number of digits after the decimal point. Default is unlimited.',
    type       : 'number'
  })
  maxDecimalDigits?: number;

  constructor(data: JsfPropNumber) {
    super();
    Object.assign(this, data);
  }
}

@DefLayout({
  type : 'div',
  items: [
    {
      key: 'even'
    },
    {
      key: 'odd'
    }
  ]
})
/**
 * For integers
 */
@DefExtends('JsfAbstractNumberBase')
export class JsfPropInteger extends JsfAbstractNumberBase<'integer', JsfHandlerInteger> {

  /**
   * The value of "even" MUST be a boolean, representing the number must be even.
   *
   * If the instance is a number, then the instance is valid only if it has an even value.
   */
  @DefProp({
    title      : 'Even',
    description: 'The value of "even" MUST be a boolean, representing the number must be even.',
    type       : 'boolean'
  })
  even?: boolean;

  /**
   * The value of "odd" MUST be a boolean, representing the number must be odd.
   *
   * If the instance is a number, then the instance is valid only if it has an odd value.
   */
  @DefProp({
    title      : 'Odd',
    description: 'The value of "odd" MUST be a boolean, representing the number must be odd.',
    type       : 'boolean'
  })
  odd?: boolean;

  constructor(data: JsfPropInteger) {
    super();
    Object.assign(this, data);
  }
}
