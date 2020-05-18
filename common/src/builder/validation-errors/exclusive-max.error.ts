import { MaximumValidationError } from './max.error';

export class ExclusiveMaximumValidationError extends MaximumValidationError {

  errorCode    = 'prop/exclusive-maximum';
  errorMessage = 'Value must be less than {{ maxValue }}';

  constructor(maxValue: number | Date) {
    super(maxValue);
  }
}
