import { JsfAbstractItemsLayout }         from '../../abstract/abstract-layout';
import { DefLayout, DefProp, DefExtends, DefCategory } from '../../../jsf-for-jsf/decorators';
import { JsfUnknownLayout } from '../../index';

@DefLayout({
  type : 'div',
  items: [
    {
      key: 'title'
    },
    {
      key: 'selected'
    },
  ]
})

@DefExtends('JsfAbstractItemsLayout')
@DefCategory('Layout')
export class JsfLayoutTab extends JsfAbstractItemsLayout<'tab'> {
  @DefProp('JsfUnknownLayout[]')
  items: JsfUnknownLayout[];

  @DefProp({
    type : 'string',
    title: 'Title'
  })
  title?: string;

  @DefProp({
    type : 'boolean',
    title: 'Selected'
  })
  selected?: boolean;

  @DefProp('JsfLayoutTabPreferences')
  preferences?: JsfLayoutTabPreferences;

  constructor(data: JsfLayoutTab) {
    super();
    Object.assign(this, data);
  }
}

export interface JsfLayoutTabPreferences {
  /**
   * Name of a material icon to use as the prefix.
   * See https://material.io/tools/icons/
   */
  prefixIcon?: string;
  /**
   * Text to use as the prefix.
   */
  prefixLabel?: string;
}
