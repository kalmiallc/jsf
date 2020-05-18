import { ChangeDetectionStrategy, Component, Input }                   from '@angular/core';
import { AbstractItemsLayoutComponent }                                from '../../../abstract/items-layout.component';
import { JsfItemsLayoutBuilder, JsfLayoutDialogContent, JsfLayoutDiv } from '@kalmia/jsf-common-es2015';
import { BuilderDeveloperToolsInterface }                              from '@kalmia/jsf-app/lib/kal-jsf-doc/builder-developer-tools.interface';
import * as OverlayScrollbars                                          from 'overlayscrollbars';


@Component({
  selector       : 'jsf-layout-dialog-content',
  template       : `
    <mat-dialog-content class="jsf-layout-dialog-content"
         [ngClass]="getLayoutInnerClass()"
         [ngStyle]="getLayoutInnerStyle()"
         (click)="handleLayoutClick($event)">
      <overlay-scrollbars [options]="scrollOptions">
          <jsf-layout-router *ngFor="let item of layoutBuilder.items"
                             [layoutBuilder]="item"
                             [developerTools]="developerTools"
                             [ngClass]="getLayoutItemClass(item)"
                             [ngStyle]="getLayoutItemStyle(item)">
          </jsf-layout-router>
      </overlay-scrollbars>
    </mat-dialog-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : [
    `.mat-dialog-content {
        overflow: hidden;
    }`
  ]
})
export class LayoutDialogContentComponent extends AbstractItemsLayoutComponent<JsfLayoutDialogContent> {

  @Input()
  layoutBuilder: JsfItemsLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  public readonly scrollOptions: OverlayScrollbars.Options = {
    overflowBehavior: {
      x: 'hidden',
      y: 'scroll'
    },
    resize          : 'none',
    paddingAbsolute : true
  };
}
