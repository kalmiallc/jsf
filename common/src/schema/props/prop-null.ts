import { JsfAbstractProp } from '../abstract/abstract-prop';
import { JsfHandlerNull }  from '../../handlers';
import { DefExtends, DefCategory }      from '../../jsf-for-jsf';

/**
 * Value MUST be null.  Note this is mainly for purpose of
 * being able use union types to define nullability.  If this type
 * is not included in a union, null values are not allowed (the
 * primitives listed above do not allow nulls on their own).
 */
@DefExtends('JsfAbstractProp')
export class JsfPropNull extends JsfAbstractProp<null, 'null', JsfHandlerNull> {
  constructor(data: JsfPropNull) {
    super();
    Object.assign(this, data);
  }
}
