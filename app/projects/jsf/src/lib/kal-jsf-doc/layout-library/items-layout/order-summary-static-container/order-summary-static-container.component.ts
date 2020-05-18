import { ChangeDetectionStrategy, Component, Input }                   from '@angular/core';
import { AbstractItemsLayoutComponent }                                from '../../../abstract/items-layout.component';
import { JsfItemsLayoutBuilder, JsfLayoutOrderSummaryStaticContainer } from '@kalmia/jsf-common-es2015';
import { BuilderDeveloperToolsInterface }                              from '../../../builder-developer-tools.interface';


@Component({
  selector       : 'jsf-layout-order-summary-static-container',
  template       : `
    <div class="jsf-layout-order-summary-static-container"
         [ngClass]="getLayoutInnerClass()"
         [ngStyle]="getLayoutInnerStyle()"
         (click)="handleLayoutClick($event)">
      <div class="static-content">
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
  styles         : [
    `
      :host {
        flex: 0 0 auto;
      }
    `
  ]
})
export class LayoutOrderSummaryStaticContainerComponent extends AbstractItemsLayoutComponent<JsfLayoutOrderSummaryStaticContainer> {

  @Input()
  layoutBuilder: JsfItemsLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface
}
