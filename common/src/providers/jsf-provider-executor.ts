import { JsfProviderExecutorStatus }                                                from './enums/jsf-provider-executor-status.enum';
import { Observable, Subject }                                                      from 'rxjs';
import { JsfBuilder, JsfUnknownPropBuilder, PropStatus, PropStatusChangeInterface } from '../builder';
import { JsfProviderExecutorInterface }                                             from './interfaces/jsf-provider-executor.interface';
import { takeUntil }                                                                from 'rxjs/operators';
import { debounce, has, isEqual }                                                   from 'lodash';
import { JsfProviderConsumerInterface }                                             from './interfaces/jsf-provider-consumer.interface';
import { jsfEnv }                                                                   from '../jsf-env';
import { JsfProviderAbstractTrigger }                                               from './triggers/abstract/jsf-provider-abstract-trigger';
import { JsfProviderCustomTrigger }                                                 from './interfaces/jsf-provider-custom-trigger.interface';
import { JsfProviderTriggerFactory }                                                from './triggers/abstract/jsf-provider-trigger-factory';

export class JsfProviderExecutor {

  private triggers: JsfProviderAbstractTrigger<JsfProviderCustomTrigger>[];

  private unsubscribe: Subject<void>                    = new Subject<void>();
  private dependencyValueCache: { [path: string]: any } = {};

  private pendingUpdate = false;

  /**
   * Debounced version of the provide method. Use this if for example you're triggering the provider based on some
   * search input.
   */
  public provideDebounced: () => Promise<void>;

  /**
   * "Smart" provide :). Uses the debounced version if a debounce time is set, otherwise uses the immediate version.
   */
  public provide: () => Promise<void>;


  private _status: JsfProviderExecutorStatus = JsfProviderExecutorStatus.Idle;
  get status(): JsfProviderExecutorStatus {
    return this._status;
  }

  set status(value: JsfProviderExecutorStatus) {
    if (this._status !== value) {
      this._status = value;
      this._statusChange.next(value);
      this.runStatusChangeHook(value);
    }
  }

  private _statusChange: Subject<JsfProviderExecutorStatus> = new Subject<JsfProviderExecutorStatus>();

  get statusChange(): Observable<JsfProviderExecutorStatus> {
    if (!this._statusChange) {
      this._statusChange = new Subject<JsfProviderExecutorStatus>();
    }
    return this._statusChange.asObservable();
  }

  get async(): boolean {
    return this.executor.async;
  }

  constructor(private builder: JsfBuilder,
              private executor: JsfProviderExecutorInterface,
              private consumer: JsfProviderConsumerInterface,
              private propBuilder: JsfUnknownPropBuilder) {

    this.provide = this.provideImmediately;

    if (this.executor.debounce) {
      const debounceTime    = typeof this.executor.debounce === 'boolean' ? 250 : this.executor.debounce;
      this.provideDebounced = debounce(this.provideImmediately.bind(this), debounceTime); // tslint:disable-line
      this.provide          = this.provideDebounced;
    }
  }

  /**
   * Performs initialization logic.
   */
  onInit() {
    if (jsfEnv.isApi) {
      return;
    }
    this.subscribeToDependencies();
    this.createCustomTriggers().catch(e => {
      throw e;
    });
  }

  onDestroy() {
    this.unsubscribeFromDependencies();
    this.destroyCustomTriggers().catch(e => {
      throw e;
    });
  }

  private async createCustomTriggers() {
    this.triggers = [];

    if (this.executor.customTriggers && this.executor.customTriggers.length) {
      for (const triggerDef of this.executor.customTriggers) {
        const triggerInstance = JsfProviderTriggerFactory.createTrigger(triggerDef, this, this.builder, this.propBuilder);

        await triggerInstance.register();

        this.triggers.push(triggerInstance);
      }
    }
  }

  private async destroyCustomTriggers() {
    for (const trigger of this.triggers) {
      await trigger.unregister();
    }

    this.triggers = void 0;
  }

