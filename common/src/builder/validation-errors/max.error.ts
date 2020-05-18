import { ValidationError } from '../abstract/abstract-validation-error';

export class MaximumValidationError extends ValidationError {

  errorCode    = 'prop/maximum';
  errorMessage = 'Value must be less than or equal to {{ maxValue }}';

  constructor(maxValue: number | Date) {
    super({
      maxValue
    });
  }

}
