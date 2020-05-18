import {
  ComponentRef, ElementRef,
  Inject,
  Injectable,
  Injector,
  NgModuleFactory,
  NgModuleFactoryLoader,
  Renderer2,
  ViewContainerRef
} from '@angular/core';
import { JSF_APP_CONFIG, JsfAppConfig }                                                                      from '../../common';
import { OverlayContainer }                                                                                  from '@angular/cdk/overlay';
import { JsfResponsiveService }                                                                              from './responsive.service';
import { BaseThemeComponent }                                                                                from '../theme/base-theme.component';
import { pascalcase }                                                                                        from '../../utilities';
import { JsfThemeRenderMode }                                                                                from '../theme/render-mode.enum';
import { JsfLayoutPreferencesInterface }                                                                     from '@kalmia/jsf-common-es2015';


export interface ThemeRendererOptions {
  disableWrapperStyles?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeRendererService {

  constructor(private loader: NgModuleFactoryLoader,
              private injector: Injector,
              private cdkOverlayContainer: OverlayContainer,
              private responsiveService: JsfResponsiveService,
              @Inject(JSF_APP_CONFIG) private jsfAppConfig: JsfAppConfig) {
  }

  private _globalThemePreferences: JsfLayoutPreferencesInterface;
  get globalThemePreferences(): JsfLayoutPreferencesInterface {
    return this._globalThemePreferences;
  }


  private get jsfThemePath(): string {
    return this.jsfAppConfig.themePath;
  }

  public async renderTheme(renderer: Renderer2,
                           container: ViewContainerRef,
                           themePath: string,
                           renderMode: JsfThemeRenderMode = JsfThemeRenderMode.Form,
                           options?: ThemeRendererOptions,
                           containerElementRef?: ElementRef): Promise<BaseThemeComponent> {
    container.clear();

    themePath = themePath || `default/default`;
    if (!themePath) {
      return void 0;
    }

    const themeName    = themePath.split('/')[0];
    const themeVariant = themePath.split('/')[1];

    const jsfThemePath = this.jsfThemePath;
    // tslint:disable-next-line
    const modulePath   = `${ jsfThemePath }themes/${ themeName }/variants/${ themeVariant }/${ themeName }-${ themeVariant }.module.ts#${ pascalcase(`${ themeName }-${ themeVariant }`) }Module`;

    try {
      const moduleFactory: NgModuleFactory<any> = await this.loader.load(modulePath);

      // Load main entry component from module
      const entryComponent = (<any>moduleFactory.moduleType).entryComponent;
      const moduleRef      = moduleFactory.create(this.injector);
      const compFactory    = moduleRef.componentFactoryResolver.resolveComponentFactory(entryComponent);
      const componentRef   = container.createComponent(compFactory);

      this.responsiveService.breakpoints = (componentRef.instance as BaseThemeComponent).breakpoints;

      (componentRef.instance as BaseThemeComponent).activeRenderMode = renderMode;

      // Add theme class to theme component & CDK overlay
      const themeClassName = `app-theme-${ themeName }-${ themeVariant }`;
      renderer.addClass(componentRef.location.nativeElement, themeClassName);

      if (renderMode === JsfThemeRenderMode.Styles) {
        if (!containerElementRef) {
          throw new Error(`No container element provided.`);
        }
        renderer.addClass(containerElementRef.nativeElement, themeClassName);
      }

      if (options && options.disableWrapperStyles) {
        renderer.addClass(componentRef.location.nativeElement, `wrapper-styles-disabled`);
      }

      if (renderMode === JsfThemeRenderMode.RouterOutlet || renderMode === JsfThemeRenderMode.Styles || this.jsfAppConfig.alwaysRenderCdkOverlay) {
        // Save global theme preferences
        this._globalThemePreferences = (componentRef.instance as BaseThemeComponent).preferences;

        // Add classes to CDK overlay element
        const cdkOverlayElement = this.cdkOverlayContainer.getContainerElement();
        const classesToRemove   = [];
        for (const className of Array.from(cdkOverlayElement.classList)) {
          if (className.startsWith('app-theme')) {
            classesToRemove.push(className);
          }
        }
        classesToRemove.map(x => renderer.removeClass(cdkOverlayElement, x));
        renderer.addClass(cdkOverlayElement, themeClassName);

        if (options && options.disableWrapperStyles) {
          renderer.addClass(cdkOverlayElement, `wrapper-styles-disabled`);
        }
      }

      return componentRef.instance as BaseThemeComponent;
    } catch (e) {
      throw new Error(e);
    }
  }

  public getGlobalThemeClassName(): string {
    const cdkOverlayElement = this.cdkOverlayContainer.getContainerElement();
    for (const className of Array.from(cdkOverlayElement.classList)) {
      if (className.startsWith('app-theme')) {
        return className;
      }
    }
  }

}
