import { GetControlOptions, JsfAbstractPropBuilder, JsfUnknownPropBuilder } from '../abstract/abstract-prop-builder';
import { JsfProp, JsfPropArray }                                            from '../../schema/props/index';
import { JsfHandlerBuilderArray }                                           from '../../handlers/index';
import {
  isPropBuilderArray,
  JsfPropBuilderFactory,
  MinItemsValidationError,
  UniqueItemsValidationError,
  ValidationError
}                                                                           from '../index';
import { MaxItemsValidationError }                                          from '../validation-errors/max-items.error';
import { JsfTranslatableMessage }                                           from '../../translations';
import {
  PatchValueOptionsInterface,
  SetValueOptionsInterface
}                                                                           from '../interfaces/set-value-options.interface';
import { Subject }                                                          from 'rxjs';

export class JsfPropBuilderArray extends JsfAbstractPropBuilder<JsfPropArray, JsfHandlerBuilderArray, any[], any[]> {

  _uniqIdCount    = 0;
  _uniqTmpIdCount = 0;

  items: JsfUnknownPropBuilder[] = [];

  lockMap: Map<Symbol, any> = new Map<Symbol, any>();

  _onItemAdd: Subject<{ index: number, item: JsfUnknownPropBuilder }>    = new Subject<{ index: number, item: JsfUnknownPropBuilder }>();
  _onItemRemove: Subject<{ index: number, item: JsfUnknownPropBuilder }> = new Subject<{ index: number, item: JsfUnknownPropBuilder }>();
  _onItemsSet: Subject<void>                                             = new Subject<void>();

  get onItemAdd() { return this._onItemAdd.asObservable(); }

  get onItemRemove() { return this._onItemRemove.asObservable(); }

  get onItemsSet() { return this._onItemsSet.asObservable(); }

  get abstractPath() {
    if (this.parentProp) {
      if (isPropBuilderArray(this.parentProp)) {
        return `${ this.parentProp.abstractPath }`;
      } else {
        if (!this.parentProp.parentProp) {
          return `${ this.propName }[]`;
        } else {
          return `${ this.parentProp.abstractPath }.${ this.propName }[]`;
        }
      }
    } else {
      return `${ this.propName }[]`;
    }
  }

  getChildDependencies() {
    return this.items || [];
  }

  lock(lockKey: Symbol = Symbol() as Symbol): Symbol {
    const items = this.getItems();
    this.lockMap.set(lockKey, items ? items.slice() : items);

    if (items) {
      for (const item of items) {
        item.lock(lockKey);
      }
    }

    return lockKey;
  }

  getDiff(lockKey: Symbol): any {
    if (this.isDiff(lockKey)) {
      const cVal = this.getItems();
      return cVal ? cVal.map(x => x.getValue()) : cVal;
    }
  }

  getDiffKeys(lockKey: Symbol): string[] {
    return this.isDiff(lockKey) ? [this.path] : [];
  }

  getJsonDiff(lockKey: Symbol): any {
    if (this.isDiff(lockKey)) {
      return this.getItems().map(x => x.getJsonValue());
    }
  }

  isDiff(lockKey: Symbol): boolean {
    if (this.lockMap.has(lockKey)) {
      const lockedValue = this.lockMap.get(lockKey) as JsfUnknownPropBuilder[];

      if ((lockedValue && !this.items) ||
        (!lockedValue && this.items)) {
        return true;
      }

      if (!this.items) {
        return false;
      }

      if (lockedValue.length !== this.items.length) {
        return true;
      }

      for (const x of this.items) {
        if (x.isDiff(lockKey)) {
          return true;
        }
      }

      for (let i = 0; i < lockedValue.length; i++) {
        if (this.items[i] !== lockedValue[i]) {
          return true;
        }
      }
    }

    return false;
  }

  get isFixedItems() {
    return Array.isArray(this.prop.items);
  }

  async _validateViaProp() {
    this.errors = [];

    if (this.items) {
      // uniqueItems
      if (this.prop.uniqueItems === true) {
        if ([...(new Set(this.items) as unknown as any[])].length !== this.items.length) {
          this.errors.push(new UniqueItemsValidationError());
        }
      }

      // minItems
      if (this.prop.minItems !== undefined && this.prop.minItems > 0) {
        if (this.items.length < this.prop.minItems) {
          this.errors.push(new MinItemsValidationError(this.items.length, this.prop.minItems));
        }
      }

      // maxItems
      if (this.prop.maxItems !== undefined && this.prop.maxItems >= 0) {
        if (this.items.length > this.prop.maxItems) {
          this.errors.push(new MaxItemsValidationError(this.items.length, this.prop.maxItems));
        }
      }

      // translate
      for (const error of this.errors) {
        error.errorMessage = this.translationServer.get({ id: error.errorCode, val: error.errorMessage });
      }
    }
    // evalValidators
    this.processEvalValidators();

    // Validate items
    await Promise.all((this.items || []).map(x => x.validate()));

    for (const x of this.items || []) {
      if (x.invalid) {
        return false;
      }
    }

    return !this.errorsExist;
  }

