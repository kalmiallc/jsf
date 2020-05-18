import { JsfUnknownPropBuilder, PropStatus }          from './abstract/index';
import { union, uniq }                                from 'lodash';
import { JsfBuilder }                                 from './jsf-builder';
import { isJsfPropBuilderObject, isPropBuilderArray } from './props';
import { jsfEnv }                                     from '../jsf-env';

export class JsfDependencyResolver {

  /**
   * Idea here is to force strictMode while in development so errors are more visible, but when in production
   * some circuit breakers are disabled in order to allow resolver to try to recover from badly written forms.
   */
  strictMode = true;

  // PAUSE/RESUME
  // This is used so we can manually PAUSE/RESUME whole resolver.
  // Warning: until resumed all PATCH,SET,ADD,REMOVE are delayed!
  private pauseCounter                     = 0;
  private resumePromise: Promise<void>     = null;
  private resumePromiseResolve: () => void = null;

  // QUEUE AND IDLE SUPPORT
  // This is used in order to better manage resolve queue
  // If you need to wait for idle state you can call waitForIdle()
  /**
   * Set by resolver when there is nothin to resolve.
   */
  private idlePromise: Promise<void>                          = Promise.resolve();
  /**
   * If true indicated that resolver is already in progress, and will check for next queue.
   */
  private nextResolveLock: boolean                            = false;
  /**
   * Array of all node paths needed to be resolved.
   */
  private nextResolveQueue: string[]                          = [];
  private nextResolveQueuePromise: Promise<void>              = null;
  private nextResolveQueuePromiseResolve: () => void          = null;
  private nextResolveQueuePromiseReject: (error: any) => void = null;

  // STATISTICS
  /**
   * How many times resolver was executed. From this ID is derived.
   */
  resolveCount = 0;

  // GARBAGE COLLECTION TRICKS
  /**
   * Used to remember what we nee dto delete in order not to waste CPU until is really needed.
   */
  private _newlyRemovedNodes: string[] = [];

  // PERSISTENT DATA
  /**
   * Main builder obj., this is final and doesn't change.
   */
  private jsfBuilder: JsfBuilder;

  // TREE FOR ENABLED STATE
  public dependenciesListForEnabledIf: { [nodePath: string]: string[] }           = {};
  private _reversedDependenciesListForEnabledIf: { [nodePath: string]: string[] } = {};

  // TREE FOR VALIDATE STATE
  public dependenciesListForValidate: { [nodePath: string]: string[] }           = {};
  private _reversedDependenciesListForValidate: { [nodePath: string]: string[] } = {};

  get reversedDependenciesListForEnabledIf() {
    if (!this._reversedDependenciesListForEnabledIf) {
      this.buildReversedDependenciesListForEnabledIf();
    }
    return this._reversedDependenciesListForEnabledIf;
  }

  get reversedDependenciesListForValidate() {
    if (!this._reversedDependenciesListForValidate) {
      this.buildReversedDependenciesListForValidate();
    }
    return this._reversedDependenciesListForValidate;
  }

  constructor(jsfBuilder: JsfBuilder) {
    this.jsfBuilder = jsfBuilder;
    this.prepareNextResolveQueue();
  }

  debug(...args) {
    if (this.jsfBuilder.debug || this.jsfBuilder.diagnosticsHook) {
      console.debug(...args);
    }
  }

  warn(...args) {
    if (this.jsfBuilder.debug || this.jsfBuilder.diagnosticsHook) {
      console.warn(...args);
    }
  }

  info(...args) {
    if (this.jsfBuilder.debug || this.jsfBuilder.diagnosticsHook) {
      console.info(...args);
    }
  }

  diagnostics(type: string, data: any) {
    if (this.jsfBuilder.diagnosticsHook) {
      this.jsfBuilder.diagnosticsHook(type, data);
    }
  }

  // ══════════════════════
  // Flow control util
  // ══════════════════════

  waitForIdle() {
    return this.idlePromise;
  }

  requestPauseByOne() {
    this.pauseCounter++;
    if (this.pauseCounter === 1 && !this.resumePromise) {
      this.resumePromise = new Promise<void>(resolve => this.resumePromiseResolve = resolve);
    }
    if (!this.resumePromise) {
      throw new Error('[RE-10] Resolver pause counter out of sequence, no pausePromise set.');
    }
  }

