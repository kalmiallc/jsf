import { ConsumeProviderValueOptionsInterface } from '../../builder/interfaces';

export interface JsfProviderConsumerInterface {

  consumeProviderValue(jsonValue: any, options?: ConsumeProviderValueOptionsInterface): Promise<void>;

}
