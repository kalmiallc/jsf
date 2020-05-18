import { JsfAbstractItemsLayout }         from '../../abstract/abstract-layout';
import { JsfLayoutDrawerHeader }          from './layout-drawer-header';
import { JsfLayoutDrawerContent }         from './layout-drawer-content';
import { DefLayout, DefProp, DefExtends, DefCategory } from '../../../jsf-for-jsf/decorators';

@DefLayout({
  type : 'div',
  items: [
    {
      key: 'color'
    },
    {
      key: 'position'
    }
  ]
})
@DefExtends('JsfAbstractItemsLayout')
@DefCategory('Layout')
export class JsfLayoutDrawer extends JsfAbstractItemsLayout<'drawer'> {
  items: (JsfLayoutDrawerHeader | JsfLayoutDrawerContent)[];
  @DefProp(['JsfLayoutDrawerHeader', 'JsfLayoutDrawerContent'])
  
  @DefProp({
    type       : 'string',
    title      : 'Color',
    description: 'Choose primary, accent or none'
  })
  color?: 'primary' | 'accent' | 'none';

  @DefProp({
    type       : 'string',
    title      : 'Position',
    description: 'Choose bottom or top'
  })
  position?: 'bottom' | 'top';

  constructor(data: JsfLayoutDrawer) {
    super();
    Object.assign(this, data);
  }
}
