import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  HostListener,
  Inject,
  Injector,
  Input,
  NgModuleFactoryLoader,
  OnDestroy,
  OnInit,
  Optional,
  QueryList,
  Renderer2,
  SkipSelf,
  ViewChildren,
  ViewContainerRef
}                                         from '@angular/core';
import {
  isBindable,
  isPropArray,
  isPropObject,
  JsfAbstractAuthCustomerProvider,
  JsfAbstractAuthUserProvider,
  JsfAbstractService,
  JsfBuilder,
  JsfBuilderOptions,
  JsfDocument,
  JsfFormEventInterface,
  JsfNotificationInterface,
  JsfProp,
  JsfRuntimeContext,
  LayoutMode,
  ObjectID
}                                         from '@kalmia/jsf-common-es2015';
import { uniq }                           from 'lodash';
import { AnalyticsService }               from './analytics/analytics.service';
import { JsfResponsiveService }           from './services/responsive.service';
import { JsfScrollService }               from './services/scroll.service';
import { ModuleCacheService }             from './services/module-cache.service';
import { ThemeRendererService }           from './services/theme-renderer.service';
import {
  JSF_API_SERVICE,
  JSF_APP_CONFIG,
  JSF_APP_ROUTER,
  JSF_AUTH_CUSTOMER_PROVIDER,
  JSF_AUTH_USER_PROVIDER,
  JSF_DEVELOPMENT_MODE,
  JSF_RUNTIME_CONTEXT,
  JsfAppConfig,
  PreloadedModule
}                                         from '../common';
import { pascalcase }                     from '../utilities';
import { FormOutletComponent }            from './theme/form-outlet.component';
import { ThemeOutletComponent }           from './theme/theme-outlet.component';
import { JsfThemeRenderMode }             from './theme/render-mode.enum';
import { BuilderDeveloperToolsInterface } from './builder-developer-tools.interface';
import { StripeService }                  from './service-library/stripe.service';
import { ScriptInjectorService }          from './services/script-injector.service';
import { Subject }                        from 'rxjs';
import { takeUntil }                      from 'rxjs/operators';
import { OverlayScrollbarsComponent }     from 'overlayscrollbars-ngx';


// tslint:disable:no-output-on-prefix

