import { JsfDocument }                                                                                  from '../jsf-document';
import { JsfPropBuilderFactory }                                                                        from './util/prop-builder-factory';
import { JsfAbstractBuilder, JsfUnknownPropBuilder, PropStatus, ValidationError, ValueChangeInterface } from './abstract/index';
import { JsfLayoutBuilderFactory, JsfUnknownLayoutBuilder }                                             from './layout/index';
import { JsfTranslatableMessage, JsfTranslationServer }                                                 from '../translations';
import { filter, flattenDeep, uniq, uniqWith }                                                          from 'lodash';
import { Observable, Subject }                                                                          from 'rxjs';
import { JsfDependencyResolver }                                                                        from './jsf-dependency-resolver';
import {
  PatchValueOptionsInterface,
  SetValueOptionsInterface
}                                                                                                       from './interfaces/set-value-options.interface';
import { EvalContextOptions, evalService }                                                              from './util/eval.service';
import { JsfAbstractAuthCustomerProvider, JsfAbstractAuthUserProvider, JsfAbstractRouter }              from '../abstract';
import { JsfProvider }                                                                                  from '../providers/jsf-provider';
import { JsfProviderExecutor }                                                                          from '../providers';
import { jsfEnv }                                                                                       from '../jsf-env';
import { JsfAbstractService }                                                                           from '../abstract/abstract-service';
import { JsfNotificationInterface, JsfRuntimeContext }                                                  from './interfaces';
import ObjectID                                                                                         from 'bson-objectid';


export interface PropValueChangeInterface {
  value: any;
}

export interface PropStatusChangeInterface {
  path?: string;
  abstractPath?: string;
  status: PropStatus;
}

export interface JsfFormEventInterface {
  /**
   * Name of the event
   *
   * Known supported events:
   * - app:pick-customer
   *   Description: app will display dialog to pick customer
   *   Value should be: { onPickEventKey: 'my-custom-event-listener', onCancelEventKey: 'my-custom-event-listener2' }
   *     onPickEventKey - tells what event to trigger when customer picked
   *     Argument is (full or partial depend on permissions) customer object.
   */
  event: string;
  /**
   * Optional value from the event
   */
  value?: any;
  /**
   * Source event data which dispatched this event. This is usually the DOM click event, but can be anything depending
   * on which component triggered the event (see table component for example).
   */
  $event?: any;
  /**
   * The type of layout which triggered the event.
   */
  layout?: string;
}

export interface JsfBuilderOptions {
  debug?: boolean;
  warnings?: boolean;

  clientConfig?: { [configKey: string]: any };
  runtimeContext?: JsfRuntimeContext;
  services?: { [serviceName: string]: JsfAbstractService }; // Array of available service instances.

  headless?: boolean;
  safeMode?: boolean;
  skipValidation?: boolean;
  withoutHandlers?: boolean;

  linkedBuilder?: JsfBuilder;

  appRouter?: JsfAbstractRouter;
  authUserProvider?: JsfAbstractAuthUserProvider;
  authCustomerProvider?: JsfAbstractAuthCustomerProvider;

  onFormEvent?: (data: JsfFormEventInterface) => Promise<any>;
  onSubmit?: () => Promise<any>;
  onCustomEvent?: (eventName: string, eventData: any, documentId?: string | ObjectID) => Promise<any>;
  onVirtualEvent?: (eventName: string, eventData: any) => Promise<any>;
  onError?: (error: any) => Promise<any>;
  onNotification?: (notification: JsfNotificationInterface) => Promise<any>;
}

export enum LayoutMode {
  /**
   * New document
   */
  New       = 'new',
  /**
   * Document in draft state
   */
  Draft     = 'draft',
  /**
   * Document in submitted state
   */
  Submitted = 'submitted',
  /**
   * Document is displayed in a public view
   */
  Public    = 'public',
  /**
   * Document is embedded in another page
   */
  Embedded  = 'embedded',
  /**
   * Document was created by QA robot for testing purposes.
   */
  Test      = 'test',
  /**
   * Document is open inside a dialog.
   */
  Dialog    = 'dialog',
}


let jsfBuilderId = 0;

export class JsfBuilder extends JsfAbstractBuilder {

  /**
   * ID
   */
  private _id = jsfBuilderId++;
  get id(): number {
    return this._id;
  }

