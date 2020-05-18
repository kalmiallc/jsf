import { ErrorStateMatcher }                       from '@angular/material';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ShowValidationMessagesDirective }         from '../kal-jsf-doc/directives/show-validation-messages.directive';

/**
 * Error when control is invalid & dirty.
 */
export class JsfErrorStateMatcher implements ErrorStateMatcher {

  constructor(protected showValidation: ShowValidationMessagesDirective) {
  }

  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    if (this.showValidation) {
      return !!(control && control.invalid && (this.showValidation.state || control.dirty));
    }
    return !!(control && control.invalid && control.dirty);
  }
}
