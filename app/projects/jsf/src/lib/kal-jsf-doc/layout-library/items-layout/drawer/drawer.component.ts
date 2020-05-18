import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractItemsLayoutComponent }                                 from '../../../abstract/items-layout.component';
import { JsfItemsLayoutBuilder, JsfLayoutDrawer }                       from '@kalmia/jsf-common-es2015';
import { BuilderDeveloperToolsInterface }                               from '../../../builder-developer-tools.interface';
import * as OverlayScrollbars                                           from 'overlayscrollbars';

@Component({
  selector       : 'jsf-layout-drawer',
  template       : `
      <div class="jsf-layout-drawer"
           [ngClass]="getLayoutInnerClass()"
           [ngStyle]="getLayoutInnerStyle()"
           [class.primary]="isColorPrimary()"
           [class.accent]="isColorAccent()"
           [class.position-bottom]="isPositionBottom()"
           [class.position-top]="isPositionTop()"
           (click)="handleLayoutClick($event)">
          <!-- Placeholder element to adjust the page layout for the drawer height -->
          <div class="drawer-placeholder"></div>
          <!-- Absolutely-positioned drawer container -->
          <div class="drawer-container"
               [style.bottom.px]="offsetBottom"
               [style.top.px]="offsetTop">
              <div class="drawer-header">
                  <!-- Toggle button -->
                  <div class="drawer-toggle-button">
                      <button mat-icon-button (click)="toggleExpanded()">
                          <mat-icon *ngIf="!expanded">keyboard_arrow_up</mat-icon>
                          <mat-icon *ngIf="expanded">keyboard_arrow_down</mat-icon>
                      </button>
                  </div>

                  <div class="drawer-header-wrapper"
                       [class.__background-color--primary]="isColorPrimary()"
                       [class.__color--primary-contrast]="isColorPrimary()"
                       [class.__background-color--accent]="isColorAccent()"
                       [class.__color--accent-contrast]="isColorAccent()"
                       [class.__background-color--white]="isColorNone()"
                       [class.__color--white-contrast]="isColorNone()">
                      <jsf-layout-router *ngIf="headerLayoutBuilder"
                                         [layoutBuilder]="headerLayoutBuilder"
                                         [developerTools]="developerTools"
                                         [ngClass]="getLayoutItemClass(headerLayoutBuilder)"
                                         [ngStyle]="getLayoutItemStyle(headerLayoutBuilder)">
                      </jsf-layout-router>
                  </div>
              </div>

              <div class="drawer-content">
                  <div class="drawer-content-outer-wrapper">
                      <div class="drawer-content-wrapper"
                           #drawerContentWrapper
                           [class.expanded]="expanded">
                          <overlay-scrollbars [options]="scrollOptions">
                              <jsf-layout-router *ngIf="contentLayoutBuilder"
                                                 [layoutBuilder]="contentLayoutBuilder"
                                                 [developerTools]="developerTools"
                                                 [ngClass]="getLayoutItemClass(contentLayoutBuilder)"
                                                 [ngStyle]="getLayoutItemStyle(contentLayoutBuilder)">
                              </jsf-layout-router>
                          </overlay-scrollbars>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls      : ['./drawer.component.scss']
})
export class LayoutDrawerComponent extends AbstractItemsLayoutComponent<JsfLayoutDrawer> implements OnInit {

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

  public expanded = false;

  public offsetTop;
  public offsetBottom;

  @ViewChild('drawerContentWrapper')
  protected drawerContentWrapper;

  get headerLayoutBuilder(): JsfItemsLayoutBuilder {
    for (const item of this.layoutBuilder.items) {
      if (item.type === 'drawer-header') {
        return item as JsfItemsLayoutBuilder;
      }
    }
    if (this.layoutBuilder.rootBuilder.warnings) {
      if (this.layoutBuilder.rootBuilder.warnings) {
        console.warn(`Layout 'drawer' [${ this.layoutBuilder.id }] could not find a 'drawer-header' layout item. The header will not render correctly.`);
      }
    }
  }

  get contentLayoutBuilder(): JsfItemsLayoutBuilder {
    for (const item of this.layoutBuilder.items) {
      if (item.type === 'drawer-content') {
        return item as JsfItemsLayoutBuilder;
      }
    }
    if (this.layoutBuilder.rootBuilder.warnings) {
      if (this.layoutBuilder.rootBuilder.warnings) {
        console.warn(`Layout 'drawer' [${ this.layoutBuilder.id }] could not find a 'drawer-content' layout item. The header will not render correctly.`);
      }
    }
  }

  get color(): 'primary' | 'accent' | 'none' {
    return this.layout.color || 'primary';
  }

  get position(): 'bottom' | 'top' {
    return this.layout.position || 'bottom';
  }


  ngOnInit(): void {
  }

  toggleExpanded(): void {
    if (!this.drawerContentWrapper) {
      return;
    }
    this.expanded = !this.expanded;
  }

  isColorPrimary = () => this.color === 'primary';
  isColorAccent  = () => this.color === 'accent';
  isColorNone    = () => this.color === 'none';

  isPositionBottom = () => this.position === 'bottom';
  isPositionTop    = () => this.position === 'top';

}