  /**
   * True when all initialized with preset values, before this changeOtherPropValues will not work.
   */
  ready = false;

  /**
   * Render debug views & output detailed information.
   */
  debug?: boolean;

  /**
   * Output warnings for developers. Disabled by default
   */
  warnings = false;


  /**
   * This is part of common module so backend can verify form/layout structure.
   */
  propBuilder: JsfUnknownPropBuilder;
  layoutBuilder?: JsfUnknownLayoutBuilder;

  // APP ONLY
  //
  jsfHandlersPath: string;
  jsfThemePath: string;
  cachedModules: { [key: string]: any };
  innerScrollEnabled: boolean;
  apiService: any; // HTTP
  appRouter: JsfAbstractRouter;

  ////// This is only acceptable data from outside world!
  runtimeContext?: JsfRuntimeContext;
  authUserProvider: JsfAbstractAuthUserProvider; // Authenticated user data
  authCustomerProvider: JsfAbstractAuthCustomerProvider; // Authenticated customer data
  //////

  linkedBuilder?: JsfBuilder; // Instance of another builder on which we run certain things
  //
  // APP ONLY END


  translationServer: JsfTranslationServer;

  $evalObjects: { [objectName: string]: any } = {};

  resolver: JsfDependencyResolver;

  providers: { [key: string]: JsfProvider }                = {};
  private providerExecutorInitQueue: JsfProviderExecutor[] = [];

  /**
   * Services can be use dto extend functionality of JSF.
   * For example: stripe service provides option for payment
   * Usage for stripe:
   *    In JSF DEF add:
   *        $services: ['stripe'],
   *
   *
   *  On click action could look like:
   *        {
   *          runServiceAction: {
   *             service: 'stripe',
   *             action : 'checkout',
   *             data   : {
   *               $eval: `return {
   *                 publishableKey: $val.stripeCheckout.publishableKey,
   *                 sessionId: $val.stripeCheckout.sessionId
   *               }`
   *             }
   *           }
   *         }
   */
  services: { [key: string]: JsfAbstractService } = {};

  searchableProps: string[] = [];

  private _isDirty = false;
  get isDirty() {
    return this._isDirty;
  }

  set isDirty(val: boolean) {
    this._isDirty = val;
    this._onDirtyChange.next(this._isDirty);
  }

  private _onDirtyChange = new Subject<boolean>();
  get onDirtyChange() {
    return this._onDirtyChange.asObservable();
  }

  /**
   * Fires when form is done building.
   */
  private _formInit = new Subject<JsfBuilder>();
  get formInit() {
    return this._formInit.asObservable();
  }

  /**
   * Emits form events to outside world.
   */
  public onFormEvent: (data: JsfFormEventInterface) => Promise<any>;

  /**
   * Emits submit events.
   */
  public onSubmit: () => Promise<any>;

  /**
   * Emits custom events.
   */
  public onCustomEvent: (eventName: string, eventData: any, documentId?: string | ObjectID) => Promise<any>;

  /**
   * Emits virtual events.
   */
  public onVirtualEvent: (eventName: string, eventData: any) => Promise<any>;

  /**
   * Emits errors.
   */
  public onError: (error: any) => Promise<any>;

  /**
   * Emits notifications.
   */
  public onNotification: (notification: JsfNotificationInterface) => Promise<any>;


  /**
   * Warning! not same on API and APP.
   */
  clientConfig: { [configKey: string]: any } = {};

  /**
   * Hooks to run before the form is submitted.
   */
  private preSubmitHooks: { [key: string]: () => Promise<void> } = {};

  diagnosticsHook: (type: string, data: any) => void;

  pathsCache: { [abspath: string]: JsfUnknownPropBuilder } = {};

  /**
   * Any extra states of layout elements exposed to others.
   * Depending on layout element this value can persist across angular component destroys and creations.
   */
  private layoutState: {
    [id: string]: {
      store: { [key: string]: any },
      listener?: Subject<{ key: string, value: any }>
    }
  } = {};

  /**
   * Stores layouts components based on custom IDs.
   * Must have unique IDs.
   */
  private layout: {
    [id: string]: any
  } = {};

  private valueChangeListeners: { [path: string]: Subject<PropValueChangeInterface> }   = {};
  private statusChangeListeners: { [path: string]: Subject<PropStatusChangeInterface> } = {};

