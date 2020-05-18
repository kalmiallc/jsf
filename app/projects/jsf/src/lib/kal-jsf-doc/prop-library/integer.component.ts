import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { AbstractPropLayoutComponent }                                                               from '../abstract/prop-layout.component';
import {
  JsfLayoutPropIntegerPreferences,
  JsfPropBuilderInteger,
  JsfPropLayoutBuilder,
  JsfProviderExecutorStatus
}                                                                                                    from '@kalmia/jsf-common-es2015';
import { ShowValidationMessagesDirective }                                                           from '../directives/show-validation-messages.directive';
import { MatInput }                                                                                  from '@angular/material';
import { takeUntil }                                                                                 from 'rxjs/operators';
import { BuilderDeveloperToolsInterface }                                                            from '../builder-developer-tools.interface';

@Component({
  selector       : 'jsf-prop-integer',
  template       : `
      <div class="jsf-prop jsf-prop-integer"
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
                     [disabled]="disabled"
                     [id]="id"
                     [name]="propBuilder.id"
                     [readonly]="prop.readonly || prop.const ? 'readonly' : null"
                     type="number"
                     [step]="themePreferences.step"
                     [(ngModel)]="value"
                     #input="ngModel"
                     jsfNumberInputAutoCorrect
                     [jsfPropValidator]="layoutBuilder"
                     [errorStateMatcher]="errorStateMatcher">

              <mat-icon matPrefix *ngIf="themePreferences.prefixIcon">{{ themePreferences.prefixIcon }}</mat-icon>
              <span matPrefix *ngIf="themePreferences.prefixLabel">{{ themePreferences.prefixLabel }}</span>

              <mat-icon matPrefix *ngIf="themePreferences.stepperButtons"
                        id="{{ id }}--decrease"
                        ngClass="stepper-button decrement no-text-selection cursor-pointer __color--{{ themePreferences.color }}"
                        (click)="decrement()">
                  remove
              </mat-icon>

              <button mat-button *ngIf="themePreferences.clearable && value" matSuffix mat-icon-button aria-label="Clear"
                      (click)="value = null">
                  <mat-icon>close</mat-icon>
              </button>

              <mat-icon matSuffix *ngIf="themePreferences.stepperButtons"
                        id="{{ id }}--increment"
                        ngClass="stepper-button increment no-text-selection cursor-pointer __color--{{ themePreferences.color }}"
                        (click)="increment()">
                  add
              </mat-icon>

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
  styles         : []
})
export class PropIntegerComponent extends AbstractPropLayoutComponent<JsfPropBuilderInteger> implements OnInit {

  @Input()
  layoutBuilder: JsfPropLayoutBuilder<JsfPropBuilderInteger>;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  @ViewChild(MatInput)
  matInputControl: MatInput;

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

  increment() {
    let x = (this.propBuilder.getValue() || 0) + this.themePreferences.step;
    if (this.prop.maximum !== undefined) {
      x = Math.min(x, this.prop.maximum);
    }
    this.value = x;
    this.markMaterialControlAsDirty();
  }

  decrement() {
    let x = (this.propBuilder.getValue() || 0) - this.themePreferences.step;
    if (this.prop.minimum !== undefined) {
      x = Math.max(x, this.prop.minimum);
    }
    this.value = x;
    this.markMaterialControlAsDirty();
  }

  private markMaterialControlAsDirty() {
    if (this.matInputControl) {
      const ngControl = this.matInputControl.ngControl;
      if (ngControl && ngControl.control) {
        ngControl.control.markAsDirty();
      }
    }
  }

  get themePreferences(): JsfLayoutPropIntegerPreferences {
    return {
      /* Defaults */
      appearance    : 'legacy',
      variant       : 'standard',
      color         : 'primary',
      clearable     : false,
      prefixIcon    : '',
      prefixLabel   : '',
      suffixIcon    : '',
      suffixLabel   : '',
      stepperButtons: false,
      step          : 1,

      /* Global overrides */
      ...(this.globalThemePreferences ? this.globalThemePreferences.integer : {}),

      /* Layout overrides */
      ...(this.localThemePreferences || {})
    } as JsfLayoutPropIntegerPreferences;
  }

  isVariantStandard = () => this.themePreferences.variant === 'standard';
  isVariantSmall    = () => this.themePreferences.variant === 'small';

}
