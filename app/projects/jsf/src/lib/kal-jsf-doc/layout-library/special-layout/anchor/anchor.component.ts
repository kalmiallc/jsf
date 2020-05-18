import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit }            from '@angular/core';
import { JsfLayoutAnchor, JsfSpecialLayoutBuilder, PropStatus, PropStatusChangeInterface } from '@kalmia/jsf-common-es2015';
import { AbstractSpecialLayoutComponent }                                                  from '../../../abstract/special-layout.component';
import { BuilderDeveloperToolsInterface }                                                  from '../../../builder-developer-tools.interface';
import { takeUntil }                                                                       from 'rxjs/operators';

@Component({
  selector       : 'jsf-layout-anchor',
  template       : `
      <a *ngIf="href" [ngClass]="htmlClass" (click)="handleLayoutClick($event);" href="{{ href }}" target="_blank">{{ title }}</a>
      <a *ngIf="!href" [ngClass]="htmlClass" (click)="handleLayoutClick($event);" href="javascript:void(0)">{{ title }}</a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class LayoutAnchorComponent extends AbstractSpecialLayoutComponent<JsfLayoutAnchor> implements OnInit {

  @Input()
  layoutBuilder: JsfSpecialLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  constructor(private cdRef: ChangeDetectorRef) {
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

  get href(): string {
    if (!this.layout.href) {
      return null;
    }

    const templateData = this.getHrefTemplateData();

    if (templateData) {
      const template = this.translationServer.getTemplate(this.i18n(this.layout.href));
      return template(templateData);
    }

    return this.i18n(this.layout.href);
  }

  get hrefDependencies(): string[] {
    return this.layout.hrefTemplateData ? this.layout.hrefTemplateData.dependencies || [] : [];
  }

  get titleDependencies(): string[] {
    return this.layout.titleTemplateData ? this.layout.titleTemplateData.dependencies || [] : [];
  }

  ngOnInit(): void {
    if (this.layout.hrefTemplateData) {
      if (this.hrefDependencies.length) {
        for (const dependency of this.hrefDependencies) {
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
          console.warn(`Layout 'anchor' [${ this.layoutBuilder.id }] uses hrefTemplateData but has not listed any dependencies.`,
            `The component will be updated on every form href change which may decrease performance.`);
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
          console.warn(`Layout 'anchor' [${ this.layoutBuilder.id }] uses hrefTemplateData but has not listed any dependencies.`,
            `The component will be updated on every form href change which may decrease performance.`);
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

  getTitleTemplateData(): any {
    if (this.layout.titleTemplateData) {

      const ctx = this.layoutBuilder.rootBuilder.getEvalContext({
        layoutBuilder: this.layoutBuilder
      });
      return this.layoutBuilder.rootBuilder.runEvalWithContext(
        (this.layout.titleTemplateData as any).$evalTranspiled || this.layout.titleTemplateData.$eval, ctx);

    }
  }

  getHrefTemplateData(): any {
    if (this.layout.hrefTemplateData) {

      const ctx = this.layoutBuilder.rootBuilder.getEvalContext({
        layoutBuilder: this.layoutBuilder
      });
      return this.layoutBuilder.rootBuilder.runEvalWithContext(
        (this.layout.hrefTemplateData as any).$evalTranspiled || this.layout.hrefTemplateData.$eval, ctx);

    }
  }
}
