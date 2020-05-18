import { JsfAbstractItemsLayout } from '../../abstract/abstract-layout';
import { DefProp, DefExtends, DefCategory }    from '../../../jsf-for-jsf/decorators';
import { JsfUnknownLayout } from '../../index';

@DefExtends('JsfAbstractItemsLayout')
@DefCategory('Layout')
export class JsfLayoutListItem extends JsfAbstractItemsLayout<'list-item'> {
  @DefProp('JsfUnknownLayout[]')
  items: JsfUnknownLayout[];
  constructor(data: JsfLayoutListItem) {
    super();
    Object.assign(this, data);
  }
}
