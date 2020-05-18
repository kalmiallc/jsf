import { JsfBuilder }               from '../jsf-builder';
import {
  isItemsLayout,
  isPropArrayLayout,
  isPropExpansionPanelLayout,
  isPropLayout,
  isPropTableLayout, isRefLayout,
  isSpecialLayout
} from '../../layout/jsf-layout-util';
import { JsfAbstractLayout }        from '../../layout/abstract/abstract-layout';
import { JsfSpecialLayoutBuilder }  from './layout-builder-special';
import { JsfItemsLayoutBuilder }    from './layout-builder-items';
import {
  JsfArrayPropLayoutBuilder,
  JsfExpansionPanelPropLayoutBuilder,
  JsfTablePropLayoutBuilder
}                                   from './layout-builder-array-prop';
import { JsfPropLayoutBuilder }     from './layout-builder-prop';
import { JsfAbstractLayoutBuilder } from '../abstract';
import { JsfUnknownLayout }         from '../../layout';
import { set, cloneDeep }                      from 'lodash';

export class JsfLayoutBuilderFactory {

  static create(
    layout: JsfAbstractLayout,
    rootBuilder: JsfBuilder,
    parentBuilder: JsfAbstractLayoutBuilder<JsfUnknownLayout>,
    options: {
      docDefPath: string,
      arrayPropMap: { [propKey: string]: string },
      index?: number | string
    }) {

    if (isRefLayout(layout)) {
      // direct inject from sys
      let refLayout = rootBuilder.doc['$layoutDefinitions'][layout.$ref]

      // internal inject
      const refKey = layout.$ref.split('/')[2];
      refLayout = rootBuilder.doc['$layoutDefinitions'][refKey];

      if (!refLayout) {
        throw new Error('Invalid reference ' + layout.$ref);
      }
      refLayout = cloneDeep(refLayout);

      if (layout.set) {
        for (const setObj of layout.set) {
          set(refLayout, setObj.path, setObj.value);
        }
      }

      return JsfLayoutBuilderFactory.create(refLayout, rootBuilder, parentBuilder, options);
    }

    const constructorOptions = {
      index: options.index,
      docDefPath: options.docDefPath
    };

    if (isSpecialLayout(layout)) {
      return new JsfSpecialLayoutBuilder(layout, rootBuilder, parentBuilder, options.arrayPropMap, constructorOptions);
    }

    if (isItemsLayout(layout)) {
      return new JsfItemsLayoutBuilder(layout, rootBuilder, parentBuilder, options.arrayPropMap, constructorOptions);
    }

    if (isPropArrayLayout(layout)) {
      return new JsfArrayPropLayoutBuilder(layout, rootBuilder, parentBuilder, options.arrayPropMap, constructorOptions);
    }

    if (isPropTableLayout(layout)) {
      return new JsfTablePropLayoutBuilder(layout, rootBuilder, parentBuilder, options.arrayPropMap, constructorOptions);
    }

    if (isPropExpansionPanelLayout(layout)) {
      return new JsfExpansionPanelPropLayoutBuilder(layout, rootBuilder, parentBuilder, options.arrayPropMap, constructorOptions);
    }

    if (isPropLayout(layout)) {
      return new JsfPropLayoutBuilder(layout, rootBuilder, parentBuilder, options.arrayPropMap, constructorOptions);
    }

    throw new Error(`Unknown layout ${ JSON.stringify(layout) }`);
  }
}