  requestResumeByOne() {
    this.pauseCounter--;
    if (this.pauseCounter < 0) {
      throw new Error('[RE-09] Resolver pause counter out of sequence: negative pause ' + this.pauseCounter);
    }
    if (this.pauseCounter === 0) {
      if (this.resumePromiseResolve) {
        this.resumePromiseResolve();
      } else {
        throw new Error('[RE-08] Resolver can not resume.');
      }
    }
  }

  runWithDelayedUpdate(cb) {
    this.requestPauseByOne();
    cb();
    this.requestResumeByOne();
  }


  // ══════════════════════
  // On create/destroy nodes util
  // ══════════════════════

  onNodeInit(node: JsfUnknownPropBuilder) {
    this.debug(`NODE ADD: <${ node.path }>`);

    // FOR VALIDATE
    this.dependenciesListForValidate[node.path] = this.dependenciesListForValidate[node.path]
                                                  ?
                                                  union(
                                                    this.dependenciesListForValidate[node.path],
                                                    node.dependenciesPathsForValidate
                                                  )
                                                  : node.dependenciesPathsForValidate;

    if (node.parentProp) {
      this.dependenciesListForValidate[node.parentProp.path] = this.dependenciesListForValidate[node.parentProp.path] || [];
      if (this.dependenciesListForValidate[node.parentProp.path].indexOf(node.path) === -1) {
        this.dependenciesListForValidate[node.parentProp.path].push(node.path);
      }
    }

    // FOR ENABLED IF
    this.dependenciesListForEnabledIf[node.path] = this.dependenciesListForEnabledIf[node.path]
                                                   ?
                                                   union(
                                                     this.dependenciesListForEnabledIf[node.path],
                                                     node.dependenciesPathsForEnabledIf
                                                   )
                                                   : node.dependenciesPathsForEnabledIf;

    this.invalidateReversedDependenciesLists();

    this.diagnostics('ON-NODE-INIT', { node });
  }

  onNodeDestroy(node: JsfUnknownPropBuilder) {
    this.debug(`NODE DESTROY: <${ node.path }>`);

    this._newlyRemovedNodes.push(node.path);

    this.invalidateReversedDependenciesLists();
    this.diagnostics('ON-NODE-DESTROY', { id: node.path });
  }

  processNewlyRemovedNodes() {
    if (this._newlyRemovedNodes.length) {
      const start                 = +new Date();
      const _newlyRemovedNodesLen = this._newlyRemovedNodes.length;
      for (let nodeIndex = 0; nodeIndex < _newlyRemovedNodesLen; nodeIndex++) {
        delete this.dependenciesListForValidate[this._newlyRemovedNodes[nodeIndex]];
        delete this.dependenciesListForEnabledIf[this._newlyRemovedNodes[nodeIndex]];
      }

      // REMOVE FROM VALIDATE DEPENDENCIES
      const depForValidateKeys       = Object.keys(this.dependenciesListForValidate);
      const depForValidateKeysLength = depForValidateKeys.length;
      for (let i = 0; i < depForValidateKeysLength; i++) {
        const key = depForValidateKeys[i];

        for (let nodeIndex = 0; nodeIndex < _newlyRemovedNodesLen; nodeIndex++) {
          // POP we can do parallel search (without)
          const foundIndex = this.dependenciesListForValidate[key].indexOf(this._newlyRemovedNodes[nodeIndex]);
          if (foundIndex !== -1) {
            this.dependenciesListForValidate[key].splice(foundIndex, 1);
          }
        }
      }

      // REMOVE FROM ENABLED DEPENDENCIES
      const depForEnabledIfKeys       = Object.keys(this.dependenciesListForEnabledIf);
      const depForEnabledIfKeysLength = depForEnabledIfKeys.length;
      for (let i = 0; i < depForEnabledIfKeysLength; i++) {
        const key = depForEnabledIfKeys[i];

        for (let nodeIndex = 0; nodeIndex < _newlyRemovedNodesLen; nodeIndex++) {
          // POP we can do parallel search (without)
          const foundIndex = this.dependenciesListForEnabledIf[key].indexOf(this._newlyRemovedNodes[nodeIndex]);
          if (foundIndex !== -1) {
            this.dependenciesListForEnabledIf[key].splice(foundIndex, 1);
          }
        }
      }

      this.invalidateReversedDependenciesLists();

      this._newlyRemovedNodes = [];

      if (!jsfEnv.isApi) {
        this.info(`[R] processNewlyRemovedNodes duration: ${ ((+new Date()) - start) / 1000 }s`);
      }
    }
  }


