import { Node } from './node';

export abstract class NodeServer {

  private static readonly _nodes = {};

  public static get(id: any): Node<PIXI.Container> {
    return NodeServer._nodes[id];
  }

  public static store(id: any, node: Node<PIXI.Container>) {
    NodeServer._nodes[id] = node;
  }

  public static remove(id: any) {
    delete NodeServer._nodes[id];
  }

}
