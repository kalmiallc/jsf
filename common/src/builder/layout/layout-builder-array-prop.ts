import { JsfLayoutPropArray, JsfLayoutPropExpansionPanel, JsfLayoutPropTable, JsfUnknownLayout } from '../../layout/index';
import { JsfLayoutBuilderOptionsInterface, JsfUnknownPropBuilder }                               from '../abstract/index';
import { JsfBuilder }                                                                            from '../jsf-builder';
import { JsfLayoutBuilderFactory }                                                               from './layout-factory';
import { JsfAbstractLayout }                                                                     from '../../layout/abstract/abstract-layout';
import { isPropBuilderArray, JsfPropBuilderArray }                                               from '../props/index';
import { JsfAbstractLayoutBuilder }                                                              from '../abstract/abstract-layout-builder';
import { canActivateLayoutItem }                                                                 from './layout-util';
import { takeUntil }                                                                             from 'rxjs/operators';

export class JsfArrayPropLayoutBuilder extends JsfAbstractLayoutBuilder<JsfLayoutPropArray> {

  /**
   * Absolute prop path to here.
   */
  path: string;

  propBuilder: JsfPropBuilderArray;

  items: JsfAbstractLayoutBuilder<JsfAbstractLayout>[][] = [];

  get isFixedItems() {
    return Array.isArray(this.propBuilder.isFixedItems);
  }

  get type() {
    return 'prop';
  }

  get enabled(): boolean {
    return this.propBuilder.enabled;
  }

  constructor(
    layout: JsfLayoutPropArray,
    rootBuilder: JsfBuilder,
    parentBuilder: JsfAbstractLayoutBuilder<JsfUnknownLayout>,
    arrayPropMap: { [propKey: string]: string },
    options: JsfLayoutBuilderOptionsInterface
  ) {
    super(layout, rootBuilder, parentBuilder, arrayPropMap, options);

    this.path         = this.abstractPathToAbsolute(layout.key);
    const propBuilder = rootBuilder.propBuilder.getControlByPath(this.path);

    if (isPropBuilderArray(propBuilder)) {
      this.propBuilder = propBuilder;
    } else {
      throw new Error(`Expected JsfPropBuilderArray from ${ layout.key }.
You probably anciently added [] at the end in the key field.
Example: { type: "array", key: "my.array.path" }
Check array-get-prop-item test for more usage info.`);
    }

    this.propBuilder.onItemAdd
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(x => {
        this.add(x.item);
      });
    this.propBuilder.onItemRemove
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(x => {
        this.removeAt(x.index);
      });
    this.propBuilder.onItemsSet
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(x => {
        this.rebuildItems();
      });
  }

  updateStatus() {
    super.updateStatus();
    this.rebuildItems();
  }

  rebuildItems() {
    this.items = [];
    (this.propBuilder.items || []).forEach(x => this.add(x));
  }

  add(propItem: JsfUnknownPropBuilder) {
    const layoutItem = ((this.layout.items || []) as any[])
      .filter(x => canActivateLayoutItem(this.rootBuilder.modes, x))
      .map((childLayout, index) => {
        const layoutBuilder = JsfLayoutBuilderFactory.create(childLayout, this.rootBuilder, this, {
          arrayPropMap: {
            ...this.arrayPropMap,
            [`${ this.layout.key }[]`]: `${ this.path }[${ propItem.id }]`
          },
          index       : `(${ propItem.id }:${ index })`,
          docDefPath  : `${ this.docDefPath }.items[${ index }]`
        });
        layoutBuilder.updateStatus();
        return layoutBuilder;
      });

    this.items.push(layoutItem);
  }

  removeAt(index: number) {
    const removedItems = this.items.splice(index, 1);
    // Note, removedItems should only contain 1 item, but we loop through all of them just in case
    for (const arrayItem of removedItems) {
      for (const layout of arrayItem) {
        layout.onDestroy();
      }
    }
  }
}

export class JsfTablePropLayoutBuilder extends JsfArrayPropLayoutBuilder {

  headers: JsfAbstractLayoutBuilder<JsfAbstractLayout>[] = [];

  constructor(
    layout: JsfLayoutPropTable,
    rootBuilder: JsfBuilder,
    parentBuilder: JsfAbstractLayoutBuilder<JsfUnknownLayout>,
    arrayPropMap: { [propKey: string]: string },
    options: JsfLayoutBuilderOptionsInterface
  ) {
    super(layout as any, rootBuilder, parentBuilder, arrayPropMap, options);

    this.headers = (layout.headers || [])
      .filter(x => canActivateLayoutItem(this.rootBuilder.modes, x))
      .map((childLayout, index) => JsfLayoutBuilderFactory.create(
        childLayout,
        rootBuilder,
        this,
        {
          arrayPropMap: this.arrayPropMap,
          index,
          docDefPath  : `${ this.docDefPath }.items[${ index }]`
        }
      ));
  }
}

export class JsfExpansionPanelPropLayoutBuilder extends JsfArrayPropLayoutBuilder {

  constructor(
    layout: JsfLayoutPropExpansionPanel,
    rootBuilder: JsfBuilder,
    parentBuilder: JsfAbstractLayoutBuilder<JsfUnknownLayout>,
    arrayPropMap: { [propKey: string]: string },
    options: JsfLayoutBuilderOptionsInterface
  ) {
    super(layout as any, rootBuilder, parentBuilder, arrayPropMap, options);
  }

}