  get valid() {
    return this.propBuilder.valid;
  }

  get valueChange(): Observable<ValueChangeInterface> {
    return this.propBuilder.valueChange;
  }

  get statusChange(): Observable<PropStatus> {
    return this.propBuilder.statusChange;
  }

  get modes() {
    return this.doc.$modes || [];
  }

  static async create(
    doc: JsfDocument,
    options: JsfBuilderOptions = {}) {
    const x = new JsfBuilder(doc, options);
    await x.onInit();
    return x;
  }

  constructor(public doc: JsfDocument, public options: JsfBuilderOptions = {}) {
    super();
    this.resolver          = new JsfDependencyResolver(this);
    this.translationServer = new JsfTranslationServer(doc.$translations);
    this.initEvalObject();

    this.debug    = !!options.debug;
    this.warnings = !!options.warnings;

    this.appRouter = options.appRouter;

    this.linkedBuilder        = options.linkedBuilder;
    this.runtimeContext       = options.runtimeContext;
    this.authUserProvider     = options.authUserProvider;
    this.authCustomerProvider = options.authCustomerProvider;

    this.onFormEvent    = options.onFormEvent;
    this.onSubmit       = options.onSubmit;
    this.onCustomEvent  = options.onCustomEvent;
    this.onVirtualEvent = options.onVirtualEvent;
    this.onError        = options.onError;
    this.onNotification = options.onNotification;

    if (doc.$config) {
      this.clientConfig = doc.$config;
    }
    if (this.options.clientConfig) {
      this.clientConfig = { ...doc.$config, ...this.options.clientConfig };
    }

    // Create providers
    this.initProviders();

    // Create prop & layout builders
    this.propBuilder = JsfPropBuilderFactory.create({
      prop       : doc.schema,
      docDefPath : 'schema',
      propName   : '',
      rootBuilder: this,
      safeMode   : options.safeMode
    });
    if (doc.value !== undefined) {
      this.propBuilder.setJsonValueNoResolve(doc.value, { noResolve: true });
    }

    if (!options.headless) {
      this.layoutBuilder = JsfLayoutBuilderFactory.create(doc.layout, this, null,
        { arrayPropMap: {}, docDefPath: 'layout' }
      );
    }

    // Safety checks
    if (this.warnings) {
      // No dirty list provided
      if (!this.doc.$dirtyList) {
        console.warn(`No dirty prop list provided for this document. The document will be marked as dirty on every value change, which may not be what you want.`);
      }
    }

    this.propBuilder.onDependenciesInit();
  }

  async onInit() {
    // Initialize services
    for (const service of (this.doc.$services || [])) {
      const serviceName   = typeof service === 'object' ? service.name : service;
      const serviceConfig = typeof service === 'object' ? service.config : void 0;

      const serviceInstance = this.options.services[serviceName];
      if (serviceInstance) {
        await serviceInstance.onCreate(this, serviceConfig);
        await serviceInstance.onInit();

        this.services[serviceName] = serviceInstance;

        this.log(`Initialized service: "${ serviceName }"`);
      } else {
        if (this.warnings) {
          console.warn(`Service not found: "${ serviceName }"`);
        }
      }
    }

    // Run all provider executors
    if (this.debug) {
      console.log('Running provider executors');
    }
    // First run all non-async providers, then schedule all async providers to be run after the form is initialized.
    await Promise.all(
      this.providerExecutorInitQueue.filter(x => !x.async).map(x => x.provideImmediately())
    );
    this.formInit.subscribe(() => {
      this.providerExecutorInitQueue.filter(x => x.async).map(x => x.provideImmediately().catch(e => console.error(e)));
    });

    // Update status
    if (this.debug) {
      console.log('Running validation');
    }
    if (!this.options.skipValidation) {
      await this.resolver.updateStatus(this.propBuilder, { ignoreReadyFlag: true });
    }
    if (this.layoutBuilder) {
      this.layoutBuilder.updateStatus();
    }

    if (this.debug) {
      console.log('Jsf builder instance is now ready');
    }
    this.ready = true;

    if (!jsfEnv.isApi) {
      if (this.doc.$lifeCycle && this.doc.$lifeCycle.$afterFormInit) {
        if (this.doc.$lifeCycle.$afterFormInit.$eval) {
          this.runEval((this.doc.$lifeCycle.$afterFormInit as any).$evalTranspiled || this.doc.$lifeCycle.$afterFormInit.$eval);
        }
      }
    }

    this.emitFormInit();
  }

