import { evalService, JsfSpecialLayoutBuilder } from '@kalmia/jsf-common-es2015';
import { colorUtils }                           from '../../../../../utilities';

export interface EvalObject {
  $eval: string;
  $evalTranspiled?: string;

  dependencies?: [];
  layoutDependencies?: [];
}

export class PropertyEvaluator {

  constructor(private layoutBuilder: JsfSpecialLayoutBuilder) {
  }

  public evaluate(propertyValue: any, extraContext?: any): any {
    if (this.isEvalObject(propertyValue)) {
      // Additional context parameters that are available only inside the renderer.
      extraContext = {
        $ralToHex: (x: string) => colorUtils.ralToHex(x),
        ... (extraContext || {})
      };

      // Evaluate.
      const ctx = evalService.getEvalContext(this.layoutBuilder.rootBuilder, {
        layoutBuilder     : this.layoutBuilder,
        extraContextParams: extraContext || {}
      });
      return evalService.runEvalWithContext(propertyValue.$evalTranspiled || propertyValue.$eval, ctx);
    } else {
      return propertyValue;
    }
  }

  public isEvalObject(x: any): x is EvalObject {
    return typeof x === 'object' && '$eval' in x;
  }

}
