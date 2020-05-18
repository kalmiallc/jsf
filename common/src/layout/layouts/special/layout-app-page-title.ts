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
@DefCategory('Layout')
export class JsfLayoutAppPageTitle extends JsfAbstractSpecialLayout<'app-page-title'> {

  @DefProp({
    type : 'string',
    title: 'Title'
  })
  title?: string;

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

  constructor(data: JsfLayoutAppPageTitle) {
    super();
    Object.assign(this, data);
  }
}
