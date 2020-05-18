import { MaximumValidationError } from './max.error';

export class MaxDecimalDigitsError extends MaximumValidationError {

  errorCode    = 'prop/decimal-digits-maximum';
  errorMessage = `Value can't have more than {{ maxValue }} decimal digits`;

  constructor(maxValue) {
    super(maxValue);
  }

}
