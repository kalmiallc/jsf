import {
  JsfAbstractItemsLayout,
  JsfAbstractLayout,
  JsfAbstractPropLayout,
  JsfAbstractSpecialLayout
}                                                                                            from './abstract/abstract-layout';
import { JsfLayoutPropArray, JsfLayoutPropExpansionPanel, JsfLayoutPropTable, JsfLayoutRef } from './index';

export function isRefLayout(layout: JsfAbstractLayout): layout is JsfLayoutRef {
  return (layout as any).type === 'ref' && (layout as any)['$ref'];
}

export function isSpecialLayout(layout: JsfAbstractLayout): layout is JsfAbstractSpecialLayout<any> {
  return (layout as any).type && !(layout as any).key && !(layout as any).items;
}

export function isItemsLayout(layout: JsfAbstractLayout): layout is JsfAbstractItemsLayout<any> {
  return (layout as any).type && !(layout as any).key && (layout as any).items;
}

export function isPropLayout(layout: JsfAbstractLayout): layout is JsfAbstractPropLayout {
  return (layout as any).key && !isPropArrayLayout(layout);
}

export function isPropArrayLayout(layout: JsfAbstractLayout): layout is JsfLayoutPropArray {
  return (layout as any).key && (layout as any).type === 'array';
}

export function isPropTableLayout(layout: JsfAbstractLayout): layout is JsfLayoutPropTable {
  return (layout as any).key && (layout as any).type === 'table';
}

export function isPropExpansionPanelLayout(layout: JsfAbstractLayout): layout is JsfLayoutPropExpansionPanel {
  return (layout as any).key && (layout as any).type === 'expansion-panel';
}
