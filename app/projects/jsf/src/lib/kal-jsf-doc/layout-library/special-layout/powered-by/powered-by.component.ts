import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { JsfLayoutPoweredBy, JsfSpecialLayoutBuilder }                          from '@kalmia/jsf-common-es2015';
import { AbstractSpecialLayoutComponent }                                       from '../../../abstract/special-layout.component';
import { BuilderDeveloperToolsInterface }                                       from '../../../builder-developer-tools.interface';

@Component({
  selector       : 'jsf-layout-powered-by',
  template       : `
      <div class="jsf-layout-powered-by __color--black" [ngClass]="htmlClass" (click)="handleLayoutClick($event)">
          <div class="powered-by-container" (click)="navigateToWebsite()">
              <span i18n class="powered-by-label">Powered by</span>
              <img class="powered-by-logo" src="https://app.salesqueze.com/en/assets/branding/logo-flat.png">
          </div>
      </div>
  `,
  styleUrls      : ['./powered-by.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutPoweredByComponent extends AbstractSpecialLayoutComponent<JsfLayoutPoweredBy> implements OnInit {

  @Input()
  layoutBuilder: JsfSpecialLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  constructor(private cdRef: ChangeDetectorRef) {
    super();
  }

  public ngOnInit(): void {}

  navigateToWebsite() {
    return this.layoutBuilder.rootBuilder.appRouter.navigateTo('https://salesqueze.com/', {
      type: 'absolute'
    });
  }
}
