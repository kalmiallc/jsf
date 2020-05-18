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
}                                                                                                   from '@angular/core';
import { JsfLayoutCustomComponent, JsfSpecialLayoutBuilder, PropStatus, PropStatusChangeInterface } from '@kalmia/jsf-common-es2015';
import { AbstractSpecialLayoutComponent }                                                           from '../../../abstract/special-layout.component';
import { ScriptInjectorService }                                                                    from '../../../services/script-injector.service';
import { BuilderDeveloperToolsInterface }                                                           from '../../../builder-developer-tools.interface';
import { takeUntil }                                                                                from 'rxjs/operators';
import Color                                                                                        from 'color';
import { CustomComponentFactory, CustomComponentInterface }                                         from './custom-component.interface';
import { DomSanitizer, SafeHtml }                                                                   from '@angular/platform-browser';


enum CustomComponentEventType {
  Init,
  Update,
  Destroy
}


let customComponentCount = 0;

@Component({
  selector       : 'jsf-layout-custom-component',
  template       : `
      <div class="jsf-layout-custom-component" [ngClass]="htmlClass"
           id="{{ customComponentElementId }}"
           [innerHtml]="componentHtml"
           #element>
      </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class LayoutCustomComponentComponent extends AbstractSpecialLayoutComponent<JsfLayoutCustomComponent> implements OnInit, OnDestroy, AfterViewInit {

  @Input()
  layoutBuilder: JsfSpecialLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  @ViewChild('element')
  element: ElementRef;

  public customComponentId = ++customComponentCount;

  private componentInstance: CustomComponentInterface;
  public componentHtml: SafeHtml;
  public componentStyles: HTMLElement[] = [];


  get customComponentElementId() {
    return `jsf-custom-component-${ this.customComponentId }`;
  }

  constructor(private scriptInjector: ScriptInjectorService,
              private sanitizier: DomSanitizer,
              private cdRef: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
  }

  public ngOnDestroy(): void {
    // Trigger destroy event
    this.emitComponentInstanceEvent(CustomComponentEventType.Destroy);

    // Clear html
    this.element.nativeElement.innerHtml = void 0;

    // Remove styles
    for (const styleElement of this.componentStyles) {
      styleElement.remove();
    }

    super.ngOnDestroy();
  }


  public async ngAfterViewInit() {
    // Create component
    await this.createCustomComponent();

    // Subscribe to dependencies
    this.subscribeToDependencies();

    // Trigger onInit
    this.emitComponentInstanceEvent(CustomComponentEventType.Init);
  }

  private subscribeToDependencies() {
    // Prop dependencies
    const dependencies = this.componentInstance.dependencies || [];

    if (dependencies.length) {
      for (const dependency of dependencies) {
        const dependencyAbsolutePath = this.layoutBuilder.abstractPathToAbsolute(dependency);
        this.layoutBuilder.rootBuilder.listenForStatusChange(dependencyAbsolutePath)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((status: PropStatusChangeInterface) => {
            if (status.status !== PropStatus.Pending) {
              this.emitComponentInstanceEvent(CustomComponentEventType.Update);
            }
          });
      }
    }

    // Layout dependencies
    const layoutDependencies = this.componentInstance.layoutDependencies || [];

    if (layoutDependencies.length) {
      for (const id of layoutDependencies) {
        this.layoutBuilder.rootBuilder.subscribeLayoutStateChange(id)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(newValue => {
            this.emitComponentInstanceEvent(CustomComponentEventType.Update);
          });
      }
    }
  }

  private async createCustomComponent() {
    let componentData;
    if (typeof this.layout.component === 'object' && '$eval' in this.layout.component) {
      const ctx     = this.layoutBuilder.rootBuilder.getEvalContext({
        layoutBuilder: this.layoutBuilder
      });
      componentData = this.layoutBuilder.rootBuilder.runEvalWithContext(
        (this.layout.component as any).$evalTranspiled || this.layout.component.$eval, ctx);
    } else {
      componentData = this.layout.component;
    }

    // Check what type of data we have
    let script: CustomComponentFactory | string = componentData;
    if (typeof script === 'string' && (script.startsWith('http://') || script.startsWith('https://'))) {
      // Fetch the component script
      script = await this.layoutBuilder.rootBuilder.apiService.getNoAuth(componentData)
        .pipe(takeUntil(this.ngUnsubscribe))
        .toPromise();

      script = new Function(script as string)();
    } else if (typeof script === 'object' && '$eval' in script) {
      const ctx = this.layoutBuilder.rootBuilder.getEvalContext({
        layoutBuilder     : this.layoutBuilder,
      });

      script = this.layoutBuilder.rootBuilder.runEvalWithContext((script as any).$evalTranspiled || (script as any).$eval, ctx);
    }

    // Get config
    let config = this.layout.config;
    if (typeof config === 'object' && '$eval' in config) {
      const ctx = this.layoutBuilder.rootBuilder.getEvalContext({
        layoutBuilder     : this.layoutBuilder,
      });

      config = this.layoutBuilder.rootBuilder.runEvalWithContext((config as any).$evalTranspiled || config.$eval, ctx);
    }

    // Get custom component instance
    this.componentInstance = (script as CustomComponentFactory)(this.customComponentElementId, config || {});

    const head = document.querySelector('head');

    // Inject html
    this.componentHtml = this.sanitizier.bypassSecurityTrustHtml(this.componentInstance.html);
    this.cdRef.detectChanges();

    // Inject styles
    for (const css of this.componentInstance.styles || []) {
      const styleElement: HTMLStyleElement = document.createElement('style');
      styleElement.appendChild(document.createTextNode(css));
      head.appendChild(styleElement);
      this.componentStyles.push(styleElement);
    }

    for (const cssUrl of this.componentInstance.styleUrls || []) {
      const styleElement: HTMLLinkElement = document.createElement('link');
      styleElement.type                   = 'text/css';
      styleElement.rel                    = 'stylesheet';
      styleElement.href                   = cssUrl;
      head.appendChild(styleElement);
      this.componentStyles.push(styleElement);
    }

    // Inject scripts
    for (const js of this.componentInstance.scripts || []) {
      await this.scriptInjector.injectScript(js);
    }

    for (const jsUrl of this.componentInstance.scriptUrls || []) {
      await this.scriptInjector.injectScriptFromUrl(jsUrl);
    }
  }


  emitComponentInstanceEvent(eventType: CustomComponentEventType) {
    const ctx = this.layoutBuilder.rootBuilder.getEvalContext({
      layoutBuilder     : this.layoutBuilder,
      extraContextParams: {
        $color: Color
      }
    });

    switch (eventType) {
      case CustomComponentEventType.Init:
        return this.componentInstance.onInit && this.componentInstance.onInit(ctx);
      case CustomComponentEventType.Update:
        return this.componentInstance.onUpdate && this.componentInstance.onUpdate(ctx);
      case CustomComponentEventType.Destroy:
        return this.componentInstance.onDestroy && this.componentInstance.onDestroy(ctx);
    }
  }


  private getChartConfig() {
    if (typeof this.layout.config === 'object' && '$eval' in this.layout.config) {
      const ctx = this.layoutBuilder.rootBuilder.getEvalContext({
        layoutBuilder     : this.layoutBuilder,
        extraContextParams: {
          $color: Color
        }
      });
      return this.layoutBuilder.rootBuilder.runEvalWithContext(
        (this.layout.config as any).$evalTranspiled || this.layout.config.$eval, ctx);

    } else {
      return this.layout.config;
    }
  }

}
