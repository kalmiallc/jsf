import { JsfPropNull }                                   from '../../schema/props/prop-null';
import { JsfAbstractPropBuilder, JsfUnknownPropBuilder } from '../abstract/abstract-prop-builder';
import { JsfHandlerBuilderNull }                         from '../../handlers/index';
import { isI18nObject, JsfTranslatableMessage }          from '../../translations';

export class JsfPropBuilderNull extends JsfAbstractPropBuilder<JsfPropNull, JsfHandlerBuilderNull, null, null> {

  lock(lockKey: Symbol = Symbol() as Symbol): Symbol {
    return lockKey;
  }

  isDiff(lockKey: Symbol): boolean {
    return false;
  }

  getDiff(lockKey: Symbol): any {
    return null;
  }

  getJsonDiff(lockKey: Symbol): any {
    return null;
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
    throw new Error(`Can not call getControl(${ path.join('.') }) on JsfPropBuilderNull`);
  }

  _getValueViaProp() {
    return null;
  }

  valueToJson(value) {
    return null;
  }

  jsonToValue(jsonValue) {
    return null;
  }

  _setValueViaProp(value) {}

  _patchValueViaProp(value) {}

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
