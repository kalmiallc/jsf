import { ValidationError } from '../abstract/abstract-validation-error';

export class RequiredValidationError extends ValidationError {

  errorCode    = 'prop/required';
  errorMessage = 'Required';

}
