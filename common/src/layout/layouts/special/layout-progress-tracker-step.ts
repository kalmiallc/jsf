import { JsfAbstractSpecialLayout }       from '../../abstract/abstract-layout';
import { DefLayout, DefProp, DefExtends, DefCategory } from '../../../jsf-for-jsf/decorators';


@DefExtends('JsfAbstractSpecialLayout')
@DefCategory('Layout')
export class JsfLayoutProgressTrackerStep extends JsfAbstractSpecialLayout<'progress-tracker-step'> {

  title?: string;
  titleTemplateData?: {
    $eval: string,
    dependencies?: string[]
  };

  description?: string;
  descriptionTemplateData?: {
    $eval: string,
    dependencies?: string[]
  };

  icon?: string | {
    $eval: string,
    dependencies?: string[]
  };

  disabled?: boolean | {
    $eval: string,
    dependencies?: string[]
  };

  constructor(data: JsfLayoutProgressTrackerStep) {
    super();
    Object.assign(this, data);
  }
}