@Component({
  selector       : 'jsf-kal-jsf-doc',
  templateUrl    : './kal-jsf-doc.component.html',
  styleUrls      : ['./kal-jsf-doc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KalJsfDocComponent implements OnInit, AfterViewInit, OnDestroy {

  private componentInitialized = false;

  public internalErrorMessage: string;

  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  /**
   * Internal flag indicating whether all child controls should have their validation state displayed.
   */
  private _showAllValidationErrors: boolean;
  get showAllValidationErrors(): boolean {
    if (this._showAllValidationErrorsOverride !== undefined) {
      return this._showAllValidationErrorsOverride;
    }
    return this._showAllValidationErrors;
  }

  set showAllValidationErrors(value: boolean) {
    this._showAllValidationErrors = value;
    if (this.cdRef) {
      this.cdRef.detectChanges();
    }
  }

  /**
   * Same as above, but has priority since this property is bound to a component input.
   */
  private _showAllValidationErrorsOverride: boolean;

  /**
   * Flag indicating whether the theme is loaded, used for display on frontend only.
   */
  public themeLoaded = false;

  /**
   * Flag indicating whether the document has to be rebuilt.
   */
  private documentRebuildRequired = true;

  /**
   * Flag indicating whether the document is building.
   */
  private documentBuilding = false;

  /**
   * Doc
   */
  private _doc: JsfDocument;
  get doc(): JsfDocument {
    return this._doc;
  }

  @Input()
  set doc(value: JsfDocument) {
    this._doc = value;
    this.rebuildOnInputChange();
  }

  /**
   * Builder options
   */
  private _builderOptions: JsfBuilderOptions;
  get builderOptions(): JsfBuilderOptions {
    return this._builderOptions;
  }

  @Input()
  set builderOptions(opts: JsfBuilderOptions) {
    this._builderOptions = opts;
    this.rebuildOnInputChange();
  }

  /**
   * Modes
   */
  private _modes: string[] = [
    // Use reasonable defaults
    LayoutMode.New
  ];
  get modes(): string[] {
    return this._modes;
  }

  @Input()
  set modes(modes: string[]) {
    this._modes = modes;
    this.rebuildOnInputChange();
  }

  /**
   * Debug
   */
  private _debug?: boolean;
  get debug(): boolean {
    return this._debug;
  }

  @Input()
  set debug(value: boolean | undefined) {
    this._debug = value;
    this.rebuildOnInputChange();
  }

  /**
   * Whether the document should render its own theme.
   */
  @Input() enableThemeRender = false;

  /**
   * Whether the theme should handle the form scrolling, instead of the component parent.
   */
  @Input() innerScroll?: boolean;

  /**
   * Set to true to disable theme's wrapper styles.
   */
  @Input() disableWrapperStyles?: boolean;

  /**
   * Flag to override the loading indicator display.
   */
  @Input() showLoadingIndicator?: boolean;

  /**
   * Developer tools options for visual jsf builder for jsf builder.
   */
  @Input() developerTools?: BuilderDeveloperToolsInterface;

  @Input()
  get showValidationErrors(): boolean {
    return this._showAllValidationErrorsOverride;
  }

  set showValidationErrors(value: boolean) {
    this._showAllValidationErrorsOverride = value;
    this.cdRef.detectChanges();
  }

  private formSubmissionInProgress = false;

  get loadingIndicatorVisible() {
    if (this.showLoadingIndicator !== undefined) {
      return this.showLoadingIndicator;
    }
    return this.formSubmissionInProgress;
  }

  /**
   * A builder instance to link this form builder to. This is useful to for example run onClick events on a different
   * form.
   */
  private _linkedFormBuilder?: JsfBuilder;
  @Input()
  get linkedFormBuilder(): JsfBuilder {
    return this._linkedFormBuilder;
  }

  set linkedFormBuilder(value: JsfBuilder) {
    this._linkedFormBuilder = value;
    if (this.builder) {
      this.builder.linkedBuilder = this._linkedFormBuilder;
    }
  }


  /**
   * Called when form instance is built.
   */
  private _onFormBuilderCreated: (formBuilder: JsfBuilder) => Promise<void>;
  @Input()
  get onFormBuilderCreated(): (formBuilder: JsfBuilder) => Promise<void> {
    return this._onFormBuilderCreated;
  }

  set onFormBuilderCreated(value: (formBuilder: JsfBuilder) => Promise<void>) {
    try {
      if (value && isBindable(value)) {
        throw new Error(`Provided method for 'onFormBuilderCreated' is not bound to parent context. Try using the @Bind() decorator.`);
      }
      this._onFormBuilderCreated = value;
    } catch (e) {
      this.runOnErrorHook(e)
        .catch(e => {
          throw e;
        });
    }
  }

  /**
   * Called when an error occurs in the component.
   */
  private _onError: (e: any) => Promise<void>;
  @Input()
  get onError(): (e: any) => Promise<void> {
    return this._onError;
  }

  set onError(value: (e: any) => Promise<void>) {
    try {
      if (value && isBindable(value)) {
        throw new Error(`Provided method for 'onError' is not bound to parent context. Try using the @Bind() decorator.`);
      }
      this._onError = value;
    } catch (e) {
      this.runOnErrorHook(e)
        .catch(e => {
          throw e;
        });
    }
  }

  /**
   * Called when a custom event is triggered.
   * The function should throw an error if the operation failed.
   */
  private _onFormEvent: (data: JsfFormEventInterface) => Promise<any>;
  @Input()
  get onFormEvent(): (data: JsfFormEventInterface) => Promise<any> {
    return this._onFormEvent;
  }

  set onFormEvent(value: (data: JsfFormEventInterface) => Promise<any>) {
    try {
      if (value && isBindable(value)) {
        throw new Error(`Provided method for 'onFormEvent' is not bound to parent context. Try using the @Bind() decorator.`);
      }
      this._onFormEvent = value;
    } catch (e) {
      this.runOnErrorHook(e)
        .catch(e => {
          throw e;
        });
    }
  }

  /**
   * Called when form value changes.
   */
  private _onValueChange: (value: any) => Promise<any>;
  @Input()
  get onValueChange(): (value: any) => Promise<any> {
    return this._onValueChange;
  }

  set onValueChange(value: (value: any) => Promise<any>) {
    try {
      if (value && isBindable(value)) {
        throw new Error(`Provided method for 'onValueChange' is not bound to parent context. Try using the @Bind() decorator.`);
      }
      this._onValueChange = value;
    } catch (e) {
      this.runOnErrorHook(e)
        .catch(e => {
          throw e;
        });
    }
  }

  /**
   * Called when form is submitted.
   * The function should throw an error if the operation failed.
   */
  private _onSubmit: () => Promise<any>;
  @Input()
  get onSubmit(): () => Promise<any> {
    return this._onSubmit;
  }

  set onSubmit(value: () => Promise<any>) {
    try {
      if (value && isBindable(value)) {
        throw new Error(`Provided method for 'onSubmit' is not bound to parent context. Try using the @Bind() decorator.`);
      }
      this._onSubmit = value;
    } catch (e) {
      this.runOnErrorHook(e)
        .catch(e => {
          throw e;
        });
    }
  }

  /**
   * Called when the application should trigger a custom event.
   * Function should return the result of the custom event API call, or throw an error if the operation failed.
   */
  private _onCustomEvent: (eventName: string, eventData: any, documentId?: string | ObjectID) => Promise<any>;
  @Input()
  get onCustomEvent(): (eventName: string, eventData: any, documentId?: string | ObjectID) => Promise<any> {
    return this._onCustomEvent;
  }

  set onCustomEvent(value: (eventName: string, eventData: any, documentId?: string | ObjectID) => Promise<any>) {
    try {
      if (value && isBindable(value)) {
        throw new Error(`Provided method for 'onCustomEvent' is not bound to parent context. Try using the @Bind() decorator.`);
      }
      this._onCustomEvent = value;
    } catch (e) {
      this.runOnErrorHook(e)
        .catch(e => {
          throw e;
        });
    }
  }

  /**
   * Called when the application should trigger a virtual event.
   * Function should return the result of the virtual event API call, or throw an error if the operation failed.
   */
  private _onVirtualEvent: (eventName: string, eventData: any) => Promise<any>;
  @Input()
  get onVirtualEvent(): (eventName: string, eventData: any) => Promise<any> {
    return this._onVirtualEvent;
  }

  set onVirtualEvent(value: (eventName: string, eventData: any) => Promise<any>) {
    try {
      if (value && isBindable(value)) {
        throw new Error(`Provided method for 'onVirtualEvent' is not bound to parent context. Try using the @Bind() decorator.`);
      }
      this._onVirtualEvent = value;
    } catch (e) {
      this.runOnErrorHook(e)
        .catch(e => {
          throw e;
        });
    }
  }


  /**
   * Called when the application should display a notification.
   */
  private _onNotification: (notification: JsfNotificationInterface) => Promise<any>;
  @Input()
  get onNotification(): (notification: JsfNotificationInterface) => Promise<any> {
    return this._onNotification;
  }

  set onNotification(value: (notification: JsfNotificationInterface) => Promise<any>) {
    try {
      if (value && isBindable(value)) {
        throw new Error(`Provided method for 'onNotification' is not bound to parent context. Try using the @Bind() decorator.`);
      }
      this._onNotification = value;
    } catch (e) {
      this.runOnErrorHook(e)
        .catch(e => {
          throw e;
        });
    }
  }


  /**
   * Themes & handlers paths
   */
  get jsfThemePath(): string {
    return this.jsfAppConfig.themePath;
  }

  get jsfHandlersPath(): string {
    return this.jsfAppConfig.handlersPath;
  }

  builder: JsfBuilder;
  styleElement: HTMLElement;
  scriptElement: HTMLScriptElement;

  @ViewChildren('themeContainer', { read: ViewContainerRef })
  containers: QueryList<ViewContainerRef>;

  diagnosticsWindow: any;

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((window as any)._diagnostics && event.ctrlKey && (event.which || event.keyCode) === 9) {
      this.openDiagnostics();
      (window as any)._jsfBuildersList = (window as any)._jsfBuildersList || [];
      (window as any)._jsfBuildersList.push(this);
      return event.preventDefault();
    }
  }

  constructor(private loader: NgModuleFactoryLoader,
              private injector: Injector,
              private resolver: ComponentFactoryResolver,
              private cdRef: ChangeDetectorRef,
              private renderer: Renderer2,
              private analyticsService: AnalyticsService,
              private responsiveService: JsfResponsiveService,
              public scrollService: JsfScrollService,
              private moduleCacheService: ModuleCacheService,
              private themeRendererService: ThemeRendererService,
              private scriptInjector: ScriptInjectorService,
              @Optional() @SkipSelf() private globalThemeOutlet: ThemeOutletComponent,
              @Optional() private formScrollElement: OverlayScrollbarsComponent,
              @Inject(JSF_APP_CONFIG) private jsfAppConfig: JsfAppConfig,
              @Inject(JSF_API_SERVICE) private apiService: any,
              @Inject(JSF_APP_ROUTER) private appRouter: any,
              @Optional() @Inject(JSF_DEVELOPMENT_MODE) public developmentMode: boolean,
              @Optional() @Inject(JSF_RUNTIME_CONTEXT) public runtimeContext: JsfRuntimeContext,
              @Optional() @Inject(JSF_AUTH_USER_PROVIDER) public authUserProvider: JsfAbstractAuthUserProvider,
              @Optional() @Inject(JSF_AUTH_CUSTOMER_PROVIDER) public authCustomerProvider: JsfAbstractAuthCustomerProvider) {

    this.developmentMode = this.developmentMode || false;
    if (this.developmentMode) {
      console.log('%cJSF is running in development mode',
        'font-size: 20px; background: black; color: red; font-family: monospace; padding: 3px;');
    }

    if (formScrollElement) {
      this.scrollService.registerCustomScrollableElement(formScrollElement);
    }
  }

  ngOnInit() {
    const head                      = document.getElementsByTagName('head')[0];
    this.styleElement               = document.createElement('style');
    (this.styleElement as any).type = 'text/css';
    head.appendChild(this.styleElement);


    this.scriptElement      = document.createElement('script') as HTMLScriptElement;
    this.scriptElement.type = 'text/javascript';
    head.appendChild(this.scriptElement);

    this.componentInitialized = true;
  }


  ngAfterViewInit() {
    this.buildDocument().catch(e => {
      throw e;
    });
  }

  ngOnDestroy() {
    // Unsubscribe from all observables.
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

    this.cdRef = void 0;

    this.styleElement.remove();
    this.destroyBuilder();
  }

  private rebuildOnInputChange() {
    if (!this.componentInitialized) {
      return;
    }

    this.buildDocument().catch(e => {
      throw e;
    });
  }

  private destroyBuilder() {
    if (this.builder) {
      this.builder.onDestroy();
      this.builder = void 0;
    }
  }

  private getHandlerPaths(prop: JsfProp) {
    const handlers = [];


    if (prop.handler && prop.handler.type) {
      handlers.push(prop.handler.type);
    }

    if (isPropObject(prop)) {
      // ==> Object
      for (const key of Object.keys(prop.properties || {})) {
        handlers.push(...this.getHandlerPaths(prop.properties[key]));
      }

    } else if (isPropArray(prop)) {
      // ==> Array
      if (Array.isArray(prop.items)) {
        for (const x of prop.items) {
          handlers.push(...this.getHandlerPaths(x));
        }
      } else {
        handlers.push(...this.getHandlerPaths(prop.items));
      }
    }

    return handlers.filter(x => x !== 'any');
  }

  private preloadModules(prop: JsfProp): Promise<PreloadedModule[]> {
    const handlerPaths                        = this.getHandlerPaths(prop);
    const modules: Promise<PreloadedModule>[] = [];

    for (const path of uniq(handlerPaths)) {
      if (this.moduleCacheService.has(path)) {
        modules.push(Promise.resolve({
          path,
          module: this.moduleCacheService.get(path)
        } as PreloadedModule));
      } else {
        modules.push(this.loadHandlerModule(path));
      }
    }

    return Promise.all(modules);
  }

  private loadHandlerModule(handlerPath: string): Promise<PreloadedModule> {
    const pathTokens = handlerPath.split('/');
    if (pathTokens.length !== 2) {
      throw new Error(`Invalid handler module name format: ${ handlerPath }`);
    }

    const handlerCategory = pathTokens[0];
    const handlerName     = pathTokens[1];
    // tslint:disable-next-line
    const modulePath      = `${ this.jsfHandlersPath }${ handlerCategory }/handlers/${ handlerName }/app/${ handlerName }.module.ts#${ pascalcase(handlerName) }Module`;

    if (this.debug) {
      console.log(`Preloading module '${ modulePath }'`);
    }

    return new Promise<PreloadedModule>((resolve, reject) => {
      this.loader.load(modulePath)
        .then(module => {
          // Save module to module cache
          this.moduleCacheService.store(handlerPath, module);

          // Resolve the module
          resolve({
            path: handlerPath,
            module
          });
        })
        .catch(err => reject(err));
    });
  }

  public async buildDocument() {
    this.documentRebuildRequired = true;
    return this.buildDocumentInternal();
  }

  private async buildDocumentInternal() {
    if (this.documentBuilding) {
      return;
    }

    if (!this.doc || !this.styleElement) {
      return;
    }

    if (!this.componentInitialized) {
      return;
    }

    this.documentBuilding        = true;
    this.documentRebuildRequired = false;

    try {
      const modules = await this.preloadModules(this.doc.schema);
      await this.buildDocumentWithModules(this.doc, modules);

      this.documentBuilding = false;

      if (this.documentRebuildRequired) {
        return this.buildDocumentInternal();
      }
    } catch (e) {
      await this.runOnErrorHook(e);
    }
  }

  private async buildDocumentWithModules(doc: JsfDocument, modules: PreloadedModule[]) {
    const moduleMap = modules.reduce((x, m) => ({ ...x, [m.path]: m.module }), {});

    // Merge modes
    const modes = doc.$modes || [];
    doc.$modes  = uniq(modes.concat(this.modes || []));

    // Destroy existing builder instance
    this.destroyBuilder();

    // Create JSF builder instance
    this.builder = await JsfBuilder.create(doc, {
      debug   : this.debug,
      warnings: this.developmentMode,

      services: await this.getAvailableServices(),

      appRouter: this.appRouter || void 0,

      runtimeContext      : this.runtimeContext,
      authUserProvider    : this.authUserProvider || void 0,
      authCustomerProvider: this.authCustomerProvider || void 0,
      linkedBuilder       : this.linkedFormBuilder,

      onFormEvent   : this.runOnFormEventHook.bind(this), // Make sure to bind context here!
      onSubmit      : this.submitForm.bind(this), // Make sure to bind context here!
      onCustomEvent : this.runOnCustomEventHook.bind(this), // Make sure to bind context here!
      onVirtualEvent: this.runOnVirtualEventHook.bind(this), // Make sure to bind context here!
      onError       : this.runOnErrorHook.bind(this), // Make sure to bind context here!
      onNotification: this.runOnNotificationHook.bind(this), // Make sure to bind context here!

      ...this.builderOptions
    });
    if (this.debug) {
      console.log('Jsf builder instance created.', this.builder);
    }

    this.builder.jsfHandlersPath    = this.jsfHandlersPath;
    this.builder.jsfThemePath       = this.jsfThemePath;
    this.builder.cachedModules      = moduleMap;
    this.builder.innerScrollEnabled = this.innerScroll;

    // CON-741: Update the linked builder instance here, because it may have been changed while the JsfBuilder.create was being awaited.
    this.builder.linkedBuilder = this.linkedFormBuilder;

    this.builder.apiService = this.apiService;

    this.builder.valueChange
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(x => this.runOnValueChangeHook(x));


    if (doc.$style) {
      this.styleElement.appendChild(document.createTextNode(doc.$style));
    } else {
      this.styleElement.innerHTML = '';
    }

    if (doc.$scripts) {
      this.scriptElement.innerHTML = doc.$scripts.join(`\n;/* ------ */\n`);
    } else {
      this.scriptElement.innerHTML = '';
    }

    if (this.builder.hasMode(LayoutMode.Public)) {
      // Inject favicon & title
      if (doc.$favicon) {
        (<HTMLLinkElement>document.getElementById('document-favicon')).href = doc.$favicon;
      }

      // Note: Title is now handled by DFF.
      // if (doc.$title) {
      //  (<HTMLTitleElement>document.getElementById('document-title')).innerText =
      // this.builder.translationServer.get(doc.$title); }

      // Configure analytics
      if (doc.$analytics) {
        await this.analyticsService.configureAndInject(doc.$analytics);
      }
    }

    // Emit form builder instance
    await this.runOnFormBuilderCreatedHook();

    // Set flags
    this.showAllValidationErrors = (this.doc.$modes || []).indexOf(LayoutMode.New) === -1;


    if (this.containers) {
      await this.renderTheme(this.containers.first);
    }
  }

  private async getAvailableServices(): Promise<{ [key: string]: JsfAbstractService }> {
    const services: { [key: string]: JsfAbstractService } = {
      // Stripe service
      'stripe': new StripeService(this.scriptInjector)
    };

    return services;
  }

  // Hooks
  public async runOnErrorHook(e: any) {
    this.internalErrorMessage = e.message || 'Unknown error.';
    if (this.onError) {
      return this.onError(e);
    }
    throw e;
  }

  public async runOnSubmitHook() {
    if (this.onSubmit) {
      return this.onSubmit();
    }
    if (this.developmentMode) {
      console.warn(`onSubmit hook function not provided.`);
    }
  }

  public async runOnCustomEventHook(eventName: string, eventData: any, documentId?: string | ObjectID) {
    if (this.onCustomEvent) {
      return this.onCustomEvent(eventName, eventData, documentId);
    }
    if (this.developmentMode) {
      console.warn(`onCustomEvent hook function not provided.`);
    }
  }

  public async runOnVirtualEventHook(eventName: string, eventData: any) {
    if (this.onVirtualEvent) {
      return this.onVirtualEvent(eventName, eventData);
    }
    if (this.developmentMode) {
      console.warn(`onVirtualEvent hook function not provided.`);
    }
  }

  public async runOnFormBuilderCreatedHook() {
    if (this.onFormBuilderCreated) {
      return this.onFormBuilderCreated(this.builder);
    }
  }

  public async runOnValueChangeHook(value = this.builder.getValue()) {
    if (this.onValueChange) {
      return this.onValueChange(value);
    }
  }

  public async runOnFormEventHook(event: JsfFormEventInterface) {
    if (this.onFormEvent) {
      return this.onFormEvent(event);
    }
    if (this.developmentMode) {
      console.warn(`onFormEvent hook function not provided.`);
    }
  }

  public async runOnNotificationHook(notification: JsfNotificationInterface) {
    if (this.onNotification) {
      return this.onNotification(notification);
    }
  }


  // Themes
  private async renderTheme(container: ViewContainerRef) {
    if (!container || !this.builder) {
      return;
    }

    this.themeLoaded = false;
    this.cdRef.detectChanges(); // Notify angular of themeLoaded flag to angular.

    try {
      let componentInstance;
      if (this.enableThemeRender) {
        // Render form via theme component
        componentInstance = await this.themeRendererService.renderTheme(
          this.renderer,
          container,
          this.builder.doc.$theme,
          JsfThemeRenderMode.Form,
          {
            disableWrapperStyles: this.disableWrapperStyles
          });
      } else {
        // Render form directly
        let globalThemePreferences;
        if (this.globalThemeOutlet) {
          globalThemePreferences = this.globalThemeOutlet.preferences;
        } else if (this.themeRendererService.globalThemePreferences) {
          globalThemePreferences = this.themeRendererService.globalThemePreferences;
        }
        if (!globalThemePreferences) {
          throw new Error(`No global theme found. Please make sure the global application theme is rendered, or enable theme rendering for this ${ KalJsfDocComponent.name } instance.`);
        }

        container.clear();

        const factory      = this.resolver.resolveComponentFactory(FormOutletComponent);
        const componentRef = container.createComponent(factory);

        componentInstance = (componentRef.instance as FormOutletComponent);

        // Copy preferences over from the global theme.
        componentInstance.preferences = globalThemePreferences;
      }

      componentInstance.builder        = this.builder;
      componentInstance.developerTools = this.developerTools;

      this.themeLoaded = true;
    } catch (e) {
      this.themeLoaded = true;
      await this.runOnErrorHook(e);
    }

    this.cdRef.detectChanges();
  }


  /**
   * Default form submission implementation.
   * Can be overriden by subscribing to the `submit` event emitter.
   */
  private async submitForm() {
    // Show all validation errors
    this.showAllValidationErrors = true;
    if (this.cdRef) {
      this.cdRef.detectChanges();
    }

    // Check if someone is subscribed to our submit event.
    if (this.onSubmit) {
      return this.runOnSubmitHook();
    }

    if (this.formSubmissionInProgress) {
      throw new Error(`Attempt to submit form while previous request has not yet completed.`);
    }

    if (!this.builder.valid) {
      console.warn('Form data is not valid');
      // Do not throw here, this is a valid case.
      return false;
    }

    this.formSubmissionInProgress = true;
    this.cdRef.markForCheck();


    // Run pre-submit hooks
    try {
      await this.builder.runPreSubmitHooks();
    } catch (e) {
      // Pre-submit hooks failed
      this.formSubmissionInProgress = false;
      await this.runOnNotificationHook({
        level  : 'error',
        message: e.toString()
      });

      this.cdRef.markForCheck();
      return false;
    }

    // Send order to server
    try {
      const response = await this.createOrderFromData(this.builder.getJsonValue());

      this.formSubmissionInProgress = false;
      this.cdRef.markForCheck();

      return true;
    } catch (e) {
      // Order save failed
      this.formSubmissionInProgress = false;
      await this.runOnNotificationHook({
        level  : 'error',
        message: `Something went wrong while submitting the form, please try again.`
      });

      this.cdRef.markForCheck();
      throw e; // Let it be captured by application error handler
    }
  }

  private createOrderFromData(data: any): Promise<any> {
    const url = this.doc.$submit && this.doc.$submit.$api;
    if (!url) {
      throw new Error(`No submit URL provided by the document schema.`);
    }

    if (!this.apiService) {
      throw new Error('API service is not provided.');
    }

    return new Promise((resolve, reject) => {
      this.apiService.post(url, data)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(response => {
          resolve(response);
        }, error => {
          reject(error.message);
        });
    });
  }

  openDiagnostics() {
    (window as any).__jsfDiagnosticsActionFunCount = (window as any).__jsfDiagnosticsActionFunCount || 0;
    (window as any).__jsfDiagnosticsActionFunCount++;

    this.diagnosticsWindow = window.open(
      '/assets/_jsf-diagnostics.html?id=' + (window as any).__jsfDiagnosticsActionFunCount,
      '_blank',
      'width=980,height=650,left=200,top=100'
    );
    if ((this.builder as any).diagnosticsHook) {
      const tmpHook                         = (this.builder as any).diagnosticsHook;
      (this.builder as any).diagnosticsHook = (type, data) => {
        this.diagnosticsWindow.onDiagnosticsMessage(type, data);
        tmpHook(type, data);
      };
    } else {
      (this.builder as any).diagnosticsHook = (type, data) => this.diagnosticsWindow.onDiagnosticsMessage(type, data);
    }

    const actions = {
      'INIT-REQ': () => this.diagnosticsWindow ? this.diagnosticsWindow.onDiagnosticsMessage('_INIT', {
        builder: this.builder,
        id     : (window as any).__jsfDiagnosticsActionFunCount
      }) : console.log('DiagnosticsWindow already closed.')
    };

    (window as any)['__jsfDiagnosticsAction' + (window as any).__jsfDiagnosticsActionFunCount] =
      (type: string, data?: any) => {
        if (!actions[type]) {
          return console.error('JSF DIAG, invalid action', type, data);
        }
        actions[type](data);
      };
  }
}
