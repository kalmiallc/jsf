import { Node }      from './node';
import { NodeEvent } from './node-event.enum';


export class Fragment {

  /**
   * ID
   * This will match the node's ID
   */
  private _id: number;
  get id(): number {
    return this._id;
  }


  constructor(private node: Node<PIXI.Container>) {
    this._id = node.id;
  }

  /**
   * Proxy object for eval manipulation
   */
  get proxy(): any {
    return {
      update : this.update.bind(this),
      destroy: this.destroy.bind(this)
    };
  }

  public update() {
    return this.node.dispatchEvent(NodeEvent.Update);
  }

  public async destroy() {
    return this.node.destroy();
  }
}
