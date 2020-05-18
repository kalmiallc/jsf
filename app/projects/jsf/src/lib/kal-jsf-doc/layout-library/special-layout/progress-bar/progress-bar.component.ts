import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit }                 from '@angular/core';
import { JsfLayoutProgressBar, JsfSpecialLayoutBuilder, PropStatus, PropStatusChangeInterface } from '@kalmia/jsf-common-es2015';
import { AbstractSpecialLayoutComponent }                                                       from '../../../abstract/special-layout.component';
import { takeUntil }                                                                            from 'rxjs/operators';
import { BuilderDeveloperToolsInterface }                                                       from '../../../builder-developer-tools.interface';

@Component({
  selector       : 'jsf-layout-progress-bar',
  template       : `
      <mat-progress-bar [ngClass]="htmlClass"
                        [mode]="mode"
                        [color]="color"
                        [value]="progressValue"
                        (click)="handleLayoutClick($event)">
      </mat-progress-bar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class LayoutProgressBarComponent extends AbstractSpecialLayoutComponent<JsfLayoutProgressBar> implements OnInit {

  @Input()
  layoutBuilder: JsfSpecialLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  private _progressValue = 0;

  get mode(): 'determinate' | 'indeterminate' | 'buffer' | 'query' {
    return this.layout.mode || 'determinate';
  }

  get color() {
    return this.layout.color || 'primary';
  }

  get progressValue() {
    return this._progressValue || 0;
  }

  constructor(private cdRef: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    if (this.layout.progress && typeof this.layout.progress === 'object') {
      const dependencies = this.layout.progress.dependencies || [];
      if (dependencies.length) {
        for (const dependency of dependencies) {
          const dependencyAbsolutePath = this.layoutBuilder.abstractPathToAbsolute(dependency);
          this.layoutBuilder.rootBuilder.listenForStatusChange(dependencyAbsolutePath)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((status: PropStatusChangeInterface) => {
              if (status.status !== PropStatus.Pending) {
                this.updateProgressValue();
              }
            });
        }
      } else {
        if (this.layoutBuilder.rootBuilder.warnings) {
          console.warn(`Layout 'progress-bar' [${ this.layoutBuilder.id }] uses progress eval but has not listed any dependencies.`,
            `The component will be updated on every form value change which may decrease performance.`);
        }
        this.layoutBuilder.rootBuilder.propBuilder.statusChange
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((status: PropStatus) => {
            if (status !== PropStatus.Pending) {
              this.updateProgressValue();
            }
          });
      }
    }

    this.updateProgressValue();
  }

  private updateProgressValue() {
    if (this.layout.progress && typeof this.layout.progress === 'object') {
      const ctx           = this.layoutBuilder.rootBuilder.getEvalContext({
        layoutBuilder: this.layoutBuilder
      });
      this._progressValue = this.layoutBuilder.rootBuilder.runEvalWithContext(
        (this.layout.progress as any).$evalTranspiled || this.layout.progress.$eval, ctx);

      if (this._progressValue < 0) {
        throw new Error(`Progress value cannot be lower than 0 (${ this._progressValue }).`);
      }

      if (this._progressValue > 100) {
        throw new Error(`Progress value cannot be higher than 100 (${ this._progressValue }).`);
      }
    } else {
      this._progressValue = this.layout.progress as number;
    }

    this.cdRef.detectChanges();
  }

}
