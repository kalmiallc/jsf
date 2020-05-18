import { JsfAbstractPropLayout }                       from '../../abstract/abstract-layout';
import { DefExtends, DefProp, DefLayout, DefCategory } from '../../../jsf-for-jsf';
import { JsfLayoutDiv, JsfUnknownLayout }              from '../../index';

@DefLayout({
  type : 'div',
  items: [
    {
      key: 'type'
    }
  ]
} as JsfLayoutDiv)
@DefExtends('JsfAbstractPropLayout')
@DefCategory('Layout')
export class JsfLayoutProp extends JsfAbstractPropLayout {
  @DefProp({
    type : 'null',
    title: 'Type'
  })
  type?: never;

  @DefProp('JsfLayoutPropPreferences')
  preferences?: JsfLayoutPropPreferences;

  /**
   * Used only in specific cases like table 2.0, kanban board, ...
   */
  @DefProp('JsfUnknownLayout[]')
  items?: JsfUnknownLayout[];

  constructor(data: JsfLayoutProp) {
    super();
    Object.assign(this, data);
  }
}

export type JsfLayoutPropPreferences =
  JsfLayoutPropStringPreferences |
  JsfLayoutPropNumberPreferences |
  JsfLayoutPropBooleanPreferences;


export interface JsfLayoutPropStringPreferences {
  /**
   * Prop color palette.
   */
  color?: 'primary' | 'accent';
  /**
   * Set the appearance of input form fields.
   */
  appearance?: 'legacy' | 'standard' | 'fill' | 'outline';
  /**
   * Input variant. Affects appearance of the control as defined in the active theme.
   */
  variant?: 'standard' | 'small';
  /**
   * Whether the prop should have a clear button.
   */
  clearable?: boolean;
  /**
   * Name of a material icon to use as the prefix.
   * See https://material.io/tools/icons/
   */
  prefixIcon?: string;
  /**
   * Name of a material icon to use as the suffix.
   * See https://material.io/tools/icons/
   */
  suffixIcon?: string;
  /**
   * Text to use as the prefix.
   */
  prefixLabel?: string;
  /**
   * Text to use as the suffix.
   */
  suffixLabel?: string;
}

export interface JsfLayoutPropNumberPreferences extends JsfLayoutPropStringPreferences {
  /**
   * Show the increment/decrement buttons on the sides of the input control.
   */
  stepperButtons?: boolean;
  /**
   * Amount to increment/decrement the value when using stepper buttons or arrow keys.
   */
  step?: number;
}

export interface JsfLayoutPropIntegerPreferences extends JsfLayoutPropStringPreferences {
  /**
   * Show the increment/decrement buttons on the sides of the input control.
   */
  stepperButtons?: boolean;
  /**
   * Amount to increment/decrement the value when using stepper buttons or arrow keys.
   */
  step?: number;
}

export interface JsfLayoutPropBooleanPreferences {
  /**
   * Display the control as either a checkbox or a slider.
   */
  variant: 'checkbox' | 'slider';
  /**
   * Prop color palette.
   */
  color?: 'primary' | 'accent';
  /**
   * Set the position of the label in relation to the check box.
   */
  labelPositionCheckbox?: 'before' | 'after';
  /**
   * Set the position of the label in relation to the slider.
   */
  labelPositionSlider?: 'before' | 'after';
}
