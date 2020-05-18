import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { JsfBuilder, JsfLayoutPreferencesInterface }                from '@kalmia/jsf-common-es2015';
import { JsfBreakpoints, jsfDefaultBreakpoints }                    from '../services/responsive.service';
import { JsfThemeRenderMode }                                       from './render-mode.enum';
import { BuilderDeveloperToolsInterface }                           from '../builder-developer-tools.interface';

@Component({
  selector       : 'jsf-base-theme',
  template       : ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseThemeComponent {

  public activeRenderMode: JsfThemeRenderMode;

  public builder: JsfBuilder;
  public developerTools?: BuilderDeveloperToolsInterface;
  public preferences: JsfLayoutPreferencesInterface = <JsfLayoutPreferencesInterface>{};
  public breakpoints: JsfBreakpoints                = jsfDefaultBreakpoints;

}
