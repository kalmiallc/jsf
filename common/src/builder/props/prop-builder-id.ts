import { JsfAbstractPropBuilder, JsfUnknownPropBuilder } from '../abstract/abstract-prop-builder';
import { JsfPropId }                                     from '../../schema/props/index';
import { JsfHandlerBuilderId }                           from '../../handlers/index';
import { isI18nObject, JsfTranslatableMessage }          from '../../translations';
import { isString }                                      from 'lodash';
import * as BsonObjectID                                 from 'bson-objectid';

export type ObjectID = any;

export class JsfPropBuilderId extends JsfAbstractPropBuilder<JsfPropId, JsfHandlerBuilderId, ObjectID, string> {

  value: any;

  lockMap: Map<Symbol, any> = new Map<Symbol, any>();

  lock(lockKey: Symbol = Symbol() as Symbol): Symbol {
    this.lockMap.set(lockKey, this.getValue());
    return lockKey;
  }

  isDiff(lockKey: Symbol): boolean {
    if (this.lockMap.has(lockKey)) {
      const lockedValue = this.lockMap.get(lockKey);
      const cValue      = this.getValue();

      return (lockedValue && lockedValue.toString()) !== (cValue && cValue.toString());
    }
  }

  getDiff(lockKey: Symbol): any {
    if (this.isDiff(lockKey)) {
      return this.getValue();
    }
  }

  getJsonDiff(lockKey: Symbol): any {
    if (this.isDiff(lockKey)) {
      return this.getJsonValue();
    }
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
    throw new Error(`Can not call getControl(${ path.join('.') }) on JsfPropBuilderId`);
  }

  _getValueViaProp() {
    if (this.disabled) {
      return null;
    }
    return this.value;
  }

  valueToJson(id: ObjectID) {
    if (!id) {
      return null;
    }
    return id.toString();
  }

  jsonToValue(stringId: string | ObjectID) {
    if (!stringId) {
      return null;
    }
    if (!isString(stringId)) {
      if ((stringId as any)._bsontype === 'ObjectID') {
        return stringId;
      }
      throw new Error(`Invalid json ID value: ${ stringId }`);
    }

    return (BsonObjectID as any)(stringId);
  }

  _setValueViaProp(value) {
    if (isString(value)) {
      throw new Error(`Invalid ID value: ${ value }`);
    }
    this.value = value;
  }

  _patchValueViaProp(value) {
    if (isString(value)) {
      throw new Error(`Invalid ID value: ${ value }`);
    }
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
