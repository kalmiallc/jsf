export interface JsfProviderSourceVirtualEventInterface {
  /**
   * Name of virtual event.
   */
  virtualEvent: string;
}

export interface JsfProviderSourceEntityInterface {
  /**
   * Name of the entity to get data from.
   *
   * For DFF forms use value dff:<key>, for users use 'user' and for customers use 'customer'.
   * Examples:
   *  - dff:order
   *  - user
   *  - customer
   */
  entity: string;
}

export interface JsfProviderSourceEvalInterface {
  /**
   * The eval to run which should return a value to be provided.
   */
  $eval: string;
  /**
   * Whether the eval should be executed on the linked builder.
   */
  onLinked?: boolean;
}

export interface JsfProviderSourceApiInterface {
  /**
   * API route (or absolute URL) to fetch data from.
   *
   * Valid API option examples:
   *  - { api: 'crm/customer/documents' }
   *  - { api: 'dff/order/documents/virtual-event/abc' }
   *  - { api: 'https://example.com/data.json' }
   */
  api: string | {
    $eval: string
  };

  /**
   * If not set GET will be used.
   */
  reqType?: 'POST' | 'GET';
}

export type JsfProviderSource =
  JsfProviderSourceEntityInterface
  | JsfProviderSourceVirtualEventInterface
  | JsfProviderSourceEvalInterface
  | JsfProviderSourceApiInterface;

export interface JsfProviderInterface {
  /**
   * Where data should be provided from.
   * This can be either a virtual event (limited to the form's dff key), or the name of the entity (user, customer, ...)
   */
  source: JsfProviderSource;
  /**
   * Whether the provider should cache the requests based on the input data.
   * Defaults to true.
   */
  cache?: boolean;
  /**
   * Optional eval which gets called once the provider receives the data. The eval should return the mapped data.
   * The eval context will contain a special variable `$response` which contains the data received from the server.
   */
  mapResponseData?: {
    $eval: string;
  };

}

export interface JsfProviderDffEventInterface {
  /**
   * Contains a copy of the provider's 'source' property.
   */
  source: JsfProviderSource;

  /**
   * If source type is 'entity' then data will be an object containing the '_id' property.
   * If source type is 'virtualEvent' then data will contain any extra data as specified in 'providerRequestData' eval.
   */
  data: any;
}

export function isJsfProvider(x: any): x is JsfProviderInterface {
  return typeof x === 'object' && 'source' in x;
}

export function isJsfProviderSourceEntity(source: any): source is JsfProviderSourceEntityInterface {
  return typeof source === 'object' && 'entity' in source;
}

export function isJsfProviderSourceVirtualEvent(source: any): source is JsfProviderSourceVirtualEventInterface {
  return typeof source === 'object' && 'virtualEvent' in source;
}

export function isJsfProviderSourceEval(source: any): source is JsfProviderSourceEvalInterface {
  return typeof source === 'object' && '$eval' in source;
}

export function isJsfProviderSourceApi(source: any): source is JsfProviderSourceApiInterface {
  return typeof source === 'object' && 'api' in source;
}
