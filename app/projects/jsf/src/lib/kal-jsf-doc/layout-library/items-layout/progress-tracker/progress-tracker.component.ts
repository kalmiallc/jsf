import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AbstractItemsLayoutComponent }                                         from '../../../abstract/items-layout.component';
import {
  JsfItemsLayoutBuilder,
  JsfLayoutProgressTracker,
  JsfSpecialLayoutBuilder,
  PropStatus,
  PropStatusChangeInterface
}                                                                               from '@kalmia/jsf-common-es2015';
import { BuilderDeveloperToolsInterface }                                       from '../../../builder-developer-tools.interface';
import { takeUntil }                                                            from 'rxjs/operators';
import { Subject }                                                              from 'rxjs';


@Component({
  selector       : 'jsf-layout-progress-tracker',
  template       : `
      <div class="jsf-layout-progress-tracker"
           [ngClass]="getLayoutInnerClass()"
           [ngStyle]="getLayoutInnerStyle()"
           (click)="handleLayoutClick($event)">
          <div class="progress-tracker-container">
              <div class="row w-full h-full">
                  <ng-container *ngFor="let item of items; let i = index; let first = first; let last = last">
                      <div class="col h-full">
                          <jsf-layout-router [layoutBuilder]="item"
                                             [developerTools]="developerTools"
                                             [ngClass]="getLayoutItemClass(item)"
                                             [ngStyle]="getLayoutItemStyle(item)"
                                             layoutProgressTrackerStepController
                                             [progressTrackerStepIndex]="i"
                                             [progressTrackerStepLast]="last"
                                             [progressTrackerStepCompleted]="i <= step"
                                             [progressTrackerStepProgress]="step - i"
                                             [progressTrackerStepActive]="step >= i && step < i + 1">
                          </jsf-layout-router>
                      </div>
                  </ng-container>
              </div>
          </div>
      </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls      : ['./progress-tracker.component.scss']
})
export class LayoutProgressTrackerComponent extends AbstractItemsLayoutComponent<JsfLayoutProgressTracker> implements OnInit {

  @Input()
  layoutBuilder: JsfItemsLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  public onUpdate$: Subject<void> = new Subject<void>();

  private _items: JsfSpecialLayoutBuilder[] = [];
  private _stepValue                        = 0;

  get step() {
    return this._stepValue || 0;
  }

  get items() {
    return this._items;
  }

  constructor(private cdRef: ChangeDetectorRef) {
    super();
  }

  get progressTitle(): string {
    const templateData = this.getProgressTitleTemplateData();

    if (templateData) {
      const template = this.translationServer.getTemplate(this.i18n(this.layout.progressTitle));
      return template(templateData);
    }

    return this.i18n(this.layout.progressTitle);
  }

  getProgressTitleTemplateData(): any {
    if (this.layout.progressTitleTemplateData) {

      const ctx = this.layoutBuilder.rootBuilder.getEvalContext({
        layoutBuilder: this.layoutBuilder
      });
      return this.layoutBuilder.rootBuilder.runEvalWithContext(
        (this.layout.progressTitleTemplateData as any).$evalTranspiled || this.layout.progressTitleTemplateData.$eval, ctx);

    }
  }

  get progressTitleDependencies(): string[] {
    return this.layout.progressTitleTemplateData ? this.layout.progressTitleTemplateData.dependencies || [] : [];
  }


  ngOnInit(): void {
    this._items = this.layoutBuilder.items.filter(x => x.type === 'progress-tracker-step') as JsfSpecialLayoutBuilder[];

    // Step value dependencies
    if (this.layout.step && typeof this.layout.step === 'object') {
      const dependencies = this.layout.step.dependencies || [];
      if (dependencies.length) {
        for (const dependency of dependencies) {
          const dependencyAbsolutePath = this.layoutBuilder.abstractPathToAbsolute(dependency);
          this.layoutBuilder.rootBuilder.listenForStatusChange(dependencyAbsolutePath)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((status: PropStatusChangeInterface) => {
              if (status.status !== PropStatus.Pending) {
                this.updateStepValue();
              }
            });
        }
      } else {
        if (this.layoutBuilder.rootBuilder.warnings) {
          console.warn(`Layout 'progress-tracker' [${ this.layoutBuilder.id }] uses step eval but has not listed any dependencies.`,
            `The component will be updated on every form value change which may decrease performance.`);
        }
        this.layoutBuilder.rootBuilder.propBuilder.statusChange
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((status: PropStatus) => {
            if (status !== PropStatus.Pending) {
              this.updateStepValue();
            }
          });
      }
    }

    this.updateStepValue();

    // Progress title dependencies
    if (this.layout.progressTitleTemplateData) {
      if (this.progressTitleDependencies.length) {
        for (const dependency of this.progressTitleDependencies) {
          const dependencyAbsolutePath = this.layoutBuilder.abstractPathToAbsolute(dependency);
          this.layoutBuilder.rootBuilder.listenForStatusChange(dependencyAbsolutePath)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((status: PropStatusChangeInterface) => {
              if (status.status !== PropStatus.Pending) {
                this.detectChanges();
              }
            });
        }
      } else {
        if (this.layoutBuilder.rootBuilder.warnings) {
          console.warn(`Layout 'progress-tracker' [${ this.layoutBuilder.id }] uses progressTitleTemplateData but has not listed any dependencies.`,
            `The component will be updated on every form value change which may decrease performance.`);
        }
        this.layoutBuilder.rootBuilder.propBuilder.statusChange
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((status: PropStatus) => {
            if (status !== PropStatus.Pending) {
              this.detectChanges();
            }
          });
      }
    }

  }

  private updateStepValue() {
    if (this.layout.step && typeof this.layout.step === 'object') {
      const ctx       = this.layoutBuilder.rootBuilder.getEvalContext({
        layoutBuilder: this.layoutBuilder
      });
      this._stepValue = this.layoutBuilder.rootBuilder.runEvalWithContext(
        (this.layout.step as any).$evalTranspiled || this.layout.step.$eval, ctx);

      this._stepValue = Math.max(0, Math.min(this._stepValue, this.items.length - 1));
    } else {
      this._stepValue = this.layout.step as number;
    }

    this.detectChanges();
  }

  public detectChanges() {
    if (this.cdRef) {
      this.cdRef.detectChanges();
      this.onUpdate$.next();
    }
  }
}