  createChild(propItem: JsfProp, docDefPath: string) {
    return JsfPropBuilderFactory.create({
      prop       : propItem,
      parentProp : this,
      docDefPath,
      rootProp   : this.rootProp,
      propName   : `[@${ ++this._uniqIdCount }]`,
      rootBuilder: this.rootBuilder,
      safeMode   : this.safeMode
    });
  }

  createTmpChild(propItem: JsfProp, docDefPath: string) {
    return JsfPropBuilderFactory.create({
      prop       : propItem,
      parentProp : this,
      docDefPath,
      rootProp   : this.rootProp,
      propName   : `[@tmp_${ ++this._uniqTmpIdCount }]`,
      rootBuilder: this.rootBuilder,
      safeMode   : true
    });
  }

  onChildPropsInit() {
    if (Array.isArray(this.prop.items)) {
      this.items = this.prop.items.map((propItem, i) => this.createChild(
        propItem,
        `${ this.docDefPath }.items[${ i }]`
      ));
    } else {
      this.items = [];
    }

    super.onChildPropsInit();
  }

  getControl(path: string[], options: GetControlOptions = {}): JsfUnknownPropBuilder {
    if (path.length === 0) {
      return this;
    }

    const propertyId = path.shift();

    const firstBracketStart = propertyId.indexOf('[');
    const firstBracketEnd   = propertyId.indexOf(']');

    if (firstBracketStart === -1 || firstBracketEnd === -1) {
      throw new Error(`[BAE-04] Property ${ propertyId } should be in brackets []`);
    }

    if (firstBracketStart === firstBracketEnd) {
      throw new Error(`[BAE-03] Property ${ propertyId } is not in format: [number | @string]`);
    }

    const itemId = propertyId.substring(firstBracketStart + 1, firstBracketEnd);

    if (firstBracketEnd !== propertyId.length - 1) {
      path.unshift(propertyId.substring(firstBracketEnd + 1, propertyId.length));
    }

    if (itemId.startsWith('@')) {
      const item = this.items.find(x => x.id === itemId);
      if (!item) {
        throw new Error(`[BAE-01] JsfPropBuilderArray<${ this.path }>: Item ${ propertyId } can not be found.`);
      }
      return item.getControl(path);
    }

    const itemIndex = +itemId;
    if (itemIndex >= this.items.length) {
      throw new Error(`[BAE-02] JsfPropBuilderArray<${ this.path }>: item index ${ itemIndex } out of bounds exception.
None existing path: <${ path }>`);
    }

    return this.items[itemIndex].getControl(path);
  }

  _getValueViaProp() {
    if (!this.getItems()) {
      return this.getItems();
    }

    return this.items.map(x => x.enabled ? x.getValue() : null);
  }

  getItems() {
    return this.items;
  }

  resetToDefault(options: { noRecursion?: boolean } = {}) {
    super.resetToDefault();

    if (!options.noRecursion) {
      // Reset child properties
      for (const item of this.items) {
        item.resetToDefault();
      }
    }
  }

  valueToJson(value) {
    if (value === undefined || value === null) {
      return value;
    }
    if (Array.isArray(this.prop.items)) {
      if (this.prop.items.length === value.length) {
        return this.items.map((prop, i) => prop.valueToJson(value[i]));
      } else {
        throw new Error(`Invalid value [${ JSON.stringify(value) }] for static array "${ this.path }".`);
      }
    } else {
      if (this.items && value && this.items.length === value.length) {
        return this.items.map((prop, i) => prop.valueToJson(value[i]));
      } else {
        const tmpProp = this.createTmpChild(this.prop.items, `${ this.docDefPath }.items`);
        return value.map(x => tmpProp.valueToJson(x));
      }
    }
  }

  jsonToValue(jsonValue?: any[]) {
    if (jsonValue === undefined || jsonValue === null) {
      return jsonValue;
    }
    if (Array.isArray(this.prop.items)) {
      if (this.prop.items.length === jsonValue.length) {
        return this.items.map((prop, i) => prop.jsonToValue(jsonValue[i]));
      } else {
        throw new Error(`Invalid JSON value [${ JSON.stringify(jsonValue) }] for static array "${ this.path }".`);
      }
    } else {
      if (this.items && jsonValue && this.items.length === jsonValue.length) {
        return this.items.map((prop, i) => prop.jsonToValue(jsonValue[i]));
      } else {
        const tmpProp = this.createTmpChild(this.prop.items, `${ this.docDefPath }.items`);
        return jsonValue.map(x => tmpProp.jsonToValue(x));
      }
    }
  }

