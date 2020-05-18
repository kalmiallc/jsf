import { JsfAbstractSpecialLayout }       from '../../abstract/abstract-layout';
import { DefLayout, DefProp, DefExtends, DefCategory } from '../../../jsf-for-jsf/decorators';

@DefLayout({
  type : 'div',
  items: [
    {
      key: 'title'
    },
    {
      type: 'div',
      htmlClass: 'ml-2 mt-3',
      items: [
        {
          type: 'heading',
          title: 'Template data',
          level: 5
        },
        {
          key: 'templateData.$eval'
        },
        {
          key: 'templateData.dependencies'
        }
      ]
    }   
  ]
})
@DefExtends('JsfAbstractSpecialLayout')
@DefCategory('Text')
export class JsfLayoutSpan extends JsfAbstractSpecialLayout<'span'> {

  @DefProp({
    type : 'string',
    title: 'Title'
  })
  title: string;

  @DefProp({
    type      : 'object',
    title     : 'Template data',
    properties: {
      $eval       : {
        type : 'string',
        title: 'Eval'
      },
      dependencies: {
        type : 'array',
        title: 'Dependencies',
        items: []
      }
    }
  })
  templateData?: {
    $eval: string,
    dependencies?: string[]
  };

  constructor(data: JsfLayoutSpan) {
    super();
    Object.assign(this, data);
  }
}
