import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  JsfBuilder,
  JsfLayoutPreferencesInterface
}                                                                                                                    from '@kalmia/jsf-common-es2015';
import { JsfThemeRenderMode }                                                                                        from './render-mode.enum';
import { BuilderDeveloperToolsInterface }                                                                            from '../builder-developer-tools.interface';


@Component({
  selector       : 'jsf-theme-outlet',
  template       : `
    <ng-container *ngIf="hasActiveRenderMode">
      <ng-container [ngSwitch]="activeRenderMode">
        <ng-container *ngSwitchCase="renderModes.Form">
          <jsf-form-outlet [builder]="builder"
                           [developerTools]="developerTools"
                           [preferences]="preferences">
          </jsf-form-outlet>
        </ng-container>

        <ng-container *ngSwitchCase="renderModes.RouterOutlet">
          <router-outlet></router-outlet>
        </ng-container>
        
        <ng-container *ngSwitchCase="renderModes.Styles">
          <!-- NOOP -->
        </ng-container>
        
        <p *ngSwitchDefault>Unknown render mode "{{ activeRenderMode }}"</p>
      </ng-container>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class ThemeOutletComponent implements OnInit, AfterViewInit {

  public renderModes = JsfThemeRenderMode;

  @Input()
  builder: JsfBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  @Input()
  preferences: JsfLayoutPreferencesInterface;

  @Input()
  activeRenderMode: JsfThemeRenderMode;

  get hasActiveRenderMode() {
    return this.activeRenderMode !== void 0;
  }

  constructor(protected cdRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.update();
  }

  private update() {
    if (this.cdRef) {
      this.cdRef.detectChanges();
    }
  }
}
