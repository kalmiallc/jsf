import { ValidationError } from '../abstract/abstract-validation-error';

export class InvalidDateValidationError extends ValidationError {

  errorCode    = 'prop/invalid-date';
  errorMessage = 'Invalid date';

}
