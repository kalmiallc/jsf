import { ValidationError } from '../abstract/abstract-validation-error';

export class MinimumLengthValidationError extends ValidationError {

  errorCode    = 'prop/min-length';
  errorMessage = 'Minimum length is {{ minLength }}';

  constructor(minLength: number) {
    super({
      minLength
    });
  }

}