  onDestroy() {
    // Destroy services
    for (const serviceName of Object.keys(this.services)) {
      this.services[serviceName].onDestroy()
        .catch(e => {
          throw e;
        });
    }
    this.services = {};

    return this.propBuilder.onDestroy();
  }

  private initEvalObject() {
    if (this.doc.$evalObjects) {
      for (const name of Object.keys(this.doc.$evalObjects)) {
        Object.defineProperty(this.$evalObjects, name, {
          get: () => {

            const lambda = ((this.doc as any).$evalObjectsTranspiled || {})[name] || this.doc.$evalObjects[name];

            const ctx = this.getEvalContext();
            return this.runEvalWithContext(lambda, ctx);

          }
        });
      }
    }
  }

  private initProviders() {
    if (this.doc.$providers) {
      for (const key of Object.keys(this.doc.$providers)) {
        this.providers[key] = new JsfProvider(this, this.doc.$providers[key]);
      }
    }
  }


  hasMode(mode: LayoutMode | string) {
    return this.modes.indexOf(mode) > -1;
  }

  getServiceByName(name: string) {
    if (this.services) {
      return this.services[name];
    }
  }

  public async runOnFormEventHook(event: JsfFormEventInterface) {
    if (this.onFormEvent) {
      return this.onFormEvent(event);
    }
    if (this.warnings) {
      console.warn(`onFormEvent hook function not provided.`);
    }
  }

  public async runOnSubmitHook() {
    if (this.onSubmit) {
      return this.onSubmit();
    }
    if (this.warnings) {
      console.warn(`onSubmit hook function not provided.`);
    }
  }

  public async runOnCustomEventHook(eventName: string, eventData: any, documentId?: string | ObjectID) {
    if (this.onCustomEvent) {
      return this.onCustomEvent(eventName, eventData, documentId);
    }
    if (this.warnings) {
      console.warn(`onCustomEvent hook function not provided.`);
    }
  }

  public async runOnVirtualEventHook(eventName: string, eventData: any) {
    if (this.onVirtualEvent) {
      return this.onVirtualEvent(eventName, eventData);
    }
    if (this.warnings) {
      console.warn(`onVirtualEvent hook function not provided.`);
    }
  }

  public async runOnErrorHook(error: any) {
    if (this.onError) {
      return this.onError(error);
    }
    // If no hook function is provided throw the error
    throw error;
  }

  public async runOnNotificationHook(notification: JsfNotificationInterface) {
    if (this.onNotification) {
      return this.onNotification(notification);
    }
    if (this.warnings) {
      console.warn(`onNotification hook function not provided.`);
    }
  }


  onExternalEvent(eventKey: string, eventData: any) {
    console.log('Incoming external event', eventKey, eventData);

    if (!this.doc.$events) {
      return;
    }

    if (this.doc.$events.listen && this.doc.$events.listen[eventKey]) {
      const ctx = this.getEvalContext({
        propBuilder       : this.propBuilder,
        extraContextParams: {
          $eventData: eventData
        }
      });
      this.runEvalWithContext(this.doc.$events.listen[eventKey].$eval, ctx);
    }
  }

  registerLayoutComponent(id: string, component: any): void {
    if (this.layout[id]) {
      throw new Error(`Layout with id '${ id }' is already registered.`);
    }
    this.layout[id] = component;
  }

  unregisterLayoutComponent(id: string): void {
    delete this.layout[id];
  }

  getLayoutComponent(id: string): any {
    return this.layout[id];
  }

  setLayoutStateUnderSameIds(ids: string[], key: string, value: any): void {
    uniq(ids).forEach(id => this.setLayoutState(id, key, value));
  }

  setLayoutState(id: string, key: string, value: any): void {
    this.layoutState[id]            = this.layoutState[id] || {
      store   : {},
      listener: new Subject()
    };
    this.layoutState[id].store[key] = value;
    if (this.layoutState[id].listener) {
      this.layoutState[id].listener.next({ value, key });
    }
  }

  getLayoutState(id: string, key: string): any {
    if (!this.layoutState[id]) {
      return undefined;
    }
    return this.layoutState[id].store[key];
  }

