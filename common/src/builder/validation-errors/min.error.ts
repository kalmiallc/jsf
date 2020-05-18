import { ValidationError } from '../abstract/abstract-validation-error';

export class MinimumValidationError extends ValidationError {

  errorCode    = 'prop/minimum';
  errorMessage = 'Value must be greater than or equal to {{ minValue }}';

  constructor(minValue: number | Date) {
    super({
      minValue
    });
  }

}
