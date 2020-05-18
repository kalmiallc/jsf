import { JsfAbstractItemsLayout }         from '../../abstract/abstract-layout';
import { JsfLayoutButtonPreferences }     from '../special';
import { DefLayout, DefProp, DefExtends, DefCategory } from '../../../jsf-for-jsf/decorators';
import { JsfLayoutMenuItem } from './layout-menu-item';

@DefLayout({
  type : 'div',
  items: [
    {
      key: 'title'
    },
    {
      key: 'icon'
    }
  ]
})

@DefExtends('JsfAbstractItemsLayout')
@DefCategory('Navigation')
export class JsfLayoutMenu extends JsfAbstractItemsLayout<'menu'> {
  @DefProp('JsfLayoutMenuItem[]')
  items: JsfLayoutMenuItem[];

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

  @DefProp({
    type : 'string',
    title: 'Icon'
  })
  icon?: string;

  @DefProp('JsfLayoutButtonPreferences')
  preferences?: JsfLayoutButtonPreferences;

  constructor(data: JsfLayoutMenu) {
    super();
    Object.assign(this, data);
  }
}
