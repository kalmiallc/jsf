import { JsfUnknownPropBuilder }                        from './abstract-prop-builder';
import { JsfTranslatableMessage, JsfTranslationServer } from '../../translations';
import { JsfAbstractHandlerBuilder }                    from './abstract-handler-builder';
import {
  ConsumeProviderValueOptionsInterface,
  PatchValueOptionsInterface,
  SetValueOptionsInterface
}                                                       from '../interfaces/set-value-options.interface';

export abstract class JsfBasicHandlerBuilder<BuilderType extends JsfUnknownPropBuilder> extends JsfAbstractHandlerBuilder<BuilderType> {

  constructor(builder: BuilderType) {
    super(builder);
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

  getDiffKeys(lockKey: Symbol): string[] {
    return this.isDiff(lockKey) ? [ this.builder.path ] : [];
  }

  getJsonDiff(lockKey: Symbol): any {
    if (this.isDiff(lockKey)) {
      return this.builder.getJsonDiff(lockKey);
    }
  }

  setValue(value: any, options: SetValueOptionsInterface = {}) {
    this.builder._setValueViaProp(value, options);
  }

  patchValue(value: any, options: PatchValueOptionsInterface = {}) {
    this.builder._patchValueViaProp(value, options);
  }

  async consumeProviderValue(value: any, options: ConsumeProviderValueOptionsInterface = { mode: 'set' }) {
    if (options.setToPath) {
      const control = this.builder.getControlByPath(options.setToPath);
      return options.mode === 'set' ? control.setJsonValue(value, options) : control.patchJsonValue(value, options);
    }
    return options.mode === 'set' ? this.builder.setJsonValue(value, options) : this.builder.patchJsonValue(value, options);
  }

  async validate(): Promise<boolean> {
    return this.builder._validateViaProp();
  }

  getValue() {
    return this.builder._getValueViaProp();
  }

  async getPropTranslatableStrings(): Promise<JsfTranslatableMessage[]> {
    return [];
  }

  getStaticTranslatableStrings(): JsfTranslatableMessage[] {
    return [];
  }

  get translationServer(): JsfTranslationServer {
    return this.builder.rootBuilder.translationServer;
  }
}

