import { ValidationError } from '../abstract/abstract-validation-error';

export class PatternValidationError extends ValidationError {

  errorCode    = 'prop/pattern';
  errorMessage = 'Value does not match the required pattern';

}
