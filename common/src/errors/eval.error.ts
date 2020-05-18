export interface JsfEvalRuntimeExceptionData {
  /**
   * Executed code
   */
  eval: string;
  /**
   * Context passed to the eval function
   */
  context: any;
  /**
   * Error message
   */
  errorMessage: any;
  /**
   * Error stack
   */
  errorStack: any;
  /**
   * The original thrown exception
   */
  exception: any;
}


export class JsfEvalRuntimeError extends Error implements JsfEvalRuntimeExceptionData {

  readonly eval: string;
  readonly context: any;

  readonly errorMessage: any;
  readonly errorStack: any;

  readonly exception: any;

  constructor(exceptionData: JsfEvalRuntimeExceptionData) {
    super(exceptionData.errorMessage);

    Object.assign(this, exceptionData);
    // The following line is needed for working `instanceof`.
    Object.setPrototypeOf(this, JsfEvalRuntimeError.prototype);
  }

}
