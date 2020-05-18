import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit }                          from '@angular/core';
import { JsfLayoutOrderSummaryLineItem, JsfSpecialLayoutBuilder, PropStatus, PropStatusChangeInterface } from '@kalmia/jsf-common-es2015';
import { AbstractSpecialLayoutComponent }                                                                from '../../../abstract/special-layout.component';
import { BuilderDeveloperToolsInterface }                                                                from '../../../builder-developer-tools.interface';
import { takeUntil }                                                                                     from 'rxjs/operators';

@Component({
  selector       : 'jsf-layout-order-summary-line-item',
  template       : `
      <div class="jsf-layout-order-summary-line-item" (click)="handleLayoutClick($event)" [ngClass]="htmlClass">
          <div class="line-item">
              <div class="row">
                  <div class="line-item-label col-6">{{ label }}</div>
                  <div class="line-item-value col-6">{{ value }}</div>
              </div>
          </div>
      </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class LayoutOrderSummaryLineItemComponent extends AbstractSpecialLayoutComponent<JsfLayoutOrderSummaryLineItem> implements OnInit {

  @Input()
  layoutBuilder: JsfSpecialLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;


  constructor(private cdRef: ChangeDetectorRef) {
    super();
  }

  get label(): string {
    const templateData = this.getLabelTemplateData();

    if (templateData) {
      const template = this.translationServer.getTemplate(this.i18n(this.layout.label));
      return template(templateData);
    }

    return this.i18n(this.layout.label);
  }

  get value(): string {
    const templateData = this.getValueTemplateData();

    if (templateData) {
      const template = this.translationServer.getTemplate(this.i18n(this.layout.value));
      return template(templateData);
    }

    return this.i18n(this.layout.value);
  }

  get valueDependencies(): string[] {
    return this.layout.valueTemplateData ? this.layout.valueTemplateData.dependencies || [] : [];
  }

  get labelDependencies(): string[] {
    return this.layout.labelTemplateData ? this.layout.labelTemplateData.dependencies || [] : [];
  }

  ngOnInit(): void {
    if (this.layout.valueTemplateData) {
      if (this.valueDependencies.length) {
        for (const dependency of this.valueDependencies) {
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
          console.warn(`Layout 'order-summary-line-item' [${ this.layoutBuilder.id }] uses valueTemplateData but has not listed any dependencies.`,
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

    if (this.layout.labelTemplateData) {
      if (this.labelDependencies.length) {
        for (const dependency of this.labelDependencies) {
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
          console.warn(`Layout 'order-summary-line-item' [${ this.layoutBuilder.id }] uses valueTemplateData but has not listed any dependencies.`,
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

  getLabelTemplateData(): any {
    if (this.layout.labelTemplateData) {

      const ctx = this.layoutBuilder.rootBuilder.getEvalContext();
      return this.layoutBuilder.rootBuilder.runEvalWithContext(
        (this.layout.labelTemplateData as any).$evalTranspiled || this.layout.labelTemplateData.$eval, ctx);

    }
  }

  getValueTemplateData(): any {
    if (this.layout.valueTemplateData) {

      const ctx = this.layoutBuilder.rootBuilder.getEvalContext();
      return this.layoutBuilder.rootBuilder.runEvalWithContext(
        (this.layout.valueTemplateData as any).$evalTranspiled || this.layout.valueTemplateData.$eval, ctx);

    }
  }
}
