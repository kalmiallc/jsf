import { BrowserModule }                                      from '@angular/platform-browser';
import { NgModule }                                           from '@angular/core';
import { AppComponent }                                       from './app.component';
import {
  JSF_API_SERVICE,
  JSF_APP_CONFIG,
  JSF_APP_PAGE_DATA,
  JSF_APP_ROUTER,
  JSF_AUTH_CUSTOMER_PROVIDER,
  JSF_AUTH_USER_PROVIDER,
  JSF_DEVELOPMENT_MODE,
  JSF_RUNTIME_CONTEXT,
  JsfAppConfig,
  JsfModule,
  KalJsfDashboardModule
}                                                             from '@kalmia/jsf-app';
import { BrowserAnimationsModule }                            from '@angular/platform-browser/animations';
import { SharedModule }                                       from './shared/shared.module';
import { MonacoEditorModule }                                 from 'ngx-monaco-editor';
import { HttpClientModule }                                   from '@angular/common/http';
import { Angulartics2RouterlessModule }                       from 'angulartics2/routerlessmodule';
import { AppRoutingModule }                                   from './app-routing.module';
import { LayoutModule }                                       from './layout/layout.module';
import { SystemModule }                                       from './system/system.module';
import { ApiService }                                         from './services/api.service';
import { AuthUserProvider }                                   from './services/auth-user-provider';
import { AuthCustomerProvider }                               from './services/auth-customer-provider';
import { AppRouterService }                                   from './services/app-router.service';
import { AppPageDataService }                                 from './services/app-page-data.service';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { TreeModule }                                     from 'angular-tree-component';
import { JsfRuntimeContext }                              from '@kalmia/jsf-common-es2015';
import { OverlayscrollbarsModule }                        from 'overlayscrollbars-ngx';


(window as any)._diagnostics = true;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
const DATE_FORMATS = {
  parse  : {
    dateInput: 'D.M.YYYY'
  },
  display: {
    dateInput         : 'D.M.YYYY',
    monthYearLabel    : 'MMM YYYY',
    dateA11yLabel     : 'D.M.YYYY',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports     : [
    BrowserModule,
    BrowserAnimationsModule,
    MonacoEditorModule.forRoot(),
    Angulartics2RouterlessModule.forRoot(),
    TreeModule.forRoot(),
    HttpClientModule,
    SharedModule,
    SystemModule,
    JsfModule,
    LayoutModule,
    AppRoutingModule,
    KalJsfDashboardModule,
    OverlayscrollbarsModule,
  ],
  providers   : [
    {
      provide : MAT_MOMENT_DATE_ADAPTER_OPTIONS,
      useValue: {
        useUtc: true
      }
    },
    {
      provide : MAT_DATE_FORMATS,
      useValue: DATE_FORMATS
    },
    {
      provide : DateAdapter,
      useClass: MomentDateAdapter,
      deps    : [MAT_DATE_LOCALE, MAT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    {
      provide : JSF_APP_CONFIG,
      useValue: <JsfAppConfig>{
        themePath             : 'src/jsf-themes/',
        handlersPath          : 'src/jsf-handlers/',
        alwaysRenderCdkOverlay: true
      }
    },
    {
      provide : JSF_RUNTIME_CONTEXT,
      useValue: <JsfRuntimeContext>{
        application: {
          language: 'en'
        }
      }
    },
    {
      provide    : JSF_API_SERVICE,
      useExisting: ApiService
    },
    {
      provide    : JSF_APP_ROUTER,
      useExisting: AppRouterService
    },
    {
      provide    : JSF_APP_PAGE_DATA,
      useExisting: AppPageDataService
    },
    {
      provide : JSF_DEVELOPMENT_MODE,
      useValue: true
    },
    {
      provide    : JSF_AUTH_USER_PROVIDER,
      useExisting: AuthUserProvider
    },
    {
      provide    : JSF_AUTH_CUSTOMER_PROVIDER,
      useExisting: AuthCustomerProvider
    }
  ],
  bootstrap   : [AppComponent]
})
export class AppModule {}
