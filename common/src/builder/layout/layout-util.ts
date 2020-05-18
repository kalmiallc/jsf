import { JsfAbstractLayout }            from '../../layout';
import { isBoolean, isString, isArray } from 'lodash';
import { evalService }                  from '../util/eval.service';

export function canActivateLayoutItem(modes: string[], item: JsfAbstractLayout): boolean {
  if (!item.$mode) {
    return true;
  }
  if (isString(item.$mode)) {
    if (item.$mode.startsWith('!')) {
      return modes.indexOf(item.$mode.substr(1)) === -1;
    } else {
      return modes.indexOf(item.$mode) > -1;
    }
  } else if (isArray(item.$mode)) {
    for (const $mode of item.$mode) {
      if ($mode.startsWith('!')) {
        if (modes.indexOf($mode.substr(1)) !== -1) {
          return false;
        }
      } else if (modes.indexOf($mode) === -1) {
        return false;
      }
    }
    return true;
  } else {
    const res = evalService.runEvalWithContext(item.$mode.$evalTranspiled || item.$mode.$eval, {
      $modes: [...modes],
      $mode : (mode: string) => modes.indexOf(mode) > -1
    });
    if (!isBoolean(res)) {
      throw new Error(`Layout item eval returned non boolean vale. Layout mode: ${ JSON.stringify(item.$mode) }`);
    }
    return res;
  }
}
