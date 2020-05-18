import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, Optional } from '@angular/core';
import { AbstractPropLayoutComponent }                                                    from '../abstract/prop-layout.component';
import {
  JsfLayoutPropBooleanPreferences,
  JsfPropBuilderBoolean,
  JsfPropLayoutBuilder,
  JsfProviderExecutorStatus
}                                                                                         from '@kalmia/jsf-common-es2015';
import { ShowValidationMessagesDirective }                                                from '../directives/show-validation-messages.directive';
import { takeUntil }                                                                      from 'rxjs/operators';
import { BuilderDeveloperToolsInterface }                                                 from '../builder-developer-tools.interface';

@Component({
  selector       : 'jsf-prop-boolean',
  template       : `
      <div class="jsf-prop jsf-prop-boolean" [ngClass]="htmlClass"
           [class.jsf-prop-variant-checkbox]="isVariantCheckbox()"
           [class.jsf-prop-variant-slider]="isVariantSlider()"
           (click)="handleLayoutClick($event)">

          <div class="description">{{ i18n(prop?.description) }}</div>

          <mat-checkbox
                  *ngIf="themePreferences.variant === 'checkbox'"
                  [required]="prop?.required"
                  [disabled]="disabled"
                  [id]="id"
                  [name]="propBuilder.id"
                  [labelPosition]="themePreferences.labelPositionCheckbox"
                  [color]="themePreferences.color"
                  [(ngModel)]="value"
                  #input="ngModel"
                  [jsfPropValidator]="layoutBuilder">
              {{ i18n(prop?.title) }}
          </mat-checkbox>

          <mat-slide-toggle
                  *ngIf="themePreferences.variant === 'slider'"
                  [required]="prop?.required"
                  [disabled]="disabled"
                  [id]="id"
                  [name]="propBuilder.id"
                  [labelPosition]="themePreferences.labelPositionSlider"
                  [color]="themePreferences.color"
                  [(ngModel)]="value"
                  #input="ngModel"
                  [jsfPropValidator]="layoutBuilder">
              {{ i18n(prop?.title) }}
          </mat-slide-toggle>

          <jsf-error-messages *ngIf="hasErrors" [messages]="interpolatedErrors"></jsf-error-messages>
      </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class PropBooleanComponent extends AbstractPropLayoutComponent<JsfPropBuilderBoolean> implements OnInit {

  @Input()
  layoutBuilder: JsfPropLayoutBuilder<JsfPropBuilderBoolean>;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  constructor(protected cdRef: ChangeDetectorRef,
              @Optional() protected showValidation: ShowValidationMessagesDirective) {
    super(cdRef, showValidation);
  }

  ngOnInit() {
    super.ngOnInit();

    if (this.propBuilder.hasProvider) {
      this.propBuilder.providerExecutor.statusChange
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          this.detectChanges();
        });
    }
  }

  get disabled(): boolean {
    if (this.propBuilder.hasProvider && this.propBuilder.providerExecutor.status === JsfProviderExecutorStatus.Pending) {
      return true;
    }
    return this.propBuilder.disabled;
  }

  get themePreferences(): JsfLayoutPropBooleanPreferences {
    return {
      /* Defaults */
      variant              : 'checkbox',
      color                : 'accent',
      labelPositionCheckbox: 'after',
      labelPositionSlider  : 'after',

      /* Global overrides */
      ...(this.globalThemePreferences ? this.globalThemePreferences.boolean : {}),

      /* Layout overrides */
      ...(this.localThemePreferences || {})
    } as JsfLayoutPropBooleanPreferences;
  }

  isVariantCheckbox = () => this.themePreferences.variant === 'checkbox';
  isVariantSlider   = () => this.themePreferences.variant === 'slider';

}
