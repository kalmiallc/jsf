import { ValidationError } from '../abstract/abstract-validation-error';

export class OddValidationError extends ValidationError {

  errorCode    = 'prop/odd';
  errorMessage = 'Value must be odd';

  constructor() {
    super();
  }

}
