import { ValidationError } from '../abstract/abstract-validation-error';

export class FormatValidationError extends ValidationError {

  errorCode    = 'prop/format';
  errorMessage = 'Invalid format';

  constructor(format: string) {
    super({
      format
    });
  }
}
