import { JsfPropInteger, JsfPropNumber }                     from '../../schema/props';
import { JsfAbstractPropBuilderPrimitive, ValidationError }  from '../abstract';
import { isNumber }                                          from 'lodash';
import { JsfHandlerBuilderInteger, JsfHandlerBuilderNumber } from '../../handlers/index';
import {
  EnumValidationError,
  EvenValidationError,
  ExclusiveMaximumValidationError,
  ExclusiveMinimumValidationError,
  MaxDecimalDigitsError,
  IntegerValidationError,
  MaximumValidationError,
  MinimumValidationError,
  OddValidationError,
  RequiredValidationError
}                                                            from '../validation-errors';
import { isI18nObject, JsfTranslatableMessage }              from '../../translations';

export class JsfPropBuilderInteger extends JsfAbstractPropBuilderPrimitive<JsfPropInteger, JsfHandlerBuilderInteger, number> {

  isValidPrimitiveValue(value: any) {
    return value === null || value === undefined || isNumber(value);
  }

  private hasValue(x: number): boolean {
    return (!isNaN(x) && x !== undefined && x !== null);
  }

  _validateViaProp() {
    this.errors = [];

    // required
    if (this.prop.required) {
      if (!this.hasValue(this.value)) {
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
    if (this.prop.minimum !== undefined) {
      if (this.hasValue(this.value) && this.value < this.prop.minimum) {
        this.errors.push(new MinimumValidationError(this.prop.minimum));
      }
    }

    // maximum
    if (this.prop.maximum !== undefined) {
      if (this.hasValue(this.value) && this.value > this.prop.maximum) {
        this.errors.push(new MaximumValidationError(this.prop.maximum));
      }
    }

    // integer
    if (this.hasValue(this.value) && this.value % 1 > 0) {
      this.errors.push(new IntegerValidationError());
    }

    // even
    if (this.prop.even) {
      if (this.hasValue(this.value) && this.value % 2 !== 0) {
        this.errors.push(new EvenValidationError());
      }
    }

    // odd
    if (this.prop.odd) {
      if (this.hasValue(this.value) && this.value % 2 === 0) {
        this.errors.push(new OddValidationError());
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

  _setValueViaProp(value) {
    const parsedValue = parseInt(value, 10);
    this.value = isNaN(parsedValue) ? null : parsedValue;
  }

  _patchValueViaProp(value) {
    const parsedValue = parseInt(value, 10);
    this.value = isNaN(parsedValue) ? null : parsedValue;
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
      MinimumValidationError,
      MaximumValidationError,
      IntegerValidationError,
      EvenValidationError,
      OddValidationError
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

export class JsfPropBuilderNumber extends JsfAbstractPropBuilderPrimitive<JsfPropNumber, JsfHandlerBuilderNumber, number> {


  isValidPrimitiveValue(value: any) {
    return value === null || value === undefined || isNumber(value);
  }

  private hasValue(x: number): boolean {
    return (!isNaN(x) && x !== undefined && x !== null);
  }

  _validateViaProp() {
    this.errors = [];

    // required
    if (this.prop.required) {
      if (!this.hasValue(this.value)) {
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
    if (this.prop.minimum !== undefined) {
      if (this.hasValue(this.value) && this.value < this.prop.minimum) {
        this.errors.push(new MinimumValidationError(this.prop.minimum));
      }
    }

    // maximum
    if (this.prop.maximum !== undefined) {
      if (this.hasValue(this.value) && this.value > this.prop.maximum) {
        this.errors.push(new MaximumValidationError(this.prop.maximum));
      }
    }

    // exclusiveMinimum
    if (this.prop.exclusiveMinimum !== undefined) {
      if (this.hasValue(this.value) && this.value <= this.prop.exclusiveMinimum) {
        this.errors.push(new ExclusiveMinimumValidationError(this.prop.exclusiveMinimum));
      }
    }

    // maxDecimalDigits
    if (this.prop.maxDecimalDigits !== undefined) {
      if (this.value !== null && this.value !== undefined && this.value.toString().split('.')[1]) {
        const decimals = this.value.toString().split('.')[1].length || 0;
        if (decimals > this.prop.maxDecimalDigits) {
          this.errors.push(new MaxDecimalDigitsError(this.prop.maxDecimalDigits));
        }
      }
    }

    // maximum
    if (this.prop.exclusiveMaximum !== undefined) {
      if (this.hasValue(this.value) && this.value >= this.prop.exclusiveMaximum) {
        this.errors.push(new ExclusiveMaximumValidationError(this.prop.exclusiveMaximum));
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

  _setValueViaProp(value) {
    const parsedValue = parseFloat(value);
    this.value = isNaN(parsedValue) ? null : parsedValue;
  }

  _patchValueViaProp(value) {
    const parsedValue = parseFloat(value);
    this.value = isNaN(parsedValue) ? null : parsedValue;
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
      MinimumValidationError,
      MaximumValidationError,
      ExclusiveMinimumValidationError,
      ExclusiveMaximumValidationError
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
