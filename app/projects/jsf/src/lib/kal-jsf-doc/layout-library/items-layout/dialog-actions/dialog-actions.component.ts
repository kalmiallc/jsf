import { ChangeDetectionStrategy, Component, Input }                                           from '@angular/core';
import { AbstractItemsLayoutComponent }                                                        from '../../../abstract/items-layout.component';
import { JsfItemsLayoutBuilder, JsfLayoutDialogActions, JsfLayoutDialogContent, JsfLayoutDiv } from '@kalmia/jsf-common-es2015';
import { BuilderDeveloperToolsInterface }                                                      from '@kalmia/jsf-app/lib/kal-jsf-doc/builder-developer-tools.interface';


@Component({
  selector       : 'jsf-layout-dialog-actions',
  template       : `
    <mat-dialog-actions [attr.align]="align" class="jsf-layout-dialog-actions"
         [ngClass]="getLayoutInnerClass()"
         [ngStyle]="getLayoutInnerStyle()"
         (click)="handleLayoutClick($event)">
      <jsf-layout-router *ngFor="let item of layoutBuilder.items"
                         [layoutBuilder]="item"
                         [developerTools]="developerTools"
                         [ngClass]="getLayoutItemClass(item)"
                         [ngStyle]="getLayoutItemStyle(item)">
      </jsf-layout-router>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class LayoutDialogActionsComponent extends AbstractItemsLayoutComponent<JsfLayoutDialogActions> {

  get align() {
    return this.layout.align || 'end';
  }

  @Input()
  layoutBuilder: JsfItemsLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;
}