  // ══════════════════════
  // Dependencies util
  // ══════════════════════

  private invalidateReversedDependenciesLists() {
    this._reversedDependenciesListForValidate  = null;
    this._reversedDependenciesListForEnabledIf = null;
  }

  getReverseDependenciesForEnabledIf(nodePath: string) {
    return this.reversedDependenciesListForEnabledIf[nodePath] || [];
  }

  getReverseDependenciesForValidate(nodePath: string) {
    return this.reversedDependenciesListForValidate[nodePath] || [];
  }

  private buildReversedDependenciesListForEnabledIf() {
    this._reversedDependenciesListForEnabledIf = {};
    const keys                                 = Object.keys(this.dependenciesListForEnabledIf);
    const keysLength                           = keys.length;
    for (let i = 0; i < keysLength; i++) {
      const depKeys = this.dependenciesListForEnabledIf[keys[i]];
      for (let j = 0; j < depKeys.length; j++) {
        if (!this._reversedDependenciesListForEnabledIf[depKeys[j]]) {
          this._reversedDependenciesListForEnabledIf[depKeys[j]] = [keys[i]];
        } else if (this._reversedDependenciesListForEnabledIf[depKeys[j]].indexOf(keys[i]) === -1) {
          this._reversedDependenciesListForEnabledIf[depKeys[j]].push(keys[i]);
        }
      }
    }
  }

  private buildReversedDependenciesListForValidate() {
    this._reversedDependenciesListForValidate = {};
    const keys                                = Object.keys(this.dependenciesListForValidate);
    const keysLength                          = keys.length;
    for (let i = 0; i < keysLength; i++) {
      const depKeys = this.dependenciesListForValidate[keys[i]];
      for (let j = 0; j < depKeys.length; j++) {
        if (!this._reversedDependenciesListForValidate[depKeys[j]]) {
          this._reversedDependenciesListForValidate[depKeys[j]] = [keys[i]];
        } else if (this._reversedDependenciesListForValidate[depKeys[j]].indexOf(keys[i]) === -1) {
          this._reversedDependenciesListForValidate[depKeys[j]].push(keys[i]);
        }
      }
    }
  }


  // ══════════════════════════════
  // New core util - ENABLED STATE
  // ══════════════════════════════
  markEnabledIfDependantsAsPending(node: JsfUnknownPropBuilder, resolverKey: Symbol) {
    node._resolverStatus.enabledPending = resolverKey;
    node._resolverStatus.seenBy         = resolverKey;

    this.diagnostics('PENDING-NODE-ENABLED-IF', { node });

    const dependants       = this.getReverseDependenciesForEnabledIf(node.path);
    const dependantsLength = dependants.length;

    for (let i = 0; i < dependantsLength; i++) {
      const dependantNode = this.jsfBuilder.getProp(dependants[i]);

      if (dependantNode._resolverStatus.resolvedBy !== resolverKey) {
        if (dependantNode._resolverStatus.seenBy === resolverKey) {
          throw new Error(`[RE-11] Circular reference detected in enabled dependants: "${ node.path }" -> "${ dependantNode.path }".`);
        }
        this.markEnabledIfDependantsAsPending(dependantNode, resolverKey);
      }
    }

    node._resolverStatus.resolvedBy = resolverKey;
  }


  resolveEnabledIfDependencies(node: JsfUnknownPropBuilder, id: number, pendingKey: Symbol) {
    return this._resolveEnabledIfDependencies(node, Symbol(id), pendingKey, false);
  }

