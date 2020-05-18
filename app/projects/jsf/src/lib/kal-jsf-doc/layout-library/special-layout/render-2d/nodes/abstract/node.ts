import {
  isJsfLayoutRender2DEmitter,
  isJsfLayoutRender2DNodeArray,
  JsfLayoutRender2DNode,
  PropStatus,
  PropStatusChangeInterface
}                                                                                                      from '@kalmia/jsf-common-es2015';
import { Renderer }                                                                                    from '../../renderer';
import { NodeServer }                                                                                  from './node-server';
import { NodeState }                                                                                   from './node-state.enum';
import { NodeEvent }                                                                                   from './node-event.enum';
import { Fragment }                                                                                    from './fragment';
import { Emitter }                                                                                     from './emitter';
import { nodePropertiesListMetadataKey, nodePropertyGetterMetadataKey, nodePropertySetterMetadataKey } from './node.const';
import { Subject, Subscription }                                                                       from 'rxjs';
import { takeUntil }                                                                                   from 'rxjs/operators';
import { isNodeProxyInterface, NodeProxyInterface }                                                    from './node-proxy.interface';
import { debounce }                                                                                    from 'lodash';
import Color                                                                                           from 'color';
import 'reflect-metadata';


let nodeId = 0;

export abstract class Node<T extends PIXI.Container> {

  /**
   * ID
   */
  private _id = nodeId++;
  get id(): number {
    return this._id;
  }


  /**
   * Node state
   */
  private _state: NodeState = NodeState.Creating;

  public stateChange = new Subject<NodeState>();

  set state(x: NodeState) {
    this._state = x;
    this.stateChange.next(x);
  }

  get state(): NodeState {
    return this._state;
  }

  /**
   * Node scope & fragment context
   */
  private _scope: any = {};
  private _context: any;

  get scope(): any {
    return this._scope;
  }

  get context(): any {
    return this._context ? this._context : (this.parent ? this.parent.context : void 0);
  }

  /**
   * Display object for the type of node
   */
  private _displayObject: T;
  get displayObject(): T {
    return this._displayObject;
  }

  set displayObject(x: T) {
    this._displayObject = x;
  }

  /**
   * Children
   */
  protected children: Node<PIXI.Container>[] = [];


  /**
   * Fragments
   */
  private _sourceFragment: Fragment; // If node was created from a fragment definition, this will be set to the Fragment instance.
  protected _fragments: Fragment[] = []; // List of child fragments.

  public get fragments(): Fragment[] {
    return this._fragments;
  }

  /**
   * Emitter
   */
  protected emitter: Emitter;


  protected get rootNode(): Node<PIXI.Container> {
    return this.renderer.rootNode;
  }

  /**
   * Properties that were defined in the layout
   */
  private layoutProperties: string[] = [];

  /**
   * Subscriptions
   */
  private subscriptions: Subscription[] = [];

  /**
   * Ticker function
   */
  private tickerFunction: any;

  /**
   * Whether node updates are paused
   */
  private paused = false;

  /**
   * Unsubscribe notifier
   */
  protected unsubscribe: Subject<void> = new Subject<void>();

  /**
   * Proxy object for eval manipulation
   */
  get proxy(): NodeProxyInterface {
    const proxyObject: NodeProxyInterface = {
      __modifiedPropertyList: []
    };

    const properties = this.getNodeProperties();
    for (const property of properties) {
      proxyObject[property] = this[property];
    }

    return new Proxy(proxyObject, {
      set: (target: NodeProxyInterface, prop: any, value: any) => {
        target[prop] = value;
        // Mark property as modified
        if (target.__modifiedPropertyList.indexOf(prop) === -1) {
          target.__modifiedPropertyList.push(prop);
        }
        return true;
      }
    });
  }

