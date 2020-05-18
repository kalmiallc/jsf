import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit
}                             from '@angular/core';
import {
  isBindable, isPropBuilderArray,
  isPropRef,
  JsfBuilder,
  JsfBuilderOptions,
  JsfDashboard,
  JsfDefinition,
  JsfFormEventInterface,
  JsfNotificationInterface, JsfPropBuilderArray,
  JsfPropBuilderObject,
  JsfPropRef,
  JsfWidget,
  ObjectID, PropStatus
}                             from '@kalmia/jsf-common-es2015';
import { cloneDeep, isEqual } from 'lodash';

import { JSF_APP_CONFIG, JsfAppConfig }             from '../common';
import { GridsterConfig }                           from 'angular-gridster2';
import { Observable, Subject, Subscription, timer } from 'rxjs';
import { debounce, filter, takeUntil }              from 'rxjs/operators';
import { BuilderDeveloperToolsInterface }           from '@kalmia/jsf-app/lib/kal-jsf-doc/builder-developer-tools.interface';
import * as OverlayScrollbars                       from 'overlayscrollbars';

export interface DataSourceRequestInterface {
  groupKey?: string;
  dataSourceKey: string;
  filter?: any[];
}

export interface DataSourceResponseInterface {
  groupKey?: string;
  dataSourceKey: string;
  filter?: any[];

  /**
   * Fore example dff::list would be:
   *  items: [....], pageIndex, pageSize, ...
   */
  value: any;
}

