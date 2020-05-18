import { JsfAbstractItemsLayout }         from '../../abstract/abstract-layout';
import { JsfLayoutCol }                   from './layout-col';
import { DefLayout, DefProp, DefExtends, DefCategory } from '../../../jsf-for-jsf/decorators';

@DefLayout({
  type : 'div',
  items: [
    {
      key: 'gutters'
    },
    {
      key: 'verticalAlign'
    },
    {
      key: 'horizontalAlign'
    }
  ]
})

@DefExtends('JsfAbstractItemsLayout')
@DefCategory('Layout')
export class JsfLayoutRow extends JsfAbstractItemsLayout<'row'> {
  /**
   * Toggle column gutters. Defaults to true.
   */
  @DefProp({
    type : 'boolean',
    title: 'Gutters',
  })
  gutters?: boolean;
  /**
   * Vertical alignment for items.
   */
  @DefProp({
    type       : 'string',
    title      : 'Vertical align',
    description: 'Choose start, center or end'
  })
  verticalAlign: 'start' | 'center' | 'end';
  /**
   * Horizontal alignment.
   */
  @DefProp({
    type       : 'string',
    title      : 'Horizontal align',
    description: 'Choose start, center, end, around or between'
  })
  horizontalAlign: 'start' | 'center' | 'end' | 'around' | 'between';

  @DefProp('JsfLayoutCol[]')
  items: JsfLayoutCol[];

  constructor(data: JsfLayoutRow) {
    super();
    Object.assign(this, data);
  }
}
