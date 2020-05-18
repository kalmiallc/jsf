import { ConsumeProviderValueOptionsInterface } from '../builder';
import { JsfProviderConsumerInterface }         from './interfaces/jsf-provider-consumer.interface';
import { isBindable }                           from '../decorators';

/**
 * This is a basic class that implements the consumer interface.
 * You can use it to have the provider call your function whenever data is provided.
 */
export class JsfProviderConsumer implements JsfProviderConsumerInterface {

  constructor(private fn: (jsonValue: any, options?: ConsumeProviderValueOptionsInterface) => Promise<void>) {
    if (isBindable(fn)) {
      throw new Error(`Provided consumer function is not bound to parent context. Try using the @Bind() decorator.`);
    }
  }

  consumeProviderValue(jsonValue: any, options?: ConsumeProviderValueOptionsInterface): Promise<void> {
    return this.fn(jsonValue, options);
  }

}