  constructor(protected renderer: Renderer,
              protected parent: Node<PIXI.Container>,
              protected layoutData: JsfLayoutRender2DNode,
              context?: any) {
    // Set context
    this._context = context || void 0;

    // Call node created hook function
    this.onNodeCreated();

    // Evaluate layout properties
    const data       = {};
    const properties = this.getNodeProperties();
    for (const property of properties) {
      if (this.layoutData.hasOwnProperty(property) && this.layoutData[property] !== void 0) {
        this.evaluatePropertyValue(this.layoutData[property], data, property);
        this.layoutProperties.push(property);
      }
    }

    // Write node data for initial values
    this.writeData(data);

    // Create children
    this.children = [];
    if (layoutData.nodes) {
      if (isJsfLayoutRender2DNodeArray(layoutData.nodes)) {
        for (const child of layoutData.nodes) {
          this.children.push(this.renderer.nodeFactory.createNode(this, child));
        }
      } else if (isJsfLayoutRender2DEmitter(layoutData.nodes)) {
        this.emitter = this.renderer.emitterFactory.createEmitter(this, layoutData.nodes);
      }
    }

    this.renderer.running
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(running => {
        const currentState = this.paused;
        this.paused        = !running;

        if (!this.paused && this.paused !== currentState) {
          this.resumeFromPausedState();
        }
      });

    // Set node state to `Created`
    this.state = NodeState.Created;
  }

  /**
   * Node created hook
   */
  protected onNodeCreated() {
  }

  /**
   * Create the node and its children and attach to scene.
   */
  public async render() {
    // Validate state
    if (this.state !== NodeState.Created) {
      return;
    }

    // Register ourselves with the node server
    NodeServer.store(this.id, this);

    // Create the display object
    await this.createDisplayObject();

    // Call setter functions for properties that were defined in the layout
    for (const property of this.layoutProperties) {
      const setterFn = this.getNodeSetterFunctionForProperty(property);
      await setterFn();
    }

    // After the display object was created, read back the default values into our class
    const properties = this.getNodeProperties();
    for (const property of properties) {
      if (this[property] === void 0) {
        const getterFn = this.getNodeGetterFunctionForProperty(property);
        this[property] = await getterFn();
      }
    }

    // Call all setter functions
    for (const setterFn of this.getNodeSetterFunctions()) {
      await setterFn();
    }

    // Handle the rest of the logic
    this.attachDisplayObjectToParent();
    await this.renderChildren();

    this.subscribeToPropertyChanges();
    this.subscribeToTickEvent();

    // Initialize emitter & update emitter state
    if (this.emitter) {
      this.emitter.initialize();
      await this.emitter.update();
    }

    this.state = NodeState.Active;

    this.dispatchEvent(NodeEvent.Create);
    this.dispatchEvent(NodeEvent.Update);
  }

  /**
   * Destroy the node and all its children.
   */
  public async destroy() {
    // Validate state
    if (this.state !== NodeState.Active) {
      // Schedule destroy after state changes to active.
      this.subscriptions.push(
        this.stateChange.subscribe(async state => {
          if (state === NodeState.Active) {
            await this.destroy();
          }
        })
      );

      return;
    }

    this.state = NodeState.Destroying;

    this.dispatchEvent(NodeEvent.Destroy);

    this.unsubscribeFromSubscriptions();
    this.unsubscribeFromTickEvent();

    // Destroy emitter
    if (this.emitter) {
      this.emitter.destroy();
      this.emitter = null;
    }

    await this.destroyChildren();
    this.detachDisplayObjectFromParent();

    await this.destroyDisplayObject();

    // Remove ourselves from the node server
    NodeServer.remove(this.id);

    // Remove ourselves from parent children array
    if (this.parent) {
      this.parent.children = this.parent.children.filter(x => x.id !== this.id);
    }

    // If this node has a matching fragment, remove ourselves from the fragment array as well
    if (this._sourceFragment && this.parent) {
      this.parent._fragments = this.parent._fragments.filter(x => x.id !== this.id);
    }

    // Trigger unsubscribe
    this.unsubscribe.next();
    this.unsubscribe.complete();

    // Update node state
    this.state = NodeState.Destroyed;
  }

  protected resumeFromPausedState() {
    // Evaluate each property
    const properties = this.getNodeProperties();
    for (const property of properties) {
      if (this.layoutProperties.indexOf(property) > -1) {
        this.evaluatePropertyValue(this.layoutData[property], this, property);
      }
    }

    // Run update event
    this.dispatchEvent(NodeEvent.Update);
  }

  private subscribeToTickEvent() {
    if (this.layoutData.events) {
      if (this.layoutData.events[NodeEvent.Tick]) {
        this.tickerFunction = (delta) => {
          if (!this.paused) {
            this.dispatchEvent(NodeEvent.Tick, {
              $delta: this.renderer.application.ticker.elapsedMS
            });
          }
        };

        this.renderer.application.ticker.add(this.tickerFunction);
      }
    }
  }

  private unsubscribeFromTickEvent() {
    if (this.tickerFunction) {
      this.renderer.application.ticker.remove(this.tickerFunction);
    }
  }

