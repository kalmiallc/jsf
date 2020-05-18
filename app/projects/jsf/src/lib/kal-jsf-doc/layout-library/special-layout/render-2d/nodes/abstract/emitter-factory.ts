import { JsfLayoutRender2DEmitter } from '@kalmia/jsf-common-es2015';
import { Renderer }                 from '../../renderer';
import { FragmentEmitter }          from '../emitters/fragment-emitter';
import { Node }                     from './node';
import { Emitter }                  from './emitter';


export class EmitterFactory {

  constructor(private renderer: Renderer) {
  }

  public createEmitter(node: Node<PIXI.Container>, data: JsfLayoutRender2DEmitter): Emitter {
    if (isFragmentEmitter(data)) {
      return new FragmentEmitter(this.renderer, node, data.options);
    }

    throw new Error(`Unknown emitter type '${ JSON.stringify(data) }'`);
  }

}

function isFragmentEmitter(x: JsfLayoutRender2DEmitter): x is JsfLayoutRender2DEmitter {
  return typeof x === 'object' && x.emitter === 'fragment';
}
