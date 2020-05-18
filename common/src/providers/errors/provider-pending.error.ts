import { ValidationError } from '../../builder/abstract/abstract-validation-error';

export class ProviderPendingError extends ValidationError {

  errorCode    = 'prop/provider-pending';
  errorMessage = 'Data is loading, please wait';

}
