import { JsfBuilder } from '../builder';

export abstract class JsfAbstractService {

  protected builder: JsfBuilder;
  protected config: { [key: string]: any};

  /**
   * Called when service gets created.
   * You should never call this yourself, it will be called by JsfBuilder.
   */
  public async onCreate(builder: JsfBuilder,
                 config?: { [key: string]: any }): Promise<void> {
    this.builder = builder;
    this.config = config;
  }

  /**
   * Hooks
   */

  abstract async onInit(): Promise<void>;

  abstract async onDestroy(): Promise<void>;

  /**
   * Main goal of service is to extend functionality via actions support.
   * @param action
   * @param data
   */
  abstract async onAction(action: string, data: any): Promise<any>;

}
