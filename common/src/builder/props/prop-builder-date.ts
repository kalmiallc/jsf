import { JsfPropDate }                                   from '../../schema/props/prop-date';
import { JsfAbstractPropBuilder, JsfUnknownPropBuilder } from '../abstract/abstract-prop-builder';
import { JsfHandlerBuilderDate }                         from '../../handlers/index';
import { EnumValidationError, RequiredValidationError }  from '../validation-errors';
import { MinimumValidationError }                        from '../validation-errors/min.error';
import { MaximumValidationError }                        from '../validation-errors/max.error';
import { isI18nObject, JsfTranslatableMessage }          from '../../translations';
import { ValidationError }                               from '../abstract';
import { isDate }                                        from 'lodash';
import { isMoment, Moment }                              from 'moment';

export class JsfPropBuilderDate extends JsfAbstractPropBuilder<JsfPropDate, JsfHandlerBuilderDate, Date, string> {

  value: Date = null;

  lockMap: Map<Symbol, any> = new Map<Symbol, any>();

  lock(lockKey: Symbol = Symbol() as Symbol): Symbol {
    this.lockMap.set(lockKey, this.getValue());
    return lockKey;
  }

  isDiff(lockKey: Symbol): boolean {
    if (this.lockMap.has(lockKey)) {
      const lockedValue = this.lockMap.get(lockKey);

      if ((lockedValue && !this.getValue()) ||
        (!lockedValue && this.getValue())) {
        return true;
      }

      if (+lockedValue !== +this.getValue()) {
        return true;
      }
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

    // required
    if (this.prop.required) {
      if (this.value === undefined) {
        this.errors.push(new RequiredValidationError());
      }
    }

    // enum
    if (this.prop.enum) {
      if (this.prop.enum.indexOf(this.value) === -1) {
        this.errors.push(new EnumValidationError());
      }
    }

    // minimum
    if (this.prop.minimum) {
      if (this.value && this.value < this.prop.minimum) {
        this.errors.push(new MinimumValidationError(this.prop.minimum));
      }
    }

    // maximum
    if (this.prop.maximum) {
      if (this.value && this.value > this.prop.maximum) {
        this.errors.push(new MaximumValidationError(this.prop.maximum));
      }
    }

    // translate
    for (const error of this.errors) {
      error.errorMessage = this.translationServer.get({ id: error.errorCode, val: error.errorMessage });
    }

    // evalValidators
    this.processEvalValidators();

    return this.errorsNotExist;
  }

  getControl(path: string[]): JsfUnknownPropBuilder {
    if (path.length === 0) {
      return this;
    }
    throw new Error(`Can not call getControl(${ path.join('.') }) on JsfPropBuilderDate`);
  }

  _getValueViaProp() {
    if (this.disabled) {
      return null;
    }
    return this.value;
  }

  valueToJson(date: Date) {
    if (!date) {
      return null;
    }
    return date && date.toString();
  }

  jsonToValue(date: string) {
    if (!date) {
      return null;
    }
    if (isDate(date)) {
      return date;
    }
    return new Date(date);
  }

  _setValueViaProp(value) {
    if (value === null || value === undefined) {
      this.value = value;
      return;
    }
    if (isMoment(value)) {
      value = (value as Moment).toDate();
    }
    if (!isDate(value)) {
      throw new Error(`Invalid date value: ${ value }`);
    }
    this.value = value;
  }

  _patchValueViaProp(value) {
    return this._setValueViaProp(value);
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

    [
      RequiredValidationError,
      EnumValidationError,
      MinimumValidationError,
      MaximumValidationError
    ].map(x => {
      const e = new (x as any) as ValidationError;
      messages.push(new JsfTranslatableMessage(e.errorMessage, e.errorCode));
    });

    if (this.hasHandler) {
      messages.push(...this.handler.getStaticTranslatableStrings());
    }

    messages.push(...this.getEvalValidatorsTranslatableMessages());

    return messages;
  }
}