  /**
   * Adds the executor to the builder queue to be executed after the form finished loading.
   */
  enqueue() {
    if (!this.builder.ready) {
      this.builder.enqueueProviderExecutor(this);
    }
  }

  /**
   * Manually trigger the provider.
   */
  public async provideImmediately(): Promise<void> {
    this.pendingUpdate = true;
    if (this.status !== JsfProviderExecutorStatus.Pending) {
      return this.executeProviderIfPendingUpdate();
    }
  }

  /**
   * Executes the provider if an update is pending.
   */
  private async executeProviderIfPendingUpdate() {
    if (this.pendingUpdate) {
      this.pendingUpdate = false;
      return this.executeProvider();
    }
  }

  /**
   * Executes the provider.
   */
  private async executeProvider() {
    // Skip providing if running on API.
    if (jsfEnv.isApi) {
      return;
    }

    // If a condition is present, evaluate it and check if provider can be executed.
    if (this.executor.condition) {
      const ctx = this.builder.getEvalContext({
        propBuilder: this.propBuilder
      });

      try { // TODO FIXME without try-catch!
        const shouldRun = this.builder.runEvalWithContext((this.executor.condition as any).$evalTranspiled || this.executor.condition.$eval, ctx);

        if (!shouldRun) {
          return;
        }
      } catch (e) {
        console.error(e);
        return;
      }
    }

    this.status = JsfProviderExecutorStatus.Pending;

    try {
      const updateMode = this.executor.mode || 'set';

      const provider = this.builder.getProvider(this.executor.key);
      await provider.provide({
        propBuilder        : this.propBuilder,
        consumer           : this.consumer,
        providerRequestData: this.executor.providerRequestData,
        mapResponseData    : this.executor.mapResponseData,
        mode               : updateMode
      });

      await this.executeProviderIfPendingUpdate();

      this.status = JsfProviderExecutorStatus.Idle;
    } catch (e) {
      this.status = JsfProviderExecutorStatus.Failed;
      throw e;
    }
  }

  public subscribeToDependencies(): void {
    for (const dependency of (this.executor.dependencies || [])) {
      const dependencyAbsolutePath = this.propBuilder.convertAbstractSiblingPathToPath(dependency);

      this.builder.listenForStatusChange(dependencyAbsolutePath)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(async (status: PropStatusChangeInterface) => {
          if (this.builder.ready && status.status !== PropStatus.Pending) {
            // We have to check if the value has changed to avoid an infinite provider loop.
            // It also helps to reduce the amount of requests we perform since we only update the data if the
            // dependency changed.

            const newValue = this.propBuilder.rootBuilder.getProp(dependencyAbsolutePath).getJsonValue();

            if (has(this.dependencyValueCache, dependencyAbsolutePath)) {
              const previousValue = this.dependencyValueCache[dependencyAbsolutePath];

              if (isEqual(previousValue, newValue)) {
                return;
              }
            }

            this.dependencyValueCache[dependencyAbsolutePath] = newValue;

            await this.provide();
          }
        });
    }
  }

  public unsubscribeFromDependencies(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();

    this.dependencyValueCache = {};
  }

  private runStatusChangeHook(status: JsfProviderExecutorStatus) {
    const hookKey = {
      [JsfProviderExecutorStatus.Idle]: 'onIdle',
      [JsfProviderExecutorStatus.Pending]: 'onPending',
      [JsfProviderExecutorStatus.Failed]: 'onFailed',
    }[status];

    this.runHook(hookKey);
  }

  private runHook(hookKey: string) {
    if (this.executor.hooks && hookKey in this.executor.hooks) {
      const ctx = this.builder.getEvalContext({
        propBuilder: this.propBuilder
      });

      try { // TODO FIXME without try-catch!
        this.builder.runEvalWithContext((this.executor.hooks[hookKey] as any).$evalTranspiled || this.executor.hooks[hookKey].$eval, ctx);
      } catch (e) {
        console.error(e);
      }
    }
  }
}
