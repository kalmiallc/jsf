import { JsfPropBinary }                                 from '../../schema/props/prop-binary';
import { JsfAbstractPropBuilder, JsfUnknownPropBuilder } from '../abstract/abstract-prop-builder';
import { JsfHandlerBuilderBinary }                       from '../../handlers/index';
import { isI18nObject, JsfTranslatableMessage }          from '../../translations';

export class JsfPropBuilderBinary extends JsfAbstractPropBuilder<JsfPropBinary, JsfHandlerBuilderBinary, ArrayBuffer, string> {

  value: ArrayBuffer;

  lockMap: Map<Symbol, any> = new Map<Symbol, any>();

  static encode(arraybuffer: ArrayBuffer): string {
    throw new Error('Not implemented.');
  }

  static decode(base64: string): ArrayBuffer {
    throw new Error('Not implemented.');
  }

  lock(lockKey: Symbol = Symbol() as Symbol): Symbol {
    this.lockMap.set(lockKey, this.value);
    return lockKey;
  }

  isDiff(lockKey: Symbol): boolean {
    if (this.lockMap.has(lockKey)) {
      const lockedValue = this.lockMap.get(lockKey) as ArrayBuffer;

      if ((lockedValue && !this.value) ||
        (!lockedValue && this.value)) {
        return true;
      }

      const lockedView  = new DataView(lockedValue);
      const currentView = new DataView(this.value);

      if (lockedView.byteLength !== currentView.byteLength) {
        return true;
      }

      for (let i = 0; i < lockedView.byteLength; i++) {
        if (lockedView.getUint8(i) !== currentView.getUint8(i)) {
          return true;
        }
      }
    }
  }

  getDiff(lockKey: Symbol): any {
    if (this.isDiff(lockKey)) {
      return this.value;
    }
  }

  getJsonDiff(lockKey: Symbol): any {
    const diff = this.getDiff(lockKey);
    return diff && diff.toString();
  }

  _validateViaProp() {
    this.errors = [];

    // evalValidators
    this.processEvalValidators();

    return this.errorsNotExist;
  }

  getControl(path: string[]): JsfUnknownPropBuilder {
    if (path.length === 0) {
      return this;
    }
    throw new Error(`Can not call getControl(${ path.join('.') }) on JsfPropBuilderBinary`);
  }

  // getJsonValue() {
  //   if (this.disabled) {
  //     return null;
  //   }
  //   return this.value && this.value.toString();
  // }

  _getValueViaProp() {
    if (this.disabled) {
      return null;
    }
    return this.value;
  }

  valueToJson(buffer: ArrayBuffer) {
    return JsfPropBuilderBinary.encode(buffer);
  }

  jsonToValue(base64: string) {
    return JsfPropBuilderBinary.decode(base64);
  }

  _setValueViaProp(value) {
    this.value = value;
  }

  _patchValueViaProp(value) {
    this.value = value;
  }

  async getPropTranslatableStrings(): Promise<JsfTranslatableMessage[]> {
    const messages: JsfTranslatableMessage[] = [];

    if (this.prop.title) {
      messages.push(isI18nObject(this.prop.title) ?
                    new JsfTranslatableMessage(this.prop.title.val, this.prop.title.id) :
                    new JsfTranslatableMessage(this.prop.title));
    }

    if (this.prop.description) {
      messages.push(isI18nObject(this.prop.description) ?
                    new JsfTranslatableMessage(this.prop.description.val, this.prop.description.id) :
                    new JsfTranslatableMessage(this.prop.description));
    }

    if (this.hasHandler) {
      messages.push(...await this.handler.getPropTranslatableStrings());
    }

    return messages;
  }

  getStaticTranslatableStrings(): JsfTranslatableMessage[] {
    const messages: JsfTranslatableMessage[] = [];

    if (this.hasHandler) {
      messages.push(...this.handler.getStaticTranslatableStrings());
    }

    return messages;
  }
}
