import { JsfAbstractSpecialLayout } from '../../abstract/abstract-layout';
import { DefCategory, DefExtends }  from '../../../jsf-for-jsf/decorators';


@DefExtends('JsfAbstractSpecialLayout')
@DefCategory('Layout')
export class JsfLayoutPoweredBy extends JsfAbstractSpecialLayout<'powered-by'> {

  constructor(data: JsfLayoutPoweredBy) {
    super();
    Object.assign(this, data);
  }

}
