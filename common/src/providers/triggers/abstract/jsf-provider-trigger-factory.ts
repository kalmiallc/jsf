import { JsfProviderAbstractTrigger }        from './jsf-provider-abstract-trigger';
import { JsfProviderIntervalTrigger }        from '../jsf-provider-interval-trigger';
import { JsfBuilder, JsfUnknownPropBuilder } from '../../../builder';
import { JsfProviderExecutor }               from '../../jsf-provider-executor';
import {
  isJsfProviderIntervalTrigger,
  isJsfProviderNameTrigger,
  JsfProviderCustomTrigger
}                                            from '../../interfaces/jsf-provider-custom-trigger.interface';

export class JsfProviderTriggerFactory {

  public static createTrigger(trigger: JsfProviderCustomTrigger,
                              executor: JsfProviderExecutor,
                              builder: JsfBuilder,
                              propBuilder: JsfUnknownPropBuilder): JsfProviderAbstractTrigger<JsfProviderCustomTrigger> {
    if (isJsfProviderIntervalTrigger(trigger)) {
      return new JsfProviderIntervalTrigger(trigger, executor, builder, propBuilder);
    }

    if (isJsfProviderNameTrigger(trigger)) {
      throw new Error('Not implemented');
    }

    throw new Error(`Unknown provider trigger type ${ trigger }`);
  }

}
