import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
}                                                                                            from '@angular/core';
import { JsfLayoutRender2D, JsfSpecialLayoutBuilder, PropStatus, PropStatusChangeInterface } from '@kalmia/jsf-common-es2015';
import { AbstractSpecialLayoutComponent }                                                    from '../../../abstract/special-layout.component';
import { ScriptInjectorService }                                                             from '../../../services/script-injector.service';
import { Renderer }                                                                          from './renderer';
import { BuilderDeveloperToolsInterface }                                                    from '../../../builder-developer-tools.interface';
import { takeUntil }                                                                         from 'rxjs/operators';
import { debounce, flattenDeep, get, isArray, map, merge, pick, set, uniq }                  from 'lodash';
import * as Bowser                                                                           from 'bowser';
import { DomSanitizer, SafeUrl }                                                             from '@angular/platform-browser';

export const render2dConfig = {

  libraryUrl: 'https://app.salesqueze.com/en/assets/lib/pixijs-v5/pixi-legacy.min.js'

};


let render2dCount = 0;

enum DisplayMode {
  Realtime = 'realtime',
  SSR      = 'ssr'
}

@Component({
  selector       : 'jsf-layout-render-2d',
  template       : `
      <div class="jsf-layout-render-2d"
           [ngClass]="htmlClass"
           [class.loading]="loadingIndicatorVisible">

          <div class="render-2d-loading-indicator" *ngIf="loadingIndicatorVisible">
              <mat-spinner color="accent" diameter="45"></mat-spinner>
          </div>

          <div id="jsf-render-2d-{{ render2dId }}"
               class="render-2d-container rounded-sm"
               [class.d-none]="!isRealtimeDisplayMode"
               #renderContainer>
          </div>

          <img [attr.src]="ssrImageUrl"
               alt="Render"
               class="render-2d-ssr"
               [class.d-none]="!isSSRDisplayMode">
      </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : [`
      .render-2d-container {
          overflow: hidden;
      }

      .jsf-layout-render-2d {
          position: relative;
          height:   100%;
      }

      .jsf-layout-render-2d.loading {
          /* Set a min height value when loading to ensure the loading indicator is properly visible */
          min-height: 100px;
      }

      .jsf-layout-render-2d .render-2d-loading-indicator {
          position:  absolute;
          top:       50%;
          left:      50%;
          transform: translate(-50%, -50%);
      }

      .render-2d-ssr {
          width:   100%;
          display: block;
      }

      .loading .render-2d-ssr {
          opacity: .35;
      }

      :host /deep/ .renderer {
          /* Scale canvas element to parent */
          width:   100%;
          /* Prevent an extra 5px margin on the bottom of the canvas */
          display: block;
      }
  `]
})
export class LayoutRender2DComponent extends AbstractSpecialLayoutComponent<JsfLayoutRender2D> implements OnInit, OnDestroy, AfterViewInit {


  private renderer: Renderer;

  public render2dId = ++render2dCount;

  // Realtime renderer loading indicator
  public loading = true;

  // SSR renderer loading indicator
  public ssrLoading = true;

  /**
   * SSR state.
   */
  public ssrImageUrl: SafeUrl;
  private ssrImageUrlRaw: string;

  private ssrUpdateNext     = false;
  private ssrRequestPending = false;

  // Will be set to true if the device is capable of running a realtime renderer.
  private _deviceSupportsRealtimeRendering;

  // Will be set to true if realtime rendering should be enabled.
  private _useRealtimeRendering;
  // Will be set to true if serverside rendering should be enabled.
  private _useServerSideRendering;

  // Global flag to toggle between realtime or SSR rendering display mode.
  public displayMode: DisplayMode;

  // Flag indicating whether the initial realtime renderer load has completed. Used for preloading using SSR.
  private _realtimeRendererFinishedLoading = false;


  @Input()
  layoutBuilder: JsfSpecialLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  @ViewChild('renderContainer')
  private renderContainer: ElementRef;

  private libraryLoaded = false;

  get hookId() {
    return `render-2d-${ this.render2dId }-screenshot`;
  }

  get loadingIndicatorVisible() {
    return (this.isRealtimeDisplayMode && this.loading) || (this.isSSRDisplayMode && this.ssrLoading);
  }

  /**
   * Display mode getters.
   */
  get isRealtimeDisplayMode() {
    return this.displayMode === DisplayMode.Realtime;
  }

  get isSSRDisplayMode() {
    return this.displayMode === DisplayMode.SSR;
  }

  get useRealtimeRendering() {
    return this._useRealtimeRendering;
  }

  get useServerSideRendering() {
    return this._useServerSideRendering;
  }

  get realtimeRendererFinishedLoading() {
    return this._realtimeRendererFinishedLoading;
  }

  get ssrDffKey() {
    if (this.layout.ssr && this.layout.ssr.dffKey) {
      return this.layout.ssr.dffKey;
    }

    if (this.layoutBuilder.rootBuilder.doc.$dff && this.layoutBuilder.rootBuilder.doc.$dff.key) {
      return this.layoutBuilder.rootBuilder.doc.$dff.key;
    }
  }

  get alwaysUseSSR() {
    return this.layout.ssr && this.layout.ssr.alwaysUseSSR;
  }

  get preloadWithSSR() {
    return this.layout.ssr && this.layout.ssr.preloadWithSSR;
  }

  public updateSSRImage = debounce(() => {
    this.ssrUpdateNext = true;
    if (!this.ssrRequestPending) {
      this.ssrCheckNext();
    }
  }, 200);

  constructor(private scriptInjector: ScriptInjectorService,
              private cdRef: ChangeDetectorRef,
              private sanitizer: DomSanitizer) {
    super();
  }

  ngOnInit(): void {
    this.layoutBuilder.visibleObservable
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((visible) => {
        this.updateRendererRunningState();
      });

    const ssrEnabled                      = this.layout.ssr && this.layout.ssr.enabled;
    this._deviceSupportsRealtimeRendering = !(
      Bowser.msie // Internet Explorer.
      || Bowser.mobile // Mobile browser.
      || Bowser.tablet // Tablet browser.
      || Bowser.c // This browser has degraded capabilities. Serve simpler version.
      || Bowser.x // This browser has minimal capabilities and is probably not well detected.
    );

    console.log('[Render2D] _deviceSupportsRealtimeRendering', this._deviceSupportsRealtimeRendering);

    this._useRealtimeRendering = !!((this._deviceSupportsRealtimeRendering && !this.alwaysUseSSR) || this.isHeadlessMode);

    const useServerSideRendering = !!(ssrEnabled &&
      (!this.isHeadlessMode && (this.alwaysUseSSR || this.preloadWithSSR || !this._deviceSupportsRealtimeRendering)));
    if (useServerSideRendering) {
      if (this.ssrDffKey) {
        this._useServerSideRendering = true;
      } else {
        console.error(`[Render2D] Cannot start SSR mode (missing dff key)`);
        this._useServerSideRendering = false;
      }
    } else {
      this._useServerSideRendering = false;
    }

    // Fall back to realtime if no best matching option was found.
    if (!this._useRealtimeRendering && !this._useServerSideRendering) {
      console.log('[Render2D] No appropriate rendering mode found, will use realtime as the default');
      this._useRealtimeRendering = true;
    }

    console.log('[Render2D] _useRealtimeRendering', this._useRealtimeRendering);
    console.log('[Render2D] _useServerSideRendering', this._useServerSideRendering);

    this.updateDisplayMode();
  }

  private updateRendererRunningState() {
    if (this.renderer) {
      this.layoutBuilder.visible ? this.renderer.setAsRunning() : this.renderer.setAsPaused();
    }
  }

  private updateDisplayMode() {
    if (this.isHeadlessMode) {
      // In case of headless mode always go realtime.
      this.displayMode = DisplayMode.Realtime;
    } else if (this.useRealtimeRendering && (!this.preloadWithSSR || (this.preloadWithSSR && this.realtimeRendererFinishedLoading))) {
      this.displayMode = DisplayMode.Realtime;
    } else if (this.useServerSideRendering) {
      this.displayMode = DisplayMode.SSR;
    }

    this.cdRef.detectChanges();

    console.log('[Render2D] Setting display mode to', this.displayMode);
  }

  async ngOnDestroy(): Promise<void> {
    super.ngOnDestroy();

    if (this.useRealtimeRendering) {
      await this.renderer.destroy();
      this.renderer = null;
    }

    this.layoutBuilder.rootBuilder.removePreSubmitHook(this.hookId);
  }

  async ngAfterViewInit() {
    this.layoutBuilder.rootBuilder.addPreSubmitHook(this.hookId, this.takeScreenshotAndAssignToProperty.bind(this));

    // Set up server side rendering
    if (this.useServerSideRendering) {
      console.log(`[Render2D] Starting ssr renderer...`);

      const dependencies = this.getRendererDependencies();
      for (const dependency of dependencies) {
        const dependencyAbsolutePath = this.layoutBuilder.abstractPathToAbsolute(dependency);
        this.layoutBuilder.rootBuilder.listenForStatusChange(dependencyAbsolutePath)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((status: PropStatusChangeInterface) => {
            if (status.status !== PropStatus.Pending) {
              this.updateSSRImage();
            }
          });
      }

      this.updateSSRImage();
    }

    // Set up realtime rendering
    if (this.useRealtimeRendering) {
      console.log(`[Render2D] Starting realtime renderer...`);
      await this.runApp();

      if (this.preloadWithSSR) {
        console.log('[Render2D] SSR preload - waiting for renderer to finish...');
        await this.ensureRendererFinishedLoading();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay an additional 1 second
        console.log('[Render2D] SSR preload - finished');
      }

      this._realtimeRendererFinishedLoading = true;
    }

    this.updateDisplayMode();
  }


  private getRendererDependencies() {
    function extractDependencies(o: { [key: string]: any }) {
      const deps = [];

      const properties = Object.keys(o);
      for (const property of properties) {
        const value = o[property];
        if (Array.isArray(value)) {
          deps.push(flattenDeep(value.map(x => extractDependencies(x))));
        } else if (typeof value === 'object') {
          if ('$eval' in value && 'dependencies' in value) {
            deps.push(value['dependencies']);
          } else {
            deps.push(extractDependencies(value));
          }
        }
      }

      return deps;
    }

    const dependencies = [];
    dependencies.push(extractDependencies(this.layout));

    return uniq(flattenDeep(dependencies));
  }

  private pickExtended(object, paths) {
    return paths.reduce((result, path) => {
      if (path.includes('[].')) {
        const [collectionPath, itemPath] = path.split(/\[]\.(.+)/);
        const collection                 = get(object, collectionPath);

        if (!isArray(collection)) {
          return result;
        }

        const partialResult = {};
        set(
          partialResult,
          collectionPath,
          map(collection, item => this.pickExtended(item, [itemPath]))
        );

        return merge(result, partialResult);
      }

      return merge(result, pick(object, [path]));
    }, {});
  }

  private ssrCheckNext() {
    if (this.ssrUpdateNext) {
      this.ssrUpdateInternal()
        .catch(e => {
          throw e;
        });
      this.ssrUpdateNext = false;
    }
  }

  private async ssrUpdateInternal() {
    this.ssrRequestPending = true;

    const documentValue = this.layoutBuilder.rootBuilder.getJsonValue();

    // Pick only keys which the renderer depends on.
    const dependantValue = this.pickExtended(documentValue, this.getRendererDependencies());

    try {
      this.ssrLoading = true;
      this.cdRef.markForCheck();
      this.cdRef.detectChanges();

      this.layoutBuilder.rootBuilder.apiService.post(`headless/render/dff/${ this.ssrDffKey }`,
        {
          value: dependantValue
        })
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((response: { hash: string; imageUrl: string; }) => {
          this.ssrImageUrlRaw = response.imageUrl;
          this.ssrImageUrl    = this.sanitizer.bypassSecurityTrustUrl(response.imageUrl);

          this.ssrLoading = false;

          this.cdRef.markForCheck();
          this.cdRef.detectChanges();

          this.ssrRequestPending = false;
          this.ssrCheckNext();
        }, (e) => {
          this.ssrRequestPending = false;

          console.error(e);
        });
    } catch (e) {
      console.error(e);

      this.ssrLoading = false;

      this.cdRef.markForCheck();
      this.cdRef.detectChanges();

      this.ssrRequestPending = false;
      this.ssrCheckNext();
    }
  }


  /**
   * Runs the renderer application.
   */
  private async runApp() {
    await this.injectPIXI();
    await this.createRenderer();
    await this.attachRenderer();

    this.updateRendererRunningState();

    this.loading = false;

    this.cdRef.detectChanges();

    if (this.renderer.options.headless) {
      const config = this.getHeadlessActionConfig();
      if (config.id === this.layout.id) {
        return this.takeHeadlessScreenshot({ delay: config.delay });
      }
    }
  }

  /**
   * Inject the PIXI library.
   */
  private async injectPIXI() {
    if (!this.libraryLoaded) {
      await this.scriptInjector.injectScriptFromUrl(render2dConfig.libraryUrl);
      this.libraryLoaded = true;
    }
  }

  private async createRenderer() {
    this.renderer = new Renderer(this.layoutBuilder, { headless: this.isHeadlessMode });
    return this.renderer.bootstrap();
  }

  private async attachRenderer() {
    if (!this.renderer) {
      throw new Error(`Renderer not found`);
    }
    if (!this.renderContainer) {
      throw new Error(`Render container not found.`);
    }

    // Attach renderer to dom
    (this.renderContainer.nativeElement as HTMLElement)
      .appendChild(this.renderer.application.view);

    // Add class
    this.renderer.application.view.classList.add('renderer');

    // Perform change detection cycle
    this.cdRef.detectChanges();
  }

  private async takeScreenshotAndAssignToProperty() {
    const assignToKey = this.layout.screenshot && this.layout.screenshot.key;
    if (!assignToKey) {
      return;
    }

    if (this.useServerSideRendering) {
      const response = await this.layoutBuilder.rootBuilder.apiService.getNoAuth(this.ssrImageUrlRaw, {
          responseType: 'arraybuffer'
        })
        .pipe(takeUntil(this.ngUnsubscribe))
        .toPromise();

      const downloadedImageAsBase64 = await (new Promise((resolve, reject) => {
        const blob   = new Blob([response], { type: 'image/jpeg' });
        const reader = new FileReader();
        reader.addEventListener('load', function () {
          resolve(reader.result);
        }, false);

        reader.onerror = () => {
          return reject(this);
        };
        reader.readAsDataURL(blob);
      }));

      // Set image on the specified prop.
      // tslint:disable-next-line:no-shadowed-variable
      const prop = this.layoutBuilder.rootBuilder.propBuilder.getControlByPath(assignToKey);
      return prop.patchJsonValue(downloadedImageAsBase64, {
        noResolve    : true,
        noValueChange: true
      });
    }

    if (!this.renderer) {
      throw new Error(`Renderer instance does not exist`);
    }

    const canvas = this.renderer.application.view;
    if (!canvas) {
      throw new Error(`Can't get canvas element`);
    }

    // Pause application ticker.
    this.renderer.ticker.stop();

    // Execute `toDataUrl` asynchronously otherwise the page will freeze for a second.
    const imageData = await (new Promise((resolve) => {
      setTimeout(() => {
        resolve(canvas.toDataURL('image/png'));
      }, 0);
    }));

    // Resume application ticker.
    this.renderer.ticker.start();

    // Set image on the specified prop.
    const prop = this.layoutBuilder.rootBuilder.propBuilder.getControlByPath(assignToKey);
    return prop.patchJsonValue(imageData, {
      noResolve    : true,
      noValueChange: true
    });
  }

  private async ensureRendererFinishedLoading() {
    // Pause application ticker.
    this.renderer.ticker.stop();

    // Force an update and render a frame.
    this.renderer.ticker.forceUpdate();
    this.renderer.application.render();

    // Ensure everything gets rendered.
    let finished = false;
    while (!finished) {
      // Wait for more resources to be loaded.
      await this.renderer.resourceLoader.allResourcesLoaded();

      // Update.
      await (new Promise((resolve) => {
        setTimeout(() => {
          this.renderer.ticker.forceUpdate();
          resolve();
        });
      }));

      // Render a frame.
      await (new Promise((resolve) => {
        setTimeout(() => {
          this.renderer.application.render();
          resolve();
        });
      }));

      // Wait 50ms.
      await (new Promise(resolve => setTimeout(resolve, 50)));

      // Check if there are more resources available.
      if (!this.renderer.resourceLoader.hasPendingResources()) {
        finished = true;
      }
    }

    // Render another frame.
    await (new Promise((resolve) => {
      setTimeout(() => {
        this.renderer.application.render();
        resolve();
      });
    }));

    // Resume application ticker.
    this.renderer.ticker.start();
  }

  private async takeHeadlessScreenshot(options: { delay?: number } = {}) {
    if (!this.renderer) {
      throw new Error(`Renderer instance does not exist`);
    }

    const canvas = this.renderer.application.view;
    if (!canvas) {
      throw new Error(`Can't get canvas element`);
    }

    await this.ensureRendererFinishedLoading();

    // Execute on next tick
    await (new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, options.delay || 0);
    }));

    console.log('[Render2D] About to get image');

    // Execute `toDataUrl` asynchronously otherwise the page will freeze for a second.
    const imageData = await (new Promise((resolve) => {
      setTimeout(() => {
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      }, 0);
    }));

    console.log('[Render2D] Image rendered');

    const headlessOnCustomEvent = (window as any)['headlessOnCustomEvent'];

    headlessOnCustomEvent({
      type: 'finish',
      data: {
        image: imageData.toString()
      }
    });
  }

  private get isHeadlessMode() {
    const headlessInstructions = (window as any)['__headless'];
    if (headlessInstructions) {
      if (headlessInstructions.action && headlessInstructions.action.type === 'render-2d-output-image') {
        return true;
      }
    }
  }

  private getHeadlessActionConfig() {
    return (window as any)['__headless'].action.config;
  }
}