  _resolveEnabledIfDependencies(node: JsfUnknownPropBuilder, resolverKey: Symbol, pendingKey: Symbol, isSecondaryResolve: boolean) {
    node._resolverStatus.seenBy = resolverKey;

    // If nothing to do go out
    if (node._resolverStatus.enabledPending !== pendingKey) {
      this._notifyAboutValueChangeOtherEnabledDependants(node.parentProp, resolverKey, pendingKey);
      return;
    }

    const edgesPaths = this.dependenciesListForEnabledIf[node.path] || [];
    for (const edge of edgesPaths.map(x => this.jsfBuilder.getProp(x))) { // POP
      if (edge._resolverStatus.enabledPending === pendingKey && edge._resolverStatus.resolvedBy !== resolverKey) {
        if (edge._resolverStatus.seenBy === resolverKey) {
          if (!isSecondaryResolve) {
            throw new Error(`[RE-12] Circular reference detected while resolving enabled state: "${ node.path }" -> "${ edge.path }".`);
          }
        }
        this._resolveEnabledIfDependencies(edge, resolverKey, pendingKey, isSecondaryResolve);
      }
    }

    // Circuit breaker
    if (!node.dependenciesForEnabledIfReady) {
      throw new Error(`[RE-13] Not all enabled state dependencies are ready for: "${ node.path }"`);
    }

    node._resolverStatus.enabledPending = null;
    if (node._updateEnabledStatus({ noEmit: true })) {
      this.diagnostics('RESOLVED-NODE-ENABLED-IF', { node });

      // Enabled if status changed, report for validation
      this.markForValidateDependantsAsPending(node, pendingKey);

      node.setStatus(PropStatus.Pending, { noEmit: true });

      // const childDependants = node.getChildDependencies();
      // for (const dependant of childDependants) {
      //   // if is same it means that dependant is already waiting to resolve itself so leave him
      //   // to resolve itself
      //   if (dependant._resolverStatus.seenBy !== resolverKey) {
      //     this._resolveEnabledIfDependencies(dependant, resolverKey, pendingKey, true);
      //   }
      // }

      // RUN ALL OTHER AND CHILDREN
      // * children since we might need to disable/enabled them
      // * other because regardless of state need to exec enabledIf since value changed
      const otherDependants  = this.getReverseDependenciesForEnabledIf(node.path);
      const dependantsLength = otherDependants.length;
      for (let i = 0; i < dependantsLength; i++) {
        const dependant = this.jsfBuilder.getProp(otherDependants[i]);
        if (dependant._resolverStatus.seenBy !== resolverKey) {
          this._resolveEnabledIfDependencies(dependant, resolverKey, pendingKey, true);
        }
      }
    } else {
      this.diagnostics('RESOLVED-NODE-ENABLED-IF', { node });

      // RUN ONLY OTHER other because regardless of state we need to exec enabledIf since value changed
      // const otherDependants  = this.getReverseDependenciesForEnabledIf(node.path);
      // const childDependants = node.getChildDependenciesPaths();
      // const dependantsLength = otherDependants.length;
      // for (let i = 0; i < dependantsLength; i++) {
      //   const childIndex = childDependants.indexOf(otherDependants[i]);
      //   if (childIndex > -1) {
      //     childDependants[childIndex] = undefined;
      //     continue;
      //   }
      //   const dependant = this.jsfBuilder.getProp(otherDependants[i]);
      //   if (dependant._resolverStatus.seenBy !== resolverKey) {
      //     this._resolveEnabledIfDependencies(dependant, resolverKey, pendingKey, true);
      //   }
      // }
      this._notifyAboutValueChangeOtherEnabledDependants(node, resolverKey, pendingKey);
    }

    // NOTIFY PARENT UP THE CHAIN since enabled state is recalculated only if value changed
    // meaning that each parent value also changed, so we need to notify all enabledIf dependants (other)
    // exception are children since they are dependant not from value of parent directly but of his state
    // if one needs child to depend on value change of parent it must manually set dependency in that case second
    // dependency is set
    this._notifyAboutValueChangeOtherEnabledDependants(node.parentProp, resolverKey, pendingKey);

    node._resolverStatus.resolvedBy = resolverKey;
  }

