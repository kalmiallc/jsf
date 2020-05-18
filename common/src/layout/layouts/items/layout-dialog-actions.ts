import { JsfAbstractItemsLayout }         from '../../abstract/abstract-layout';
import { DefLayout, DefProp, DefExtends, DefCategory } from '../../../jsf-for-jsf/decorators';
import { JsfUnknownLayout } from '../../index';

@DefLayout({
  type : 'div',
  items: [
    {
      key: 'align'
    }

  ]
})
@DefExtends('JsfAbstractItemsLayout')
@DefCategory('Popups & Modals')
export class JsfLayoutDialogActions extends JsfAbstractItemsLayout<'dialog-actions'> {
  @DefProp({
    type       : 'string',
    title      : 'Align',
    description: 'Choose center or end'
  })
  align: 'center' | 'end';

  @DefProp('JsfUnknownLayout[]')
  items: JsfUnknownLayout[];
  
  constructor(data: JsfLayoutDialogActions) {
    super();
    Object.assign(this, data);
  }
}
