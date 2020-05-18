import { ChangeDetectionStrategy, Component, Input }                  from '@angular/core';
import { AbstractItemsLayoutComponent }                               from '../../../abstract/items-layout.component';
import { JsfItemsLayoutBuilder, JsfLayoutDiv, JsfLayoutDrawerHeader } from '@kalmia/jsf-common-es2015';
import { BuilderDeveloperToolsInterface }            from '../../../builder-developer-tools.interface';

@Component({
  selector       : 'jsf-layout-drawer-header',
  template       : `
    <div class="jsf-layout-drawer-header"
         [ngClass]="getLayoutInnerClass()"
         [ngStyle]="getLayoutInnerStyle()"
         (click)="handleLayoutClick($event)">
      <div class="drawer-header-items">
        <jsf-layout-router *ngFor="let item of layoutBuilder.items"
                           [layoutBuilder]="item"
                           [developerTools]="developerTools"
                           [ngClass]="getLayoutItemClass(item)"
                           [ngStyle]="getLayoutItemStyle(item)">
        </jsf-layout-router>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls         : ['./drawer-header.component.scss']
})
export class LayoutDrawerHeaderComponent extends AbstractItemsLayoutComponent<JsfLayoutDrawerHeader> {

  @Input()
  layoutBuilder: JsfItemsLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;
}