  hasLayoutState(id: string, key: string): boolean {
    if (!this.layoutState[id]) {
      return false;
    }
    return this.layoutState[id].store[key] !== undefined;
  }

  getProvider(key: string) {
    if (!this.providers[key]) {
      throw new Error(`Provider '${ key }' not found. Make sure you defined the provider in the schema's '$providers' map.`);
    }
    return this.providers[key];
  }

  enqueueProviderExecutor(executor: JsfProviderExecutor) {
    // Add a provider consumer to the init queue.
    if (this.ready) {
      throw new Error(`Executor cannot be queued after the form is in ready state.`);
    }
    this.providerExecutorInitQueue.push(executor);
  }

  addPreSubmitHook(id: string, fn: () => Promise<void>) {
    if (this.preSubmitHooks[id]) {
      console.warn(`Overriding pre-submit hook '${ id }'`);
    }
    this.preSubmitHooks[id] = fn; // we don't care if it already exists, just override
  }

  removePreSubmitHook(id: string) {
    delete this.preSubmitHooks[id];
  }

  hasPreSubmitHook(id: string) {
    return this.preSubmitHooks[id] !== undefined;
  }

  async runPreSubmitHooks(): Promise<any> {
    const promises = [];
    for (const k of Object.keys(this.preSubmitHooks)) {
      promises.push(this.preSubmitHooks[k]());
    }

    return Promise.all(promises);
  }

  subscribeLayoutStateChange(id: string): Observable<{ key: string, value: any }> {
    this.layoutState[id] = this.layoutState[id] || {
      store   : {},
      listener: new Subject()
    };

    return this.layoutState[id].listener;
  }

  listenForValueChange(path: string): Observable<PropValueChangeInterface> {
    this.valueChangeListeners[path] = this.valueChangeListeners[path] || new Subject<PropValueChangeInterface>();
    return this.valueChangeListeners[path].asObservable();
  }

  listenForStatusChange(path: string): Observable<PropStatusChangeInterface> {
    this.statusChangeListeners[path] = this.statusChangeListeners[path] || new Subject<PropStatusChangeInterface>();
    return this.statusChangeListeners[path].asObservable();
  }

  /**
   * All props report their changes.
   */
  masterEmitValueChange(path: string, data: PropValueChangeInterface) {
    this.log(`Master emit VALUE "${ path }"`, data);
    if (this.valueChangeListeners[path]) {
      this.valueChangeListeners[path].next(data);
    }

    if (this.ready) {
      if (this.doc.$dirtyList) {
        if (this.doc.$dirtyList.find(x => (x === path) || path.startsWith(x + '.') || path.startsWith(x + '['))) {
          this.isDirty = true;
        } else {
          this.log(`Prop "${ path }" is excluded from dirtyList.`);
        }
      } else {
        this.isDirty = true;
      }
    }
  }

  masterEmitStatusChange(from: { path: string, abstractPath: string }, data: PropStatusChangeInterface) {
    this.log(`Master emit STATUS "${ from.path }"`, data);

    if (from.path) {
      data.path = from.path;
    }
    if (from.abstractPath) {
      data.abstractPath = from.abstractPath;
    }

    if (this.statusChangeListeners[from.path]) {
      this.statusChangeListeners[from.path].next(data);
    }

    if (this.statusChangeListeners[from.abstractPath]) {
      this.statusChangeListeners[from.abstractPath].next(data);
    }
  }

  /**
   * Emits form init event.
   */
  private emitFormInit() {
    this._formInit.next(this);
  }

  clone() {
    return new JsfBuilder(JSON.parse(JSON.stringify(this.doc)));
  }

  ////////////////////////////
  // JSF PASS THRU
  ////////////////////////////

  getProp(path: string) {
    if (this.warnings) {
      // Check if path accesses any array element by index and issue a warning.
      if (/\[\d]/.test(path)) {
        console.error(`Unsafe access to prop "${ path }": accessing array path by index may return an outdated cached value!`);
      }
    }

    if (this.pathsCache[path]) {
      return this.pathsCache[path];
    }
    return this.pathsCache[path] = this.propBuilder.getControlByPath(path);
  }

  /**
   * Lock values as original values. This is useful when you would like to get diff.
   */
  lock(lockKey?: Symbol): Symbol {
    return this.propBuilder.lock(lockKey);
  }

