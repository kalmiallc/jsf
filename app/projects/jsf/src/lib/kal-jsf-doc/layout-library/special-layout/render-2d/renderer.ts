import { JsfLayoutRender2D, JsfLayoutRender2DNode, JsfSpecialLayoutBuilder } from '@kalmia/jsf-common-es2015';
import { Node }                                                              from './nodes/abstract/node';
import { NodeFactory }                                                       from './nodes/abstract/node-factory';
import { PropertyEvaluator }                                                 from './helpers/property-evaluator';
import { Ticker }                                                            from './ticker';
import { EmitterFactory }                                                    from './nodes/abstract/emitter-factory';
import { ResourceLoader, ResourceLoaderInstance }                            from './helpers/resource-loader';
import Color                                                                 from 'color';
import { BehaviorSubject }                                                   from 'rxjs';

// @ts-ignore
declare const PIXI: import('pixi.js-legacy');

let rendererId = 0;

export class Renderer {

  /**
   * ID
   */
  private _id = rendererId++;
  get id(): number {
    return this._id;
  }

  private readonly defaultFrameRate = 5;

  private _pixiApp: PIXI.Application;
  private _evaluator: PropertyEvaluator;
  private _ticker: Ticker;

  private _rootNode: Node<PIXI.Container>;

  private _nodeFactory: NodeFactory;
  private _emitterFactory: EmitterFactory;

  private _resourceLoader: ResourceLoader;

  private _running: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  get application(): PIXI.Application {
    return this._pixiApp;
  }

  get ticker(): Ticker {
    return this._ticker;
  }

  get evaluator(): PropertyEvaluator {
    return this._evaluator;
  }

  get rootNode(): Node<PIXI.Container> {
    return this._rootNode;
  }

  get nodeFactory(): NodeFactory {
    return this._nodeFactory;
  }

  get emitterFactory(): EmitterFactory {
    return this._emitterFactory;
  }

  get resourceLoader(): ResourceLoader {
    return this._resourceLoader;
  }

  get running(): BehaviorSubject<boolean> {
    return this._running;
  }

  get layout(): JsfLayoutRender2D {
    return this.layoutBuilder.layout as JsfLayoutRender2D;
  }

  private get rootNodeDef() {
    return {
      type     : 'container',
      fragments: this.layout.fragments,
      nodes    : this.layout.nodes
    } as JsfLayoutRender2DNode;
  }

  constructor(public layoutBuilder: JsfSpecialLayoutBuilder,
              public options: { headless: boolean } = {
                headless: false
              }) {
    const layout: JsfLayoutRender2D = this.layoutBuilder.layout as JsfLayoutRender2D;

    this._nodeFactory    = new NodeFactory(this);
    this._emitterFactory = new EmitterFactory(this);

    if (layout.resourceLoader && layout.resourceLoader.sharedInstance) {
      const instanceKey    = `jsf-builder-${ layoutBuilder.rootBuilder.id }`;
      this._resourceLoader = ResourceLoaderInstance.getInstance(this, instanceKey, layout.resourceLoader);
    } else {
      this._resourceLoader = ResourceLoaderInstance.getInstance(this, null, layout.resourceLoader);
    }

    const viewport = {
      width : 800,
      height: 600,

      transparent: true,
      resolution : 1,
      autoDensity: false,
      antialias  : true,

      backgroundColor: '#ffffff',

      frameRate: options.headless ? 60 : this.defaultFrameRate,

      ...(layout.viewport || {})
    };

    // Create PIXI application
    this._pixiApp = new PIXI.Application({
      width : viewport.width,
      height: viewport.height,

      transparent    : viewport.transparent,
      backgroundColor: Color(viewport.backgroundColor).rgbNumber(),

      resolution: viewport.resolution,

      autoDensity: viewport.autoDensity,

      antialias: viewport.antialias,

      preserveDrawingBuffer: true, // Required for taking snapshots of the canvas content

      sharedTicker: false // Required so we can use our custom ticker

      // legacy: true,
    });

    // Create custom ticker
    this._pixiApp.ticker.stop();
    this._ticker = new Ticker(this, this._pixiApp.ticker, viewport.frameRate);
    this._ticker.start();

    // Create evaluator instance
    this._evaluator = new PropertyEvaluator(this.layoutBuilder);
  }


  public async bootstrap() {
    // Load resources
    if (this.layout.resources) {
      this.resourceLoader.registerResources(this.layout.resources);
      await this.resourceLoader.preload();
    }

    // Create root node
    this._rootNode = this._nodeFactory.createNode(void 0, this.rootNodeDef);

    // Render
    return this._rootNode.render();
  }


  public async destroy() {
    // Destroy all nodes
    await this._rootNode.destroy();

    // Stop the ticker
    this._ticker.stop();

    // Destroy application
    this._pixiApp.destroy();
  }

  public setAsRunning() {
    console.log(`[${ Renderer.name }:${ this.id }] State => running`);
    this._running.next(true);
  }

  public setAsPaused() {
    console.log(`[${ Renderer.name }:${ this.id }] State => paused`);
    this._running.next(false);
  }
}
