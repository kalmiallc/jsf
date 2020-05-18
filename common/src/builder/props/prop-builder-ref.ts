import { JsfAbstractPropBuilder, JsfUnknownPropBuilder }        from '../abstract/abstract-prop-builder';
import { JsfProp, JsfPropRef }                                  from '../../schema/props/index';
import { JsfDocument }                                          from '../../jsf-document';
import { JsfHandlerBuilderRef }                                 from '../../handlers/index';
import { PatchValueOptionsInterface, SetValueOptionsInterface } from '../interfaces/set-value-options.interface';

export class JsfPropBuilderRef extends JsfAbstractPropBuilder<JsfPropRef, JsfHandlerBuilderRef, any, any> {

  protected schema: JsfProp | JsfDocument;
  protected builder: JsfUnknownPropBuilder;

  lock(lockKey: Symbol = Symbol() as Symbol): Symbol {
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
    return this.isDiff(lockKey) ? [ this.path ] : [];
  }

  getJsonDiff(lockKey: Symbol): any {
    if (this.isDiff(lockKey)) {
      return this.builder.getJsonDiff(lockKey);
    }
  }

  _validateViaProp() {
    this.errors = [];

    return this.errorsNotExist;
  }

  getControl(path: string[]): JsfUnknownPropBuilder {
    throw new Error('Not implemented!');
  }

  _getValueViaProp() {
    return this.builder.getValue();
  }

  valueToJson(value) {
    return value;
  }

  jsonToValue(jsonValue) {
    return jsonValue;
  }

  _setValueViaProp(value, options: SetValueOptionsInterface = {}) {
    return this.builder._setValueViaProp(value, options);
  }

  _patchValueViaProp(value, options: PatchValueOptionsInterface = {}) {
    return this.builder._patchValueViaProp(value, options);
  }

  getPropTranslatableStrings(): any {
    return this.builder.getPropTranslatableStrings();
  }

  getStaticTranslatableStrings(): any {
    return this.builder.getStaticTranslatableStrings();
  }

}
