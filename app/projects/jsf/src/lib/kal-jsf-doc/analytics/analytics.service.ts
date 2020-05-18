import { Injectable }                                                                  from '@angular/core';
import { GoogleAnalyticsInjector }                                                     from './injectors/google-analytics';
import { JsfAnalytics, JsfAnalyticsConfigurationGoogleAnalytics, JsfAnalyticsVendors } from '@kalmia/jsf-common-es2015';
import { Angulartics2 }                                                                from 'angulartics2';
import { AnalyticsEvent }                                                              from '../abstract/layout.component';
import { Angulartics2GoogleGlobalSiteTag }                                             from 'angulartics2/gst';
import { ScriptInjectorService }                                                       from '../services/script-injector.service';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  // Track configured state
  private _configured = {
    googleAnalytics: false
  };
  get configured() {
    return this._configured;
  }

  constructor(private scriptInjector: ScriptInjectorService,
              private angulartics2GoogleGlobalSiteTag: Angulartics2GoogleGlobalSiteTag,
              private angulartics2: Angulartics2) {
  }


  /**
   * Configure services & inject vendor-specific code into the page.
   */
  async configureAndInject(analyticsConfiguration: JsfAnalytics): Promise<void> {
    if (!analyticsConfiguration.enabled) {
      return;
    }

    const vendors = analyticsConfiguration.vendors || {} as JsfAnalyticsVendors;

    // Inject analytics code
    await this.configureGoogleAnalytics(vendors.googleAnalytics);
  }


  /**
   * Track a custom event
   * @param event The event definition
   * @param value Optional value to track
   */
  trackEvent(event: AnalyticsEvent, value?: number) {
    return this.trackRawEvent(event.as, event.category, undefined, value);
  }

  /**
   * Track a custom raw event.
   * @param action The type of interaction (e.g. 'play')
   * @param category Typically the object that was interacted with (e.g. 'Video')
   * @param label Useful for categorizing events (e.g. 'Fall Campaign')
   * @param value A numeric value associated with the event (e.g. 42)
   */
  trackRawEvent(action: string, category: string, label?: string, value?: number) {
    this.angulartics2.eventTrack.next({
      action,
      properties: {
        category,
        label,
        value
      }
    });
  }

  /**
   * Send an ecommerce event to google analytics.
   * See ecommerce docs for action and properties.
   * @param action Type of ecommerce action
   * @param ecommerceProperties: Properties for the action
   */
  trackGoogleAnalyticsEcommerceEvent(action: string, ecommerceProperties: any) {
    const data = {
      action,
      properties: {
        gstCustom: {
          ...ecommerceProperties
        }
      }
    };
    // console.log('tracking event:', data);
    this.angulartics2.eventTrack.next(data);
  }


  /**
   * Google analytics
   */
  private async configureGoogleAnalytics(config: JsfAnalyticsConfigurationGoogleAnalytics) {
    if (!config || this.configured.googleAnalytics) {
      return;
    }

    await (new GoogleAnalyticsInjector(this.scriptInjector).inject(config));

    this.angulartics2GoogleGlobalSiteTag.startTracking();

    this.configured.googleAnalytics = true;
  }
}
