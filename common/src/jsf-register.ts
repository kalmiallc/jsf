import { JsfAbstractHandlerBuilder, JsfAbstractPropBuilder, JsfUnknownPropBuilder } from './builder/abstract';
import { JsfBuilder }                                                               from './builder';

export class JsfRegister {

  static storage: { [propBuilderKey: string]: (new (builder: JsfUnknownPropBuilder) => JsfAbstractHandlerBuilder<any>) } = {};

  static handler(
    type: string,
    handlerBuilderClass: new (builder: JsfUnknownPropBuilder) => JsfAbstractHandlerBuilder<any>,
    forWho: (new (rootBuilder: JsfBuilder) => JsfAbstractPropBuilder<any, any, any, any>)[]
  ) {
    JsfRegister.storage[type] = handlerBuilderClass;
  }
}
