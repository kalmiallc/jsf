import { JsfAbstractPropPrimitive }       from '../abstract/abstract-prop-primitive';
import { JsfHandlerDate }                 from '../../handlers';
import { DefExtends, DefLayout, DefProp, DefCategory } from '../../jsf-for-jsf/decorators';

@DefLayout({
  type : 'div',
  items: [
    {
      key: 'minimum'
    },
    {
      key: 'maximum'
    }
  ]
})
@DefExtends('JsfAbstractPropPrimitive')

export class JsfPropDate extends JsfAbstractPropPrimitive<Date, 'date', JsfHandlerDate> {

  /**
   * The value of "minimum" MUST be a Date, representing an inclusive lower limit for a date instance.
   *
   * If the instance is a date, then this keyword validates only if the instance is greater than or exactly equal to
   * "minimum".
   */
  @DefProp({
    title      : 'Minimum value',
    description: 'The value of "minimum" MUST be a Date, representing an inclusive lower limit for a date instance.',
    type       : 'date'
  })
  minimum?: Date;

  /**
   * The value of "maximum" MUST be a date, representing an inclusive upper limit for a date instance.
   *
   * If the instance is a date, then this keyword validates only if the instance is less than or exactly equal to
   * "maximum".
   */
  @DefProp({
    title      : 'Maximum value',
    description: 'The value of "maximum" MUST be a date, representing an inclusive upper limit for a date instance.',
    type       : 'date'
  })
  maximum?: Date;

  constructor(data: JsfPropDate) {
    super();
    Object.assign(this, data);
  }

}