  _setValueViaProp(values: any[], options: SetValueOptionsInterface) {
    if (Array.isArray(this.prop.items)) {
      this.items.forEach((v, i) => {
        if (values) {
          this.items[i].setValueNoResolve(values[i], options);
        } else {
          this.items[i].setValueNoResolve(values, options);
        }
      });
    } else {
      if (!values) {
        this.setNull();
      } else {
        this.items = this.items || [];
        for (let i = 0; i < values.length; i++) {
          if (this.items[i]) {
            this.items[i].setValueNoResolve(values[i], options);
          } else {
            const pb = this.createChild(this.prop.items as JsfProp, `${ this.docDefPath }.items[${ i }]`);
            this.items.push(pb);
            pb.setValueNoResolve(values[i], options);
            pb.onDependenciesInit();
            pb.afterDynamicInit();
          }
        }
        if (this.items.length > values.length) {
          this.splice(values.length, this.items.length - values.length);
        }
      }
    }

    this._onItemsSet.next();
  }

  _patchValueViaProp(value, options: PatchValueOptionsInterface) {
    this._setValueViaProp(value, { ...options, noResolve: true });
  }

  async add(value?: any, options: { mode?: 'set' | 'patch' } = {}) {
    this.items = this.items || [];
    const item = this.createChild(this.prop.items as JsfProp, `${ this.docDefPath }.items`);

    if (value !== undefined) {
      if (options.mode === 'patch') {
        item.patchValueNoResolve(value, { noValueChange: true });
      } else {
        item.setValueNoResolve(value, { noValueChange: true });
      }
    }

    item.onDependenciesInit();

    this.items.push(item);

    item.afterDynamicInit();

    this._recalculateEnabledIfStatusOnNextResolve = true;
    await this.rootBuilder.resolver.updateStatus(item);

    this._onItemAdd.next({
      index: this.items.length - 1,
      item
    });

    return item;
  }

  private splice(startIndex: number, deleteCount: number) {
    const removedItems = this.items.slice(startIndex, startIndex + deleteCount);
    this.items.splice(startIndex, deleteCount);
    for (let i = 0; i < removedItems.length; i++) {
      this._onItemRemove.next({
        index: startIndex + i,
        item: removedItems[i]
      });
      removedItems[i].onDestroy();
    }
  }

  private setNull() {
    const removedItems = this.items || [];
    this.items = null;
    for (let i = 0; i < removedItems.length; i++) {
      this._onItemRemove.next({
        index: i,
        item: removedItems[i]
      });
      removedItems[i].onDestroy();
    }
  }

  private _removeAt(index: number) {
    if (this.items[index]) {
      const removedItem = this.items[index];
      this.items.splice(index, 1);
      this._onItemRemove.next({
        index,
        item: removedItem
      });
      removedItem.onDestroy();

      return removedItem.id;
    }
  }

  async removeAt(index: number) {
    this._removeAt(index);
    return this.resolve();
  }

  async removeById(id: string) {
    const i = this.items.findIndex(x => x.id === id);
    if (i !== -1) {
      await this.removeAt(i);
    }
  }

  onDestroy() {
    if (this.items) {
      const itemsLen = this.items.length;
      for (let i = 0; i < itemsLen; i++) {
        this.items[i].onDestroy();
      }
    }
    super.onDestroy();
  }

  async getPropTranslatableStrings(): Promise<JsfTranslatableMessage[]> {
    const messages: JsfTranslatableMessage[] = [];

    if (this.isFixedItems) {
      for (const item of this.items) {
        messages.push(...await item.getPropTranslatableStrings());
      }
    } else {
      // Make sure at least one item exists so we can get the messages
      if (!this.items || !this.items.length) {
        await this.add();
      }
      messages.push(...await this.items[0].getPropTranslatableStrings());
    }

    if (this.hasHandler) {
      messages.push(...await this.handler.getPropTranslatableStrings());
    }

    return messages;
  }

  getStaticTranslatableStrings(): JsfTranslatableMessage[] {
    const messages: JsfTranslatableMessage[] = [];

    [
      UniqueItemsValidationError,
      MinItemsValidationError,
      MaxItemsValidationError
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

  statusTree(): any {
    return {
      status: this.status,
      errors: this.errors,
      items : this.items && this.items.map(x => x.statusTree())
    };
  }
}
