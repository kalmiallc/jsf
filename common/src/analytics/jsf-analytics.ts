import { JsfAnalyticsConfigurationGoogleAnalytics } from './vendors';

export interface JsfAnalytics {
  /**
   * Global flag to enable or disable all analytics for this schema.
   */
  enabled: boolean;

  /**
   * Configuration options for all supported vendors.
   */
  vendors: JsfAnalyticsVendors;
}

export interface JsfAnalyticsVendors {
  /**
   * Google Analytics
   */
  googleAnalytics: JsfAnalyticsConfigurationGoogleAnalytics;
}
