import { ValidationError } from '../abstract/abstract-validation-error';

export class EnumValidationError extends ValidationError {

  errorCode    = 'prop/enum';
  errorMessage = 'Value must be one of available values';

}
