import { ValidationError } from '../abstract/abstract-validation-error';

export class MaximumLengthValidationError extends ValidationError {

  errorCode    = 'prop/max-length';
  errorMessage = 'Maximum length is {{ maxLength }}';

  constructor(maxLength: number) {
    super({
      maxLength
    });
  }
}
