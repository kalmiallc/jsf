import { Node }                                                 from './abstract/node';
import { NodeProperty, NodePropertyGetter, NodePropertySetter } from './abstract/node-decorators';

export class Container extends Node<PIXI.Container> {

  @NodeProperty()
  public name: string;

  @NodeProperty()
  public visible: boolean;

  @NodeProperty()
  public x: number;

  @NodeProperty()
  public y: number;

  @NodeProperty()
  public scaleX: number;

  @NodeProperty()
  public scaleY: number;

  @NodeProperty()
  public pivotX: number;

  @NodeProperty()
  public pivotY: number;

  @NodeProperty()
  public alpha: number;

  protected async createDisplayObject() {
    this.displayObject = new PIXI.Container();
  }

  protected async destroyDisplayObject() {
    this.displayObject.destroy();
  }

  @NodePropertySetter('scaleX')
  setContainerScaleX() {
    this.displayObject.scale.x = this.scaleX;
  }

  @NodePropertyGetter('scaleX')
  getContainerScaleX() {
    return this.displayObject.scale.x;
  }

  @NodePropertySetter('scaleY')
  setContainerScaleY() {
    this.displayObject.scale.y = this.scaleY;
  }

  @NodePropertyGetter('scaleY')
  getContainerScaleY() {
    return this.displayObject.scale.y;
  }

  @NodePropertySetter('pivotX')
  setContainerPivotX() {
    this.displayObject.pivot.x = this.pivotX;
  }

  @NodePropertyGetter('pivotX')
  getContainerPivotX() {
    return this.displayObject.pivot.x;
  }

  @NodePropertySetter('pivotY')
  setContainerPivotY() {
    this.displayObject.pivot.y = this.pivotY;
  }

  @NodePropertySetter('pivotY')
  getContainerPivotY() {
    return this.displayObject.pivot.y;
  }

}
