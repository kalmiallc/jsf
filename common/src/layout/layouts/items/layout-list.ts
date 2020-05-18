import { JsfAbstractItemsLayout } from '../../abstract/abstract-layout';
import { JsfLayoutListItem }      from './layout-list-item';
import { DefProp, DefExtends, DefCategory }    from '../../../jsf-for-jsf/decorators';


@DefExtends('JsfAbstractItemsLayout')
@DefCategory('Layout')
export class JsfLayoutList extends JsfAbstractItemsLayout<'list'> {

  @DefProp('JsfLayoutListItem[]')
  items: JsfLayoutListItem[];

  @DefProp('JsfLayoutListPreferences')
  preferences?: JsfLayoutListPreferences;

  constructor(data: JsfLayoutList) {
    super();
    Object.assign(this, data);
  }
}

export interface JsfLayoutListPreferences {
  /**
   * List type, ordered or unordered.
   * Default is 'unordered'.
   */
  type: 'ordered' | 'unordered';
}
