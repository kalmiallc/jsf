import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  SkipSelf,
  ViewChild
}                                               from '@angular/core';
import { AbstractItemsLayoutComponent }         from '../../../abstract/items-layout.component';
import {
  JsfItemsLayoutBuilder,
  JsfLayoutStep,
  JsfLayoutStepper,
  JsfLayoutStepperPreferences,
  JsfLayoutStepPreferences,
  PropStatus,
  PropStatusChangeInterface
}                                               from '@kalmia/jsf-common-es2015';
import { STEPPER_GLOBAL_OPTIONS }               from '@angular/cdk/stepper';
import { AnalyticsService }                     from '../../../analytics/analytics.service';
import { JsfStepper, JsfStepperSelectionEvent } from '../../custom-components/stepper/jsf-stepper.component';
import { range, uniq }                          from 'lodash';
import { ShowValidationMessagesDirective }      from '../../../directives/show-validation-messages.directive';
import { BuilderDeveloperToolsInterface }       from '../../../builder-developer-tools.interface';
import { takeUntil }                            from 'rxjs/operators';

// tslint:disable:max-line-length
@Component({
  selector       : 'jsf-layout-stepper',
  template       : `
      <div class="jsf-layout-stepper"
           [class.jsf-layout-stepper-standard]="isAppearanceStandard()"
           [class.jsf-layout-stepper-compact]="isAppearanceCompact()"
           (click)="handleLayoutClick($event)"
           [ngClass]="htmlClass">
          <!-- Horizontal stepper -->
          <ng-container *ngIf="horizontal; else vertical">
              <jsf-horizontal-stepper
                      [labelPosition]="themePreferences.labelPosition"
                      [linear]="linear"
                      (selectionChange)="selectionChange($event)"
                      [ngClass]="'active-step-' + activeStep"
                      [class.jsf-layout-step-header-align-end]="themePreferences.stepHeaderPosition === 'end'"
                      #stepper>

                  <!-- Icon overrides -->
                  <ng-template matStepperIcon="edit" let-index="index">
                      <mat-icon *ngIf="themePreferences.editIcon">{{ themePreferences.editIcon }}</mat-icon>
                      <ng-container *ngIf="!themePreferences.editIcon">{{ index + 1 }}</ng-container>
                  </ng-template>

                  <ng-template matStepperIcon="done" let-index="index">
                      <mat-icon *ngIf="themePreferences.doneIcon">{{ themePreferences.doneIcon }}</mat-icon>
                      <ng-container *ngIf="!themePreferences.doneIcon">{{ index + 1 }}</ng-container>
                  </ng-template>

                  <!-- Steps -->
                  <jsf-step *ngFor="let step of items; let i = index"
                            [optional]="isStepOptional(step)"
                            [editable]="isStepEditable(step)"
                            [completed]="jsfShowValidationMessages.valid"
                            [hasError]="isStepErrorStateVisible(step) && jsfShowValidationMessages.invalid"
                            [errorMessage]="i18n('Some fields are invalid')"
                            #jsfShowValidationMessages="jsfShowValidationMessages"
                            [jsfShowValidationMessages]="isStepErrorStateVisible(step)">
                      <ng-template matStepLabel>{{ getStepTitle(step) }}</ng-template>

                      <jsf-layout-router *ngFor="let item of items[i].items"
                                         [layoutBuilder]="item"
                                         [developerTools]="developerTools"
                                         [ngClass]="getLayoutItemClass(item)"
                                         [ngStyle]="getLayoutItemStyle(item)">
                      </jsf-layout-router>
                  </jsf-step>
              </jsf-horizontal-stepper>
          </ng-container>

          <!-- Vertical stepper -->
          <ng-template #vertical>
              <jsf-vertical-stepper
                      [linear]="linear"
                      (selectionChange)="selectionChange($event)"
                      [ngClass]="'active-step-' + activeStep"
                      #stepper>

                  <!-- Icon overrides -->
                  <ng-template matStepperIcon="edit" let-index="index">
                      <mat-icon *ngIf="themePreferences.editIcon">{{ themePreferences.editIcon }}</mat-icon>
                      <ng-container *ngIf="!themePreferences.editIcon">{{ index + 1 }}</ng-container>
                  </ng-template>

                  <ng-template matStepperIcon="done" let-index="index">
                      <mat-icon *ngIf="themePreferences.doneIcon">{{ themePreferences.doneIcon }}</mat-icon>
                      <ng-container *ngIf="!themePreferences.doneIcon">{{ index + 1 }}</ng-container>
                  </ng-template>

                  <!-- Steps -->
                  <jsf-step *ngFor="let step of items; let i = index"
                            [optional]="isStepOptional(step)"
                            [editable]="isStepEditable(step)"
                            [completed]="jsfShowValidationMessages.valid"
                            [hasError]="isStepErrorStateVisible(step) && jsfShowValidationMessages.invalid"
                            [errorMessage]="i18n('Some fields are invalid')"
                            #jsfShowValidationMessages="jsfShowValidationMessages"
                            [jsfShowValidationMessages]="isStepErrorStateVisible(step)">
                      <ng-template matStepLabel>{{ getStepTitle(step) }}</ng-template>

                      <jsf-layout-router *ngFor="let item of items[i].items"
                                         [layoutBuilder]="item"
                                         [developerTools]="developerTools"
                                         [ngClass]="getLayoutItemClass(item)"
                                         [ngStyle]="getLayoutItemStyle(item)">
                      </jsf-layout-router>
                  </jsf-step>
              </jsf-vertical-stepper>
          </ng-template>
      </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : [],
  providers      : [
    { provide: STEPPER_GLOBAL_OPTIONS, useValue: { showError: true } }
  ]
})
export class LayoutStepperComponent extends AbstractItemsLayoutComponent<JsfLayoutStepper> implements OnInit, OnDestroy, AfterViewInit {

  @Input()
  layoutBuilder: JsfItemsLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  @ViewChild('stepper')
  stepper: JsfStepper;

  private stepIndexesWithVisibleErrorState: number[] = [];


  constructor(private analyticsService: AnalyticsService,
              private cdRef: ChangeDetectorRef,
              @Optional() @SkipSelf() protected showValidation: ShowValidationMessagesDirective) {
    super();
  }

  get items(): JsfItemsLayoutBuilder[] {
    return this.layoutBuilder.items as JsfItemsLayoutBuilder[];
  }

  get horizontal(): boolean {
    return (!this.layout.variant) || this.layout.variant === 'horizontal';
  }

  get linear(): boolean {
    return this.layout.linear;
  }

  get primary(): boolean {
    return this.layout.primary;
  }

  get initialStep(): number | { $eval: string } {
    return this.layout.initialStep;
  }

  get onStepChange(): { $eval: string } {
    return this.layout.onStepChange;
  }

  get activeStep(): number {
    return this.stepper && this.stepper.selectedIndex;
  }

  get parentValidationContextState(): boolean {
    return this.showValidation && this.showValidation.state;
  }

  nextStep(): void {
    if (this.stepper) {
      this.stepper.next();
    }
  }

  previousStep(): void {
    if (this.stepper) {
      this.stepper.previous();
    }
  }

  selectionChange(change: JsfStepperSelectionEvent) {
    this.setLayoutState('activeStepIndex', change.selectedIndex);
    this.setLayoutState('previouslyActiveStepIndex', change.previouslySelectedIndex);


    if (change.preventedMoveToInvalidStep) {
      this.stepIndexesWithVisibleErrorState = uniq(this.stepIndexesWithVisibleErrorState.concat([change.selectedIndex]));
    }

    // All previous steps should have a visible error state
    if (change.selectedIndex > 0) {
      this.stepIndexesWithVisibleErrorState = uniq(this.stepIndexesWithVisibleErrorState.concat(range(change.selectedIndex)));
    }

    // Set layout state & handle analytics
    const highestActivatedStepIndex = this.getLayoutState('highestActivatedStepIndex') || 0;
    if (change.selectedIndex > highestActivatedStepIndex) {
      this.setLayoutState('highestActivatedStepIndex', change.selectedIndex);

      // Analytics => checkout progress
      if (this.primary && this.layoutBuilder.rootBuilder.doc.$analytics) {
        const ga = this.layoutBuilder.rootBuilder.doc.$analytics.vendors.googleAnalytics;
        if (ga) {
          if (ga.ecommerce && ga.ecommerce.enabled) {
            this.analyticsService.trackGoogleAnalyticsEcommerceEvent('checkout_progress', {
              checkout_step: change.selectedIndex + 1
            });
          }
        }
      }
    }

    // Analytics => step-change
    this.trackStepChange(change.selectedIndex);

    // Event - on step change
    if (this.onStepChange) {
      const ctx = this.layoutBuilder.rootBuilder.getEvalContext({
        layoutBuilder     : this.layoutBuilder,
        extraContextParams: {
          $oldStep: change.previouslySelectedIndex,
          $newStep: change.selectedIndex
        }
      });
      this.layoutBuilder.rootBuilder.runEvalWithContext(
        (this.onStepChange as any).$evalTranspiled || this.onStepChange.$eval, ctx);

    }
  }

  trackStepChange(stepIndex: number, value?: any) {
    if (this.hasAnalyticsEvent('step-change')) {
      const stepName  = (this.items[stepIndex].layout as JsfLayoutStep).title;
      const eventData = this.getAnalyticsEventData('step-change');
      this.analyticsService.trackRawEvent(eventData.as, eventData.category, stepName, value);
    }
  }

  isStepOptional(step: JsfItemsLayoutBuilder): boolean {
    return !!(step.layout as any).optional;
  }

  isStepEditable(step: JsfItemsLayoutBuilder): boolean {
    return (step.layout as any).editable !== undefined ? (step.layout as any).editable : true;
  }

  isStepErrorStateVisible(step: JsfItemsLayoutBuilder) {
    const stepIdx = this.items.indexOf(step);
    if (stepIdx === -1) {
      throw new Error(`Step not found`);
    }

    return this.parentValidationContextState || this.stepIndexesWithVisibleErrorState.indexOf(stepIdx) > -1;
  }

  getStepTitle(step: JsfItemsLayoutBuilder) {
    const layout = step.layout as JsfLayoutStep;

    const templateData = this.getStepTemplateData(step);

    if (templateData) {
      const template = this.translationServer.getTemplate(this.i18n(layout.title));
      return template(templateData);
    }

    return this.i18n(layout.title);
  }

  getStepTemplateData(step: JsfItemsLayoutBuilder) {
    const layout = step.layout as JsfLayoutStep;
    if (layout.templateData) {

      const ctx = this.layoutBuilder.rootBuilder.getEvalContext({
        layoutBuilder: this.layoutBuilder
      });
      return this.layoutBuilder.rootBuilder.runEvalWithContext(
        (layout.templateData as any).$evalTranspiled || layout.templateData.$eval, ctx);

    }
  }

  ngOnInit() {
    this.registerLayoutComponent();

    if (this.showValidation) {
      this.showValidation.state$
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(x => {
          this.cdRef.detectChanges();
        });
    }

    this.subscribeToStepDependencies();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.unregisterLayoutComponent();
  }

  private subscribeToStepDependencies() {
    for (const step of this.items) {
      const layout = step.layout as JsfLayoutStep;

      if (layout.templateData) {
        const dependencies = layout.templateData.dependencies || [];
        if (dependencies.length) {
          for (const dependency of dependencies) {
            const dependencyAbsolutePath = this.layoutBuilder.abstractPathToAbsolute(dependency);
            this.layoutBuilder.rootBuilder.listenForStatusChange(dependencyAbsolutePath)
              .pipe(takeUntil(this.ngUnsubscribe))
              .subscribe((status: PropStatusChangeInterface) => {
                if (status.status !== PropStatus.Pending) {
                  this.cdRef.detectChanges();
                }
              });
          }
        } else {
          if (this.layoutBuilder.rootBuilder.warnings) {
            console.warn(`Layout 'step' [${ this.layoutBuilder.id }] uses templateData but has not listed any dependencies.`,
              `The component will be updated on every form value change which may decrease performance.`);
          }
          this.layoutBuilder.rootBuilder.propBuilder.statusChange
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((status: PropStatus) => {
              if (status !== PropStatus.Pending) {
                this.cdRef.detectChanges();
              }
            });
        }
      }
    }
  }

  ngAfterViewInit() {
    let initialStep = 0;
    if (this.initialStep) {
      if (typeof this.initialStep === 'number') {
        initialStep = this.initialStep;
      } else {
        const ctx  = this.layoutBuilder.rootBuilder.getEvalContext({
          layoutBuilder: this.layoutBuilder
        });
        const step = this.layoutBuilder.rootBuilder.runEvalWithContext(
          (this.initialStep as any).$evalTranspiled || this.initialStep.$eval, ctx);
        if (step !== null && step !== undefined && !isNaN(step)) {
          initialStep = step;
        }
      }
    }

    this.setLayoutState('activeStepIndex', initialStep);
    this.setLayoutState('previouslyActiveStepIndex', initialStep);
    this.setLayoutState('highestActivatedStepIndex', initialStep);

    this.stepper.selectedIndex = initialStep;

    // Analytics => step-change
    this.trackStepChange(initialStep);

    // Analytics => checkout begin
    if (this.primary && this.layoutBuilder.rootBuilder.doc.$analytics) {
      const ga = this.layoutBuilder.rootBuilder.doc.$analytics.vendors.googleAnalytics;
      if (ga) {
        if (ga.ecommerce && ga.ecommerce.enabled) {
          this.analyticsService.trackGoogleAnalyticsEcommerceEvent('begin_checkout', {});
        }
      }
    }

    // Analytics => checkout end
    if (this.primary && this.layoutBuilder.rootBuilder.doc.$analytics) {
      const ga = this.layoutBuilder.rootBuilder.doc.$analytics.vendors.googleAnalytics;
      if (ga) {
        if (ga.ecommerce && ga.ecommerce.enabled) {
          this.layoutBuilder.rootBuilder.addPreSubmitHook('stepper-primary-checkout-complete', async () => {
            this.analyticsService.trackGoogleAnalyticsEcommerceEvent('purchase', {
              transaction_id: ('_' + Math.random().toString(36).substr(2, 9))
            });
          });
        }
      }
    }
  }

  get themePreferences(): JsfLayoutStepperPreferences {
    return {
      /* Defaults */
      labelPosition     : 'end',
      stepHeaderPosition: 'start',
      doneIcon          : 'done',
      editIcon          : 'create',
      appearance        : 'standard',

      /* Global overrides */
      ...(this.globalThemePreferences ? this.globalThemePreferences.stepper : {}),

      /* Layout overrides */
      ...(this.localThemePreferences || {})
    } as JsfLayoutStepperPreferences;
  }

  getStepPreferences(stepIndex: number): JsfLayoutStepPreferences {
    return {
      /* Defaults */

      /* Global overrides */
      ...(this.globalThemePreferences ? this.globalThemePreferences.step : {}),

      /* Layout overrides */
      ...(this.getStepLocalPreferences(stepIndex) || {})
    } as JsfLayoutStepPreferences;
  }

  private getStepLocalPreferences(stepIndex: number) {
    return this.items[stepIndex].layout.preferences as JsfLayoutStepPreferences;
  }

  isAppearanceStandard = () => this.themePreferences.appearance === 'standard';
  isAppearanceCompact  = () => this.themePreferences.appearance === 'compact';

}
