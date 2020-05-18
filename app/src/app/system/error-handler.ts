import { ErrorHandler, Injectable} from '@angular/core';
import { JsfEvalRuntimeError }     from '@kalmia/jsf-common-es2015';
import * as logdown from 'logdown';

@Injectable()
export class AppErrorHandler implements ErrorHandler {

  private readonly evalRuntimeErrorLogger = logdown('Eval Runtime');

  constructor() {
    this.evalRuntimeErrorLogger.state.isEnabled = true;
  }

  handleError(e: any) {
    // Handle zone.js wrapping errors.
    if (typeof e === 'object' && 'rejection' in e) {
      e = e['rejection'];
    }

    if (e instanceof JsfEvalRuntimeError) {
      this.evalRuntimeErrorLogger.error(`*${ e.errorMessage }*`, {
        ... (e),
      }, e.errorStack);
    } else {
      console.error(e);
    }
  }

}
