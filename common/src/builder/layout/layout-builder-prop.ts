import { JsfPropLayout, JsfUnknownLayout }                                 from '../../layout/index';
import { JsfAbstractPropBuilder, JsfLayoutBuilderOptionsInterface, JsfUnknownPropBuilder } from '../abstract/index';
import { JsfBuilder }                                                                      from '../jsf-builder';
import { JsfAbstractLayoutBuilder }                                                        from '../abstract/abstract-layout-builder';
import { JsfAbstractItemsLayoutBuilder }                                                   from './layout-builder-items';

export class JsfPropLayoutBuilder<PropBuilder extends JsfAbstractPropBuilder<any, any, any, any> = JsfUnknownPropBuilder>
  // extends JsfAbstractLayoutBuilder<JsfPropLayout>
  extends JsfAbstractItemsLayoutBuilder<JsfPropLayout> {

  path: string;

  propBuilder: PropBuilder;

  get type() {
    return 'prop';
  }

  get enabled(): boolean {
    return this.propBuilder.enabled;
  }

  constructor(
    layout: JsfPropLayout,
    rootBuilder: JsfBuilder,
    parentBuilder: JsfAbstractLayoutBuilder<JsfUnknownLayout>,
    arrayPropMap: { [propKey: string]: string },
    options: JsfLayoutBuilderOptionsInterface
  ) {
    super(layout, rootBuilder, parentBuilder, arrayPropMap, options);

    this.path                                   = this.abstractPathToAbsolute(layout.key);
    (this.propBuilder as JsfUnknownPropBuilder) = rootBuilder.propBuilder.getControlByPath(this.path);


    if (!layout.items && this.propBuilder.hasHandler) {
      this.propBuilder.handler.beforeLayoutBuildHook(this);
    }

    this.buildItems();
  }
}
