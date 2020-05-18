import { MinItemsValidationError } from './min-items.error';

export class MaxItemsValidationError extends MinItemsValidationError {

  errorCode    = 'prop/max-items';
  errorMessage = 'Number of items must be less than or equal to {{ expectedCount }}';

}
