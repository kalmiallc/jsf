import { JsfRegister }            from '../../jsf-register';
import { JsfBasicHandlerBuilder } from '../../builder/abstract/abstract-basic-handler-builder';
import { JsfPropBuilderObject }   from '../../builder/props';
import {
  PatchValueOptionsInterface,
  SetValueOptionsInterface
}                                 from '../../builder/interfaces/set-value-options.interface';
import { JsfUnknownPropBuilder }  from '../../builder/abstract/index';

export class JsfHandlerBuilderAny extends JsfBasicHandlerBuilder<JsfUnknownPropBuilder> {
  type: 'any';

  value: any;

  constructor(builder: JsfUnknownPropBuilder) {
    super(builder);
    this.builder.valueToJson = x => x;
    this.builder.jsonToValue = x => x;
  }

  lock(lockKey?: Symbol): Symbol {
    return this.builder.lock(lockKey);
  }

  isDiff(lockKey: Symbol): boolean {
    return this.builder.isDiff(lockKey);
  }

  getDiff(lockKey: Symbol): any {
    if (this.isDiff(lockKey)) {
      return this.builder.getDiff(lockKey);
    }
  }

  getJsonDiff(lockKey: Symbol): any {
    if (this.isDiff(lockKey)) {
      return this.builder.getJsonDiff(lockKey);
    }
  }

  setValue(value: any, options: SetValueOptionsInterface = {}) {
    this.value = value;
  }

  patchValue(value: any, options: PatchValueOptionsInterface = {}) {
    this.value = { ...this.value, ...value };
  }

  async validate(): Promise<boolean> {
    return this.builder._validateViaProp();
  }

  getJsonValue() {
    return this.value;
  }

  getValue() {
    return this.value;
  }
}

JsfRegister.handler('any', JsfHandlerBuilderAny, [JsfPropBuilderObject]);
