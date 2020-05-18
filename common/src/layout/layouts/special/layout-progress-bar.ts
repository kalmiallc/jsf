import { JsfAbstractSpecialLayout } from '../../abstract/abstract-layout';
import { DefExtends, DefCategory }               from '../../../jsf-for-jsf/decorators';

@DefExtends('JsfAbstractSpecialLayout')
@DefCategory('Buttons & Indicators')
export class JsfLayoutProgressBar extends JsfAbstractSpecialLayout<'progress-bar'> {

  mode: 'determinate' | 'indeterminate' | 'buffer' | 'query';
  color?: 'primary' | 'accent' | 'warn';
  progress?: number | {
    $eval: string;
    dependencies: string[]
  }; // Range 0 to 100

  constructor(data: JsfLayoutProgressBar) {
    super();
    Object.assign(this, data);
  }
}
