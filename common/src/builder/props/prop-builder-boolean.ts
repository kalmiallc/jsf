import { JsfPropBoolean }                               from '../../schema/props/prop-boolean';
import { JsfAbstractPropBuilderPrimitive }              from '../abstract/abstract-prop-builder-primitive';
import { JsfHandlerBuilderBoolean }                     from '../../handlers/index';
import { EnumValidationError, RequiredValidationError } from '../validation-errors';
import { isI18nObject, JsfTranslatableMessage }         from '../../translations';
import { ValidationError }                              from '../abstract';
import { isBoolean }                                    from 'lodash';

export class JsfPropBuilderBoolean extends JsfAbstractPropBuilderPrimitive<JsfPropBoolean, JsfHandlerBuilderBoolean, boolean> {

  isValidPrimitiveValue(value: any) {
    return value === null || value === undefined || isBoolean(value);
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
      EnumValidationError
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
