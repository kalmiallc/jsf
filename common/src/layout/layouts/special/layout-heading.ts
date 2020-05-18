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
    },
    {
      key: 'level'
    }
  ]
})

@DefExtends('JsfAbstractSpecialLayout')
@DefCategory('Text')
export class JsfLayoutHeading extends JsfAbstractSpecialLayout<'heading'> {

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
        items: [
          {
            type: 'string'
          }
        ]
      },
    }
  })
  templateData?: {
    $eval: string,
    dependencies?: string[]
  };

  @DefProp({
    type       : 'integer',
    title      : 'level',
    minimum    : 1,
    maximum    : 6,
    description: 'Choose a number from 1 to 6'
  })
  level?: 1 | 2 | 3 | 4 | 5 | 6;

  constructor(data: JsfLayoutHeading) {
    super();
    Object.assign(this, data);
  }
}
