import { ValidationError }               from './abstract-validation-error';
import {
  JsfAbstractHandlerBuilder,
  JsfUnknownHandlerBuilder
}                                        from './abstract-handler-builder';
import {
  isPropBuilderArray,
  JsfPropBuilder
}                                        from '../props';
import {
  JsfAbstractProp,
  JsfUnknownProp
}                                        from '../../schema/abstract/abstract-prop';
import { JsfAbstractBuilder }            from './abstract-builder';
import { EvalValidationError }           from '../validation-errors';
import {
  Observable,
  Subject
}                                        from 'rxjs';
import {
  JsfTranslatableMessage,
  JsfTranslationServer
}                                        from '../../translations';
import { JsfRegister }                   from '../../jsf-register';
import { JsfBuilder }                    from '../jsf-builder';
import { JsfBasicHandlerBuilder }        from './abstract-basic-handler-builder';
import { JsfEvalRuntimeError }           from '../../errors';
import {
  PropStatus
}                                        from '../interfaces/prop-status.enum';
import { ValueChangeInterface }          from '../interfaces/value-change.interface';
import {
  AddOrRemoveItemValueOptionsInterface,
  ConsumeProviderValueOptionsInterface,
  PatchValueOptionsInterface,
  SetValueOptionsInterface
}                                        from '../interfaces/set-value-options.interface';
import { canActivateFilterItem }         from '../../filters';
import {
  isJsfProviderExecutor,
  JsfProviderConsumerInterface,
  JsfProviderExecutor,
  JsfProviderExecutorStatus
}                                        from '../../providers';
import { takeUntil }                     from 'rxjs/operators';
import { ProviderPendingError }          from '../../providers/errors/provider-pending.error';
import { ProviderFailedError }           from '../../providers/errors/provider-failed.error';
import { getEvalValidatorsDependencies } from '../util/abstarct-prop-util';
import { safeModeCompatibleHandlers }    from '../../handlers';
import { jsfEnv }                        from '../../jsf-env';
import * as hash                         from 'object-hash';

export type JsfUnknownPropBuilder = JsfAbstractPropBuilder<JsfUnknownProp, JsfUnknownHandlerBuilder, any, any>;

export interface GetControlOptions {}

export type SafeModeTypes = boolean; // 'minimum' | 'with-supported-handlers' | 'with-handlers'

/**
 * Used for __id.
 */
let uniqIdCount    = 0;
const uniqIdPrefix = 'S' + (+new Date()) + '_';

//   _____________________________________________________________
//  /\                                                            \
//  \_|                                                           |
//    | Leave the campground cleaner than the way you found it.   |
//    |                                                           |
//    |   ________________________________________________________|_
//     \_/__________________________________________________________/
//

/**
 * Notes:
 * - updateStatus is superior to validate
 */
