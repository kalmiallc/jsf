import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit }             from '@angular/core';
import { JsfLayoutHeading, JsfSpecialLayoutBuilder, PropStatus, PropStatusChangeInterface } from '@kalmia/jsf-common-es2015';
import { AbstractSpecialLayoutComponent }                                                   from '../../../abstract/special-layout.component';
import { BuilderDeveloperToolsInterface }                                                   from '../../../builder-developer-tools.interface';
import { takeUntil }                                                                        from 'rxjs/operators';


@Component({
  selector       : 'jsf-layout-heading',
  template       : `
      <ng-container [ngSwitch]="level">
          <h1 *ngSwitchCase="1" class="jsf-layout-heading" (click)="handleLayoutClick($event)" [ngClass]="htmlClass">{{ title }}</h1>
          <h2 *ngSwitchCase="2" class="jsf-layout-heading" (click)="handleLayoutClick($event)" [ngClass]="htmlClass">{{ title }}</h2>
          <h3 *ngSwitchCase="3" class="jsf-layout-heading" (click)="handleLayoutClick($event)" [ngClass]="htmlClass">{{ title }}</h3>
          <h4 *ngSwitchCase="4" class="jsf-layout-heading" (click)="handleLayoutClick($event)" [ngClass]="htmlClass">{{ title }}</h4>
          <h5 *ngSwitchCase="5" class="jsf-layout-heading" (click)="handleLayoutClick($event)" [ngClass]="htmlClass">{{ title }}</h5>
          <h6 *ngSwitchCase="6" class="jsf-layout-heading" (click)="handleLayoutClick($event)" [ngClass]="htmlClass">{{ title }}</h6>
          <pre *ngSwitchDefault>Unknown heading level: {{ level }} - expected 1 to 6</pre>
      </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class LayoutHeadingComponent extends AbstractSpecialLayoutComponent<JsfLayoutHeading> implements OnInit {

  @Input()
  layoutBuilder: JsfSpecialLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  constructor(private cdRef: ChangeDetectorRef) {
    super();
  }

  get level(): number {
    return this.layout.level || 1;
  }

  get title(): string {
    const templateData = this.getTemplateData();

    if (templateData) {
      const template = this.translationServer.getTemplate(this.i18n(this.layout.title));
      return template(templateData);
    }

    return this.i18n(this.layout.title);
  }

  get dependencies(): string[] {
    return this.layout.templateData ? this.layout.templateData.dependencies || [] : [];
  }

  ngOnInit(): void {
    if (this.layout.templateData) {
      if (this.dependencies.length) {
        for (const dependency of this.dependencies) {
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
          console.warn(`Layout 'heading' [${ this.layoutBuilder.id }] uses templateData but has not listed any dependencies.`,
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

  getTemplateData(): any {
    if (this.layout.templateData) {

      const ctx = this.layoutBuilder.rootBuilder.getEvalContext({
        layoutBuilder: this.layoutBuilder
      });
      return this.layoutBuilder.rootBuilder.runEvalWithContext(
        (this.layout.templateData as any).$evalTranspiled || this.layout.templateData.$eval, ctx);

    }
  }

}
