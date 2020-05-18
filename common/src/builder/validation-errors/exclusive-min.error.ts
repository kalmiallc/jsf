import { MinimumValidationError } from './min.error';

export class ExclusiveMinimumValidationError extends MinimumValidationError {

  errorCode    = 'prop/exclusive-minimum';
  errorMessage = 'Value must be greater than {{ minValue }}';

  constructor(minValue: number | Date) {
    super(minValue);
  }

}
