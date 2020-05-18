import { JsfLayoutRender2DNode } from '@kalmia/jsf-common-es2015';
import { Node }                  from './node';
import { Sprite }                from '../sprite';
import { Renderer }              from '../../renderer';
import { Container }             from '../container';
import { Text }                  from '../text';
import { TilingSprite }          from '../tiling-sprite';
import { Polygon }               from '../polygon';
import { NinePatchRect }         from '../nine-patch-rect';


export class NodeFactory {

  constructor(private renderer: Renderer) {
  }

  public createNode(parent: Node<PIXI.Container>, data: JsfLayoutRender2DNode, context?: any): Node<PIXI.Container> {
    if (isContainerNode(data)) {
      return new Container(this.renderer, parent, data, context);
    }

    if (isSpriteNode(data)) {
      return new Sprite(this.renderer, parent, data, context);
    }

    if (isTilingSpriteNode(data)) {
      return new TilingSprite(this.renderer, parent, data, context);
    }

    if (isTextNode(data)) {
      return new Text(this.renderer, parent, data, context);
    }

    if (isPolygonNode(data)) {
      return new Polygon(this.renderer, parent, data, context);
    }

    if (isNinePatchRectNode(data)) {
      return new NinePatchRect(this.renderer, parent, data, context);
    }

    throw new Error(`Unknown node type '${ data.type }'`);
  }
}

function isContainerNode(x: any): x is Container {
  return typeof x === 'object' && x.type === 'container';
}

function isSpriteNode(x: any): x is Sprite {
  return typeof x === 'object' && x.type === 'sprite';
}

function isTilingSpriteNode(x: any): x is Sprite {
  return typeof x === 'object' && x.type === 'tiling-sprite';
}

function isTextNode(x: any): x is Text {
  return typeof x === 'object' && x.type === 'text';
}

function isPolygonNode(x: any): x is Polygon {
  return typeof x === 'object' && x.type === 'polygon';
}

function isNinePatchRectNode(x: any): x is NinePatchRect {
  return typeof x === 'object' && x.type === 'nine-patch-rect';
}
