import { JsfAbstractPropLayout }          from '../../abstract/abstract-layout';
import { JsfUnknownLayout }               from '../../index';
import { DefExtends, DefLayout, DefProp, DefCategory } from '../../../jsf-for-jsf/decorators';
import { JsfLayoutExpansionPanelContent, JsfLayoutExpansionPanelHeader } from '../items';

export class JsfLayoutPropExpansionPanelPreferences {}

@DefLayout({
  type : 'div',
  items: [
    {
      key: 'type'
    },
    {
      key: 'multi'
    }
  ]
})
@DefExtends('JsfAbstractPropLayout')
@DefCategory('Layout')
export class JsfLayoutPropExpansionPanel extends JsfAbstractPropLayout {
  @DefProp({
    type : 'string',
    title: 'Type',
    const: 'expansion-panel'
  })
  type: 'expansion-panel';

  @DefProp(['JsfLayoutExpansionPanelContent[]', 'JsfLayoutExpansionPanelHeader[]'])
  items: (JsfLayoutExpansionPanelContent | JsfLayoutExpansionPanelHeader)[];

  /**
   * Whether the user can expand multiple panels at the same time.
   */
  @DefProp({
    type : 'boolean',
    title: 'Multi'
  })
  multi?: boolean;

  @DefProp('JsfLayoutPropExpansionPanelPreferences')
  preferences?: JsfLayoutPropExpansionPanelPreferences;

  constructor(data: JsfLayoutPropExpansionPanel) {
    super();
    Object.assign(this, data);
  }
}
