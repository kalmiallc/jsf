import { animate, AnimationTriggerMetadata, state, style, transition, trigger } from '@angular/animations';

export const jsfStepperAnimations: {
  readonly horizontalStepTransition: AnimationTriggerMetadata;
  readonly verticalStepTransition: AnimationTriggerMetadata;
} = {
  /** Animation that transitions the step along the X axis in a horizontal stepper. */
  horizontalStepTransition: trigger('stepTransition', [
    state('previous', style({
      opacity   : 0,
      transform : 'translateX(-20px)',
      visibility: 'hidden'
    })),
    state('current', style({
      opacity   : 1,
      transform : 'none',
      visibility: 'visible'
    })),
    state('next', style({
      opacity   : 0,
      transform : 'translateX(20px)',
      visibility: 'hidden'
    })),
    transition('* => *', animate('500ms cubic-bezier(0.35, 0, 0.25, 1)'))
  ]),

  /** Animation that transitions the step along the Y axis in a vertical stepper. */
  verticalStepTransition: trigger('stepTransition', [
    state('previous', style({ height: '0px', visibility: 'hidden' })),
    state('next', style({ height: '0px', visibility: 'hidden' })),
    state('current', style({ height: '*', visibility: 'visible' })),
    transition('* <=> current', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
  ])
};
