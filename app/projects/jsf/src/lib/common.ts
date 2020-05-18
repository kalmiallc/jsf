import { InjectionToken, NgModuleFactory } from '@angular/core';
import {
  JsfAbstractAuthCustomerProvider,
  JsfAbstractAuthUserProvider,
  JsfAbstractPageDataService,
  JsfAbstractRouter,
  JsfRuntimeContext
}                                          from '@kalmia/jsf-common-es2015';

export interface PreloadedModule {
  path: string;
  module: NgModuleFactory<any>;
}

export interface JsfAppConfig {
  /**
   * Path to themes submodule.
   */
  themePath: string;
  /**
   * Path to handlers directory.
   */
  handlersPath: string;

  /**
   * Flag indicating whether the CDK overlay should always be rendered by the theme renderer service.
   * This is mostly relevant only for development, so don't set this flag in configurator-app unless you know what you're doing!
   */
  alwaysRenderCdkOverlay: boolean;
}


/**
 * Provide this token with the app config.
 */
export const JSF_APP_CONFIG = new InjectionToken<JsfAppConfig>('JSF_APP_CONFIG');

/**
 * Provide this token with an instance of the app's api service.
 *
 * providers: [
 *   { provide: JSF_API_SERVICE; useExisting: ApiService }
 * ]
 */
export const JSF_API_SERVICE = new InjectionToken<any>('JSF_API_SERVICE');

/**
 * Provide this token to enable developer mode.
 */
export const JSF_DEVELOPMENT_MODE = new InjectionToken<boolean>('JSF_DEVELOPMENT_MODE');


/**
 * Provide this token with an instance of a JsfRouter.
 * This is required in order to allow the form to trigger router changes in the app.
 */
export const JSF_APP_ROUTER = new InjectionToken<JsfAbstractRouter>('JSF_APP_ROUTER');

/**
 * Provide this token with an instance of JsfAbstractBreadcrumbsService to provide breadcrumbs information..
 */
export const JSF_APP_PAGE_DATA = new InjectionToken<JsfAbstractPageDataService>('JSF_APP_PAGE_DATA');

/**
 * Provide this token with an instance of JsfAuthUserProviderInterface to provide authenticated user's data.
 */
export const JSF_AUTH_USER_PROVIDER     = new InjectionToken<JsfAbstractAuthUserProvider>('JSF_AUTH_USER_PROVIDER');

/**
 * Provide this token with an instance of JsfAuthCustomerProviderInterface to provide authenticated user's customer data.
 */
export const JSF_AUTH_CUSTOMER_PROVIDER = new InjectionToken<JsfAbstractAuthCustomerProvider>('JSF_AUTH_CUSTOMER_PROVIDER');
/**
 * Provide this token with client config.
 */
export const JSF_RUNTIME_CONTEXT = new InjectionToken<JsfRuntimeContext>('JSF_RUNTIME_CONTEXT');
