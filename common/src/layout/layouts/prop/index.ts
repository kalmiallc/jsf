import {
  JsfLayoutPropBooleanPreferences,
  JsfLayoutPropIntegerPreferences,
  JsfLayoutPropNumberPreferences,
  JsfLayoutPropStringPreferences
}                                                 from './layout-prop';
import { JsfLayoutPropExpansionPanelPreferences } from './layout-expansion-panel';
import { JsfLayoutPropTablePreferences }          from './layout-table';


export * from './layout-prop';
export * from './layout-array';
export * from './layout-table';
export * from './layout-expansion-panel';


export interface JsfLayoutPropPreferencesInterface {
  // array?: never; // Not implemented
  // object?: never; // Not implemented
  // null?: never; // Not implemented
  // ref?: never; // Not implemented
  // binary?: never; // Not implemented
  // id?: never; // Not implemented
  // boolean?: never; // Not implemented
  date?: JsfLayoutPropStringPreferences;
  number?: JsfLayoutPropNumberPreferences;
  integer?: JsfLayoutPropIntegerPreferences;
  string?: JsfLayoutPropStringPreferences;
  boolean?: JsfLayoutPropBooleanPreferences;
  table?: JsfLayoutPropTablePreferences;
  expansionPanel?: JsfLayoutPropExpansionPanelPreferences;
}
