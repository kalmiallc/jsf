import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { BaseThemeComponent, JsfBreakpoints }                            from '@kalmia/jsf-app';
import { JsfLayoutPreferencesInterface }                                 from '@kalmia/jsf-common-es2015';
import { ThemeDefaultPreferences }                                       from '../../base/theme-default.preferences';
import { ThemeDefaultBreakpoints }                                       from '../../base/theme-default.breakpoints';

@Component({
  selector       : 'app-theme-default-default',
  template       : `
    <jsf-theme-outlet [builder]="builder"
                      [developerTools]="developerTools"
                      [preferences]="preferences"
                      [activeRenderMode]="activeRenderMode">
    </jsf-theme-outlet>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls      : ['./default-default.component.scss'],
  encapsulation  : ViewEncapsulation.None
})
export class DefaultDefaultComponent extends BaseThemeComponent implements OnInit {

  public preferences: JsfLayoutPreferencesInterface = {
    ...ThemeDefaultPreferences

    // Add custom overrides here

  } as JsfLayoutPreferencesInterface;

  public breakpoints: JsfBreakpoints = ThemeDefaultBreakpoints;

  constructor() {
    super();
  }

  ngOnInit() {
  }

}
