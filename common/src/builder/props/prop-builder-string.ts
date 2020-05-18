import { JsfPropString }                                                                    from '../../schema/props';
import { JsfAbstractPropBuilderPrimitive, ValidationError }                                 from '../abstract';
import { JsfHandlerBuilderString }                                                          from '../../handlers/index';
import {
  EnumValidationError,
  FormatValidationError,
  MaximumLengthValidationError,
  MinimumLengthValidationError,
  PatternValidationError,
  RequiredValidationError
}                                                                                           from '../validation-errors';
import { isCreditCard, isEmail, isHexColor, isISO8601, isMACAddress, isMobilePhone, isURL } from 'validator';
import { isI18nObject, JsfTranslatableMessage }                                             from '../../translations';
import { isString }                                                                         from 'lodash';

export class JsfPropBuilderString extends JsfAbstractPropBuilderPrimitive<JsfPropString, JsfHandlerBuilderString, string> {

  isValidPrimitiveValue(value: any) {
    return value === null || value === undefined || isString(value);
  }

  private hasValue(x: string): boolean {
    return (x !== undefined && x !== null && x.length !== 0);
  }

  _validateViaProp() {
    this.errors = [];

    // required
    if (this.prop.required && (!this.hasValue(this.value) || this.value.length === 0)) {
      this.errors.push(new RequiredValidationError());
    }

    // enum
    if (this.prop.enum) {
      if (this.prop.enum.indexOf(this.value) === -1) {
        this.errors.push(new EnumValidationError());
      }
    }

    // min length
    if (this.prop.minLength !== undefined) {
      if (this.hasValue(this.value) && this.value.length < this.prop.minLength) {
        this.errors.push(new MinimumLengthValidationError(this.prop.minLength));
      }
    }

    // max length
    if (this.prop.maxLength !== undefined) {
      if (this.hasValue(this.value) && this.value.length > this.prop.maxLength) {
        this.errors.push(new MaximumLengthValidationError(this.prop.maxLength));
      }
    }

    // pattern
    if (this.prop.pattern !== undefined) {
      if (this.hasValue(this.value) && !new RegExp(this.prop.pattern).test(this.value)) {
        this.errors.push(new PatternValidationError());
      }
    }

    // format
    // tslint:disable
    if (this.prop.format !== undefined) {
      if (this.hasValue(this.value)) {
        let error;

        switch (this.prop.format) {
          case 'color':
            error = !isHexColor(this.value);
            break;
          case 'date-time':
          case 'date':
            error = !isISO8601(this.value);
            break;
          case 'time':
            error = !new RegExp('(?:[01]\\d|2[0123]):(?:[012345]\\d):(?:[012345]\\d)')
              .test(this.value);
            break;
          case 'email':
            error = !isEmail(this.value);
            break;
          case 'hostname':
            error = !new RegExp('(?:[^0-9][a-zA-Z0-9]+(?:(?:\\-|\\.)[a-zA-Z0-9]+)*)')
              .test(this.value);
            break;
          case 'ipv4':
            error = !new RegExp('\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}\b')
              .test(this.value);
            break;
          case 'ipv6':
            error = !new RegExp('(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))')
              .test(this.value);
            break;
          case 'mac':
            error = !isMACAddress(this.value);
            break;
          case 'credit-card':
            error = !isCreditCard(this.value);
            break;
          case 'phone':
            error = !isMobilePhone(this.value, 'any');
            break;
          case 'uri':
          case 'uri-reference':
            error = !isURL(this.value);
            break;
        }

        if (error) {
          this.errors.push(new FormatValidationError(this.prop.format));
        }
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
      MinimumLengthValidationError,
      MaximumLengthValidationError,
      PatternValidationError,
      FormatValidationError
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
