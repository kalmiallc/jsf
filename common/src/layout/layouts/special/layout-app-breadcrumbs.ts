import { JsfAbstractSpecialLayout } from '../../abstract/abstract-layout';
import { DefExtends, DefCategory }               from '../../../jsf-for-jsf';

@DefExtends('JsfAbstractSpecialLayout')
@DefCategory('Navigation')
export class JsfLayoutAppBreadcrumbs extends JsfAbstractSpecialLayout<'app-breadcrumbs'> {

  constructor(data: JsfLayoutAppBreadcrumbs) {
    super();
    Object.assign(this, data);
  }

}
