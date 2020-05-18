import { JsfAbstractSpecialLayout }       from '../../abstract/abstract-layout';
import { DefLayout, DefProp, DefExtends, DefCategory } from '../../../jsf-for-jsf/decorators';

@DefLayout({
  type : 'div',
  items: [
    {
      key: 'label'
    },
    {
      type: 'div',
      htmlClass: 'ml-2 mt-3',
      items: [
        {
          type: 'heading',
          title: 'Label template data',
          level: 5
        },
        {
          key: 'labelTemplateData.$eval'
        },
        {
          key: 'labelTemplateData.dependencies'
        },
        
      ]
    },    
    {
      key: 'value'
    },
    {
      type: 'div',
      htmlClass: 'ml-2 mt-3',
      items: [
        {
          type: 'heading',
          title: 'Value template data',
          level: 5
        },
        {
          key: 'valueTemplateData.$eval'
        },
        {
          key: 'valueTemplateData.dependencies'
        }
      ]
    }
  ]
})
@DefExtends('JsfAbstractSpecialLayout')
@DefCategory('Layout')
export class JsfLayoutOrderSummaryLineItem extends JsfAbstractSpecialLayout<'order-summary-line-item'> {

  @DefProp({
    type : 'string',
    title: 'Label',
  })
  label: string;

  @DefProp({
    type      : 'object',
    title     : 'Label template data',
    properties: {
      $eval       : {
        type : 'string',
        title: 'Eval'
      },
      dependencies: {
        type : 'array',
        title: 'Dependencies',
        items: [
          {
            type: 'string'
          }
        ]
      },
    }
  })
  labelTemplateData?: {
    $eval: string;
    dependencies?: string[];
  };

  @DefProp({
    type : 'string',
    title: 'Value',
  })
  value: string;

  @DefProp({
    type      : 'object',
    title     : 'Value template data',
    properties: {
      $eval       : {
        type : 'string',
        title: 'Eval'
      },
      dependencies: {
        type : 'array',
        title: 'Dependencies',
        items: []
      },
    }
  })
  valueTemplateData?: {
    $eval: string;
    dependencies?: string[];
  };

  constructor(data: JsfLayoutOrderSummaryLineItem) {
    super();
    Object.assign(this, data);
  }
}
