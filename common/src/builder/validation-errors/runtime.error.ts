import { ValidationError } from '../abstract/abstract-validation-error';

export class RuntimeValidationError extends ValidationError {

  errorCode    = 'prop/runtime-validation-error';
  errorMessage = 'Oops! An unexpected error occured';

}