@Component({
  selector       : 'jsf-dashboard',
  templateUrl    : './kal-jsf-dashboard.component.html',
  styleUrls      : ['./kal-jsf-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KalJsfDashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  gridOptions: GridsterConfig;

  widgetInstances: {
    [key: string]: {
      error?: string,
      scrollOptions?: OverlayScrollbars.Options;
      filterSubscription?: Subscription,
      filterGroupsInfo?: {
        [indexKey: string]: { hash: string }
      },
      jsfBuilder?: JsfBuilder
    }
  }                              = {};
  forceInitialFiltersDataRequest = true;

  /**
   * List of open widget settings. Nothing important.
   */
  openWidgetSettings: {} = {};

  /**
   * Array of active data source requests. Used for merging together requests with same data.
   */
  dataSourceRequestActiveList: {
    req: DataSourceRequestInterface;
    observable: Observable<DataSourceResponseInterface>
  }[] = [];


  /**
   * Dashboard
   */
  private _dashboard: JsfDashboard;

  get dashboard(): JsfDashboard {
    return this._dashboard;
  }

  get gridDashboard() {
    return this.dashboard.layout.items;
  }

  @Input()
  set dashboard(value: JsfDashboard) {
    this._dashboard = value;
    this.initDashboard();
  }

  /**
   * Edit mode
   */
  private _edit: boolean;
  get edit(): boolean {
    return this._edit;
  }

  @Input()
  set edit(edit: boolean) {
    this._edit = edit;
    this.initDashboard();
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////

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
  }

  /**
   * Modes
   */
  private _modes: string[] = [];
  get modes(): string[] {
    return this._modes;
  }

  @Input()
  set modes(modes: string[]) {
    this._modes = modes;
  }

  /**
   * Whether the document should render its own theme.
   */
  @Input() enableThemeRender = false;

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
    this._onFormEvent = value;
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
    this._onCustomEvent = value;
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
    this._onVirtualEvent = value;
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
    this._onNotification = value;
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Called when the application should load data source with specific filters
   */
  private _dataSourceRequest: (req: DataSourceRequestInterface) => Observable<DataSourceResponseInterface>;
  @Input()
  get dataSourceRequest() {
    return this._dataSourceRequest;
  }

  set dataSourceRequest(value: (req: DataSourceRequestInterface) => Observable<DataSourceResponseInterface>) {
    if (value && isBindable(value)) {
      throw new Error(`Provided method for 'dataSourceRequest' is not bound to parent context. Try using the @Bind() decorator.`);
    }
    this._dataSourceRequest = value;
  }

  get allWidgetInstancesReady() {
    for (const widgetKey of Object.keys(this.dashboard.widgets)) {
      if (
        !this.widgetInstances[widgetKey]
        || (!this.widgetInstances[widgetKey].jsfBuilder && !this.widgetInstances[widgetKey].error)) {
        return false;
      }
    }
    return true;
  }

  constructor(
    private cdRef: ChangeDetectorRef,
    @Inject(JSF_APP_CONFIG) private jsfAppConfig: JsfAppConfig) {
  }

  ngOnInit() {
  }

  getWidget(widgetKey: string): JsfWidget {
    if (isPropRef(this.dashboard.widgets[widgetKey].definition as any)) {
      return {
        ...this.dashboard.widgets[widgetKey],
        definition: this.dashboard.externalDefinitions[(this.dashboard.widgets[widgetKey].definition as JsfPropRef).$ref]
      };
    } else {
      return this.dashboard.widgets[widgetKey];
    }
  }

  hasWidgetFilterSupport(widgetKey: string): JsfWidget {
    return (this.getWidget(widgetKey).definition as any).schema
      && (this.getWidget(widgetKey).definition as any).schema.properties.filter;
  }

  ngAfterViewInit() {

  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

    for (const widgetKey of Object.keys(this.dashboard.widgets)) {
      if (this.widgetInstances[widgetKey]) {
        if (this.widgetInstances[widgetKey].filterSubscription) {
          this.widgetInstances[widgetKey].filterSubscription.unsubscribe();
          this.widgetInstances[widgetKey].jsfBuilder = null;
        }
      }
    }
  }

  onGridInit(...args) {
    // console.log('onGridInit', args);
  }

  onEditChange(...args) {
    // console.log('Change', args);
  }

  removeWidgetClick($event, item) {
    $event.preventDefault();
    $event.stopPropagation();
    this.removeWidget(item);
  }

  toggleWidgetSettings($event, item) {
    $event.preventDefault();
    $event.stopPropagation();
    this.openWidgetSettings[item.items[0].key] = !this.openWidgetSettings[item.items[0].key];
  }

  private initDashboard() {
    this.gridOptions = {
      initCallback      : this.onGridInit,
      itemChangeCallback: this.onEditChange,
      itemResizeCallback: this.onEditChange,
      displayGrid       : this.edit ? 'always' : 'none',
      pushItems         : true,
      pushResizeItems   : true,
      draggable         : {
        enabled: this.edit
      },
      resizable         : {
        enabled: this.edit,
        handles: { s: true, e: true, n: true, w: true, se: true, ne: true, sw: true, nw: true }
      },
      margin            : 0,
      outerMargin       : false
    };

    this.reInitFilters();
  }

  private onWidgetsChange(onlyWidgets?: string[]) {
    this.reInitFilters(onlyWidgets);
    this.cdRef.detectChanges();
  }

  private reInitFilters(onlyWidgets?: string[]) {
    for (const widgetKey of onlyWidgets || Object.keys(this.dashboard.widgets)) {
      this.widgetInstances[widgetKey] = this.widgetInstances[widgetKey] || {};

      if (this.widgetInstances[widgetKey].filterSubscription) {
        this.widgetInstances[widgetKey].filterSubscription.unsubscribe();
      }

      this.widgetInstances[widgetKey].scrollOptions = {
        overflowBehavior: {
          x: 'hidden',
          y: this.dashboard.widgets[widgetKey].scroll ? 'scroll' : 'hidden'
        },
        scrollbars      : {
          autoHide     : 'leave',
          autoHideDelay: 800
        },
        resize          : 'none',
        paddingAbsolute : true
      };

      if (this.widgetInstances[widgetKey].jsfBuilder
        && (this.widgetInstances[widgetKey].jsfBuilder.propBuilder as JsfPropBuilderObject).properties['filter']) {
        this.widgetInstances[widgetKey].filterSubscription =
          (this.widgetInstances[widgetKey].jsfBuilder.propBuilder as JsfPropBuilderObject)


            .properties['filter'].statusChange
            .pipe(filter((x => x !== PropStatus.Pending)))
            //.properties['filter']
            //.valueChange

            .pipe(debounce(() => timer(250)))
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
              this.onWidgetFilterChange(widgetKey);
            });
      }
    }

    if (this.forceInitialFiltersDataRequest) {
      if (this.allWidgetInstancesReady) {
        this.forceInitialFiltersDataRequest = false;
        this.requestDataSources();
      }
    } else {
      this.requestDataSources();
    }
  }

  private requestDataSources() {
    if (this.edit) {
      return;
    }
    const dataSources: { [dataSource: string]: any[] }                               = {};
    const dataSourcesGroups: { [dataSource: string]: { [groupKey: string]: any[] } } = {};

    for (const widgetKey of Object.keys(this.dashboard.widgets)) {
      if (this.dashboard.widgets[widgetKey].dataSource) {
        dataSources[this.dashboard.widgets[widgetKey].dataSource] = dataSources[this.dashboard.widgets[widgetKey].dataSource] || [];
      }

      if (this.dashboard.widgets[widgetKey].filter) {
        if (!this.widgetInstances[widgetKey].jsfBuilder) {
          continue;
        }

        dataSources[this.dashboard.widgets[widgetKey].filter] = dataSources[this.dashboard.widgets[widgetKey].filter] || [];

        const rootProp = this.widgetInstances[widgetKey].jsfBuilder.propBuilder as JsfPropBuilderObject;
        if (isPropBuilderArray(rootProp.properties['filter'])) {
          if (!(rootProp.properties['filter'] as JsfPropBuilderArray).items || !(rootProp.properties['filter'] as JsfPropBuilderArray).items.length) {
            this.widgetInstances[widgetKey].filterGroupsInfo = {};
          } else {
            this.widgetInstances[widgetKey].filterGroupsInfo = this.widgetInstances[widgetKey].filterGroupsInfo || {};
          }

          const groupFilters = (rootProp.properties['filter'] as JsfPropBuilderArray)
            .items
            .map(x => x.getJsonValueWithHash())
            .forEach((x, i) => {
              if (this.widgetInstances[widgetKey].filterGroupsInfo[i]
                && this.widgetInstances[widgetKey].filterGroupsInfo[i].hash === x.hash) {
                return; // skip filter group did not change
              }
              this.widgetInstances[widgetKey].filterGroupsInfo[i] = { hash: x.hash };

              dataSourcesGroups[this.dashboard.widgets[widgetKey].filter]    = dataSourcesGroups[this.dashboard.widgets[widgetKey].filter] || {};
              dataSourcesGroups[this.dashboard.widgets[widgetKey].filter][i] = dataSourcesGroups[this.dashboard.widgets[widgetKey].filter][i] || [];
              dataSourcesGroups[this.dashboard.widgets[widgetKey].filter][i].push(this.dashboard.widgets[widgetKey].filter);
            })
        } else {
          const filterData = rootProp.properties['filter'].getValue();
          dataSources[this.dashboard.widgets[widgetKey].filter].push(filterData);
        }
      }
    }

    const dataSourcesList: { dataSourceKey: string, groupKey: string, filter: any[] }[] =
            Object.keys(dataSources)
              .map(x => ({
                dataSourceKey: x,
                filter       : dataSources[x],
                groupKey     : undefined
              }));
    for (const sourceKey of Object.keys(dataSourcesGroups)) {
      for (const groupKey of Object.keys(dataSourcesGroups[sourceKey])) {
        dataSourcesList.push({
          dataSourceKey: sourceKey,
          filter       : [
            ...dataSources[sourceKey],
            ...dataSourcesGroups[sourceKey][groupKey]
          ],
          groupKey     : groupKey
        });
      }
    }

    for (const widgetKey of Object.keys(this.dashboard.widgets)) {
      if (this.dashboard.widgets[widgetKey].dataSource) {
        for (const dataSource of dataSourcesList) {
          if (!this.widgetInstances[widgetKey].jsfBuilder) {
            continue;
          }

          if (dataSource.groupKey) {
            this.widgetInstances[widgetKey].jsfBuilder.onExternalEvent(
              'filter-' + dataSource.dataSourceKey + `/${ dataSource.groupKey }`,
              { ...dataSource, dataSources: dataSourcesList }
            );
            this.widgetInstances[widgetKey].jsfBuilder.onExternalEvent(
              'filter-' + dataSource.dataSourceKey + `/*`,
              { ...dataSource, dataSources: dataSourcesList }
            );
          } else {
            this.widgetInstances[widgetKey].jsfBuilder.onExternalEvent(
              'filter-' + dataSource.dataSourceKey,
              { ...dataSource, dataSources: dataSourcesList }
            );
          }
        }
      }
    }

    if (this.dataSourceRequest && dataSourcesList.length) {
      for (const dataSource of dataSourcesList) {
        const req: DataSourceRequestInterface = dataSource;

        const request$ = this.getDataSourceRequest(req);

        if (request$) {
          request$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(x => {
              this.removeDataSourceRequestFromActiveList(req);
              return this.onDataSourcesRes(x);
            });
        } else {
          console.log(`No data source returned for ${ dataSource.dataSourceKey }`, dataSource);
        }
      }
    }
  }

  private getDataSourceRequest(req: DataSourceRequestInterface): Observable<DataSourceResponseInterface> {
    const existingReq = this.dataSourceRequestActiveList.find(x => isEqual(req, x.req));
    if (existingReq) {
      return existingReq.observable;
    }

    const request$ = this.dataSourceRequest(req);

    this.dataSourceRequestActiveList.push({
      req,
      observable: request$
    });

    return request$;
  }

  private removeDataSourceRequestFromActiveList(req: DataSourceRequestInterface) {
    this.dataSourceRequestActiveList = this.dataSourceRequestActiveList.filter(x => !isEqual(req, x.req));
  }

  onDataSourcesRes(x: DataSourceResponseInterface) {
    console.log('[JSF-DASH] onDataSourcesRes', x);

    for (const widgetKey of Object.keys(this.dashboard.widgets)) {
      if (this.dashboard.widgets[widgetKey].dataSource) {
        console.log('[JSF-DASH] Emitting data to ' + widgetKey + '  SOURCE:' + x.dataSourceKey,
          x.value);

        if (!this.widgetInstances[widgetKey].jsfBuilder) {
          continue;
        }

        if (x.groupKey) {
          this.widgetInstances[widgetKey].jsfBuilder.onExternalEvent(
            x.dataSourceKey + `/${ x.groupKey }`,
            x
          );
          this.widgetInstances[widgetKey].jsfBuilder.onExternalEvent(
            x.dataSourceKey + `/*`,
            x
          );
        } else {
          this.widgetInstances[widgetKey].jsfBuilder.onExternalEvent(
            x.dataSourceKey,
            x
          );
        }
      }
    }
  }

  onWidgetFilterChange(widgetKey: string) {
    this.requestDataSources();
  }

  onWidgetJsfErrorCallback(widgetKey: string) {
    return this.onWidgetJsfError.bind(this, widgetKey);
  }

  onWidgetJsfError(widgetKey: string, error: any) {
    console.error('[JSF-DASH] Widget Jsf Error ' + widgetKey, { error });

    this.widgetInstances[widgetKey]       = this.widgetInstances[widgetKey] || {};
    this.widgetInstances[widgetKey].error = error.message || error;
  }

  onWidgetJsfBuilderCreateCallback(widgetKey: string) {
    return this.onWidgetJsfBuilderCreate.bind(this, widgetKey);
  }

  onWidgetJsfBuilderCreate(widgetKey: string, jsfBuilder: JsfBuilder) {
    console.log('[JSF-DASH] Widget JsfBuilder Create ' + widgetKey, { jsfBuilder });

    this.widgetInstances[widgetKey]            = this.widgetInstances[widgetKey] || {};
    this.widgetInstances[widgetKey].jsfBuilder = jsfBuilder;

    this.reInitFilters([widgetKey]);
  }

  removeWidget(item) {
    if (this.widgetInstances[item.items[0].key].filterSubscription) {
      this.widgetInstances[item.items[0].key].filterSubscription.unsubscribe();
    }

    delete this.widgetInstances[item.items[0].key];

    this.gridDashboard.splice(this.gridDashboard.indexOf(item), 1);

    this.onWidgetsChange();
  }

  export() {
    const exportObj        = cloneDeep(this.dashboard);
    exportObj.layout.items = cloneDeep(this.gridDashboard);
    return exportObj;
  }

  addWidget({ definition, externalDefinitionKey }: { definition: JsfDefinition, externalDefinitionKey?: string }) {
    let widgetKey = definition.$title || 'Untitled widget';
    let i         = 0;
    while (this.dashboard.widgets[widgetKey] !== undefined) {
      widgetKey = `${ definition.$title } (${ ++i })`;
    }

    if (externalDefinitionKey) {
      this._dashboard.externalDefinitions[externalDefinitionKey] = definition;
      this._dashboard.widgets[widgetKey]                         = {
        definition: {
          type: 'ref',
          $ref: externalDefinitionKey
        }
      };
    } else {
      this._dashboard.widgets[widgetKey] = { definition };
    }

    this.gridDashboard.push({
      type : 'grid-cell',
      items: [{ type: 'widget', key: widgetKey }]
    });

    this.onWidgetsChange([widgetKey]);
  }
}
