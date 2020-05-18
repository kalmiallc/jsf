import { NgModule }                        from '@angular/core';
import { CommonModule }                            from '@angular/common';
import { ShowValidationMessagesDirective }              from './show-validation-messages.directive';
import { HoverClassDirective }                          from './hover-class.directive';
import { NumberInputAutocorrectDirective }              from './number-input-autocorrect.directive';
import { OutlineGapAutocorrectDirective }               from './outline-gap-autocorrect.directive';
import { PropValidatorDirective }                       from './prop-validator.directive';
import { ArrayItemRemoveDirective }                     from './array-item-remove.directive';
import { LayoutProgressTrackerStepControllerDirective } from './layout-progress-tracker-step-controller.directive';
import { MatInputNumberDecimalDirective }               from './mat-input-number-decimal.directive';

@NgModule({
  imports     : [
    CommonModule
  ],
  declarations: [
    ShowValidationMessagesDirective,
    HoverClassDirective,
    NumberInputAutocorrectDirective,
    OutlineGapAutocorrectDirective,
    PropValidatorDirective,
    ArrayItemRemoveDirective,
    LayoutProgressTrackerStepControllerDirective,
    MatInputNumberDecimalDirective
  ],
  exports     : [
    ShowValidationMessagesDirective,
    HoverClassDirective,
    NumberInputAutocorrectDirective,
    OutlineGapAutocorrectDirective,
    PropValidatorDirective,
    ArrayItemRemoveDirective,
    LayoutProgressTrackerStepControllerDirective,
    MatInputNumberDecimalDirective
  ]
})
export class JsfDirectivesModule {}
