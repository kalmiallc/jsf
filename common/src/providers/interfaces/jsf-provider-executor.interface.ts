import { JsfProviderCustomTrigger } from './jsf-provider-custom-trigger.interface';

export interface JsfProviderExecutorInterface {

  /**
   * Name of the provider from the `$providers` map.
   */
  key: string;

  /**
   * List of dependencies which will trigger this provider to update.
   */
  dependencies?: string[];

  /**
   * Update mode. Defaults to 'set'.
   */
  mode?: 'set' | 'patch';

  /**
   * List of custom triggers for this provider.
   */
  customTriggers?: JsfProviderCustomTrigger[];

  /**
   * Optional hooks to various executor events.
   */
  hooks?: {
    /**
     * Called when executor status changes to IDLE.
     */
    onIdle?: {
      $eval: string;
    };

    /**
     * Called when executor status changes to PENDING.
     */
    onPending?: {
      $eval: string;
    }

    /**
     * Called when executor status changes to FAILED.
     */
    onFailed?: {
      $eval: string;
    }
  };

  /**
   * Enable debounce. Set to true to use the default debounce value (250ms), or you can specify your own time.
   */
  debounce?: boolean | number;

  /**
   * Optional condition to determine if the provider should run.
   * Return a truthy value to allow the provider to execute.
   */
  condition?: {
    $eval: string
  };

  /**
   * Flag indicating whether this executor should be considered as "async", meaning it will not block any form actions, such as the initial form load.
   * Defaults to false.
   */
  async?: boolean;

  /**
   * Optional data to pass to the provider.
   * This may be useful if for example you're calling a virtual event provider from inside an array. Since the provider
   * has no way of knowing which element in the array is executing the call you can provide the data yourself here.
   */
  providerRequestData?: {
    $eval: string;
  };

  /**
   * Optional eval which gets called once the executor receives the data. The eval should return the mapped data.
   * The eval context will contain a special variable `$response` which contains the data received from the server.
   */
  mapResponseData?: {
    $eval: string;
  };
}

export function isJsfProviderExecutor(x: any): x is JsfProviderExecutorInterface {
  return typeof x === 'object' && 'key' in x;
}