  _notifyAboutValueChangeOtherEnabledDependants(node: JsfUnknownPropBuilder, resolverKey: Symbol, pendingKey: Symbol) {
    // Root has no parent
    if (!node) {
      return;
    }
    // Already waiting so skip it it will be handled by other
    if (node._resolverStatus.enabledPending === pendingKey) {
      return;
    }
    // Already done skip it
    if (node._resolverStatus.resolvedBy === resolverKey) {
      return;
    }
    this.diagnostics('NODE-ENABLED-IF-PARENT-NOTIFY', { node });


    // RUN ONLY OTHER other because regardless of state we need to exec enabledIf since value changed
    const otherDependants  = this.getReverseDependenciesForEnabledIf(node.path);
    const childDependants  = node.getChildDependenciesPaths();
    const dependantsLength = otherDependants.length;
    for (let i = 0; i < dependantsLength; i++) {
      const childIndex = childDependants.indexOf(otherDependants[i]);
      if (childIndex > -1) {
        childDependants[childIndex] = undefined;
        continue;
      }
      const dependant = this.jsfBuilder.getProp(otherDependants[i]);
      if (dependant._resolverStatus.seenBy !== resolverKey) {
        dependant._resolverStatus.enabledPending = pendingKey;
        this.diagnostics('PENDING-NODE-ENABLED-IF', { node: dependant });
        this._resolveEnabledIfDependencies(dependant, resolverKey, pendingKey, true);
      }
    }

    this._notifyAboutValueChangeOtherEnabledDependants(node.parentProp, resolverKey, pendingKey);
  }


  // ══════════════════════════════
  // New core util - VALIDATION
  // ══════════════════════════════
  /**
   * Check if node enabled status is known, if not throw exception.
   * @param node
   * @throws Exception if node enabled status was not resolved.
   */
  private beforeValidateCircuitBreaker(node: JsfUnknownPropBuilder) {
    if (node._enabledIfStatus === null) {
      throw new Error(`[RE-07] Can not mark node "${ node.path }" for validation since enabled state was not calculated.`);
    }
  }

  /**
   * Mark all dependencies for validation (DOWN THE TREE, TO THE BOTTOM).
   * @param node
   * @param pendingKey
   */
  private markForValidateDependenciesAsPending(node: JsfUnknownPropBuilder, pendingKey: Symbol) {
    return this._markForValidateDependenciesAsPending(node, Symbol('mark-validate-dependencies'), pendingKey);
  }

  private _markForValidateDependenciesAsPending(node: JsfUnknownPropBuilder, resolverKey: Symbol, pendingKey: Symbol) {
    this.beforeValidateCircuitBreaker(node);

    node.setStatus(PropStatus.Pending, { noEmit: true }); // <= DEPRECATE THIS

    node._resolverStatus.seenBy            = resolverKey;
    node._resolverStatus.validationPending = pendingKey;

    this.diagnostics('PENDING-NODE-VALIDATE', { node });

    const dependencies       = node.dependenciesForValidate;
    const dependenciesLength = dependencies.length;

    // Sanity check if resolver state matches nodes true state.
    if (this.strictMode && this.dependenciesListForValidate[node.path].length !== dependenciesLength) {
      throw new Error('[RE-06] Node dependencies for validation do not match resolver internal state.');
    }

    for (let i = 0; i < dependenciesLength; i++) {
      const edge = dependencies[i];
      if (edge._resolverStatus.resolvedBy !== resolverKey) {
        if (edge._resolverStatus.seenBy === resolverKey) {
          throw new Error(`[RE-01] Circular reference detected when trying to mark for validation dependencies: "${ node.path }" -> "${ edge.path }".`);
        }
        this._markForValidateDependenciesAsPending(edge, resolverKey, pendingKey);
      }
    }

    node._resolverStatus.resolvedBy = resolverKey;
  }

  /**
   * Mark all dependants for validation (UP THE TREE, TO THE TOP).
   * @param node
   * @param pendingKey
   */
  markForValidateDependantsAsPending(node: JsfUnknownPropBuilder, pendingKey: Symbol) {
    return this._markForValidateDependantsAsPending(node, Symbol('mark-validate-dependants'), pendingKey);
  }

