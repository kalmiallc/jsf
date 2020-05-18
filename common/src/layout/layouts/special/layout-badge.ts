import { JsfAbstractSpecialLayout } from '../../abstract/abstract-layout';
import { DefCategory, DefExtends }  from '../../../jsf-for-jsf/decorators';

@DefExtends('JsfAbstractSpecialLayout')
@DefCategory('Text')
export class JsfLayoutBadge extends JsfAbstractSpecialLayout<'badge'> {

  title: string;
  templateData?: {
    $eval: string;
    dependencies?: string[];
  };

  color?: string | {
    $eval: string;
    dependencies?: string[];
  };

  constructor(data: JsfLayoutBadge) {
    super();
    Object.assign(this, data);
  }
}
