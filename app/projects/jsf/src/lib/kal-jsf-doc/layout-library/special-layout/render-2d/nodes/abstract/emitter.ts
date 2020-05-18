import { Node }                            from './node';
import { JsfLayoutRender2DEmitterOptions } from '@kalmia/jsf-common-es2015';
import { Renderer }                        from '../../renderer';


export abstract class Emitter {

  constructor(protected renderer: Renderer,
              protected node: Node<PIXI.Container>,
              protected options: JsfLayoutRender2DEmitterOptions) {
  }

  public abstract initialize();

  public abstract destroy();

  public abstract update();

}
