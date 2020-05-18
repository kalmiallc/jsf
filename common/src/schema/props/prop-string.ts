import { JsfAbstractPropPrimitive }       from '../abstract/abstract-prop-primitive';
import { JsfHandlerString }               from '../../handlers';
import { DefExtends, DefLayout, DefProp, DefCategory } from '../../jsf-for-jsf/decorators';


/**
 * date-time:     A string instance is valid against this attribute if it is a valid representation according to the
 * "date-time" production. date:          A string instance is valid against this attribute if it is a valid
 * representation according to the "full-date" production. time:          A string instance is valid against this
 * attribute if it is a valid representation according to the "full-time" production. email:         RFC 5322 hostname:
 *      RFC 1034 ipv4:          An IPv4 address according to the "dotted-quad" ABNF syntax as defined in RFC 2673,
 * section 3.2 [RFC2673]. ipv6:          An IPv6 address as defined in RFC 4291, section 2.2 [RFC4291]. mac:
 * MAC address uri:           A string instance is valid against this attribute if it is a valid URI, according to
 * [RFC3986]. uri-reference: A string instance is valid against this attribute if it is a valid URI Reference (either a
 * URI or a relative-reference), according to [RFC3986]. reqex:         A regular expression, which SHOULD be valid
 * according to the ECMA 262 [ecma262] regular expression dialect. Implementations that validate formats MUST accept at
 * least the subset of ECMA 262 defined in the Regular Expressions
 *                [regexInterop] section of this specification, and SHOULD accept all valid ECMA 262 expressions.
 * credit-card:   Must be a credit card number from one of the major providers.
 * phone:         Phone number.
 * color:         Hex color representation.
 */

export type JsfFormat =
  'email'
  | 'hostname'
  | 'uri'
  | 'uri-reference'
  | 'ipv4'
  | 'ipv6'
  | 'mac'
  | 'date-time'
  | 'date'
  | 'time'
  | 'regex'
  | 'color'
  | 'credit-card'
  | 'phone';


@DefLayout({
  type : 'div',
  items: [
    {
      key: 'minLength'
    },
    {
      key: 'maxLength'
    },
    {
      key: 'pattern'
    },
    {
      key: 'secret'
    },
    {
      key: 'multiline'
    }
  ]
})
@DefExtends('JsfAbstractPropPrimitive')
export class JsfPropString extends JsfAbstractPropPrimitive<string, 'string', JsfHandlerString> {

  /**
   * The "format" keyword functions as both an annotation and as an assertion. While no special effort is required to
   * implement it as an annotation conveying semantic meaning, implementing validation is non-trivial.
   *
   * Structural validation alone may be insufficient to validate that an instance meets all the requirements of an
   * application. The "format" keyword is defined to allow interoperable semantic validation for a fixed subset of
   * values which are accurately described by authoritative resources, be they RFCs or other external specifications.
   *
   * The value of this keyword is called a format attribute. It MUST be a string. A format attribute can generally only
   * validate a given set of instance types. If the type of the instance to validate is not in this set, validation for
   * this format attribute and instance SHOULD succeed.
   *
   * Implementations MAY support the "format" keyword as a validation assertion. Should they choose to do so:
   *    they SHOULD implement validation for attributes defined below;
   *    they SHOULD offer an option to disable validation for this keyword.
   *
   * Implementations MAY add custom format attributes. Save for agreement between parties, schema authors SHALL NOT
   * expect a peer implementation to support this keyword and/or custom format attributes.
   */
  @DefProp('JsfFormat')
  format?: JsfFormat;

  /**
   * The value of this keyword MUST be a non-negative integer.
   *
   * A string instance is valid against this keyword if its length is greater than, or equal to, the value of this
   * keyword.
   *
   * The length of a string instance is defined as the number of its characters as defined by RFC 7159 [RFC7159].
   *
   * Omitting this keyword has the same behavior as a value of 0.
   */
  @DefProp({
    title      : 'Minimum length value',
    description: 'The value of this keyword MUST be a non-negative integer.',
    type       : 'integer'
  })
  minLength?: number;

  /**
   * The value of this keyword MUST be a non-negative integer.

   A string instance is valid against this keyword if its length is less than, or equal to, the value of this keyword.

   The length of a string instance is defined as the number of its characters as defined by RFC 7159 [RFC7159].
   */
  @DefProp({
    title      : 'Maximum length value',
    description: 'The value of this keyword MUST be a non-negative integer.',
    type       : 'integer'
  })
  maxLength?: number;


  /**
   * The value of this keyword MUST be a string. This string SHOULD be a valid regular expression, according to the
   * ECMA 262 regular expression dialect.
   *
   * A string instance is considered valid if the regular expression matches the instance successfully. Recall: regular
   * expressions are not implicitly anchored.
   */
  @DefProp({
    title      : 'Pattern',
    description: 'The value of this keyword MUST be a string. This string SHOULD be a valid regular expression, according to the ECMA 262 regular expression dialect.',
    type       : 'string'
  })
  pattern?: string;

  @DefProp({
    title: 'Secret',
    type : 'boolean'
  })
  secret?: boolean;

  /**
   * Set to true for default, or provide number of rows to be displayed (this is not max rows!).
   */
  @DefProp([
    {
      title: 'Multiline',
      type : 'boolean'
    },
    {
      type : 'number',
      title: 'Multiline'
    }
  ])
  multiline?: boolean | number;

  constructor(data: JsfPropString) {
    super();
    Object.assign(this, data);
  }
}
