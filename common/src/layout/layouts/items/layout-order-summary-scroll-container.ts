import { JsfAbstractItemsLayout } from '../../abstract/abstract-layout';
import { DefExtends, DefProp, DefCategory }    from '../../../jsf-for-jsf/decorators';
import { JsfUnknownLayout } from '../../index';

@DefExtends('JsfAbstractItemsLayout')
@DefCategory('Layout')
export class JsfLayoutOrderSummaryScrollContainer extends JsfAbstractItemsLayout<'order-summary-scroll-container'> {
  @DefProp('JsfUnknownLayout[]')
  items: JsfUnknownLayout[];
  constructor(data: JsfLayoutOrderSummaryScrollContainer) {
    super();
    Object.assign(this, data);
  }
}
