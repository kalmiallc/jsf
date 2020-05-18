import { JsfAbstractPropLayout }          from '../../abstract/abstract-layout';
import { JsfUnknownLayout }               from '../../index';
import { DefExtends, DefLayout, DefProp, DefCategory } from '../../../jsf-for-jsf';

@DefLayout({
  type : 'div',
  items: [
    {
      key: 'type'
    }
  ]
})


@DefExtends('JsfAbstractPropLayout')
@DefCategory('List')
export class JsfLayoutPropTable extends JsfAbstractPropLayout {
  @DefProp({
    type : 'string',
    const: 'table',
    title: 'Type'
  })
  type: 'table';

  @DefProp('JsfUnknownLayout[]')
  headers: JsfUnknownLayout[];

  @DefProp('JsfUnknownLayout[]')
  items: JsfUnknownLayout[];

  @DefProp('JsfLayoutPropTablePreferences')
  preferences?: JsfLayoutPropTablePreferences;

  constructor(data: JsfLayoutPropTable) {
    super();
    Object.assign(this, data);
  }
}


export interface JsfLayoutPropTablePreferences {
  /**
   * Breakpoints for controlling column widths.
   */
  columnWidthBreakpoints: {
    xs?: { [headerLayoutId: string]: number },
    sm?: { [headerLayoutId: string]: number },
    md?: { [headerLayoutId: string]: number },
    lg?: { [headerLayoutId: string]: number },
    xl?: { [headerLayoutId: string]: number },
  };

}
