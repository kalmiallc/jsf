import { ChangeDetectionStrategy, Component, Input }                      from '@angular/core';
import { AbstractItemsLayoutComponent }                                   from '../../../abstract/items-layout.component';
import { JsfItemsLayoutBuilder, JsfLayoutList, JsfLayoutListPreferences } from '@kalmia/jsf-common-es2015';
import { BuilderDeveloperToolsInterface }                                 from '@kalmia/jsf-app/lib/kal-jsf-doc/builder-developer-tools.interface';


@Component({
  selector       : 'jsf-layout-list',
  template       : `
    <div class="jsf-layout-list"
         [id]="id"
         [ngClass]="getLayoutInnerClass()"
         [ngStyle]="getLayoutInnerStyle()"
         (click)="handleLayoutClick($event)">
      <ng-container [ngSwitch]="themePreferences.type">
        <ul *ngSwitchCase="'unordered'">
          <li *ngFor="let listItem of items; let i = index"
            [ngClass]="listItem.layout.htmlClass">
            <jsf-layout-router *ngFor="let item of listItem.items"
                               [layoutBuilder]="item"
                               [developerTools]="developerTools">
            </jsf-layout-router>
          </li>
        </ul>
          
        <ol *ngSwitchCase="'ordered'">
          <li *ngFor="let listItem of items; let i = index"
            [ngClass]="listItem.layout.htmlClass">
            <jsf-layout-router *ngFor="let item of listItem.items" 
                               [layoutBuilder]="item"
                               [developerTools]="developerTools">
            </jsf-layout-router>
          </li>
        </ol>
        <pre *ngSwitchDefault>Unknown list type {{ layoutBuilder.layout | json }}</pre>
      </ng-container>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class LayoutListComponent extends AbstractItemsLayoutComponent<JsfLayoutList> {

  @Input()
  layoutBuilder: JsfItemsLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  get items(): JsfItemsLayoutBuilder[] {
    return this.layoutBuilder.items as any;
  }

  get themePreferences(): JsfLayoutListPreferences {
    return {
      /* Defaults */
      type: 'unordered',

      /* Global overrides */
      ...(this.globalThemePreferences ? this.globalThemePreferences.list : {}),

      /* Layout overrides */
      ...(this.localThemePreferences || {})
    } as JsfLayoutListPreferences;
  }
}
