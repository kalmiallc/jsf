import { isBoolean, isString } from 'lodash';
import { evalService }         from '../builder/util/eval.service';

export function canActivateFilterItem(modes: string[], layoutFilterItem: any): boolean {
  if (!layoutFilterItem.$mode) {
    return true;
  }
  if (isString(layoutFilterItem.$mode)) {
    return modes.indexOf(layoutFilterItem.$mode) > -1;
  } else {
    const res = evalService.runEvalWithContext(layoutFilterItem.$mode.$evalTranspiled || layoutFilterItem.$mode.$eval, {
      $modes: [...modes],
      $mode : (mode: string) => modes.indexOf(mode) > -1
    });
    if (!isBoolean(res)) {
      throw new Error(`Filter item eval returned non boolean vale. Filter mode: ${ JSON.stringify(layoutFilterItem.$mode) }`);
    }
    return res;
  }
}
