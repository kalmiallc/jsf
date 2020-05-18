import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, Optional } from '@angular/core';
import { AbstractPropLayoutComponent }                                                    from '../abstract/prop-layout.component';
import { JsfLayoutPropStringPreferences, JsfPropBuilderId, JsfPropLayoutBuilder }         from '@kalmia/jsf-common-es2015';
import { ShowValidationMessagesDirective }                                                from '../directives/show-validation-messages.directive';
import { BuilderDeveloperToolsInterface }                                                 from '../builder-developer-tools.interface';


@Component({
  selector       : 'jsf-prop-id',
  template       : `
      <div class="jsf-prop jsf-prop-id"
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
                     [disabled]="propBuilder.disabled"
                     [id]="id"
                     [name]="propBuilder.id"
                     [readonly]="prop.readonly || prop.const ? 'readonly' : null"
                     [type]="prop.secret ? 'password' : 'text'"
                     [(ngModel)]="value"
                     #input="ngModel"
                     [jsfPropValidator]="layoutBuilder"
                     [errorStateMatcher]="errorStateMatcher">

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
export class PropIdComponent extends AbstractPropLayoutComponent<JsfPropBuilderId> implements OnInit {

  @Input()
  layoutBuilder: JsfPropLayoutBuilder<JsfPropBuilderId>;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  constructor(protected cdRef: ChangeDetectorRef,
              @Optional() protected showValidation: ShowValidationMessagesDirective) {
    super(cdRef, showValidation);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  set value(x: any) {
    if (x !== this.propBuilder.getJsonValue()) {
      this.propBuilder.setJsonValue(x)
        .catch(e => {
          throw e;
        });
      this.touched = true;
      this.dirty   = true;
    }
  }

  get value(): any {
    return this.propBuilder.getJsonValue();
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

}
