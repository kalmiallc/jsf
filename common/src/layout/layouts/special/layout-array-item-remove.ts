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
    }
  ]
})

@DefExtends('JsfAbstractSpecialLayout')
@DefCategory('Buttons & Indicators')
@JsfDefDeprecated()
export class JsfLayoutArrayItemRemove extends JsfAbstractSpecialLayout<'array-item-remove'> {

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

  @DefProp('JsfLayoutButtonPreferences')
  preferences?: JsfLayoutButtonPreferences;

  constructor(data: JsfLayoutArrayItemRemove) {
    super();
    Object.assign(this, data);
  }
}
