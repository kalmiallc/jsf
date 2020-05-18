import { JsfItemsLayout, JsfPropLayout, JsfUnknownLayout }            from '../../layout/index';
import { JsfBuilder }                                                 from '../jsf-builder';
import { JsfLayoutBuilderFactory }                                    from './layout-factory';
import { JsfAbstractLayout }                                          from '../../layout/abstract/abstract-layout';
import { JsfAbstractLayoutBuilder, JsfLayoutBuilderOptionsInterface } from '../abstract/abstract-layout-builder';
import { canActivateLayoutItem }                                      from './layout-util';
import { JsfUnknownLayoutBuilder }                                    from './index';

export abstract class JsfAbstractItemsLayoutBuilder<LayoutType extends (JsfItemsLayout | JsfPropLayout)> extends JsfAbstractLayoutBuilder<LayoutType> {
  items: JsfAbstractLayoutBuilder<JsfAbstractLayout>[];

  abstract get type(): string;

  abstract get enabled(): boolean;

  constructor(
    layout: LayoutType,
    rootBuilder: JsfBuilder,
    parentBuilder: JsfAbstractLayoutBuilder<JsfUnknownLayout>,
    arrayPropMap: { [propKey: string]: string },
    options: JsfLayoutBuilderOptionsInterface
  ) {
    super(layout, rootBuilder, parentBuilder, arrayPropMap, options);
  }

  protected buildItems() {
    this.items = ((this.layout.items || []) as any[])
      .filter(x => this.canBuildItem(x))
      .map((childLayout, index) => JsfLayoutBuilderFactory.create(
        childLayout,
        this.rootBuilder,
        this,
        {
          arrayPropMap: this.arrayPropMap,
          index,
          docDefPath  : `${ this.docDefPath }.items[${ index }]`
        }
      ));
  }

  canBuildItem(item: JsfItemsLayout) {
    if (!canActivateLayoutItem(this.rootBuilder.modes, item)) {
      return false;
    }

    if (item.buildIf) {
      const ctx = this.rootBuilder.getEvalContext({
        layoutBuilder: this as JsfUnknownLayoutBuilder
      });
      if (!this.rootBuilder.runEvalWithContext(item.buildIf.$evalTranspiled || item.buildIf.$eval, ctx)) {
        return false;
      }
    }

    return true;
  }

  updateStatus() {
    super.updateStatus();
    this.items.forEach(x => x.updateStatus());
  }

  onDestroy() {
    super.onDestroy();
    this.items.forEach(x => x.onDestroy());
  }
}


export class JsfItemsLayoutBuilder extends JsfAbstractItemsLayoutBuilder<JsfItemsLayout> {

  get type() {
    return this.layout.type;
  }

  get enabled(): boolean {
    for (const item of this.items) {
      if (item.enabled) {
        return true;
      }
    }
    return false;
  }

  constructor(
    layout: JsfItemsLayout,
    rootBuilder: JsfBuilder,
    parentBuilder: JsfAbstractLayoutBuilder<JsfUnknownLayout>,
    arrayPropMap: { [propKey: string]: string },
    options: JsfLayoutBuilderOptionsInterface
  ) {
    super(layout, rootBuilder, parentBuilder, arrayPropMap, options);
    this.buildItems();
  }
}
