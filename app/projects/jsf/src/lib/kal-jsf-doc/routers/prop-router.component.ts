import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Injector,
  Input,
  NgModuleFactory,
  NgModuleFactoryLoader,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
  ViewContainerRef
}                                         from '@angular/core';
import { JsfPropLayoutBuilder }           from '@kalmia/jsf-common-es2015';
import { RouterComponent }                from './router.component';
import { pascalcase }                     from '../../utilities';
import { BuilderDeveloperToolsInterface } from '../builder-developer-tools.interface';
import { takeUntil }                      from 'rxjs/operators';
import { Subject }                        from 'rxjs';


// Note: this is TMP in v4 we will do routing programmatically

@Component({
  selector       : 'jsf-prop-router',
  template       : `
      <fieldset *ngIf="debug; else routerTpl">
          <legend style="font-size: 70%; color: #a216ff" (click)="debugLog(layoutBuilder)">
              Prop => {{ layoutBuilder.propBuilder.prop.type }},
              path => {{ layoutBuilder.propBuilder.path }},
              aPath => {{ layoutBuilder.propBuilder.abstractPath }},
              id => {{ layoutBuilder.propBuilder.id }},
              handler => {{ layoutBuilder.propBuilder.prop.handler?.type || '/' }},
              arrayMap =>
              <pre
                      style="font-size: 90%; color: green; display: inline-block; float: right;">{{ layoutBuilder.arrayPropMap | json
                  }}</pre>
          </legend>

          <ng-content *ngTemplateOutlet="routerTpl"></ng-content>
          <p *ngIf="propBuilder.disabled">[PROP DISABLED]</p>
      </fieldset>

      <ng-template #routerTpl>
          <!-- USE PROP HANDLER -->
          <ng-container *ngIf="layoutBuilder.propBuilder.prop.handler; else defaultProp"
                        [ngSwitch]="layoutBuilder.propBuilder.prop.handler.type">
              <!--<jsf-handler-file *ngSwitchCase="'file'" [layoutBuilder]="layoutBuilder"></jsf-handler-file>
              <jsf-handler-radio *ngSwitchCase="'radio'" [layoutBuilder]="layoutBuilder"></jsf-handler-radio>-->

              <ng-container *ngSwitchDefault>
                  <ng-container #customHandlerContainer></ng-container>
                  <ng-container *ngIf="customHandlerNotFound">
                      <pre>Unknown handler: {{ layoutBuilder.propBuilder.prop.handler | json }}</pre>
                  </ng-container>
              </ng-container>
          </ng-container>

          <!-- USE DEFAULT PROP COMPONENT -->
          <ng-template #defaultProp>
              <ng-container [ngSwitch]="layoutBuilder.propBuilder.prop.type">
                  <jsf-prop-string *ngSwitchCase="'string'"
                                   [layoutBuilder]="layoutBuilder"
                                   [developerTools]="developerTools">
                  </jsf-prop-string>
                  <jsf-prop-number *ngSwitchCase="'number'"
                                   [layoutBuilder]="layoutBuilder"
                                   [developerTools]="developerTools">
                  </jsf-prop-number>
                  <jsf-prop-integer *ngSwitchCase="'integer'"
                                    [layoutBuilder]="layoutBuilder"
                                    [developerTools]="developerTools">
                  </jsf-prop-integer>
                  <jsf-prop-binary *ngSwitchCase="'binary'"
                                   [layoutBuilder]="layoutBuilder"
                                   [developerTools]="developerTools">
                  </jsf-prop-binary>
                  <jsf-prop-boolean *ngSwitchCase="'boolean'"
                                    [layoutBuilder]="layoutBuilder"
                                    [developerTools]="developerTools">
                  </jsf-prop-boolean>
                  <jsf-prop-date *ngSwitchCase="'date'"
                                 [layoutBuilder]="layoutBuilder"
                                 [developerTools]="developerTools">
                  </jsf-prop-date>
                  <jsf-prop-object *ngSwitchCase="'object'"
                                   [layoutBuilder]="layoutBuilder"
                                   [developerTools]="developerTools">
                  </jsf-prop-object>
                  <jsf-prop-ref *ngSwitchCase="'ref'"
                                [layoutBuilder]="layoutBuilder"
                                [developerTools]="developerTools">
                  </jsf-prop-ref>
                  <jsf-prop-id *ngSwitchCase="'id'"
                               [layoutBuilder]="layoutBuilder"
                               [developerTools]="developerTools">
                  </jsf-prop-id>


                  <!-- Array -->
                  <ng-container *ngSwitchCase="'array'">
                      <jsf-prop-array *ngIf="layoutType === 'array'"
                                      [layoutBuilder]="layoutBuilder"
                                      [developerTools]="developerTools">
                      </jsf-prop-array>
                      <jsf-prop-table *ngIf="layoutType === 'table'"
                                      [layoutBuilder]="layoutBuilder"
                                      [developerTools]="developerTools">
                      </jsf-prop-table>
                      <jsf-prop-expansion-panel *ngIf="layoutType === 'expansion-panel'"
                                                [layoutBuilder]="layoutBuilder"
                                                [developerTools]="developerTools">
                      </jsf-prop-expansion-panel>
                  </ng-container>

                  <!-- Null -->
                  <ng-container *ngSwitchCase="'null'"></ng-container>

                  <pre *ngSwitchDefault>Unknown prop type: {{ layoutBuilder.propBuilder.prop.type }}</pre>
              </ng-container>
          </ng-template>
      </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropRouterComponent extends RouterComponent implements OnInit, OnDestroy, AfterViewInit {

  customHandlerNotFound = false;

  @Input()
  layoutBuilder: JsfPropLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  @HostBinding('attr.jsf-prop-id')
  idAttr;

  @ViewChildren('customHandlerContainer', { read: ViewContainerRef })
  containers: QueryList<ViewContainerRef>;

  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  get layoutType(): string {
    return this.layoutBuilder.layout.type;
  }

  get debug() {
    return this.layoutBuilder && this.layoutBuilder.rootBuilder && this.layoutBuilder.rootBuilder.debug;
  }

  get propBuilder() {
    return this.layoutBuilder.propBuilder;
  }

  constructor(private loader: NgModuleFactoryLoader,
              private injector: Injector,
              private cdRef: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
    this.idAttr = this.propBuilder.id;
  }

  /**
   * Destroy.
   */
  ngOnDestroy(): void {
    // Detach change detector.
    this.cdRef.detach();

    // Unsubscribe from all observables.
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  async ngAfterViewInit() {
    try {
      await this.renderCustomHandler(this.containers.first);
    } catch (e) {
      console.error('FIXME', e);
    }
  }

  private async renderCustomHandler(container: ViewContainerRef) {
    if (!container) {
      return;
    }

    container.clear();

    const handlerPath = this.layoutBuilder.propBuilder.prop.handler && this.layoutBuilder.propBuilder.prop.handler.type;
    if (!handlerPath) {
      this.customHandlerNotFound = true;
      return this.cdRef.detectChanges();
    }

    // Use cached module factory if it exists.
    const cachedModules = this.layoutBuilder.rootBuilder.cachedModules || {};
    if (cachedModules[handlerPath]) {
      if (this.debug) {
        console.log(`Using preloaded module '${ handlerPath }'`);
      }

      await this.createHandlerComponent(container, cachedModules[handlerPath]);
      this.customHandlerNotFound = false;

      return this.cdRef.detectChanges();
    }

    // No preloaded module found, create the module factory now.
    const jsfHandlersPath = this.layoutBuilder.rootBuilder.jsfHandlersPath;
    const pathTokens      = handlerPath.split('/');
    if (pathTokens.length !== 2) {
      throw new Error(`Invalid handler module name format: ${ handlerPath }`);
    }

    const handlerCategory = pathTokens[0];
    const handlerName     = pathTokens[1];
    // tslint:disable-next-line
    const modulePath      = `${ jsfHandlersPath }${ handlerCategory }/handlers/${ handlerName }/app/${ handlerName }.module.ts#${ pascalcase(handlerName) }Module`;

    if (this.layoutBuilder.rootBuilder.warnings) {
      console.warn(`Prop '${ this.layoutType }' handler module '${ modulePath }' not found in module cache.`);
    }

    try {
      const moduleFactory: NgModuleFactory<any> = await this.loader.load(modulePath);
      // Insert module into cache
      cachedModules[handlerPath]                = moduleFactory;

      await this.createHandlerComponent(container, moduleFactory);
      this.customHandlerNotFound = false;
    } catch (e) {
      this.customHandlerNotFound = true;
      console.error(e);
    }

    this.cdRef.detectChanges();
  }

  private async createHandlerComponent(container: ViewContainerRef, moduleFactory: NgModuleFactory<any>) {
    // Load main entry component from module
    const entryComponent = (<any>moduleFactory.moduleType).entryComponent;
    const moduleRef      = moduleFactory.create(this.injector);
    const compFactory    = moduleRef.componentFactoryResolver.resolveComponentFactory(entryComponent);
    const componentRef   = container.createComponent(compFactory);

    // Set input values
    (componentRef.instance as any).layoutBuilder = this.layoutBuilder;
  }

  debugLog(x) {
    console.log(x);
  }
}