  isDiff(lockKey: Symbol): boolean {
    return this.propBuilder.isDiff(lockKey);
  }

  getDiff(lockKey: Symbol) {
    return this.propBuilder.getDiff(lockKey);
  }

  getDiffKeys(lockKey: Symbol) {
    return this.propBuilder.getDiffKeys(lockKey);
  }

  getJsonDiff(lockKey: Symbol): any {
    return this.propBuilder.getJsonDiff(lockKey);
  }

  getErrors() {
    // return this.propBuilder.getErrors();
    return null;
  }

  getErrorsFlat(): { path: string, error: ValidationError }[] {
    return null;
  }

  getValue() {
    return this.propBuilder.getValue();
  }

  getJsonValue() {
    return this.propBuilder.getJsonValue();
  }

  async setValue(value: any, options: SetValueOptionsInterface = {}) {
    return this.propBuilder.setValue(value, options);
  }

  async setJsonValue(value: any, options: SetValueOptionsInterface = {}) {
    return this.propBuilder.setJsonValue(value, options);
  }

  setValueNoResolve(value: any, options: SetValueOptionsInterface = {}): void {
    this.setValue(value, { ...options, noResolve: true }); // tslint:disable-line
  }

  async patchValue(value: any, options: PatchValueOptionsInterface = {}) {
    return this.propBuilder.patchValue(value, options);
  }

  async patchJsonValue(value: any, options: PatchValueOptionsInterface = {}) {
    return this.propBuilder.patchJsonValue(value, options);
  }

  patchValueNoResolve(value: any, options: PatchValueOptionsInterface = {}): void {
    this.patchValue(value, { ...options, noResolve: true }); // tslint:disable-line
  }


  validate() {
    return this.propBuilder.validate();
  }

  ////////////////////////////
  // TRANSLATIONS HELPER
  ////////////////////////////

  async getPropTranslatableStrings(): Promise<JsfTranslatableMessage[]> {
    return this.propBuilder.getPropTranslatableStrings();
  }

  getLayoutTranslatableStrings(): JsfTranslatableMessage[] {
    return this.layoutBuilder.getLayoutTranslatableStrings();
  }

  getStaticTranslatableStrings(): JsfTranslatableMessage[] {
    const messages: JsfTranslatableMessage[] = [];

    // Title
    if (this.doc.$title) {
      messages.push(new JsfTranslatableMessage(this.doc.$title));
    }

    // Get other static strings
    messages.push(...this.propBuilder.getStaticTranslatableStrings());

    return flattenDeep(messages);
  }

  async getAllTranslatableStrings(): Promise<JsfTranslatableMessage[]> {
    const propMessages   = await this.getPropTranslatableStrings();
    const layoutMessages = this.getLayoutTranslatableStrings();
    const staticMessages = this.getStaticTranslatableStrings();

    let messages = filter(flattenDeep([...propMessages, ...layoutMessages, ...staticMessages]),
      (x: JsfTranslatableMessage) => !!x.id && !!x.value);

    messages = uniqWith(messages, (a: JsfTranslatableMessage, b: JsfTranslatableMessage) => {
      if (a.id === b.id) {
        if (a.value !== b.value) {
          throw new Error(`
            Translatable strings with ID "${ a.id }" have different values: [${ a.id }: ${ a.value }] ==> [${ b.id }: ${ b.value }]. 
            You must specify a unique ID for all messages.`
          );
        }
        return true;
      }
      return false;
    });

    return messages;
  }

  ////////////////////////
  // EVAL HELPER
  ////////////////////////

  getStaticEvalContext(): any {
    return evalService.getStaticEvalContext(this);
  }

  getEvalContext(options: EvalContextOptions = {}): any {
    return evalService.getEvalContext(this, options);
  }

  runEvalWithContext(lambda: string, context: any): any {
    return evalService.runEvalWithContext(lambda, context);
  }

  runEval(lambda: string) {
    const ctx = this.getEvalContext({
      propBuilder: this.propBuilder
    });
    return this.runEvalWithContext(lambda, ctx);
  }

  log(...args) {
    if (this.debug) {
      console.log(...args);
    }
  }

  warn(...args) {
    if (this.warnings) {
      console.warn(...args);
    }
  }
}

export function isJsfBuilder(x: any): x is JsfBuilder {
  return x instanceof JsfBuilder;
}

