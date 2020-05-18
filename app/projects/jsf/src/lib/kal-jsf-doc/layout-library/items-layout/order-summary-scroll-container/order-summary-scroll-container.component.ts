import { ChangeDetectionStrategy, Component, Input }                   from '@angular/core';
import { AbstractItemsLayoutComponent }                                from '../../../abstract/items-layout.component';
import { JsfItemsLayoutBuilder, JsfLayoutOrderSummaryScrollContainer } from '@kalmia/jsf-common-es2015';
import { BuilderDeveloperToolsInterface }            from '../../../builder-developer-tools.interface';

@Component({
  selector       : 'jsf-layout-order-summary-scroll-container',
  template       : `
    <div class="jsf-layout-order-summary-scroll-container"
         [ngClass]="getLayoutInnerClass()"
         [ngStyle]="getLayoutInnerStyle()"
         (click)="handleLayoutClick($event)">
      <div class="scroll-content">
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
        flex:       0 1 auto;

        overflow:   hidden;
        overflow-y: auto;
      }
    `
  ]
})
export class LayoutOrderSummaryScrollContainerComponent extends AbstractItemsLayoutComponent<JsfLayoutOrderSummaryScrollContainer> {

  @Input()
  layoutBuilder: JsfItemsLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;
}
