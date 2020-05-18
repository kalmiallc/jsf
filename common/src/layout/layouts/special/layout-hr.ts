import { JsfAbstractSpecialLayout } from '../../abstract/abstract-layout';
import { DefExtends, DefCategory }               from '../../../jsf-for-jsf/decorators';

@DefExtends('JsfAbstractSpecialLayout')
@DefCategory('Layout')
export class JsfLayoutHr extends JsfAbstractSpecialLayout<'hr'> {

  constructor(data: JsfLayoutHr) {
    super();
    Object.assign(this, data);
  }

}
