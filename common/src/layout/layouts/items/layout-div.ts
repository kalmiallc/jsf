import { JsfAbstractItemsLayout }           from '../../abstract/abstract-layout';
import { DefCategory, DefExtends, DefProp } from '../../../jsf-for-jsf/decorators';
import { JsfUnknownLayout }                 from '../../index';

@DefExtends('JsfAbstractItemsLayout')
@DefCategory('Layout')
export class JsfLayoutDiv extends JsfAbstractItemsLayout<'div'> {
  @DefProp('JsfUnknownLayout[]')
  items: JsfUnknownLayout[];

  constructor(data: JsfLayoutDiv) {
    super();
    Object.assign(this, data);
  }
}