  private subscribeToPropertyChanges() {
    // Global node update event
    if (this.layoutData.events) {
      if (this.layoutData.events[NodeEvent.Update]) {
        const eventSchema = this.layoutData.events[NodeEvent.Update];

        // Prop dependencies
        const dependencies = eventSchema.dependencies || [];
        if (dependencies.length) {
          for (const path of dependencies) {
            const dependencyAbsolutePath = this.renderer.layoutBuilder.abstractPathToAbsolute(path);
            const subscription           = this.renderer.layoutBuilder.rootBuilder.listenForStatusChange(dependencyAbsolutePath)
              .subscribe((statusChange: PropStatusChangeInterface) => {
                if (statusChange.status !== PropStatus.Pending) {
                  if (!this.paused) {
                    this.dispatchEventDebounced(NodeEvent.Update);
                  }
                }
              });

            this.subscriptions.push(subscription);
          }
        }

        // Layout dependencies
        const layoutDependencies = eventSchema.layoutDependencies || [];
        if (layoutDependencies.length) {
          for (const id of layoutDependencies) {
            const subscription = this.renderer.layoutBuilder.rootBuilder.subscribeLayoutStateChange(id)
              .subscribe(newValue => {
                if (!this.paused) {
                  this.dispatchEventDebounced(NodeEvent.Update);
                }
              });

            this.subscriptions.push(subscription);
          }
        }

        /*
         if (!dependencies.length && !layoutDependencies.length) {
         if (this.renderer.layoutBuilder.rootBuilder.warnings) {
         console.warn(`Node '${ this.layoutData.type }' event '${ NodeEvent.Update }' has not listed any dependencies and layoutDependencies.`,
         `Event will never be fired.`);
         }
         }
         */
      }
    }

    // Per-property update events
    const properties = this.getNodeProperties();
    for (const property of properties) {
      const layoutPropertyValue = this.layoutData[property];
      if (this.renderer.evaluator.isEvalObject(layoutPropertyValue)) {

        // Prop dependencies
        const dependencies = layoutPropertyValue.dependencies || [];
        if (dependencies.length) {
          for (const path of dependencies) {
            const dependencyAbsolutePath = this.renderer.layoutBuilder.abstractPathToAbsolute(path);
            const subscription           = this.renderer.layoutBuilder.rootBuilder.listenForStatusChange(dependencyAbsolutePath)
              .subscribe((statusChange: PropStatusChangeInterface) => {
                if (statusChange.status !== PropStatus.Pending) {
                  if (!this.paused) {
                    this.evaluatePropertyValue(layoutPropertyValue, this, property);
                  }
                }
              });

            this.subscriptions.push(subscription);
          }
        }

        // Layout dependencies
        const layoutDependencies = layoutPropertyValue.layoutDependencies || [];
        if (layoutDependencies.length) {
          for (const id of layoutDependencies) {
            const subscription = this.renderer.layoutBuilder.rootBuilder.subscribeLayoutStateChange(id)
              .subscribe(newValue => {
                if (!this.paused) {
                  this.evaluatePropertyValue(layoutPropertyValue, this, property);
                }
              });

            this.subscriptions.push(subscription);
          }
        }

        if (!dependencies.length && !layoutDependencies.length) {
          const subscription = this.renderer.layoutBuilder.rootBuilder.propBuilder.statusChange.subscribe((status: PropStatus) => {
            if (status !== PropStatus.Pending) {
              if (!this.paused) {
                this.evaluatePropertyValue(layoutPropertyValue, this, property);
              }
            }
          });

          this.subscriptions.push(subscription);

          /*
           if (this.renderer.layoutBuilder.rootBuilder.warnings) {
           console.warn(`Node '${ this.layoutData.type }' property '${ property }' has not listed any dependencies and layoutDependencies.`,
           `Property value will be updated on every form value change which may decrease performance.`);
           }
           */
        }
      }
    }
  }

  private unsubscribeFromSubscriptions() {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
    this.subscriptions = [];
  }

  private evaluatePropertyValue(valueToEvaluate: any, target?: Object, property?: string, extraContext?: any) {
    const value = this.renderer.evaluator.evaluate(valueToEvaluate, {
      $context: this.context,
      $scope  : this.scope,
      $color  : Color,

      ...(extraContext || {})
    });

    if (value === void 0 || value === undefined) {
      return;
    }

    if (typeof value === 'number' && isNaN(value)) {
      return;
    }

    if (target && property) {
      target[property] = value;
    }

    return value;
  }

