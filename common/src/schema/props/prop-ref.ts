import { JsfAbstractBareProp }            from '../abstract/abstract-prop';
import { JsfHandlerRef }                  from '../../handlers';
import { DefExtends, DefLayout, DefProp, DefCategory } from '../../jsf-for-jsf/decorators';

@DefLayout({
  type : 'div',
  items: [
    {
      key: '$ref'
    }
  ]
})
@DefExtends('JsfAbstractBareProp')
export class JsfPropRef extends JsfAbstractBareProp<'ref', JsfHandlerRef> {

  /**
   * JSF schema definition to use.
   *
   * Internal import:
   * - #/definitions/abc
   * External import:
   * - /abc
   */
  @DefProp({
    type : 'string',
    title: 'Ref'
  })
  $ref: string;

  set?: {
    path: string;
    value: any;
  }[];

  constructor(data: JsfPropRef) {
    super();
    Object.assign(this, data);
  }
}