  _markForValidateDependantsAsPending(node: JsfUnknownPropBuilder, resolverKey: Symbol, pendingKey: Symbol) {
    this.beforeValidateCircuitBreaker(node);

    node.setStatus(PropStatus.Pending, { noEmit: true });
    node._resolverStatus.seenBy            = resolverKey;
    node._resolverStatus.validationPending = pendingKey;

    this.diagnostics('PENDING-NODE-VALIDATE', { node });

    this.beforeValidateCircuitBreaker(node);

    const dependants       = this.getReverseDependenciesForValidate(node.path);
    const dependantsLength = dependants.length;

    for (let i = 0; i < dependantsLength; i++) {
      const dependantNode = this.jsfBuilder.getProp(dependants[i]);
      if (dependantNode._resolverStatus.resolvedBy !== resolverKey) {
        if (dependantNode._resolverStatus.seenBy === resolverKey) {
          throw new Error(`[RE-02] Circular reference detected when trying to mark for validation dependants: "${ node.path }" -> "${ dependantNode.path }".`);
        }
        if (dependantNode.pending) {
          continue; // someone already traveled this path so do not waste time
        }
        this._markForValidateDependantsAsPending(dependantNode, resolverKey, pendingKey);
      }
    }

    node._resolverStatus.resolvedBy = resolverKey;
  }

  /**
   * Validate node and it's children/dependencies.
   * @param node
   * @param id
   * @param trace used to notify world about status and validation changes
   */
  resolveValidationDependencies(node: JsfUnknownPropBuilder, id: number, trace: JsfUnknownPropBuilder[]) {
    return this._resolveValidationDependencies(node, Symbol(id), trace);
  }

  async _resolveValidationDependencies(node: JsfUnknownPropBuilder, resolverKey: Symbol, trace: JsfUnknownPropBuilder[]) {
    node._resolverStatus.seenBy = resolverKey;

    if (!node._resolverStatus.validationPending) {
      this.warn(`"${ node.path }" was not markedForValidation.`);
    }

    const edgesPaths = this.dependenciesListForValidate[node.path] || [];
    for (const edge of edgesPaths.map(x => this.jsfBuilder.getProp(x))) { // POP
      if (!edge.pending) {
        continue;
      }
      if (edge._resolverStatus.resolvedBy !== resolverKey) {
        if (edge._resolverStatus.seenBy === resolverKey) {
          throw new Error(`[RE-03] Circular reference detected while validating: "${ node.path }" -> "${ edge.path }".`);
        }
        await this._resolveValidationDependencies(edge, resolverKey, trace);
      }
    }

    // Circuit breaker
    if (!node.dependenciesForValidateReady()) {
      throw new Error(`[RE-04] Not all dependencies are ready for: "${ node.path }"
      DEPENDENCIES:
      ${ JSON.stringify(node.dependenciesForValidateReadyList(), null, 2) }
      STATUS TREE:
      ${ JSON.stringify(node.statusTree(), null, 2) }
      `);
    }

    if (node.pending) {
      trace.push(node);

      const startTime = this.jsfBuilder.diagnosticsHook && (+new Date());

      await node._updateValidationStatus({ noEmit: true });
      node._resolverStatus.validationPending = null;

      this.diagnostics('RESOLVED-NODE-VALIDATE', { node, duration: (+new Date()) - startTime });
    }

    node._resolverStatus.resolvedBy = resolverKey;
  }

  // ══════════════════════
  // Core util for FLOW CONTROL
  // ══════════════════════

  prepareNextResolveQueue() {
    const resolveQueue = this.nextResolveQueue;
    const emitResolve  = this.nextResolveQueuePromiseResolve;
    const emitReject   = this.nextResolveQueuePromiseReject;

    this.nextResolveQueue        = [];
    this.nextResolveQueuePromise = new Promise<void>((resolve, reject) => {
      this.nextResolveQueuePromiseResolve = resolve;
      this.nextResolveQueuePromiseReject  = reject;
    });

    return {
      resolveQueue,
      emitResolve,
      emitReject
    }
  }

  async runNextQueueBatch() {
    if (!this.nextResolveQueue.length) {
      return;
    }

    const id                                        = this.resolveCount++;
    const { resolveQueue, emitResolve, emitReject } = this.prepareNextResolveQueue();

    /////////////////////////////// START RESOLVE
    this.diagnostics('RESOLVER-START', { id });


    const startTime = +new Date();
    try {
      await this.resolve(resolveQueue, id);
    } catch (e) {
      emitReject(e);
      throw e;
    }

    this.info(`[R] Resolver <${ id }> finished in ${ (+new Date()) - startTime }ms`);
    this.diagnostics('RESOLVER-FIN', { id, duration: (+new Date()) - startTime });

    /////////////////////////////// END RESOLVE
    emitResolve();
  }

