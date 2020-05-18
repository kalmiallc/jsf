import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, SkipSelf } from '@angular/core';
import {
  JsfLayoutProgressTrackerStep,
  JsfSpecialLayoutBuilder,
  PropStatus,
  PropStatusChangeInterface
}                                                                                                                   from '@kalmia/jsf-common-es2015';
import { AbstractSpecialLayoutComponent }                                                                           from '../../../abstract/special-layout.component';
import { BuilderDeveloperToolsInterface }                                                                           from '../../../builder-developer-tools.interface';
import { LayoutProgressTrackerStepControllerDirective }                                                             from '../../../directives/layout-progress-tracker-step-controller.directive';
import { LayoutProgressTrackerComponent }                                                                           from '../../items-layout/progress-tracker/progress-tracker.component';
import { takeUntil }                                                                                                from 'rxjs/operators';
import { isNil }                                                                                                    from 'lodash';

@Component({
  selector       : 'jsf-layout-progress-tracker-step',
  template       : `
      <div class="jsf-layout-progress-tracker-step"
           [ngClass]="htmlClass"
           [class.disabled]="disabled"
           [class.active]="active"
           [class.completed]="completed"
           [class.last]="last"
           [class.interactive]="hasOnClickActions"
           jsfHoverClass="__background-color--grey-dark-10"
           (click)="handleLayoutClick($event)">
          <!-- Bar -->
          <div *ngIf="!last"
               class="progress-tracker-step-bar __background-color--grey">
              <div class="progress-tracker-step-bar-fill __background-color--primary-p100"
                   [style.width]="progressStyle"></div>
          </div>

          <div class="progress-tracker-step-wrapper"
               matRipple
               [matRippleDisabled]="!hasOnClickActions">
              <!-- Title -->
              <div class="progress-tracker-step-title">
                  <span>{{ title }}</span>
              </div>

              <!-- Dot indicator -->
              <div class="progress-tracker-step-dot-wrapper">
                  <div class="progress-tracker-step-dot">
                      <!-- Inner dot -->
                      <div class="progress-tracker-step-dot-inner"
                           [class.__background-color--primary-p100]="completed"
                           [class.__background-color--grey]="!completed">
                          <!-- Icon -->
                          <jsf-icon [icon]="icon"
                                    [size]="'24px'"
                                    [class.__color--primary]="completed"
                                    [class.__color--grey-dark]="!completed"
                                    *ngIf="icon; else dotIndicator">
                          </jsf-icon>

                          <!-- Dot indicator -->
                          <ng-template #dotIndicator>
                              <span class="active-dot __background-color--primary" *ngIf="completed"></span>
                          </ng-template>
                      </div>
                  </div>
              </div>

              <!-- Description -->
              <div class="progress-tracker-step-description text-muted mt-1">
                  <span>{{ description }}</span>
              </div>
          </div>
      </div>
      <span class="jsf-layout-progress-tracker-step" [ngClass]="htmlClass" (click)="handleLayoutClick($event)"></span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls      : ['./progress-tracker-step.component.scss']
})
export class LayoutProgressTrackerStepComponent extends AbstractSpecialLayoutComponent<JsfLayoutProgressTrackerStep> implements OnInit, AfterViewInit, OnDestroy {

  @Input()
  layoutBuilder: JsfSpecialLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  private _icon: string;
  private _disabled: boolean;

  get icon(): string {
    return this._icon;
  }

  get disabled(): boolean {
    return this._disabled;
  }

  get active(): boolean {
    return this.progressTrackerStepController && this.progressTrackerStepController.active;
  }

  get completed(): boolean {
    return this.progressTrackerStepController && this.progressTrackerStepController.completed;
  }

  get last(): boolean {
    return this.progressTrackerStepController && this.progressTrackerStepController.last;
  }

  get progress(): number {
    return this.progressTrackerStepController && this.progressTrackerStepController.progress;
  }

  get hasOnClickActions(): boolean {
    return this.layout.onClick && !this.disabled;
  }

  get progressStyle(): string {
    return !isNil(this.progress) ? `${ this.progress * 100 }%` : '0%';
  }

  get index(): number {
    return this.progressTrackerStepController && this.progressTrackerStepController.index;
  }

  constructor(private cdRef: ChangeDetectorRef,
              @SkipSelf() private progressTrackerStepController: LayoutProgressTrackerStepControllerDirective,
              private progressTracker: LayoutProgressTrackerComponent) {
    super();
  }

  get title(): string {
    const templateData = this.getTitleTemplateData();

    if (templateData) {
      const template = this.translationServer.getTemplate(this.i18n(this.layout.title));
      return template(templateData);
    }

    return this.i18n(this.layout.title);
  }

  get description(): string {
    const templateData = this.getDescriptionTemplateData();

    if (templateData) {
      const template = this.translationServer.getTemplate(this.i18n(this.layout.description));
      return template(templateData);
    }

    return this.i18n(this.layout.description);
  }

  get descriptionDependencies(): string[] {
    return this.layout.descriptionTemplateData ? this.layout.descriptionTemplateData.dependencies || [] : [];
  }

  get titleDependencies(): string[] {
    return this.layout.titleTemplateData ? this.layout.titleTemplateData.dependencies || [] : [];
  }

  get iconDependencies(): string[] {
    if (this.isEvalObject(this.layout.icon)) {
      return this.layout.icon.dependencies || [];
    }
  }

  get disabledDependencies(): string[] {
    if (this.isEvalObject(this.layout.disabled)) {
      return this.layout.disabled.dependencies || [];
    }
  }

  ngOnInit(): void {
    // Title & description
    if (this.layout.descriptionTemplateData) {
      if (this.descriptionDependencies.length) {
        for (const dependency of this.descriptionDependencies) {
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
          console.warn(`Layout 'progress-tracker-step' [${ this.layoutBuilder.id }] uses descriptionTemplateData but has not listed any dependencies.`,
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

    if (this.layout.titleTemplateData) {
      if (this.titleDependencies.length) {
        for (const dependency of this.titleDependencies) {
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
          console.warn(`Layout 'progress-tracker-step' [${ this.layoutBuilder.id }] uses descriptionTemplateData but has not listed any dependencies.`,
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

    // Icon
    if (this.isEvalObject(this.layout.icon)) {
      if (this.iconDependencies.length) {
        for (const dependency of this.iconDependencies) {
          const dependencyAbsolutePath = this.layoutBuilder.abstractPathToAbsolute(dependency);
          this.layoutBuilder.rootBuilder.listenForStatusChange(dependencyAbsolutePath)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((status: PropStatusChangeInterface) => {
              if (status.status !== PropStatus.Pending) {
                this.getIcon();
              }
            });
        }
      } else {
        if (this.layoutBuilder.rootBuilder.warnings) {
          console.warn(`Layout 'progress-tracker-step' [${ this.layoutBuilder.id }] uses an eval object for 'icon' but has not listed any dependencies.`,
            `The component will be updated on every form value change which may decrease performance.`);
        }

        this.layoutBuilder.rootBuilder.propBuilder.statusChange
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((status: PropStatus) => {
            if (status !== PropStatus.Pending) {
              this.getIcon();
            }
          });
      }
      this.getIcon();
    }

    // Disabled
    if (this.isEvalObject(this.layout.disabled)) {
      if (this.disabledDependencies.length) {
        for (const dependency of this.disabledDependencies) {
          const dependencyAbsolutePath = this.layoutBuilder.abstractPathToAbsolute(dependency);
          this.layoutBuilder.rootBuilder.listenForStatusChange(dependencyAbsolutePath)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((status: PropStatusChangeInterface) => {
              if (status.status !== PropStatus.Pending) {
                this.getDisabled();
              }
            });
        }
      } else {
        if (this.layoutBuilder.rootBuilder.warnings) {
          console.warn(`Layout 'progress-tracker-step' [${ this.layoutBuilder.id }] uses an eval object for 'disabled' but has not listed any dependencies.`,
            `The component will be updated on every form value change which may decrease performance.`);
        }

        this.layoutBuilder.rootBuilder.propBuilder.statusChange
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((status: PropStatus) => {
            if (status !== PropStatus.Pending) {
              this.getDisabled();
            }
          });
      }
      this.getDisabled();
    }
  }

  public ngAfterViewInit(): void {
    // Parent change detection
    this.progressTracker.onUpdate$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.cdRef.detectChanges();
      });
  }

  getTitleTemplateData(): any {
    if (this.layout.titleTemplateData) {

      const ctx = this.layoutBuilder.rootBuilder.getEvalContext({
        layoutBuilder: this.layoutBuilder
      });
      return this.layoutBuilder.rootBuilder.runEvalWithContext(
        (this.layout.titleTemplateData as any).$evalTranspiled || this.layout.titleTemplateData.$eval, ctx);

    }
  }

  getDescriptionTemplateData(): any {
    if (this.layout.descriptionTemplateData) {

      const ctx = this.layoutBuilder.rootBuilder.getEvalContext({
        layoutBuilder: this.layoutBuilder
      });
      return this.layoutBuilder.rootBuilder.runEvalWithContext(
        (this.layout.descriptionTemplateData as any).$evalTranspiled || this.layout.descriptionTemplateData.$eval, ctx);

    }
  }

  private getIcon() {
    if (this.isEvalObject(this.layout.icon)) {

      const ctx  = this.layoutBuilder.rootBuilder.getEvalContext({
        layoutBuilder: this.layoutBuilder
      });
      this._icon = this.layoutBuilder.rootBuilder.runEvalWithContext(
        (this.layout.icon as any).$evalTranspiled || this.layout.icon.$eval, ctx);
    } else {
      this._icon = this.layout.icon;
    }

    this.cdRef.detectChanges();
  }

  private getDisabled() {
    if (this.isEvalObject(this.layout.disabled)) {

      const ctx      = this.layoutBuilder.rootBuilder.getEvalContext({
        layoutBuilder: this.layoutBuilder
      });
      this._disabled = this.layoutBuilder.rootBuilder.runEvalWithContext(
        (this.layout.disabled as any).$evalTranspiled || this.layout.disabled.$eval, ctx);
    } else {
      this._disabled = this.layout.disabled;
    }

    this.cdRef.detectChanges();
  }

  async handleLayoutClick($event: any) {
    if (!this.disabled) {
      return super.handleLayoutClick($event);
    }
  }

  private isEvalObject(x: any): x is { $eval: string, dependencies?: string[] } {
    return typeof x === 'object' && '$eval' in x;
  }
}
