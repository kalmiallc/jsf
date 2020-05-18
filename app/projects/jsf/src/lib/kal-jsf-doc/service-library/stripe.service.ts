import { JsfAbstractService }    from '@kalmia/jsf-common-es2015';
import { ScriptInjectorService } from '../services/script-injector.service';

declare const Stripe;

export class StripeService extends JsfAbstractService {

  private readonly scriptUrl = 'https://js.stripe.com/v3/';

  constructor(private scriptInjector: ScriptInjectorService) {
    super();
  }

  public async onInit(): Promise<void> {
    // Load Stripe SDK.
    await this.scriptInjector.injectScriptFromUrl(this.scriptUrl);

    // Verify SDK is loaded.
    if (!Stripe || !(window as any).Stripe) {
      throw new Error(`Stripe SDK failed to load.`);
    }
  }

  public async onDestroy(): Promise<void> {
  }

  public async onAction(action: string, data: any): Promise<any> {
    switch (action) {
      case 'checkout': {
        if (!data) {
          throw new Error(`Checkout action requires data object with properties "publishableKey" and "sessionId".`);
        }
        return this.checkout(data.publishableKey, data.sessionId);
      }
      default: {
        throw new Error(`Unknown action "${ action }"`);
      }
    }
  }

  /**
   * Actions
   */

  /**
   * Redirects the user to Stripe's Checkout page.
+   */
  private async checkout(publishableKey: string, sessionId: string) {
    if (!publishableKey) {
      throw new Error(`Missing publishable key.`);
    }

    if (!sessionId) {
      throw new Error(`Missing checkout session id.`);
    }


    const stripe = Stripe(publishableKey);

    const { error } = await stripe.redirectToCheckout({
      sessionId
    });

    if (error) {
      await this.builder.runOnNotificationHook({
        level: 'error',
        title: 'Checkout',
        message: 'Failed to launch checkout flow, please refresh the page and try again.'
      });
      throw new Error(error.message);
    }
  }
}