  async runUntilIdle(idlePromiseResolve?: () => void) {
    if (this.nextResolveLock && !idlePromiseResolve) {
      this.debug('[R]: nothing to do');
      return;
    }

    if (!this.nextResolveQueue.length) {
      this.nextResolveLock = false;
      if (idlePromiseResolve) {
        idlePromiseResolve();
        this.debug('[R]: entering IDLE state');
      } else {
        this.debug('[R]: strange, nothing to do, but already in IDLE');
      }
      return;
    }

    this.nextResolveLock = true;

    if (!idlePromiseResolve) {
      this.debug('[R]: waiting for IDLE flag');

      // wait for previous resolve to finish
      await this.idlePromise;

      // set us as current resolve
      this.idlePromise = new Promise<void>((resolve, reject) => {
        idlePromiseResolve = resolve;
      });
    }

    if (this.resumePromise) {
      this.debug('[R]: waiting for RESUME');
      // wait for resume event if set
      await this.resumePromise;
      this.resumePromise = null;
    } else {
      this.debug('[R]: waiting 10ms for queue final collect');
      // wait X ms to maybe get more than one node into queue
      if (this.resolveCount > 1) {
        await new Promise(start => setTimeout(start, 10));
      }
    }

    // Actual resolve
    this.debug('[R]: starting resolve');
    await this.runNextQueueBatch();

    this.debug('[R]: resolve finished');
    return this.runUntilIdle(idlePromiseResolve);
  }

  /**
   * Entry point into resolver. You really should not use ignoreReadyFlag, this is intended only for first setup.
   */
  async updateStatus(node: JsfUnknownPropBuilder, options: { ignoreReadyFlag?: boolean } = {}): Promise<void> {
    if (!this.jsfBuilder.ready && !options.ignoreReadyFlag) {
      return;
    }

    this.nextResolveQueue.push(node.path);

    if (!jsfEnv.isApi && (window as any).__jsf_ngZone) {
      (window as any).__jsf_ngZone.runOutsideAngular(() => {
        this.runUntilIdle()
          .catch(console.error);
      });
    } else {
      this.runUntilIdle()
        .catch(console.error);
    }

    return this.nextResolveQueuePromise;
  }

  /**
   * Resolve given nodes enabled state and than validate whole tree.
   * @param nodePaths
   * @param id
   */
  private async resolve(nodePaths: string[], id: number): Promise<void> {
    const startTime = +new Date();

    this.processNewlyRemovedNodes();

    nodePaths   = uniq(nodePaths);
    let nodes;
    try {
      nodes = nodePaths
        .map(x => this.jsfBuilder.getProp(x))
        // FIRST CALCULATE ENABLED/DISABLED status
        // there is nothing to do, parent is in DISABLED state so child must stay DISABLED
        .filter(node => !node.parentProp || !node.parentProp.disabled)
      ;
    } catch (e) {
      console.error(e);
      return;
    }

    if (!nodePaths.length) {
      return;
    }

    this.info(`[R] Started resolving: ${ nodePaths.join(', ') }`);

    const pendingKey = Symbol('P' + id);
    for (const node of nodes) {
      this.markEnabledIfDependantsAsPending(node, pendingKey);
      node._recalculateEnabledIfStatusOnNextResolve = true;
      this.resolveEnabledIfDependencies(node, id, pendingKey);

      // SECOND CALCULATE VALIDATION
      if (isPropBuilderArray(node) || isJsfPropBuilderObject(node)) {
        this.markForValidateDependenciesAsPending(node, pendingKey);
      }
      this.markForValidateDependantsAsPending(node, pendingKey);
      node.setStatus(PropStatus.Pending, { noEmit: true });
    }

    // RESOLVE VALIDATION top to bottom
    const trace: JsfUnknownPropBuilder[] = [];
    // FIRST RESOLVE DEPENDENCY TREE
    await this.resolveValidationDependencies(this.jsfBuilder.propBuilder, id, trace);
    this.info(`[R] Inner resolver <${ id }> finished in ${ (+new Date()) - startTime }ms`);

    const traceLength = trace.length;
    for (let i = 0; i < traceLength; i++) {
      trace[i].emitStatusIfNeeded();
    }
  }
}