export abstract class JsfAbstractPropBuilder<PropType extends JsfUnknownProp,
  PropHandler extends JsfUnknownHandlerBuilder,
  PropValue,
  PropJsonValue> extends JsfAbstractBuilder implements JsfProviderConsumerInterface {

  // ══════════════════════
  // BASIC
  // ══════════════════════
  /**
   * Id of prop. This plays important role when used with array.
   */
  id: string;

  /**
   * Jsf builder class (not same as JsfPropBuilder!). Glues props and layouts together.
   * It acts as manager. Contains extra utils like $translations, subscriptions, ...
   */
  rootBuilder: JsfBuilder;

  /**
   * Prop name: string, number, ...
   */
  propName: string;

  /**
   * Lodash compatible path to original doc def.
   */
  docDefPath: string;

  /**
   * Prop schema.
   */
  prop: PropType;

  /**
   * Parent prop builder.
   */
  parentProp?: JsfPropBuilder;

  /**
   * Top level prop builder.
   */
  rootProp?: JsfPropBuilder;

  /**
   * Validation errors (this is set when validation is called).
   */
  errors: ValidationError[] = [];

  get errorsExist() {
    return this.errors.length !== 0;
  }

  get errorsNotExist() {
    return this.errors.length === 0;
  }

  /**
   * If prop is created with safe mode ON, it is not intended for JSF FORM use.
   * Purpose of safe mode is to get class functionality (you could call it headless mode (not exactly true))
   */
  safeMode?: SafeModeTypes;

  /**
   * Returns index of prop if parent is array.
   */
  get index() {
    if (this.parentProp && isPropBuilderArray(this.parentProp)) {
      return this.parentProp.items.indexOf(this);
    } else {
      throw new Error();
    }
  }

  // ══════════════════════
  // DEPENDENCIES
  // ══════════════════════
  get otherAbstractDependenciesPathsForEnabledIf(): string[] {
    if (this.prop.enabledIf && typeof this.prop.enabledIf !== 'string') {
      if (!this.prop.enabledIf.dependencies) {
        this.rootBuilder.warn(`Prop '${ this.path }' uses enabledIf but has not listed any dependencies.`,
          `Enabled state will never be updated.`);
      } else {
        return this.getHandlerDependenciesPathsForEnabledIf(this.prop.enabledIf.dependencies);
      }
    }
    return this.getHandlerDependenciesPathsForEnabledIf();
  }

  get otherAbstractDependenciesPathsForValidate(): string[] {
    let out = getEvalValidatorsDependencies(this.prop);
    if (this.hasHandler && this.prop.handler.dependencies) {
      out = out.concat(this.prop.handler.dependencies || []);
    }
    return this.getHandlerDependenciesPathsForValidate(out);
  }

  get otherDependenciesPathsForEnabledIf() {
    return this.otherAbstractDependenciesPathsForEnabledIf.map(x => this.convertAbstractSiblingPathToPath(x));
  }

  get otherDependenciesPathsForValidate() {
    return this.otherAbstractDependenciesPathsForValidate.map(x => this.convertAbstractSiblingPathToPath(x));
  }

  get getOtherDependenciesForEnabledIf() {
    return this.otherDependenciesPathsForEnabledIf.map(path => {
      const prop = this.rootProp.getControlByPath(path);
      if (!prop) {
        throw new Error(`Dependency ${ path } not found.`);
      }
      return prop;
    });
  }

  get getOtherDependenciesForValidate() {
    return this.otherDependenciesPathsForValidate.map(path => {
      const prop = this.rootProp.getControlByPath(path);
      if (!prop) {
        throw new Error(`Dependency ${ path } not found.`);
      }
      return prop;
    });
  }

  get dependenciesForEnabledIf() {
    return this.getOtherDependenciesForEnabledIf.concat(this.parentProp ? [this.parentProp] : []);
  }

  get dependenciesForValidate() {
    return this.getOtherDependenciesForValidate.concat(this.getChildDependencies());
  }

  get dependenciesPathsForEnabledIf() {
    return this.otherDependenciesPathsForEnabledIf.concat(this.parentProp ? [this.parentProp.path] : []);
  }

  get dependenciesPathsForValidate() {
    return this.otherDependenciesPathsForValidate.concat(this.getChildDependenciesPaths());
  }

  get abstractDependenciesPathsForEnabledIf() {
    return this.otherAbstractDependenciesPathsForEnabledIf
      .concat(this.parentProp ? [this.parentProp.abstractPath] : []);
  }

  get abstractDependenciesPathsForValidate() {
    return this.otherAbstractDependenciesPathsForValidate
      .concat(this.getChildDependencies().map(x => x.abstractPath));
  }

  // ══════════════════════
  // STATUS
  // ══════════════════════
  /**
   * This is true status of prop, not the fake this.status. If value is null, JSF is in process of creating
   * all children/props and will resolve things after. For checking if null use this.isAlreadyScheduledForResolver.
   *
   * You should not call any resolve while prop is null state.
   */
  _enabledIfStatus: boolean | null         = null;
  _recalculateEnabledIfStatusOnNextResolve = true;

  get isAlreadyScheduledForResolver(): boolean {
    return this._enabledIfStatus === null;
  }

  private _status: PropStatus = PropStatus.Pending;
  private _lastNonPendingStatus: PropStatus;

  get status(): PropStatus {
    return this._status;
  }

  set status(value: PropStatus) {
    if (this._status !== value) {
      this._status = value;

      if (this.rootBuilder.diagnosticsHook) {
        this.rootBuilder.diagnosticsHook(
          'PROP-STATUS-CHANGE',
          { node: this }
        );
      }

      if (this._status !== PropStatus.Pending) {
        if (this._status !== this._lastNonPendingStatus) {
          this.emitStatusChange();
        }
        this._lastNonPendingStatus = this._status;
      }
    }
  }

  protected _statusChange: Subject<PropStatus> = new Subject<PropStatus>();
  get statusChange(): Observable<PropStatus> {
    if (!this._statusChange) {
      this._statusChange = new Subject<PropStatus>();
    }
    return this._statusChange.asObservable();
  }

  /**
   * Prop is legit if is valid or disabled (no actions are needed).
   */
  get legit(): boolean {
    return this._status === PropStatus.Valid || this._status === PropStatus.Disabled;
  }

  /**
   * If status is pending, false will be returned!
   */
  get valid(): boolean {
    return this._status === PropStatus.Valid;
  }

  /**
   * If status is pending, true will be returned!
   */
  get invalid(): boolean {
    return this._status === PropStatus.Invalid;
  }

  get pending(): boolean {
    return this._status === PropStatus.Pending;
  }

  get disabled(): boolean {
    return this._status === PropStatus.Disabled;
  }

  get enabled(): boolean {
    return this._status !== PropStatus.Disabled;
  }

  get trueDisabledStatus(): boolean {
    if (this._enabledIfStatus === null) {
      throw new Error(`You can not check trueDisabledStatus if _enabledIfStatus is null [${ this.path }]`);
    }
    return !this._enabledIfStatus;
  }

  get trueEnabledStatus(): boolean {
    return !this.trueDisabledStatus;
  }

  /**
   * Used by dependency resolver FAZE 1,2,3, do not touch (in other words hands off the keyboard).
   */
  _resolverStatus: {
    // SHARED per FUNCTION
    resolvedBy?: Symbol;
    seenBy?: Symbol;

    // SPECIFIC
    enabledPending?: Symbol;
    validationPending?: Symbol;
  } = {};

  // ══════════════════════
  // VALUE
  // ══════════════════════
  protected _valueChange: Subject<ValueChangeInterface> = new Subject<ValueChangeInterface>();

  get valueChange(): Observable<ValueChangeInterface> {
    return this._valueChange.asObservable();
  }

  private _path: string;
  // ══════════════════════
  // PATH getter
  // ══════════════════════
  get path() {
    return this._path;
  }


  private _abstractPath: string;
  /**
   * Instead of returning "a.b[@12].c" it returns "a.b[].c".
   */
  get abstractPath() {
    return this._abstractPath;
  }

  /**
   * Used by convertAbstractSiblingPathToPath
   */
  siblingPathsCache: { [abstractSiblingPath: string]: string } = {};

  // ══════════════════════
  // PROVIDER
  // ══════════════════════
  providerExecutor: JsfProviderExecutor;

  get hasProvider(): boolean {
    return !!this.providerExecutor;
  }


  // ══════════════════════
  // HANDLER
  // ══════════════════════
  /**
   * Handler can take over all prop logic.
   */
  handler: JsfAbstractHandlerBuilder<JsfUnknownPropBuilder>;

  get hasHandler(): boolean {
    return !!this.handler;
  }

  get hasHandlerGetValue(): boolean {
    return !!(this.handler && this.handler.getValue);
  }

  get hasHandlerSetValue(): boolean {
    return !!(this.handler && this.handler.setValue);
  }

  get hasHandlerPatchValue(): boolean {
    return !!(this.handler && this.handler.patchValue);
  }

  get hasHandlerConsumeProviderValue(): boolean {
    return !!(this.handler && this.handler.consumeProviderValue);
  }

  get hasHandlerValidate(): boolean {
    return !!(this.handler && this.handler.validate);
  }

  // ══════════════════════
  // TRANSLATIONS
  // ══════════════════════
  get translationServer(): JsfTranslationServer {
    return this.rootBuilder.translationServer;
  }

  // ══════════════════════
  // OTHER
  // ══════════════════════
  /**
   * This is "on destroy" in theory we need to chat @tilen and @matej about the name :D
   */
  protected unsubscribe: Subject<void> = new Subject<void>();


  // ════════════════════════════════════════════════════════════════════════════════════════
  // INIT
  // ══════════════════════
  constructor(rootBuilder: JsfBuilder) {
    super();
    this.rootBuilder = rootBuilder;
  }

  /**
   * This is called right after constructor init (it is not called by constructor so we can allow proper var extends)
   * @param data
   */
  onInit(data: {
    prop: PropType,
    docDefPath: string,
    parentProp?: JsfPropBuilder,
    rootProp?: JsfPropBuilder,
    propName: string,
    safeMode?: SafeModeTypes
  }) {
    if (!data.rootProp) {
      data.rootProp = this as any as JsfPropBuilder as any;
    }

    if (!jsfEnv.isApi && jsfEnv.__uuid) {
      if (!data.prop.__uuid || !data.prop.__uuid.startsWith(uniqIdPrefix)) {
        data.prop.__uuid = uniqIdPrefix + (++uniqIdCount);
      }
    }

    this.safeMode   = data.safeMode;
    this.prop       = data.prop;
    this.parentProp = data.parentProp;
    this.rootProp   = data.rootProp;
    this.propName   = data.propName;
    this.docDefPath = data.docDefPath;

    this.setPath();

    if (this.propName.startsWith('[')) {
      const id = this.propName.substring(1, this.propName.length - 1);
      this.id  = id.startsWith('@') ? id : `@${ id }`;
    } else {
      this.id = `@${ this.path }`;
    }

    this.setHandlerIfAny();
    if (!this.safeMode) {
      this.setProviderExecutorIfAny();
    }

    if (this.hasHandler) {
      this.handler.beforeChildrenSchemaBuildHook();
    }

    this.onChildPropsInit();

    this.resetToDefault({ noRecursion: true, noValueChange: true });

    this.initSearchable();

    if (this.hasHandler) {
      this.handler.onInit();
    }

    if (this.hasProvider) {
      this.providerExecutor.onInit();
      this.providerExecutor.enqueue();
    }

    return this;
  }

  private setPath() {
    // PATH
    if (this.parentProp) {
      this._path = `${ this.parentProp.path }${ !this.parentProp.path || isPropBuilderArray(this.parentProp) ? '' : '.' }${ this.propName }`;
    } else {
      this._path = this.propName;
    }

    // ABSTRACT PATH
    if (this.parentProp) {
      if (isPropBuilderArray(this.parentProp)) {
        this._abstractPath = `${ this.parentProp.abstractPath }`;
      } else {
        this._abstractPath = `${ this.parentProp.abstractPath }${ !this.parentProp.abstractPath ? '' : '.' }${ this.propName }`;
      }
    } else {
      this._abstractPath = this.propName;
    }
  }

  /**
   * If item is added at run time, this function will be triggered to allow handlers to do something.
   * Note: legacy JSF emited here value change
   */
  afterDynamicInit() {
    if (this.hasHandler) {
      this.handler.afterDynamicInit();
    }
    for (const child of this.getChildDependencies()) {
      child.afterDynamicInit();
    }
  }

  initSearchable() {
    if ((this.prop as JsfAbstractProp<PropType, any, any>).searchable
      && (this.prop as JsfAbstractProp<PropType, any, any>).searchable.byUser &&
      (this.prop as JsfAbstractProp<PropType, any, any>).searchable.byUser.enabled &&
      canActivateFilterItem(this.rootBuilder.modes, (this.prop as JsfAbstractProp<PropType, any, any>).searchable.byUser)) {
      this.rootBuilder.searchableProps.push(this.path);
    }
  }

  resetToDefault(options: { noRecursion?: boolean, noValueChange?: boolean } = {}) {
    if (this.prop.hasOwnProperty('const')) {
      this.setValueNoResolve(
        this.jsonToValue((this.prop as any).const),
        { skipConst: true, noValueChange: options.noValueChange }
      );
    } else if (this.prop.hasOwnProperty('default')) {
      this.setJsonValueNoResolve((this.prop as any).default, { noValueChange: options.noValueChange });
    }
  }

  /**
   * Used by object and array.
   */
  protected onChildPropsInit(): void {}

  onDependenciesInit() {
    this.getChildDependencies().forEach(x => x.onDependenciesInit());
    this.rootBuilder.resolver.onNodeInit(this);
  }

  onDestroy() {
    this.rootBuilder.resolver.onNodeDestroy(this);

    if (this.rootBuilder.pathsCache[this.path]) {
      this.rootBuilder.pathsCache[this.path] = undefined;
    }

    this.unsubscribe.next();
    this.unsubscribe.complete();

    if (this.hasHandler) {
      this.handler.onDestroy();
    }

    if (this.providerExecutor) {
      this.providerExecutor.onDestroy();
    }
  }

  setHandlerIfAny() {
    if (!this.rootBuilder.options.withoutHandlers && this.prop.handler) {
      if (this.safeMode) {
        if (safeModeCompatibleHandlers.indexOf(this.prop.handler.type) === -1) {
          return;
        }
      }

      if (this.prop.handler.type) {
        if (JsfRegister.storage[this.prop.handler.type]) {
          this.handler = new (JsfRegister.storage[this.prop.handler.type])(this);
        } else {
          throw new Error(`Handler type "${ this.prop.handler.type }" not registered.`);
        }
      } else {
        throw new Error(`Unknown handler type "${ this.prop.handler.type }".`);
      }
    }
  }

  setProviderExecutorIfAny() {
    if (this.prop.provider && isJsfProviderExecutor(this.prop.provider)) {
      this.providerExecutor = new JsfProviderExecutor(this.rootBuilder, this.prop.provider, this, this);

      this.providerExecutor.statusChange
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(async (status: JsfProviderExecutorStatus) => {
          // await this.updateStatus();
        });
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════════════
  // CONTROLS & PATH
  // ══════════════════════
  getControlByPath(path: string, options: GetControlOptions = {}): JsfUnknownPropBuilder {
    return this.getControl(path.split('.'), options);
  }

  getControlHandlerByPath(path: string, options: GetControlOptions = {}): JsfBasicHandlerBuilder<JsfUnknownPropBuilder> {
    const control = this.getControl(path.split('.'), options);
    if (!control.hasHandler) {
      throw new Error(`Control '${ path }' has no handler.`);
    }
    return control.handler;
  }

  abstract getControl(path: string[], options?: GetControlOptions): JsfUnknownPropBuilder;

  /**
   * Convert abstract path into uniq array item path, if you can.
   *
   * Will convert "nest1[].type" into "nest1[@1001]".
   * Note: this works if it is called on child for example on "nest1[@1001].parks[@1001].name",
   * since we can figure out uniq path. You can not get uniq path for a[].b[].c if you call on
   * d[].r prop. Or event if you call on a[].z you will not get full conversion.
   *
   * This method will not fail if it can not convert [] into [@xxx].
   * @param key
   */
  convertAbstractSiblingPathToPath(abstractSiblingPath: string): string {
    // Examples:
    // Call method on prop arrayProp[@1].nestedArray[@2].nestedArrayString with arg:
    // - arrayProp[].arrayPropString                  => arrayProp[@1].arrayPropString
    // - arrayProp[].nestedArray[].nestedArrayNumber  => arrayProp[@1].nestedArray[@2].nestedArrayNumber

    // Memoization
    if (this.siblingPathsCache[abstractSiblingPath]) {
      return this.siblingPathsCache[abstractSiblingPath];
    }

    const pathFragments            = this.path.split('.');
    const abstractSiblingFragments = abstractSiblingPath.split('.');

    const out: string[] = [];

    let match = true;
    for (let i = 0; i < abstractSiblingFragments.length; i++) {
      const pf = pathFragments[i];
      const kf = abstractSiblingFragments[i];

      if (!pf || !match) {
        // Out of path fragments, add the rest of the key fragments to the output
        out.push(kf);
        continue;
      }

      if (pf.replace(/\[@?\d+]$/, '[]') === kf) {
        // Fragments match
        out.push(pf);
      } else {
        // No match
        out.push(kf);
        match = false; // Mark as not matching anymore, so we copy the rest of the path as-is
      }
    }

    this.siblingPathsCache[abstractSiblingPath] = out.join('.');
    return this.siblingPathsCache[abstractSiblingPath];
  }

  /**
   * Check convertAbstractPathToUniq for supported cases. This will fail if conversion can not be made.
   * @param siblingPath
   */
  getSibling(abstractSiblingPath: string): JsfUnknownPropBuilder {
    const siblingPath = this.convertAbstractSiblingPathToPath(abstractSiblingPath);
    return this.rootBuilder.getProp(siblingPath);
  }

  // ════════════════════════════════════════════════════════════════════════════════════════
  // EVENTS
  // ══════════════════════

  /**
   * Note: parent bubble up of value change event is done via status change.
   */
  protected emitValueChange(): void {
    const value = this.getValue();
    this.rootBuilder.masterEmitValueChange(this.abstractPath, { value });

    if (this.prop.onValueChange && this.prop.onValueChange.noEmit) {
      return;
    }

    this._valueChange.next({
      path : this.path,
      value: this.getValue()
    });
  }

  emitStatusChange(): void {
    if (this._statusChange) {
      this._statusChange.next(this.status);
    }

    this.rootBuilder.masterEmitStatusChange(
      {
        abstractPath: this.abstractPath,
        path        : this.path,
      }, {
        status: this.status
      }
    );

    this.emitValueChange();
  }

  protected async onValueChange(data: {
    oldValue: any
  }) {
    await this.changeOtherPropValues(data);

    this.emitValueChange();
  }

  /**
   * Change value to other props.
   * @param data
   */
  private async changeOtherPropValues(data: {
    oldValue: any
  }) {
    if (!this.rootBuilder.ready) {
      return;
    }
    const newValue = this.getValue();

    if (this.prop.onValueChange && this.prop.onValueChange.updateDependencyValue) {
      for (const udv of this.prop.onValueChange.updateDependencyValue) {
        let builderAction = this.rootBuilder;
        if (udv.onLinked) { builderAction = this.rootBuilder.linkedBuilder; }

        // CONDITION
        let condition = true;
        if (udv.condition) {

          // prepare builder or linked builder
          let builderCondition = this.rootBuilder;
          if (udv.condition.onLinked) { builderCondition = this.rootBuilder.linkedBuilder; }
          const ctxCondition = builderCondition.getEvalContext({
            propBuilder       : this,
            extraContextParams: {
              $propVal : newValue,
              $oldValue: data.oldValue,
              $newValue: newValue
            }
          });

          // ok now check condition
          condition = builderCondition.runEvalWithContext((udv.condition as any).$evalTranspiled || udv.condition.$eval, ctxCondition);
        }

        if (condition === true) { // IF CAN ...
          // prepare builder or linked builder for value part
          let builderValue = this.rootBuilder;
          if (udv.value.onLinked) { builderValue = this.rootBuilder.linkedBuilder; }
          const ctxValue = builderValue.getEvalContext({
            propBuilder       : this,
            extraContextParams: {
              $propVal : newValue,
              $oldValue: data.oldValue,
              $newValue: newValue
            }
          });


          const prop = udv.onLinked ? builderAction.propBuilder.getControlByPath(udv.key) : this.getSibling(udv.key);
          if (!prop) {
            throw new Error(`OnValueChange from ${ this.path } complains that prop ${ udv.key } does not exist.`);
          }
          if (udv.value.default !== undefined) {
            const propValue = builderValue.propBuilder.getControlByPath(udv.key);
            propValue.resetToDefault();
          } else {
            // ok now go
            let valueToSet = udv.value.const;
            if (udv.value.$eval) {
              valueToSet = builderValue.runEvalWithContext((udv.value as any).$evalTranspiled || udv.value.$eval, ctxValue);
            }
            if (udv.mode === 'patch') {
              await prop.patchValue(valueToSet);
            } else {
              await prop.setValue(valueToSet);
            }
          }

          builderAction.resolver.updateStatus(prop).catch(console.error);
        } else if (condition === false) {
          // no op
        } else {
          throw new Error(`${ this.path } condition.eval for ${ udv.key } returned non bool value.`);
        }
      }
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════════════
  // SET & PATCH & GET VALUE
  // ══════════════════════

  abstract valueToJson(value: PropValue): PropJsonValue;

  abstract jsonToValue(jsonValue: PropJsonValue): PropValue;


  getJsonValue(): PropJsonValue {
    return this.valueToJson(this.getValue());
  }

  getValueHash(): string {
    return hash.MD5(this.valueToJson(this.getValue()) || null)
  }

  getJsonValueWithHash(): {
    value: PropJsonValue,
    hash: string
  } {
    const value = this.valueToJson(this.getValue() || null);
    return {
      value,
      hash: hash.MD5(value || {})
    };
  }

  getValue(): PropValue {

    // Here we have paradox: eval needs old / curr. val but we do not know what is it E/D - any/null
    if (this._enabledIfStatus === false) {
      return null;
    }

    if (this.hasHandlerGetValue) {
      return this.handler.getValue();
    }
    return this._getValueViaProp();
  }

  abstract _getValueViaProp(): PropValue;

  setValueNoResolve(value: PropValue, options: SetValueOptionsInterface = {}): void {
    this.setValue(value, { ...options, noResolve: true }).catch(console.error);
  }

  async setValue(value: PropValue, options: SetValueOptionsInterface = {}): Promise<void> {
    if (!options.skipConst && this.prop.hasOwnProperty('const')) {
      return;
    }

    const oldValue = options.noValueChange ? undefined : this.getValue();

    if (this.hasHandlerSetValue) {
      this.handler.setValue(value, options);
    } else {
      this._setValueViaProp(value, options);
    }

    this._recalculateEnabledIfStatusOnNextResolve = true;

    let onValueChangePromise;
    if (!options.noValueChange) {
      onValueChangePromise = this.onValueChange({ oldValue });
    }

    if (onValueChangePromise) {
      return onValueChangePromise.then(() => this.onSetValue(options));
    } else {
      return this.onSetValue(options);
    }
  }

  onSetValue(options: SetValueOptionsInterface = {}): Promise<void> {
    // this.setStatus(PropStatus.Pending);

    if (!options.noResolve) {
      return this.resolve();
    }
  }

  abstract _setValueViaProp(value: PropValue, options: SetValueOptionsInterface): void;

  setJsonValueNoResolve(jsonValue: PropJsonValue, options: SetValueOptionsInterface = {}): void {
    return this.setValueNoResolve(this.jsonToValue(jsonValue), { ...options, noResolve: true }); // tslint:disable-line
  }

  async setJsonValue(jsonValue: PropJsonValue, options: SetValueOptionsInterface = {}) {
    return this.setValue(this.jsonToValue(jsonValue), options);
  }

  patchValueNoResolve(value: PropValue, options: PatchValueOptionsInterface = {}): void {
    this.patchValue(value, { ...options, noResolve: true }).catch(console.error);
  }

  patchValue(value: PropValue, options: PatchValueOptionsInterface = {}): Promise<void> {
    if (this.prop.hasOwnProperty('const')) {
      return;
    }

    const oldValue = options.noValueChange ? undefined : this.getValue();

    if (this.hasHandlerPatchValue) {
      this.handler.patchValue(value, options);
    } else {
      this._patchValueViaProp(value, options);
    }

    this._recalculateEnabledIfStatusOnNextResolve = true;

    let onValueChangePromise;
    if (!options.noValueChange) {
      onValueChangePromise = this.onValueChange({ oldValue });
    }

    if (onValueChangePromise) {
      return onValueChangePromise.then(() => this.onPatchValue(options));
    } else {
      return this.onPatchValue(options);
    }
  }

  async onPatchValue(options: PatchValueOptionsInterface = {}) {
    // this.setStatus(PropStatus.Pending);

    if (!options.noResolve) {
      return this.resolve();
    }
  }

  abstract _patchValueViaProp(value: PropValue, options: PatchValueOptionsInterface): void;

  patchJsonValue(jsonValue: PropJsonValue, options: PatchValueOptionsInterface = {}) {
    return this.patchValue(this.jsonToValue(jsonValue), options);
  }

  async consumeProviderValue(jsonValue: PropJsonValue, options: ConsumeProviderValueOptionsInterface = { mode: 'set' }): Promise<void> {
    if (this.hasHandlerConsumeProviderValue) {
      return this.handler.consumeProviderValue(jsonValue, options);
    } else {
      if (options.setToPath) {
        const control = this.getControlByPath(options.setToPath);
        return options.mode === 'set' ? control.setJsonValue(jsonValue, options) : control.patchJsonValue(jsonValue, options);
      }
      return options.mode === 'set' ? this.setJsonValue(jsonValue, options) : this.patchJsonValue(jsonValue, options);
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════════════
  // VALIDATION & ERRORS
  // ══════════════════════
  /**
   * Validate prop if it has pending state, else do nothing. You can force validation with force opt.
   * @param options
   * @return true if valid
   */
  async validate(options: { noEmit?: boolean, force?: boolean } = {}): Promise<boolean> {
    // If prop disabled it is always valid
    if (this.trueDisabledStatus) {
      return true;
    }

    // CB if not forced, this must be here else resolver will waste cycles running duplicate validations!
    if (!options.force && !this.pending) {
      return this.valid;
    }

    if (this.rootBuilder.diagnosticsHook) {
      this.rootBuilder.diagnosticsHook(
        'PROP-VALIDATE',
        { node: this }
      );
    }

    this.errors = [];
    this.setStatus(PropStatus.Pending, options); // No worries if already pending no emit is done

    let valid = await (this.hasHandlerValidate ? this.handler.validate(options) : this._validateViaProp());

    // PROVIDER FEEDBACK
    if (valid && this.hasProvider) {
      /*
      this.setErrorIf(this.providerExecutor.status === JsfProviderExecutorStatus.Pending,
        new ProviderPendingError());
      this.setErrorIf(this.providerExecutor.status === JsfProviderExecutorStatus.Failed,
        new ProviderFailedError());
     */

      // Notice: object can return valid:false even if errors=[]
      valid = valid && this.errorsNotExist;
    }

    this.setStatus(valid ? PropStatus.Valid : PropStatus.Invalid, options);
    return this.valid;
  }

  abstract _validateViaProp(): boolean | Promise<boolean>;

  protected processEvalValidators() {
    const prop = this.prop as JsfAbstractProp<PropType, any, any>; // FIXME use instance instead of casting ;(

    if (prop.evalValidators && prop.evalValidators.$evals && prop.evalValidators.$evals.length) {
      const lambdas = (prop.evalValidators as any).$evalsTranspiled || prop.evalValidators.$evals;
      for (const lambda of lambdas) {
        let validationErrors: EvalValidationError[] = [];

        const ctx = this.rootBuilder.getEvalContext({
          propBuilder       : this,
          extraContextParams: {
            $propVal: this.getValue(),
            $error  : EvalValidationError
          }
        });

        try {
          this.rootBuilder.runEvalWithContext(lambda, ctx);
        } catch (e) {
          const runtimeError = (e as JsfEvalRuntimeError);

          // Rethrow any exception that's not a validation error
          if (!Array.isArray(e) && !(runtimeError.exception instanceof EvalValidationError)) {
            throw e;
          }

          // Lambda function can throw a single error or an array of errors, so collect any single errors into an array
          // for later
          validationErrors = (Array.isArray(runtimeError.exception) ? runtimeError.exception : [runtimeError.exception]);
        }

        // Process errors
        for (const error of validationErrors) {
          const errorCode = prop.evalValidators.errorCodes.find(x => x.code === error.errorCode);

          if (errorCode) {
            // Translate the error message
            error.errorMessage = this.translationServer.get({ id: errorCode.code, val: errorCode.message });
            // Push to errors array
            this.errors.push(error);
          } else {
            throw new Error(`An unknown error code '${ error.errorCode }' was thrown inside a validation function.`);
          }
        }
      }
    }
  }

  private setErrorIf(condition: boolean, error: ValidationError) {
    if (condition) {
      this.errors.push(error);
    }
  }

  getAllErorrs(errorCode: string, path?: string[]) {
    // recursion
    throw new Error('NOT IMPLEMENTED');
  }

  getErrors(errorCode: string, path?: string[]) {
    throw new Error('NOT IMPLEMENTED');
  }

  hasErrors(errorCode: string, path?: string[]) {
    throw new Error('NOT IMPLEMENTED');
  }

  setErrors(errors: ValidationError[] | null, opts: any) {
    throw new Error('NOT IMPLEMENTED');
  }

  // ════════════════════════════════════════════════════════════════════════════════════════
  // DEPENDENCIES
  // ══════════════════════
  getChildDependencies(): JsfUnknownPropBuilder[] {
    return [];
  }

  getChildDependenciesPaths(): string[] {
    return this.getChildDependencies().map(x => x.path);
  }

  dependenciesForEnabledIfReady(pendingSymbol: Symbol) {
    const deps = this.dependenciesForEnabledIf;
    for (let i = 0; i < deps.length; i++) {
      if (deps[i]._resolverStatus.enabledIfPending === pendingSymbol) {
        return false;
      }
    }
    return true;
  }

  dependenciesForValidateReady() {
    const deps = this.dependenciesForValidate;
    for (let i = 0; i < deps.length; i++) {
      if (deps[i].pending) {
        return false;
      }
    }
    return true;
  }

  /**
   * Used for diagnostics (crash report).
   */
  dependenciesForValidateReadyList() {
    const out = [];
    for (const prop of this.dependenciesForValidate) {
      out.push({ path: prop.path, ready: !prop.pending });
    }
    return out;
  }

  private getHandlerDependenciesPathsForEnabledIf(existing: string[] = []) {
    if (!this.hasHandler) {
      return existing;
    }
    const handlerDeps = this.handler.getDependenciesForEnabledIf();
    if (handlerDeps.length) {
      return handlerDeps.concat(existing);
    } else {
      return existing;
    }
  }

  private getHandlerDependenciesPathsForValidate(existing: string[] = []) {
    if (!this.hasHandler) {
      return existing;
    }
    const handlerDeps = this.handler.getDependenciesForValidate();
    if (handlerDeps.length) {
      return handlerDeps.concat(existing);
    } else {
      return existing;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════════════
  // STATUS
  // ══════════════════════

  setStatus(status: PropStatus, options: { noEmit?: boolean } = {}) {
    if (options.noEmit) {
      this._status = status;
      if (this.rootBuilder.diagnosticsHook) {
        this.rootBuilder.diagnosticsHook(
          'PROP-STATUS-CHANGE',
          { node: this }
        );
      }
    } else {
      this.status = status;
    }
  }

  /**
   * This method never worked as users expected. It should be made internal, but devs used it so
   * result of this fun call is not what you expect. It is here only for legacy. And re-routed to new
   * way of updating status.
   * Note: updateStatus is superior to validate
   *
   * @deprecated use resolve instead (similar but not same)
   */
  async updateStatus_legacy(options: { noEmit?: boolean, force?: boolean, legacy?: boolean } = {}) {
    if (!options.legacy) {
      return this.resolve();
    } else {
      this.rootBuilder.log(`PROP UPDATE: ${ this.path }`);
      if (this.parentProp && this.parentProp.disabled) {
        this.setStatus(PropStatus.Disabled, options);
        return;
      }

      if (this.propCanBeEnabled()) {
        // Important line in order to invalidate prop. Else validate will do nothing.
        this.setStatus(PropStatus.Pending, options);

        await this.validate(options);

        if (this.pending) {
          throw new Error(`Prop "${ this.path }" has still pending state after validation.`);
        }
      } else {
        this.setStatus(PropStatus.Disabled, options);
      }
    }
  }

  resolve() {
    return this.rootBuilder.resolver.updateStatus(this);
  }

  async _updateValidationStatus(options: { noEmit?: boolean, force?: boolean } = {}) {
    if (!this._enabledIfStatus) {
      if (this.isAlreadyScheduledForResolver) {
        throw new Error(`Validation can not be run for ${ this.path } since status is unknown (_enabledIfStatus = null).`);
      }
      this.errors = [];
      this.setStatus(PropStatus.Disabled, options);
    } else {
      await this.validate(options);
    }
  }

  /**
   * Recalculate update status and if needed mark as PENDING for validation.
   * @param options
   * @return return true if status changed
   */
  _updateEnabledStatus(options: { noEmit?: boolean } = {}): boolean {
    if (this.rootBuilder.diagnosticsHook) {
      this.rootBuilder.diagnosticsHook(
        'PROP-CALC-ENABLED',
        { node: this }
      );
    }
    const oldStatus = this._enabledIfStatus;
    if (this.propCanBeEnabled()) {
      if (!oldStatus || this._recalculateEnabledIfStatusOnNextResolve) {
        this._enabledIfStatus = true;
        if (this._recalculateEnabledIfStatusOnNextResolve) {
          this._recalculateEnabledIfStatusOnNextResolve = false;
        }
        return true;
      }
    } else {
      if (oldStatus || oldStatus === null || this._recalculateEnabledIfStatusOnNextResolve) {
        this._enabledIfStatus = false;
        if (this._recalculateEnabledIfStatusOnNextResolve) {
          this._recalculateEnabledIfStatusOnNextResolve = false;
        }
        return true;
      }
    }
    return false;
  }

  // setDisabledStatus(options: { noEmit?: boolean } = {}) {
  //   if (!this.disabled) {
  //     this.setStatus(PropStatus.Disabled, options);
  //     for (const d of this.getChildDependencies()) {
  //       d.setDisabledStatus(options);
  //     }
  //   }
  // }

  emitStatusIfNeeded() {
    if (this._status !== PropStatus.Pending) {

      // We can not use this line since layout is depending on this to change
      // if (this._status !== this._lastNonPendingStatus) {
      //   this.emitStatusChange();
      // }

      this.emitStatusChange();
      this._lastNonPendingStatus = this._status;
    }
  }

  protected propCanBeEnabled(): boolean {
    // CHECK PARENT
    if (this.parentProp && !this.parentProp._enabledIfStatus) {
      return false;
    }

    // LAST STEP CHECK: enabledIf
    if (!this.prop.enabledIf) {
      return true;
    }

    let lambda;
    if (typeof this.prop.enabledIf === 'string') {
      lambda = this.prop.enabledIf;
    } else {
      lambda = (this.prop.enabledIf as any).$evalTranspiled || this.prop.enabledIf.$eval;
    }

    const ctx = this.rootBuilder.getEvalContext({
      propBuilder: this
    });

    const result = this.rootBuilder.runEvalWithContext(lambda, ctx);

    // if (result === undefined) {
    //   throw new Error(`[enabledIf] Lambda function must return a value => '${ lambda }'`);
    // }

    return !!result;
  }

  // ════════════════════════════════════════════════════════════════════════════════════════
  // UTIL
  // ══════════════════════
  getDiffKeys(lockKey: Symbol): string[] {
    return this.isDiff(lockKey) ? [this.path] : [];
  }

  protected getEvalValidatorsTranslatableMessages() {
    const messages: JsfTranslatableMessage[] = [];
    const prop                               = this.prop as JsfAbstractProp<PropType, any, any>; // FIXME use instance
                                                                                                 // instead of casting
                                                                                                 // ;(

    if (prop.evalValidators) {
      messages.push(...prop.evalValidators.errorCodes.map(x => new JsfTranslatableMessage(x.message, x.code)));
    }

    return messages;
  }

  statusTree(): any {
    return {
      status: this.status,
      errors: this.errors
    };
  }
}
