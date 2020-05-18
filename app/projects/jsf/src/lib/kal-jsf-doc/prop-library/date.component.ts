import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, Optional } from '@angular/core';
import { AbstractPropLayoutComponent }                                                    from '../abstract/prop-layout.component';
import {
  JsfLayoutPropStringPreferences,
  JsfPropBuilderDate,
  JsfPropLayoutBuilder,
  JsfProviderExecutorStatus
}                                                                                         from '@kalmia/jsf-common-es2015';
import { ShowValidationMessagesDirective }                                                from '../directives/show-validation-messages.directive';
import { takeUntil }                                                                      from 'rxjs/operators';
import { BuilderDeveloperToolsInterface }                                                 from '../builder-developer-tools.interface';

@Component({
  selector       : 'jsf-prop-date',
  template       : `
      <div class="jsf-prop jsf-prop-date"
           [class.jsf-prop-variant-standard]="isVariantStandard()"
           [class.jsf-prop-variant-small]="isVariantSmall()"
           [ngClass]="htmlClass"
           (click)="handleLayoutClick($event)">
          <mat-form-field [color]="themePreferences.color"
                          [appearance]="themePreferences.appearance"
                          [class.jsf-mat-form-field-variant-standard]="isVariantStandard()"
                          [class.jsf-mat-form-field-variant-small]="isVariantSmall()"
                          jsfOutlineGapAutocorrect>
              <mat-label *ngIf="prop?.title"
                         [attr.for]="id"
                         [style.display]="layout?.notitle ? 'none' : ''">
                  {{ i18n(prop?.title) }}
              </mat-label>
              <input matInput
                     [placeholder]="i18n(layout?.placeholder || '')"
                     [required]="prop?.required"
                     [min]="prop?.minimum"
                     [max]="prop?.maximum"
                     [disabled]="disabled"
                     [id]="id"
                     [name]="propBuilder.id"
                     [readonly]="prop.readonly ? 'readonly' : null"
                     [matDatepicker]="picker"
                     [(ngModel)]="value"
                     #input="ngModel"
                     #field
                     (focus)="picker.open()"
                     [jsfPropValidator]="layoutBuilder"
                     [errorStateMatcher]="errorStateMatcher">

              <mat-icon matPrefix *ngIf="themePreferences.prefixIcon">{{ themePreferences.prefixIcon }}</mat-icon>
              <span matPrefix *ngIf="themePreferences.prefixLabel">{{ themePreferences.prefixLabel }}</span>

              <button mat-button *ngIf="themePreferences.clearable && value" matSuffix mat-icon-button aria-label="Clear"
                      (click)="value = null; $event.stopPropagation()">
                  <mat-icon>close</mat-icon>
              </button>

              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker [color]="themePreferences.color" (closed)="field.blur()"></mat-datepicker>

              <span matSuffix *ngIf="themePreferences.suffixLabel">{{ themePreferences.suffixLabel }}</span>
              <mat-icon matSuffix *ngIf="themePreferences.suffixIcon">{{ themePreferences.suffixIcon }}</mat-icon>

              <mat-hint *ngIf="prop?.description">{{ i18n(prop?.description) }}</mat-hint>

              <mat-error *ngFor="let error of errors">
                  {{ error.interpolatedMessage }}
              </mat-error>
          </mat-form-field>
      </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : [
    `.mat-form-field, .mat-input-element {
          cursor: pointer;
    }`
  ]
})
export class PropDateComponent extends AbstractPropLayoutComponent<JsfPropBuilderDate> implements OnInit {

  @Input()
  layoutBuilder: JsfPropLayoutBuilder<JsfPropBuilderDate>;

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

  get themePreferences(): JsfLayoutPropStringPreferences {
    return {
      /* Defaults */
      appearance : 'legacy',
      variant    : 'standard',
      color      : 'primary',
      clearable  : false,
      prefixIcon : '',
      prefixLabel: '',
      suffixIcon : '',
      suffixLabel: '',

      /* Global overrides */
      ...(this.globalThemePreferences ? this.globalThemePreferences.date : {}),

      /* Layout overrides */
      ...(this.localThemePreferences || {})
    } as JsfLayoutPropStringPreferences;
  }

  isVariantStandard = () => this.themePreferences.variant === 'standard';
  isVariantSmall    = () => this.themePreferences.variant === 'small';

}
