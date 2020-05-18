import { JsfAbstractSpecialLayout }       from '../../abstract/abstract-layout';
import { DefLayout, DefProp, DefExtends, DefCategory } from '../../../jsf-for-jsf/decorators';

@DefLayout({
  type : 'div',
  items: [
    {
      key: 'chartType'
    },
    {
      key: 'height'
    }
  ]
})
@DefExtends('JsfAbstractSpecialLayout')
@DefCategory('Layout')
export class JsfLayoutD3 extends JsfAbstractSpecialLayout<'d3'> {

  @DefProp({
    type : 'string',
    title: 'Chart type'
  })
  chartType: string;

  chartOptions: any;

  dataSets: any[][];

  @DefProp({
    type : 'number',
    title: 'Height'
  })
  height?: number;

  constructor(data: JsfLayoutD3) {
    super();
    Object.assign(this, data);
  }
}
