import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AbstractItemsLayoutComponent }              from '../../../abstract/items-layout.component';
import { JsfItemsLayoutBuilder, JsfLayoutDiv }       from '@kalmia/jsf-common-es2015';
import { BuilderDeveloperToolsInterface }            from '../../../builder-developer-tools.interface';


@Component({
  selector       : 'jsf-layout-div',
  template       : `
    <div class="jsf-layout-div"
         [id]="id"
         [ngClass]="getLayoutInnerClass()"
         [ngStyle]="getLayoutInnerStyle()"
         (click)="handleLayoutClick($event)">
      <jsf-layout-router *ngFor="let item of layoutBuilder.items"
                         [layoutBuilder]="item"
                         [developerTools]="developerTools"
                         [ngClass]="getLayoutItemClass(item)"
                         [ngStyle]="getLayoutItemStyle(item)">
      </jsf-layout-router>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class LayoutDivComponent extends AbstractItemsLayoutComponent<JsfLayoutDiv> {

  @Input()
  layoutBuilder: JsfItemsLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;
}
