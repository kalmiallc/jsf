import { ValidationError } from '../abstract/abstract-validation-error';

export class EvalValidationError extends ValidationError {

  errorCode: string;
  errorMessage: string;

  constructor(code: string, data?: { [key: string]: any }) {
    super(data);
    this.errorCode = code;
  }

}
