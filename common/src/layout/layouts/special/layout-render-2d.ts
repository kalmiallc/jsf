import { JsfAbstractSpecialLayout }       from '../../abstract/abstract-layout';
import { DefExtends, DefLayout, DefProp, DefCategory } from '../../../jsf-for-jsf/decorators';

@DefLayout({
  type : 'div',
  items: [
    {
      type     : 'div',
      htmlClass: 'ml-2 mt-3',
      items    : [
        {
          type : 'heading',
          title: 'Viewport',
          level: 5
        },
        {
          key: 'viewport.width'
        },
        {
          key: 'viewport.height'
        },
        {
          key: 'viewport.transparent'
        },
        {
          key: 'viewport.backgroundColor'
        },
        {
          key: 'viewport.resolution'
        }
      ]
    },
    {
      type     : 'div',
      htmlClass: 'ml-2 mt-3',
      items    : [
        {
          type : 'heading',
          title: 'Screenshot',
          level: 5
        },
        {
          key: 'screenshot.key'
        }
      ]
    }

  ]
})

@DefExtends('JsfAbstractSpecialLayout')
@DefCategory('Layout')
export class JsfLayoutRender2D extends JsfAbstractSpecialLayout<'render-2d'> {

  @DefProp({
    type      : 'object',
    title     : 'Viewport',
    properties: {
      width          : {
        type : 'number',
        title: 'Width'
      },
      height         : {
        type : 'number',
        title: 'Height'
      },
      transparent    : {
        type : 'string',
        title: 'Transparent'
      },
      backgroundColor: {
        type : 'number',
        title: 'Background color'
      },
      resolution     : {
        type : 'number',
        title: 'Resolution'
      },
      frameRate      : {
        type   : 'integer',
        title  : 'Maximum frame rate',
        minimum: 1
      }
    }
  })
  viewport?: {
    width?: number;
    height?: number;

    transparent?: boolean;
    backgroundColor?: string;

    resolution?: number;

    frameRate?: number;
  };

  @DefProp({
    type      : 'object',
    title     : 'Screenshot',
    properties: {
      key: {
        type : 'string',
        title: 'Key'
      }
    }
  })
  screenshot?: {
    key: string;
  };

  ssr?: {
    /**
     * Set to true to enable SSR rendering.
     */
    enabled: boolean;
    /**
     * Optional override for which dff key to use.
     */
    dffKey?: string;
    /**
     * Set to true to always force pure SSR mode.
     */
    alwaysUseSSR?: boolean;
    /**
     * If set to true the renderer will initially use SSR until the realtime renderer has finished loading.
     */
    preloadWithSSR?: boolean;
  };

  resourceLoader?: {
    /**
     * If set to true all the renderers in the form will share the same resource loader instance.
     */
    sharedInstance?: boolean;
    /**
     * Whether the resource loader should automatically upload dynamic textures (those not defined in the resources object) to GPU. Defaults to false.
     */
    uploadDynamicTexturesToGPU?: boolean;
  };

  resources?: {
    [resourceName: string]: string | JsfLayoutRender2DResource;
  };

  fragments?: {
    [fragmentId: string]: JsfLayoutRender2DNode
  };

  @DefProp('JsfLayoutRender2DNode[]')
  nodes: JsfLayoutRender2DNode[];

  constructor(data: JsfLayoutRender2D) {
    super();
    Object.assign(this, data);
  }
}

export interface JsfLayoutRender2DSpriteResource {
  type?: 'sprite';
  url?: string;
  preload?: boolean;
}

export interface JsfLayoutRender2DSpriteSheetResource {
  type?: 'spritesheet';
  url?: string;
  preload?: boolean;
}

export type JsfLayoutRender2DResource = JsfLayoutRender2DSpriteResource | JsfLayoutRender2DSpriteSheetResource;

export function isJsfLayoutRender2DResourceObject(x: any): x is JsfLayoutRender2DResource {
  return typeof x === 'object' && 'type' in x;
}

export function isJsfLayoutRender2DSpriteResource(x: any): x is JsfLayoutRender2DSpriteResource {
  return typeof x === 'object' && 'type' in x && x.type === 'sprite';
}

export function isJsfLayoutRender2DSpriteSheetResource(x: any): x is JsfLayoutRender2DSpriteSheetResource {
  return typeof x === 'object' && 'type' in x && x.type === 'spritesheet';
}

export interface JsfLayoutRender2DNode {
  type: 'container' | 'sprite' | 'tiling-sprite' | 'text' | 'polygon' | 'nine-patch-rect';

  nodes: JsfLayoutRender2DNode[] | JsfLayoutRender2DEmitter;

  fragments?: {
    [fragmentId: string]: JsfLayoutRender2DNode
  };

  events?: {
    create?: JsfLayoutRender2DEvalObject,
    destroy?: JsfLayoutRender2DEvalObject,
    update?: JsfLayoutRender2DEvalObject,
    tick?: JsfLayoutRender2DEvalObject,
  };

  // Type-specific node properties
  [key: string]: any;
}

export interface JsfLayoutRender2DEmitter {
  emitter: 'fragment';

  options: JsfLayoutRender2DEmitterOptions;
}

export interface JsfLayoutRender2DFragmentEmitterOptions {
  fragment: string | JsfLayoutRender2DNode;

  source: any[] | JsfLayoutRender2DEvalObject;

  updateMode?: 'replace';
}

export type JsfLayoutRender2DEmitterOptions = JsfLayoutRender2DFragmentEmitterOptions;

export function isJsfLayoutRender2DEmitter(x: any): x is JsfLayoutRender2DEmitter {
  return typeof x === 'object' && 'emitter' in x;
}

export function isJsfLayoutRender2DNodeArray(x: any): x is JsfLayoutRender2DNode[] {
  return Array.isArray(x);
}

export interface JsfLayoutRender2DEvalObject {
  $eval: string;
  $evalTranspiled?: string;
  dependencies?: [];
  layoutDependencies?: [];
}