  public dispatchEvent(event: NodeEvent, extraContext?: any) {
    if (this.layoutData.events) {
      if (this.layoutData.events[event]) {
        const data = this.proxy;
        this.evaluatePropertyValue(this.layoutData.events[event], {}, void 0, {
          $node: data,

          ...(extraContext || {}),

          $createFragment: (name: string, context?: any) => this.createFragment(name, context).proxy,
          $fragments     : this._fragments.map(x => x.proxy)
        });
        this.writeData(data);
      }
    }
  }

  // tslint:disable-next-line
  public dispatchEventDebounced = debounce(this.dispatchEvent, 1000 / 60); // Debounce 1 frame, assuming 60 fps


  protected writeData(data: NodeProxyInterface | any) {
    let properties = this.getNodeProperties();
    // In case we are writing data from a proxy object, filter out any unchanged properties
    if (isNodeProxyInterface(data)) {
      properties = properties.filter(x => data.__modifiedPropertyList.indexOf(x) > -1);
    }

    for (const property of properties) {
      if (data.hasOwnProperty(property) && data[property] !== void 0) {
        this[property] = data[property];
      }
    }
  }

  public createFragment(fragmentName: string, context?: any) {
    const fragmentDef = this.findFragmentDefinition(fragmentName);
    return this.createFragmentFromDefinition(fragmentDef, context);
  }

  public createFragmentFromDefinition(fragmentDef: JsfLayoutRender2DNode, context?: any) {
    const node = this.renderer.nodeFactory.createNode(this, fragmentDef, context);
    this.children.push(node);

    const fragment = new Fragment(node);
    this._fragments.push(fragment);

    node._sourceFragment = fragment;
    node.render()
      .catch(e => {
        throw e;
      });

    return fragment;
  }

  private findFragmentDefinition(fragmentName: string) {
    if (this.layoutData.fragments && this.layoutData.fragments[fragmentName]) {
      return this.layoutData.fragments[fragmentName];
    }
    if (!this.parent) {
      // We are in root node, check for fragments there
      if (this.renderer.layout.fragments && this.renderer.layout.fragments[fragmentName]) {
        return this.renderer.layout.fragments[fragmentName];
      }
      throw new Error(`Fragment '${ fragmentName } not found.`);
    }
    return this.parent.findFragmentDefinition(fragmentName);
  }

  private attachDisplayObjectToParent(): void {
    if (this.parent) {
      this.parent.displayObject.addChild(this.displayObject);
    } else {
      this.rootNode.renderer.application.stage.addChild(this.displayObject);
    }
  }

  private detachDisplayObjectFromParent(): void {
    if (this.parent) {
      this.parent.displayObject.removeChild(this.displayObject);
    } else {
      this.rootNode.renderer.application.stage.removeChild(this.displayObject);
    }
  }

  private async renderChildren() {
    for (const child of this.children) {
      await child.render();
    }
  }

  private async destroyChildren() {
    for (const child of this.children) {
      await child.destroy();
    }
    this.children   = [];
    this._fragments = [];
  }

  private getNodeSetterFunctionForProperty(propertyName: string) {
    return Reflect.getMetadata(nodePropertySetterMetadataKey(propertyName), this).bind(this);
  }

  private getNodeGetterFunctionForProperty(propertyName: string) {
    return Reflect.getMetadata(nodePropertyGetterMetadataKey(propertyName), this).bind(this);
  }

  private getNodeSetterFunctions() {
    const properties = this.getNodeProperties();
    const fns        = [];
    for (const property of properties) {
      fns.push(this.getNodeSetterFunctionForProperty(property));
    }
    return fns;
  }

  private getNodeGetterFunctions() {
    const properties = this.getNodeProperties();
    const fns        = [];
    for (const property of properties) {
      fns.push(this.getNodeGetterFunctionForProperty(property));
    }
    return fns;
  }

  private getNodeProperties(): string[] {
    return Reflect.getMetadata(nodePropertiesListMetadataKey, this) || [];
  }


  /**
   * Abstract method - responsible for creating the display object and assigning
   * it to the `displayObject` node property
   */
  protected abstract async createDisplayObject(): Promise<void>;

  /**
   * Abstract method - responsible for destroying the display object and releasing
   * any resources such as textures
   */
  protected abstract async destroyDisplayObject(): Promise<void>;
}
