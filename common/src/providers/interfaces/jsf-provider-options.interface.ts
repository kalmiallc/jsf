import { JsfUnknownPropBuilder }        from '../../builder/abstract';
import { JsfProviderConsumerInterface } from './jsf-provider-consumer.interface';

export interface JsfProviderOptionsInterface {
  /**
   * The consumer of the provided data.
   */
  consumer: JsfProviderConsumerInterface;
  /**
   * The prop builder which is consuming this provider.
   */
  propBuilder: JsfUnknownPropBuilder;

  /**
   * Custom data passed from the executor.
   */
  providerRequestData?: any;

  /**
   * Eval used for mapping the response data. This will be run AFTER the mapper defined on the provider itself.
   */
  mapResponseData?: {
    $eval: string;
  };

  /**
   * Update mode. Defaults to 'set'.
   */
  mode?: 'set' | 'patch';
}
