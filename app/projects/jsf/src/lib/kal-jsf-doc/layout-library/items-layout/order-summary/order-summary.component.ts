import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AbstractItemsLayoutComponent }              from '../../../abstract/items-layout.component';
import { JsfItemsLayoutBuilder, JsfLayoutDiv }       from '@kalmia/jsf-common-es2015';
import { BuilderDeveloperToolsInterface }            from '../../../builder-developer-tools.interface';

@Component({
  selector       : 'jsf-layout-order-summary',
  template       : `
    <div class="jsf-layout-order-summary"
         [ngClass]="getLayoutInnerClass()"
         [ngStyle]="getLayoutInnerStyle()"
         (click)="handleLayoutClick($event)">
      <ng-container *ngFor="let item of items">
        <ng-container [ngSwitch]="item.type">

          <jsf-layout-order-summary-static-container [layoutBuilder]="item" 
                                                     [developerTools]="developerTools"
                                                     *ngSwitchCase="'order-summary-static-container'">
          </jsf-layout-order-summary-static-container>

          <jsf-layout-order-summary-scroll-container [layoutBuilder]="item"
                                                     [developerTools]="developerTools"
                                                     *ngSwitchCase="'order-summary-scroll-container'">
          </jsf-layout-order-summary-scroll-container>

          <pre *ngSwitchDefault>Unknown order summary container {{ item.layout | json }}</pre>
        </ng-container>
      </ng-container>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : [
    `
        .jsf-layout-order-summary {
          display: flex;
          flex-direction: column;
        }
    `
  ]
})
export class LayoutOrderSummaryComponent extends AbstractItemsLayoutComponent<JsfLayoutDiv> {

  @Input()
  layoutBuilder: JsfItemsLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  get items(): JsfItemsLayoutBuilder[] {
    return this.layoutBuilder.items as JsfItemsLayoutBuilder[];
  }

}
