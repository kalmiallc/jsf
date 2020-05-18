import { JsfAbstractSpecialLayout }       from '../../abstract/abstract-layout';
import { DefLayout, DefProp, DefExtends, DefCategory } from '../../../jsf-for-jsf/decorators';

@DefExtends('JsfAbstractSpecialLayout')
@DefCategory('Layout')
export class JsfLayoutCustomComponent extends JsfAbstractSpecialLayout<'custom-component'> {

  /**
   * Inline component or remote url to load.
   */
  component: {
     $eval: string,
   } | string;

  /**
   * Optional config to be passed to the component factory.
   */
  config?: {
    $eval: string,
  } | any;

  constructor(data: JsfLayoutCustomComponent) {
    super();
    Object.assign(this, data);
  }
}
