import { JsfLayoutRender2DFragmentEmitterOptions, PropStatus, PropStatusChangeInterface } from '@kalmia/jsf-common-es2015';
import { Renderer }                                                                       from '../../renderer';
import { Emitter }                                                                        from '../abstract/emitter';
import { Node }                                                                           from '../abstract/node';
import { Subscription }                                                                   from 'rxjs';

export class FragmentEmitter extends Emitter {

  private sourceChangeSubscriptions: Subscription[] = [];

  private updateRequired = false;
  private updateInProgress = false;

  constructor(protected renderer: Renderer,
              protected node: Node<PIXI.Container>,
              protected options: JsfLayoutRender2DFragmentEmitterOptions) {
    super(renderer, node, options);

    this.options = {
      updateMode: 'replace',
      ...options
    };
  }

  public initialize() {
    this.subscribeToSourceChanges();
  }

  public destroy() {
    this.unsubscribeFromSourceChanges();
  }

  /**
   * Call this to schedule an update of the emitter.
   */
  public scheduleUpdate() {
    this.updateRequired = true;
    this.updateIfRequired();
  }

  private updateIfRequired() {
    if (!this.updateRequired || this.updateInProgress) {
      return;
    }
    this.updateRequired = false;

    this.update().catch(e => {
      throw e;
    });
  }

  /**
   * Update the emitter.
   * You should always await this method and never call it in parallel, or you run the risk of creating duplicate elements.
   * Use the "scheduleUpdate" method to queue an update.
   */
  public async update() {
    this.updateInProgress = true;

    const contextList = this.renderer.evaluator.evaluate(this.options.source);

    if (!contextList) {
      // Empty source, destroy all
      for (const fragment of this.node.fragments) {
        await fragment.destroy();
      }
      return;
    }

    if (!Array.isArray(contextList)) {
      throw new Error(`Emitter 'source' property must return an array of context objects.`);
    }

    switch (this.options.updateMode) {
      case 'replace': {
        // Destroy all fragments, then create them again
        for (const fragment of this.node.fragments) {
          await fragment.destroy();
        }

        for (const context of contextList) {
          await (typeof this.options.fragment === 'string'
              ? this.node.createFragment(this.options.fragment, context)
              : this.node.createFragmentFromDefinition(this.options.fragment, context)
          );
        }
        break;
      }
      default: {
        throw new Error(`Unknown update mode '${ this.options.updateMode }'`);
      }
    }

    this.updateInProgress = false;

    return this.updateIfRequired();
  }

  private subscribeToSourceChanges() {
    if (this.options.source) {
      if (this.renderer.evaluator.isEvalObject(this.options.source)) {
        // Prop dependencies
        const dependencies = this.options.source.dependencies || [];
        if (dependencies.length) {
          for (const path of dependencies) {
            const dependencyAbsolutePath = this.renderer.layoutBuilder.abstractPathToAbsolute(path);
            const subscription = this.renderer.layoutBuilder.rootBuilder.listenForStatusChange(dependencyAbsolutePath)
              .subscribe((statusChange: PropStatusChangeInterface) => {
                if (statusChange.status !== PropStatus.Pending) {
                  this.scheduleUpdate();
                }
              });

            this.sourceChangeSubscriptions.push(subscription);
          }
        }

        // Layout dependencies
        const layoutDependencies = this.options.source.layoutDependencies || [];
        if (layoutDependencies.length) {
          for (const id of layoutDependencies) {
            const subscription = this.renderer.layoutBuilder.rootBuilder.subscribeLayoutStateChange(id)
              .subscribe(newValue => {
                this.scheduleUpdate();
              });

            this.sourceChangeSubscriptions.push(subscription);
          }
        }

      }
    }
  }

  private unsubscribeFromSourceChanges() {
    for (const subscription of this.sourceChangeSubscriptions) {
      subscription.unsubscribe();
    }
    this.sourceChangeSubscriptions = [];
  }

}
