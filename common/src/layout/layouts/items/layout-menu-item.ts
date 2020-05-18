import { JsfAbstractItemsLayout }         from '../../abstract/abstract-layout';
import { JsfLayoutOnClickInterface }      from '../../interfaces/layout-on-click.interface';
import { DefLayout, DefProp, DefExtends, DefCategory } from '../../../jsf-for-jsf/decorators';
import { JsfUnknownLayout } from '../../index';

@DefLayout({
  type : 'div',
  items: [
    {
      key: 'title'
    },
    {
      key: 'description'
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
      type: 'div',
      htmlClass: 'ml-2 mt-3',
      items: [
        {
          type: 'heading',
          title: 'Description template data',
          level: 5
        },
        {
          key: 'descriptionTemplateData.$eval'
        },
        {
          key: 'descriptionTemplateData.dependencies'
        }
      ]
    }
  ]
})
@DefExtends('JsfAbstractItemsLayout')
@DefCategory('Navigation')
export class JsfLayoutMenuItem extends JsfAbstractItemsLayout<'menu-item'> {
  @DefProp('JsfUnknownLayout[]')
  items: JsfUnknownLayout[];

  @DefProp({
    type : 'string',
    title: 'Title'
  })
  title: string;

  @DefProp({
    type : 'string',
    title: 'Description'
  })
  description?: string;

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
    type      : 'object',
    title     : 'Description template data',
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
  descriptionTemplateData?: {
    $eval: string;
    dependencies?: string[];
  };

  @DefProp({
    type : 'string',
    title: 'Icon'
  })
  icon?: string;

  @DefProp('JsfLayoutOnClickInterface[]')
  onClick?: JsfLayoutOnClickInterface | JsfLayoutOnClickInterface[];

  constructor(data: JsfLayoutMenuItem) {
    super();
    Object.assign(this, data);
  }
}
