import { JsfAbstractSpecialLayout }       from '../../abstract/abstract-layout';
import { DefLayout, DefProp, DefExtends, DefCategory } from '../../../jsf-for-jsf/decorators';

@DefExtends('JsfAbstractSpecialLayout')
@DefCategory('Layout')
export class JsfLayoutChartJS extends JsfAbstractSpecialLayout<'chartjs'> {

  width?: string;

  height?: string;

  /**
   * ChartJS config object.
   */
  config: {
    $eval: string,
    dependencies: string[]
  } | any;

  constructor(data: JsfLayoutChartJS) {
    super();
    Object.assign(this, data);
  }
}
