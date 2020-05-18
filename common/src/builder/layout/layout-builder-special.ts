import { JsfSpecialLayout, JsfUnknownLayout }                         from '../../layout/index';
import { JsfBuilder }                                                 from '../jsf-builder';
import { JsfAbstractLayoutBuilder, JsfLayoutBuilderOptionsInterface } from '../abstract/abstract-layout-builder';

export class JsfSpecialLayoutBuilder extends JsfAbstractLayoutBuilder<JsfSpecialLayout> {

  get type() {
    return this.layout.type;
  }

  get enabled(): boolean {
    return true;
  }

  constructor(
    layout: JsfSpecialLayout,
    rootBuilder: JsfBuilder,
    parentBuilder: JsfAbstractLayoutBuilder<JsfUnknownLayout>,
    arrayPropMap: { [propKey: string]: string },
    options: JsfLayoutBuilderOptionsInterface
  ) {
    super(layout, rootBuilder, parentBuilder, arrayPropMap, options);
  }

}
