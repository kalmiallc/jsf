import { ChangeDetectionStrategy, Component, Input, OnInit }                                           from '@angular/core';
import { AbstractItemsLayoutComponent }                                                                from '../../../abstract/items-layout.component';
import { JsfItemsLayoutBuilder, JsfLayoutTabPreferences, JsfLayoutTabSet, JsfLayoutTabSetPreferences } from '@kalmia/jsf-common-es2015';
import { MatTabChangeEvent }                                                                           from '@angular/material';
import { BuilderDeveloperToolsInterface }            from '../../../builder-developer-tools.interface';

@Component({
  selector       : 'jsf-layout-tabset',
  template       : `
    <div class="jsf-layout-tabset"
         (click)="handleLayoutClick($event)"
         [ngClass]="htmlClass">
      <jsf-tab-group [dynamicHeight]="themePreferences.dynamicHeight"
                     [headerPosition]="themePreferences.headerPosition"
                     [disableRipple]="themePreferences.disableRipple"
                     [color]="themePreferences.color"
                     [backgroundColor]="themePreferences.backgroundColor !== 'none' && themePreferences.backgroundColor"
                     [attr.mat-align-tabs]="themePreferences.labelAlignment"
                     [class.round]="themePreferences.headerType === 'round'"
                     (selectedTabChange)="setSelectedTab($event)">

        <mat-tab *ngFor="let tab of layout.items; let i = index">
          <ng-template mat-tab-label>
            <div *ngIf="themePreferences.headerType === 'round'; else defaultTab"
                 class="tab-circle"
                 [class.theme-background-color-primary]="themePreferences.color === 'primary' && selected === i"
                 [class.theme-background-color-accent]="themePreferences.color === 'accent' && selected === i">
              <mat-icon *ngIf="getTabPreferences(i).prefixIcon">{{ getTabPreferences(i).prefixIcon }}</mat-icon>
              <span class="tab-prefix-label">{{ getTabPreferences(i).prefixLabel || (i + 1) }}</span>
            </div>

            <ng-template #defaultTab>
              <mat-icon *ngIf="getTabPreferences(i).prefixIcon">{{ getTabPreferences(i).prefixIcon }}</mat-icon>
              <span class="tab-prefix-label" *ngIf="getTabPreferences(i).prefixLabel">{{ getTabPreferences(i).prefixLabel }}</span>
            </ng-template>

            <span class="tab-title">{{ i18n(tab.title || '') }}</span>
          </ng-template>

          <jsf-layout-router *ngFor="let item of items[i].items"
                             [layoutBuilder]="item"
                             [developerTools]="developerTools"
                             [ngClass]="getLayoutItemClass(item)"
                             [ngStyle]="getLayoutItemStyle(item)">
          </jsf-layout-router>
        </mat-tab>
      </jsf-tab-group>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class LayoutTabSetComponent extends AbstractItemsLayoutComponent<JsfLayoutTabSet> implements OnInit {

  selected = 0;

  @Input()
  layoutBuilder: JsfItemsLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  get items(): JsfItemsLayoutBuilder[] {
    return this.layoutBuilder.items as any;
  }

  setSelectedTab(e: MatTabChangeEvent) {
    this.selected = e.index;
  }

  ngOnInit() {
  }

  get themePreferences(): JsfLayoutTabSetPreferences {
    return {
      /* Defaults */
      labelAlignment : 'start',
      headerPosition : 'above',
      dynamicHeight  : true,
      disableRipple  : false,
      color          : 'primary',
      backgroundColor: 'none',
      headerType     : 'default',
      // animationDuration: void 0,

      /* Global overrides */
      ...(this.globalThemePreferences ? this.globalThemePreferences.tabset : {}),

      /* Layout overrides */
      ...(this.localThemePreferences || {})
    } as JsfLayoutTabSetPreferences;
  }

  getTabPreferences(tabIndex: number): JsfLayoutTabPreferences {
    return {
      /* Defaults */
      prefixIcon : '',
      prefixLabel: '',

      /* Global overrides */
      ...(this.globalThemePreferences ? this.globalThemePreferences.tab : {}),

      /* Layout overrides */
      ...(this.getTabPropPreferences(tabIndex) || {})
    } as JsfLayoutTabPreferences;
  }

  private getTabPropPreferences(tabIndex: number) {
    return this.items[tabIndex].layout.preferences as JsfLayoutTabPreferences;
  }
}
