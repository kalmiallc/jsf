import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, Optional } from '@angular/core';
import { AbstractPropLayoutComponent }                                                    from '../abstract/prop-layout.component';
import {
  JsfLayoutPropStringPreferences,
  JsfPropBuilderString,
  JsfPropLayoutBuilder,
  JsfPropString,
  JsfProviderExecutorStatus
}                                                                                         from '@kalmia/jsf-common-es2015';
import { ShowValidationMessagesDirective }                                                from '../directives/show-validation-messages.directive';
import { isBoolean }                                                                      from 'lodash';
import { takeUntil }                                                                      from 'rxjs/operators';
import { BuilderDeveloperToolsInterface }                                                 from '../builder-developer-tools.interface';

@Component({
  selector       : 'jsf-prop-string',
  template       : `
      <div class="jsf-prop jsf-prop-string"
           [class.jsf-prop-variant-standard]="isVariantStandard()"
           [class.jsf-prop-variant-small]="isVariantSmall()"
           [class.jsf-mat-form-field-multiline]="isMultiline()"
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
                     *ngIf="!prop?.multiline"
                     [placeholder]="i18n(layout?.placeholder || '')"
                     [required]="prop?.required"
                     [disabled]="disabled"
                     [id]="id"
                     [name]="propBuilder.id"
                     [readonly]="isReadOnly"
                     [type]="inputType"
                     [(ngModel)]="value"
                     #input="ngModel"
                     [jsfPropValidator]="layoutBuilder"
                     [errorStateMatcher]="errorStateMatcher">

              <textarea matInput
                        cdkTextareaAutosize
                        [cdkAutosizeMinRows]="rows"
                        cdkAutosizeMaxRows="10"
                        *ngIf="prop?.multiline"
                        [placeholder]="i18n(layout?.placeholder || '')"
                        [required]="prop?.required"
                        [disabled]="disabled"
                        [id]="id"
                        [name]="propBuilder.id"
                        [readonly]="isReadOnly"
                        [type]="prop.secret ? 'password' : 'text'"
                        [(ngModel)]="value"
                        #input="ngModel"
                        [jsfPropValidator]="layoutBuilder"
                        [errorStateMatcher]="errorStateMatcher"></textarea>

              <mat-icon matPrefix *ngIf="themePreferences.prefixIcon">{{ themePreferences.prefixIcon }}</mat-icon>
              <span matPrefix *ngIf="themePreferences.prefixLabel">{{ themePreferences.prefixLabel }}</span>

              <button mat-button *ngIf="themePreferences.clearable && value" matSuffix mat-icon-button aria-label="Clear"
                      (click)="value = null">
                  <mat-icon>close</mat-icon>
              </button>

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

export class PropStringComponent extends AbstractPropLayoutComponent<JsfPropBuilderString> implements OnInit {

  @Input()
  layoutBuilder: JsfPropLayoutBuilder<JsfPropBuilderString>;

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

  get inputType(): string {
    const prop: JsfPropString = this.prop;

    if (prop.secret) {
      return 'password';
    }

    switch (prop.format) {
      case 'email':
        return 'email';
      case 'phone':
        return 'tel';
      case 'color':
        return 'color';
      case 'uri':
        return 'url';
      case 'time':
        return 'time';
      case 'date-time':
        return 'datetime-local';
      default:
        return 'text';
    }
  }

  get disabled(): boolean {
    if (this.propBuilder.hasProvider && this.propBuilder.providerExecutor.status === JsfProviderExecutorStatus.Pending) {
      return true;
    }
    return this.propBuilder.disabled;
  }

  get isReadOnly() {
    if (this.prop.readonly) {
      return this.prop.readonly;
    } else if (this.prop.readonly && this.prop.readonly.$eval) {
      return !!this.layoutBuilder.rootBuilder.runEval(this.prop.readonly.$eval);
    } else {
      return false;
    }
  }

  get rows() {
    if (isBoolean(this.prop.multiline)) {
      return this.prop.multiline ? 2 : 1;
    }
    return +this.prop.multiline;
  }

  get themePreferences(): JsfLayoutPropStringPreferences {
    return {
      /* Defaults */
      appearance : 'legacy',
      color      : 'primary',
      variant    : 'standard',
      clearable  : false,
      prefixIcon : '',
      prefixLabel: '',
      suffixIcon : '',
      suffixLabel: '',

      /* Global overrides */
      ...(this.globalThemePreferences ? this.globalThemePreferences.string : {}),

      /* Layout overrides */
      ...(this.localThemePreferences || {})
    } as JsfLayoutPropStringPreferences;
  }

  isVariantStandard = () => this.themePreferences.variant === 'standard';
  isVariantSmall    = () => this.themePreferences.variant === 'small';
  isMultiline       = () => this.prop.multiline;

}
