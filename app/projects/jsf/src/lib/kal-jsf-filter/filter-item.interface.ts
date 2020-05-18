import { JsfUnknownPropBuilder } from '@kalmia/jsf-common-es2015';

export interface FilterItemInterface {
  jsfProp: JsfUnknownPropBuilder;
  title: string;
  path: string;
  value?: any;
}
