import { JsfAbstractSpecialLayout }       from '../../abstract/abstract-layout';
import { DefExtends, DefLayout, DefProp, DefCategory } from '../../../jsf-for-jsf/decorators';

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
          title: 'Title template data',
          level: 5
        },
        {
          key: 'titleTemplateData.$eval'
        },
        {
          key: 'titleTemplateData.dependencies'
        }  
      ]
    },
    
    {
      key: 'href'
    },
    {
      type: 'div',
      htmlClass: 'ml-2 mt-3',
      items: [
        {
          type: 'heading',
          title: 'Href template data',
          level: 5
        },
        {
          key: 'hrefTemplateData.$eval'
        },
        {
          key: 'hrefTemplateData.dependencies'
        }
      ]
    }
    
  ]
})
@DefExtends('JsfAbstractSpecialLayout')
@DefCategory('Text')
export class JsfLayoutAnchor extends JsfAbstractSpecialLayout<'anchor'> {

  @DefProp({
    type : 'string',
    title: 'Title'
  })
  title: string;

  @DefProp({
    type      : 'object',
    title     : 'Title template data',
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
  titleTemplateData?: {
    $eval: string;
    dependencies?: string[];
  };

  @DefProp({
    type : 'string',
    title: 'Href'
  })
  href: string;

  @DefProp({
    type      : 'object',
    title     : 'Href template data',
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
  hrefTemplateData?: {
    $eval: string;
    dependencies?: string[];
  };

  constructor(data: JsfLayoutAnchor) {
    super();
    Object.assign(this, data);
  }
}
