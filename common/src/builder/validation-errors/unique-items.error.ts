import { ValidationError } from '../abstract/abstract-validation-error';

export class UniqueItemsValidationError extends ValidationError {

  errorCode    = 'prop/unique-items';
  errorMessage = 'All items must be unique';

}
