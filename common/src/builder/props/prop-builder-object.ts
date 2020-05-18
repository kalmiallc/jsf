import { GetControlOptions, JsfAbstractPropBuilder, JsfUnknownPropBuilder } from '../abstract/abstract-prop-builder';
import { JsfPropObject, JsfPropObjectJsonValue, JsfPropObjectValue }        from '../../schema/props/index';
import { JsfHandlerBuilderObject }                                          from '../../handlers/index';
import { JsfPropBuilderFactory }                                            from '../util/prop-builder-factory';
import { RequiredValidationError }                                          from '../validation-errors';
import { JsfTranslatableMessage }                                           from '../../translations';
import {
  PatchValueOptionsInterface,
  SetValueOptionsInterface
}                                                                           from '../interfaces/set-value-options.interface';

export class JsfPropBuilderObject
  extends JsfAbstractPropBuilder<JsfPropObject, JsfHandlerBuilderObject, JsfPropObjectValue, JsfPropObjectJsonValue> {

  properties: { [propertyName: string]: JsfUnknownPropBuilder } | null = {};
  propertyKeys: string[]                                               = [];

  get propertiesArray() {
    return this.propertyKeys.map(x => this.properties[x]);
  }

  getChildDependencies() {
    return this.propertiesArray;
  }

  lock(lockKey: Symbol = Symbol() as Symbol): Symbol {
    for (const key of Object.keys(this.properties)) {
      this.properties[key].lock(lockKey);
    }
    return lockKey;
  }

  getDiff(lockKey: Symbol): any {
    return this.getDiffInternal(lockKey, false);
  }

  getDiffKeys(lockKey: Symbol): string[] {
    return this.propertiesArray.reduce((a, c) => a.concat(c.getDiffKeys(lockKey) || []), [])
  }

  getJsonDiff(lockKey: Symbol): any {
    return this.getDiffInternal(lockKey, true);
  }

  isDiff(lockKey: Symbol): boolean {
    const diff = this.getDiffInternal(lockKey, false);
    return diff && !!Object.keys(diff).length;
  }

  private getDiffInternal(lockKey: Symbol, json = false): any {
    const differences = {};

    for (const key of Object.keys(this.properties)) {
      const propertyDiff = json ? this.properties[key].getJsonDiff(lockKey) : this.properties[key].getDiff(lockKey);
      if (propertyDiff !== undefined) {
        differences[key] = propertyDiff;
      }
    }

    if (Object.keys(differences).length) {
      return differences;
    }

    return undefined;
  }

  onDestroy() {
    for (const child of this.propertiesArray) {
      child.onDestroy();
    }

    super.onDestroy();

    this.properties = null;
  }

  onChildPropsInit() {
    if (!this.prop.properties) {
      this.prop.properties = null;
    } else {
      this.propertyKeys = Object.keys(this.prop.properties);

      this.properties = {};
      for (let i = 0; i < this.propertyKeys.length; i++) {
        const propertyName = this.propertyKeys[i];

        this.properties[propertyName] = JsfPropBuilderFactory.create({
          prop       : this.prop.properties[propertyName],
          parentProp : this,
          docDefPath : this.docDefPath + '.properties.' + propertyName,
          rootProp   : this.rootProp,
          propName   : propertyName,
          rootBuilder: this.rootBuilder,
          safeMode   : this.safeMode
        });

        // acc[propertyName].valueChange.subscribe(next => this.onChildPropValueChange(next));
      }
    }

    super.onChildPropsInit();
  }

  // onChildPropValueChange(data: ValueChangeInterface) {
  //   this.emitValueChange(data);
  // }

  async _validateViaProp() {
    this.errors = [];

    // Required
    if (this.prop.required) {
      for (const prop of this.prop.required) {
        if (!this.properties.hasOwnProperty(prop)) {
          this.errors.push(new RequiredValidationError());
        }
      }
    }

    // translate
    for (const error of this.errors) {
      error.errorMessage = this.translationServer.get({ id: error.errorCode, val: error.errorMessage });
    }

    // evalValidators
    this.processEvalValidators();

    // Properties
    await Promise.all(
      Object.keys(this.prop.properties)
        .map(propertyName => this.properties[propertyName].validate())
    );

    // Check Properties result
    for (const propName of Object.keys(this.properties)) {
      if (this.properties[propName].invalid) {
        return false;
      }
    }

    return this.errorsNotExist;
  }

  resetToDefault(options: { noRecursion?: boolean } = {}) {
    super.resetToDefault();

    if (!options.noRecursion) {
      // Reset child properties
      for (const key of Object.keys(this.properties)) {
        this.properties[key].resetToDefault();
      }
    }
  }

  getControl(path: string[], options: GetControlOptions = {}): JsfUnknownPropBuilder {
    if (path.length === 0 || (path.length === 1 && path[0] === '')) {
      return this;
    }

    let propertyName = path.shift();

    if (propertyName.endsWith(']')) {
      const bracketStartIndex = propertyName.indexOf('[');
      if (bracketStartIndex !== -1) {
        path.unshift(propertyName.substring(bracketStartIndex, propertyName.length));
        propertyName = propertyName.substring(0, bracketStartIndex);
      }
    }

    if (this.properties[propertyName]) {
      return this.properties[propertyName].getControl(path, options);
    } else {
      throw new Error(`Property "${ propertyName }" does not exist.`);
    }
  }

  _getValueViaProp() {
    if (!this.properties) {
      return this.properties;
    }

    /*
     return Object.keys(this.properties).reduce((acc, propertyName) => {
     if (!this.properties[propertyName].disabled) {
     acc[propertyName] = this.properties[propertyName].getValue();
     }
     return acc;
     }, {} as any); // FIXME any type :(
     */
    const value = {};
    for (let i = 0; i < this.propertyKeys.length; i++) {
      const propertyName = this.propertyKeys[i];

      if (!this.properties[propertyName].disabled) {
        value[propertyName] = this.properties[propertyName].getValue();
      }
    }

    return value;
  }

  valueToJson(value) {
    if (!value) {
      return;
    }
    const jsonValue = {};
    for (const propertyName of this.propertyKeys) {
      if (propertyName in value) {
        jsonValue[propertyName] = this.properties[propertyName].valueToJson(value[propertyName]);
      }
    }
    return jsonValue;
  }

  jsonToValue(jsonValue) {
    if (!jsonValue) {
      return;
    }
    const value = {};
    for (const propertyName of this.propertyKeys) {
      if (propertyName in jsonValue) {
        value[propertyName] = this.properties[propertyName].jsonToValue(jsonValue[propertyName]);
      }
    }
    return value;
  }

  _setValueViaProp(value, options: SetValueOptionsInterface) {
    this.properties = this.properties || {};

    // this.rootBuilder.resolver.requestPauseByOne();
    for (const propertyName of this.propertyKeys) {
      if (value) {
        this.properties[propertyName].setValueNoResolve(value[propertyName], options);
      } else {
        this.properties[propertyName].setValueNoResolve(null, options);
      }
    }
    // this.rootBuilder.resolver.requestResumeByOne();
  }

  _patchValueViaProp(value, options: PatchValueOptionsInterface) {
    if (!value) {
      return;
    }

    this.properties = this.properties || {};
    // this.rootBuilder.resolver.requestPauseByOne();
    for (const propertyName of this.propertyKeys) {
      if (propertyName in value) {
        this.properties[propertyName].patchValueNoResolve(value[propertyName], options);
      }
    }
    // this.rootBuilder.resolver.requestResumeByOne();
  }

  async getPropTranslatableStrings(): Promise<JsfTranslatableMessage[]> {
    const messages: JsfTranslatableMessage[] = [];

    for (const propertyName of this.propertyKeys) {
      messages.push(...await this.properties[propertyName].getPropTranslatableStrings());
    }

    if (this.hasHandler) {
      messages.push(...await this.handler.getPropTranslatableStrings());
    }

    return messages;
  }

  getStaticTranslatableStrings(): JsfTranslatableMessage[] {
    const messages: JsfTranslatableMessage[] = [];

    for (const propertyName of this.propertyKeys) {
      messages.push(...this.properties[propertyName].getStaticTranslatableStrings());
    }

    if (this.hasHandler) {
      messages.push(...this.handler.getStaticTranslatableStrings());
    }

    return messages;
  }

  statusTree(): any {
    return {
      status    : this.status,
      errors    : this.errors,
      properties: this.properties ? this.propertyKeys.reduce((a, c) => {
        a[c] = this.properties[c].statusTree();
        return a;
      }, {}) : 'NULL'
    };
  }
}
