import { JsfAbstractSpecialLayout }       from '../../abstract/abstract-layout';
import { JsfLayoutButtonPreferences }     from './layout-button';
import { DefLayout, DefProp, DefExtends, DefCategory, JsfDefDeprecated } from '../../../jsf-for-jsf/decorators';

@DefLayout({
  type : 'div',
  items: [
    {
      key: 'title'
    },
    {
      key: 'icon'
    },
    {
      key: 'path'
    },
    {
      type: 'div',
      htmlClass: 'ml-2 mt-3',
      items: [
        {
          type: 'heading',
          title: 'Value',
          level: 5
        },
        {
          key: 'value.$eval'
        }      
      ]
    }
    
  ]
})
@DefExtends('JsfAbstractSpecialLayout')
@DefCategory('Buttons & Indicators')
@JsfDefDeprecated()
export class JsfLayoutArrayItemAdd extends JsfAbstractSpecialLayout<'array-item-add'> {

  @DefProp({
    type : 'string',
    title: 'Title'
  })
  title: string;

  @DefProp({
    type : 'string',
    title: 'Icon'
  })
  icon?: string;

  @DefProp({
    type : 'string',
    title: 'Path'
  })
  path: string;

  @DefProp({
    type      : 'object',
    title     : 'Value',
    properties: {
      $eval: {
        type : 'string',
        title: 'Eval'
      }
    }
  })
  value?: {
    $eval: string,
  } | any;

  @DefProp('JsfLayoutButtonPreferences')
  preferences?: JsfLayoutButtonPreferences;

  constructor(data: JsfLayoutArrayItemAdd) {
    super();
    Object.assign(this, data);
  }
}
