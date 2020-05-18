import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnInit } from '@angular/core';
import { JsfAbstractPageDataService, JsfLayoutAppBreadcrumbs, JsfSpecialLayoutBuilder } from '@kalmia/jsf-common-es2015';
import { AbstractSpecialLayoutComponent }                                               from '../../../abstract/special-layout.component';
import { JSF_APP_PAGE_DATA }                                                            from '../../../../common';
import { BuilderDeveloperToolsInterface }                                               from '../../../builder-developer-tools.interface';

@Component({
  selector       : 'jsf-layout-app-breadcrumbs',
  template       : `
    <div class="jsf-layout-app-breadcrumbs" [ngClass]="htmlClass" (click)="handleLayoutClick($event)">
      <div class="breadcrumbs-container">

        <div class="fragment __color--black-50" *ngFor="let fragment of fragments; let last = last">
          <!-- Fragment name -->
          <span class="fragment-name"
                jsfHoverClass="__color--primary"
                (click)="fragment.path && navigateTo(fragment.path)">
            {{ i18n(fragment.label) }}
          </span>

          <!-- Separator -->
          <span class="fragment-separator" *ngIf="!last">/</span>
        </div>

      </div>
    </div>
  `,
  styleUrls      : ['./app-breadcrumbs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutAppBreadcrumbsComponent extends AbstractSpecialLayoutComponent<JsfLayoutAppBreadcrumbs> implements OnInit {

  @Input()
  layoutBuilder: JsfSpecialLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  get fragments() {
    return this.pageDataService.getActiveBreadcrumbs();
  }

  constructor(private cdRef: ChangeDetectorRef,
              @Inject(JSF_APP_PAGE_DATA) private pageDataService: JsfAbstractPageDataService) {
    super();
  }

  ngOnInit(): void {
  }

  navigateTo(path: string) {
    return this.layoutBuilder.rootBuilder.appRouter.navigateTo(path, {
      type: 'app'
    });
  }

}
