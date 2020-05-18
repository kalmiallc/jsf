export interface JsfProviderIntervalTriggerInterface {
  /**
   * Execute the provider every "interval" milliseconds.
   */
  interval: number;
}

export interface JsfProviderNameTriggerInterface {
  /**
   * Execute the provider when called by a specific name (tag).
   */
  name: string;
}

export type JsfProviderCustomTrigger = JsfProviderIntervalTriggerInterface | JsfProviderNameTriggerInterface;

export function isJsfProviderIntervalTrigger(x: any): x is JsfProviderIntervalTriggerInterface {
  return typeof x === 'object' && 'interval' in x;
}

export function isJsfProviderNameTrigger(x: any): x is JsfProviderNameTriggerInterface {
  return typeof x === 'object' && 'name' in x;
}
