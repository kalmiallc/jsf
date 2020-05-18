import { JsfAnalyticsConfigurationGoogleAnalytics } from '@kalmia/jsf-common-es2015';
import { ScriptInjectorService }                    from '../../services/script-injector.service';

export class GoogleAnalyticsInjector {

  constructor(private scriptInjector: ScriptInjectorService) {
  }

  async inject(config: JsfAnalyticsConfigurationGoogleAnalytics): Promise<void> {

    await this.scriptInjector.injectScriptFromUrl(`https://www.googletagmanager.com/gtag/js?id=${ config.trackingId }`);

    await this.scriptInjector.injectScript(`
      window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
      
        gtag('config', '${ config.trackingId }');
    `);

  }

}
