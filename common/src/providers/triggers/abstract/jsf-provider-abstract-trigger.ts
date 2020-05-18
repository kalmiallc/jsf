import { JsfBuilder, JsfUnknownPropBuilder } from '../../../builder';
import { JsfProviderCustomTrigger }          from '../../interfaces/jsf-provider-custom-trigger.interface';
import { JsfProviderExecutor }               from '../../jsf-provider-executor';

export abstract class JsfProviderAbstractTrigger<TriggerType extends JsfProviderCustomTrigger> {

  constructor(protected trigger: TriggerType,
              protected executor: JsfProviderExecutor,
              protected builder: JsfBuilder,
              protected propBuilder: JsfUnknownPropBuilder) {
  }

  abstract async register(): Promise<void>;

  abstract async unregister(): Promise<void>;

}
