import { JsfAbstractItemsLayout } from '../../abstract/abstract-layout';
import { DefProp, DefExtends, DefCategory }    from '../../../jsf-for-jsf/decorators';
import { JsfUnknownLayout } from '../../index';

@DefExtends('JsfAbstractItemsLayout')
@DefCategory('Popups & Modals')
export class JsfLayoutDialogContent extends JsfAbstractItemsLayout<'dialog-content'> {
  @DefProp('JsfUnknownLayout[]')
  items: JsfUnknownLayout[];
  
  constructor(data: JsfLayoutDialogContent) {
    super();
    Object.assign(this, data);
  }
}
