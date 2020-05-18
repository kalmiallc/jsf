import { ValidationError } from '../abstract/abstract-validation-error';

export class EvenValidationError extends ValidationError {

  errorCode    = 'prop/even';
  errorMessage = 'Value must be even';

  constructor() {
    super();
  }

}
