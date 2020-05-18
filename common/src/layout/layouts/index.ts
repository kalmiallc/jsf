import { JsfLayoutItemsPreferencesInterface }   from './items';
import { JsfLayoutPropPreferencesInterface }    from './prop';
import { JsfLayoutSpecialPreferencesInterface } from './special';

export * from './items';
export * from './prop';
export * from './special';

export interface JsfLayoutPreferencesInterface extends JsfLayoutItemsPreferencesInterface,
  JsfLayoutPropPreferencesInterface,
  JsfLayoutSpecialPreferencesInterface {
}
