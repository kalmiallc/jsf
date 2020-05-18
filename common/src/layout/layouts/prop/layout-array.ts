import { JsfAbstractPropLayout }          from '../../abstract/abstract-layout';
import { JsfUnknownLayout }               from '../../index';
import { DefExtends, DefLayout, DefProp, DefCategory } from '../../../jsf-for-jsf/decorators';

@DefLayout({
  type : 'div',
  items: [
    {
      key: 'type'
    },
    {
      key: 'addable'
    },
    {
      key: 'orderable'
    },
    {
      key: 'removable'
    },
  ]
})
@DefExtends('JsfAbstractPropLayout')
@DefCategory('List')
export class JsfLayoutPropArray extends JsfAbstractPropLayout {
  @DefProp({
    type : 'string',
    title: 'Type',
    const: 'array'
  })
  type: 'array';

  @DefProp('JsfUnknownLayout[]')
  items: JsfUnknownLayout[];

  @DefProp({
    type : 'boolean',
    title: 'Addable'
  })
  addable?: boolean;

  @DefProp({
    type : 'boolean',
    title: 'Orderable'
  })
  orderable?: boolean;

  @DefProp({
    type : 'boolean',
    title: 'Removable'
  })
  removable?: boolean;

  constructor(data: JsfLayoutPropArray) {
    super();
    Object.assign(this, data);
  }
}
