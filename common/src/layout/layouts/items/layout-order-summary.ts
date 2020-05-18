import { JsfAbstractItemsLayout }               from '../../abstract/abstract-layout';
import { JsfLayoutOrderSummaryStaticContainer } from './layout-order-summary-static-container';
import { JsfLayoutOrderSummaryScrollContainer } from './layout-order-summary-scroll-container';
import { DefExtends, DefProp, DefCategory }                  from '../../../jsf-for-jsf/decorators';

@DefExtends('JsfAbstractItemsLayout')
@DefCategory('Layout')
export class JsfLayoutOrderSummary extends JsfAbstractItemsLayout<'order-summary'> {
  @DefProp(['JsfLayoutOrderSummaryStaticContainer[]', 'JsfLayoutOrderSummaryScrollContainer[]'])
  items: (JsfLayoutOrderSummaryStaticContainer | JsfLayoutOrderSummaryScrollContainer)[];

  constructor(data: JsfLayoutOrderSummary) {
    super();
    Object.assign(this, data);
  }
}
