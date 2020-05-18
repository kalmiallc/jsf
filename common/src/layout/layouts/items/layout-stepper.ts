import { JsfAbstractItemsLayout }         from '../../abstract/abstract-layout';
import { JsfLayoutStep }                  from './layout-step';
import { DefLayout, DefProp, DefExtends, DefCategory } from '../../../jsf-for-jsf/decorators';

@DefLayout({
  type : 'div',
  items: [
    {
      key: 'variant'
    },
    {
      key: 'linear'
    },
    {
      key: 'primary'
    },
    {
      key: 'initialStep'
    },
    {
      type: 'div',
      htmlClass: 'ml-2 mt-3',
      items: [
        {
          type: 'heading',
          title: 'On step change',
          level: 5
        },
        {
          key: 'onStepChange.$eval'
        }
      ]
    }
    
  ]
})

@DefExtends('JsfAbstractSpecialLayout')
@DefCategory('Layout')
export class JsfLayoutStepper extends JsfAbstractItemsLayout<'stepper'> {

  @DefProp('JsfLayoutStep[]')
  items: JsfLayoutStep[];

  @DefProp({
    type       : 'string',
    title      : 'Variant',
    description: 'Choose horizontal or vertical'
  })
  variant?: 'horizontal' | 'vertical';

  @DefProp({
    type : 'boolean',
    title: 'Linear'
  })
  linear?: boolean;

  @DefProp({
    type : 'boolean',
    title: 'Primary'
  })
  primary?: boolean;

  @DefProp('JsfLayoutStepperPreferences')
  preferences?: JsfLayoutStepperPreferences;

  @DefProp([
    {
      type : 'number',
      title: 'Initial step'
    },
    {
      type      : 'object',
      title     : 'Initial step',
      properties: {
        $eval: {
          type : 'string',
          title: 'Eval'
        }
      }
    }
  ])
  initialStep?: number | {
    $eval: string;
  };

  // Event - step change
  @DefProp({
    type      : 'object',
    title     : 'On step change',
    properties: {
      $eval: {
        type : 'string',
        title: 'Eval'
      }
    }
  })
  onStepChange?: {
    $eval: string;
  };

  constructor(data: JsfLayoutStepper) {
    super();
    Object.assign(this, data);
  }
}

export interface JsfLayoutStepperPreferences {
  /**
   * Stepper variant.
   */
  appearance: 'standard' | 'compact';
  /**
   * Define the position of the labels.
   * Only available for horizontal-type stepper.
   */
  labelPosition?: 'end' | 'bottom';
  /**
   * Define the position of the step header.
   */
  stepHeaderPosition: 'start' | 'end';
  /**
   * Name of a material icon to use as the edit icon.
   * See https://material.io/tools/icons/
   */
  editIcon: string;
  /**
   * Name of a material icon to use as the done icon.
   * See https://material.io/tools/icons/
   */
  doneIcon: string;
}
