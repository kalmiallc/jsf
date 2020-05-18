import { ValidationError } from '../../builder/abstract/abstract-validation-error';

export class ProviderFailedError extends ValidationError {

  errorCode    = 'prop/provider-failed';
  errorMessage = 'Failed to load data, please try again';

}
