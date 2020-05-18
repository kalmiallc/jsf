import { JsfAbstractProp } from '../abstract/abstract-prop';
import { JsfHandlerId }    from '../../handlers';
import { DefExtends, DefCategory }      from '../../jsf-for-jsf';

@DefExtends('JsfAbstractProp')
export class JsfPropId extends JsfAbstractProp<string, 'id', JsfHandlerId> {
  constructor(data: JsfPropId) {
    super();
    Object.assign(this, data);
  }
}
