import { ValidationError } from '../abstract/abstract-validation-error';

export class MinItemsValidationError extends ValidationError {

  errorCode    = 'prop/min-items';
  errorMessage = 'Number of items must be greater than or equal to {{ expectedCount }}';

  constructor(itemsCount: number, expectedCount: number) {
    super({
      itemsCount,
      expectedCount
    });
  }
}
