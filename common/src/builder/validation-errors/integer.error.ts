import { ValidationError } from '../abstract/abstract-validation-error';

export class IntegerValidationError extends ValidationError {

  errorCode    = 'prop/integer';
  errorMessage = 'Value must be a whole number';

}
