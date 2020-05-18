import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnInit } from '@angular/core';
import {
  JsfAbstractPageDataService,
  JsfLayoutAppPageTitle,
  JsfSpecialLayoutBuilder,
  PropStatus,
  PropStatusChangeInterface
}                                                                                       from '@kalmia/jsf-common-es2015';
import { AbstractSpecialLayoutComponent }                                               from '../../../abstract/special-layout.component';
import { JSF_APP_PAGE_DATA }                                                            from '../../../../common';
import { BuilderDeveloperToolsInterface }                                               from '../../../builder-developer-tools.interface';
import { takeUntil }                                                                    from 'rxjs/operators';

@Component({
  selector       : 'jsf-layout-app-page-title',
  template       : `
      <span class="jsf-layout-app-page-title" [ngClass]="htmlClass" (click)="handleLayoutClick($event)">{{ title }}</span>
  `,
  styleUrls      : ['./app-page-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutAppPageTitleComponent extends AbstractSpecialLayoutComponent<JsfLayoutAppPageTitle> implements OnInit {

  @Input()
  layoutBuilder: JsfSpecialLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;


  constructor(private cdRef: ChangeDetectorRef,
              @Inject(JSF_APP_PAGE_DATA) private pageDataService: JsfAbstractPageDataService) {
    super();
  }

  get title(): string {
    if (this.layout.title !== void 0) {
      const templateData = this.getTemplateData();

      if (templateData) {
        const template = this.translationServer.getTemplate(this.i18n(this.layout.title));
        return template(templateData);
      }

      return this.i18n(this.layout.title);
    } else {
      return this.i18n(this.pageDataService.getActivePageTitle());
    }

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
          console.warn(`Layout 'app-page-title' [${ this.layoutBuilder.id }] uses templateData but has not listed any dependencies.`,
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
