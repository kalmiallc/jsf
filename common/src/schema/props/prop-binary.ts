import { JsfAbstractProp }                from '../abstract/abstract-prop';
import { JsfHandlerBinary }               from '../../handlers';
import { DefExtends, DefLayout, DefProp, DefCategory } from '../../jsf-for-jsf';

export type ContentType = 'image/jpeg' | 'image/png' | 'application/pdf';

type Buffer = any;

@DefExtends('JsfAbstractProp')
export class JsfPropBinary extends JsfAbstractProp<Buffer, 'binary', JsfHandlerBinary> {

  @DefProp('ContentType[]')
  contentType?: ContentType | ContentType[];

  constructor(data: JsfPropBinary) {
    super();
    Object.assign(this, data);
  }
}
