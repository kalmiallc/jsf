import { JsfAbstractProp } from '../../schema/abstract';

export function getEvalValidatorsDependencies(x: JsfAbstractProp<any, any, any> | any): string[] {
  return (x.evalValidators && x.evalValidators.dependencies) || [];
}
