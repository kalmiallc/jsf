import { DefExtends, DefLayout, DefProp, DefCategory } from '../../jsf-for-jsf/decorators';

@DefLayout({
  type : 'div',
  items: [
    {
      key: 'dependencies'
    },
  ]
})
export abstract class JsfAbstractHandler<TypeString> {
  type: TypeString;

  options?: any;

  [key: string]: any;
}
