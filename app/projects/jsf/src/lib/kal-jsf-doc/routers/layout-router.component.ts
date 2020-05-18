import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  SkipSelf,
  ViewChild
}                                                                    from '@angular/core';
import { JsfPropLayoutBuilder, JsfUnknownLayoutBuilder, PropStatus } from '@kalmia/jsf-common-es2015';
import { RouterComponent }                                           from './router.component';
import { Subject }                                                   from 'rxjs';
import { BuilderDeveloperToolsInterface }                            from '../builder-developer-tools.interface';
import { MatMenuTrigger }                                            from '@angular/material';
import { isNil }                                                     from 'lodash';
import { takeUntil }                                                 from 'rxjs/operators';

// Note: this is TMP in v4 we will do routing programmatically
// V4 when? :ultrafastpartyparrot:

@Component({
  selector       : 'jsf-layout-router',
  template       : `
      <fieldset *ngIf="debug; else routerTplWrapper">
          <legend style="font-size: 70%; color: blue" (click)="debugLog(layoutBuilder)">
              Layout => {{ layoutBuilder.type }},
              id => {{ layoutBuilder.id }},
              arrayMap =>
              <pre style="font-size: 90%; color: green; display: inline-block; float: right;">{{ layoutBuilder.arrayPropMap | json }}</pre>
          </legend>
          <ng-content *ngTemplateOutlet="routerTpl"></ng-content>
      </fieldset>

      <ng-template #routerTplWrapper>
          <div *ngIf="developerTools; else routerTpl"
               class="__developer-tools-wrapper"
               [jsfHoverClass]="'hover'"
               [jsfHoverPropagateFromChildren]="false"
               [class.selected]="selectedPathMatches"
               [class.context-menu-open]="contextMenuTrigger.menuOpen"
               (contextmenu)="onOpenDeveloperContextMenu($event)"
               (click)="onLayoutSelect($event)">

              <!-- Context menu trigger element -->
              <div style="visibility: hidden; position: fixed"
                   [style.left]="contextMenuPosition.x"
                   [style.top]="contextMenuPosition.y"
                   [matMenuTriggerFor]="contextMenu"
                   #contextMenuTrigger="matMenuTrigger">
              </div>

              <mat-menu #contextMenu="matMenu">
                  <ng-template matMenuContent>
                      <div class="text-center">
                          <ng-container [ngSwitch]="layoutBuilder.type">
                              <span *ngSwitchCase="'prop'"
                                    class="d-block my-n1 text-capitalize __color--grey-dark">Prop - {{ propBuilder.prop.type }}</span>
                              <span *ngSwitchDefault
                                    class="d-block my-n1 text-capitalize __color--grey-dark">{{ layoutBuilder.type }}</span>
                          </ng-container>
                      </div>

                      <hr>

                      <button mat-menu-item
                              (click)="builderEmitLayoutSelectEvent()">
                          <mat-icon>select_all</mat-icon>
                          <span>Select</span>
                      </button>
                      <button mat-menu-item
                              *ngIf="layoutBuilder.type === 'prop'"
                              (click)="builderEmitPropSelectEvent()">
                          <mat-icon>text_fields</mat-icon>
                          <span>Select prop</span>
                      </button>

                      <hr>

                      <button mat-menu-item
                              (click)="builderEmitLayoutDeleteEvent()">
                          <mat-icon class="__color--warn">delete_forever</mat-icon>
                          <span class="__color--warn">Delete</span>
                      </button>
                  </ng-template>
              </mat-menu>

              <div class="__developer-tools-content">
                  <ng-content *ngTemplateOutlet="routerTpl"></ng-content>
              </div>
          </div>
      </ng-template>

      <ng-template #routerTpl>
          <ng-container [ngSwitch]="layoutBuilder.type">
              <!-- PROP -->
              <jsf-prop-router
                      *ngSwitchCase="'prop'"
                      [layoutBuilder]="layoutBuilder"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-prop-router>

              <!-- ITEMS LAYOUTS -->
              <jsf-layout-div
                      *ngSwitchCase="'div'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-div>
              <jsf-layout-row
                      *ngSwitchCase="'row'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-row>
              <jsf-layout-col
                      *ngSwitchCase="'col'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-col>
              <jsf-layout-tabset
                      *ngSwitchCase="'tabset'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-tabset>
              <jsf-layout-stepper
                      *ngSwitchCase="'stepper'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-stepper>

              <jsf-layout-order-summary
                      *ngSwitchCase="'order-summary'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-order-summary>
              <jsf-layout-order-summary-overlay
                      *ngSwitchCase="'order-summary-overlay'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-order-summary-overlay>
              <jsf-layout-order-summary-scroll-container
                      *ngSwitchCase="'order-summary-scroll-container'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-order-summary-scroll-container>
              <jsf-layout-order-summary-line-item
                      *ngSwitchCase="'order-summary-line-item'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-order-summary-line-item>
              <jsf-layout-expansion-panel-header
                      *ngSwitchCase="'expansion-panel-header'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-expansion-panel-header>
              <jsf-layout-expansion-panel-content
                      *ngSwitchCase="'expansion-panel-content'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-expansion-panel-content>
              <jsf-layout-drawer
                      *ngSwitchCase="'drawer'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-drawer>
              <jsf-layout-drawer-header
                      *ngSwitchCase="'drawer-header'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-drawer-header>
              <jsf-layout-drawer-content
                      *ngSwitchCase="'drawer-content'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-drawer-content>
              <jsf-layout-menu
                      *ngSwitchCase="'menu'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-menu>
              <jsf-layout-menu-item
                      *ngSwitchCase="'menu-item'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-menu-item>
              <jsf-layout-list
                      *ngSwitchCase="'list'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-list>
              <jsf-layout-dialog-content
                      *ngSwitchCase="'dialog-content'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-dialog-content>
              <jsf-layout-dialog-actions
                      *ngSwitchCase="'dialog-actions'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-dialog-actions>


              <!-- SPECIAL LAYOUTS -->
              <jsf-layout-heading
                      *ngSwitchCase="'heading'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-heading>
              <jsf-layout-span
                      *ngSwitchCase="'span'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-span>
              <jsf-layout-sup
                      *ngSwitchCase="'sup'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-sup>
              <jsf-layout-sub
                      *ngSwitchCase="'sub'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-sub>
              <jsf-layout-anchor
                      *ngSwitchCase="'anchor'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-anchor>
              <jsf-layout-paragraph
                      *ngSwitchCase="'paragraph'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-paragraph>
              <jsf-layout-button
                      *ngSwitchCase="'button'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-button>
              <jsf-layout-badge
                      *ngSwitchCase="'badge'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-badge>
              <jsf-layout-stepper-next
                      *ngSwitchCase="'stepper-next'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-stepper-next>
              <jsf-layout-stepper-previous
                      *ngSwitchCase="'stepper-previous'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-stepper-previous>
              <jsf-layout-array-item-add
                      *ngSwitchCase="'array-item-add'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-array-item-add>
              <jsf-layout-array-item-remove
                      *ngSwitchCase="'array-item-remove'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-array-item-remove>
              <jsf-layout-image
                      *ngSwitchCase="'image'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-image>
              <jsf-layout-icon
                      *ngSwitchCase="'icon'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-icon>
              <jsf-layout-progress-bar
                      *ngSwitchCase="'progress-bar'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-progress-bar>
              <jsf-layout-hr
                      *ngSwitchCase="'hr'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-hr>
              <jsf-layout-d3
                      *ngSwitchCase="'d3'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-d3>
              <jsf-layout-chartjs
                      *ngSwitchCase="'chartjs'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-chartjs>
              <jsf-layout-custom-component
                      *ngSwitchCase="'custom-component'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-custom-component>
              <jsf-layout-render-2d
                      *ngSwitchCase="'render-2d'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-render-2d>
              <jsf-layout-html
                      *ngSwitchCase="'html'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-html>
              <jsf-layout-progress-tracker
                      *ngSwitchCase="'progress-tracker'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-progress-tracker>
              <jsf-layout-progress-tracker-step
                      *ngSwitchCase="'progress-tracker-step'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-progress-tracker-step>


              <jsf-layout-app-breadcrumbs
                      *ngSwitchCase="'app-breadcrumbs'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-app-breadcrumbs>
              <jsf-layout-app-page-title
                      *ngSwitchCase="'app-page-title'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-app-page-title>

              <jsf-layout-powered-by
                      *ngSwitchCase="'powered-by'"
                      [layoutBuilder]="layoutBuilder"
                      [developerTools]="developerTools"
                      [matTooltip]="tooltip"
                      [matTooltipPosition]="tooltipPosition"
                      [matTooltipDisabled]="!tooltipEnabled"
                      [class.tooltip-disabled]="!tooltipEnabled"
                      [attr.title]="tooltipAttributeTitle">
              </jsf-layout-powered-by>

              <pre *ngSwitchDefault>Unknown layout {{ layoutBuilder.layout | json }}</pre>
          </ng-container>
      </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : [
      `
          :host(.hidden) {
              display: none !important;
          }

          :host > .tooltip-disabled {
              touch-action:                initial !important;
              user-select:                 initial !important;
              -webkit-user-drag:           initial !important;
              -webkit-tap-highlight-color: initial !important;
          }
    `
  ]
})
export class LayoutRouterComponent extends RouterComponent implements OnInit, OnDestroy {

  @Input()
  layoutBuilder: JsfUnknownLayoutBuilder;

  @HostBinding('attr.jsf-layout-id')
  idAttr;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  @ViewChild(MatMenuTrigger)
  contextMenu: MatMenuTrigger;

  contextMenuPosition = { x: '0px', y: '0px' };

  public selectedPath: string = null;

  protected ngUnsubscribe: Subject<void> = new Subject<void>();


  constructor(private cdRef: ChangeDetectorRef,
              @SkipSelf() protected parentCdRef: ChangeDetectorRef) {
    super();
  }

  get debug() {
    return this.layoutBuilder && this.layoutBuilder.rootBuilder && this.layoutBuilder.rootBuilder.debug;
  }

  get docDefPath() {
    return this.layoutBuilder.docDefPath;
  }

  get uuid() {
    return this.layoutBuilder.layout.__uuid;
  }

  get propDocDefPath() {
    return this.propBuilder && this.propBuilder.docDefPath;
  }

  get propBuilder() {
    if (this.layoutBuilder.type === 'prop') {
      return (this.layoutBuilder as JsfPropLayoutBuilder).propBuilder;
    }
  }

  get selectedPathMatches(): boolean {
    if (isNil(this.selectedPath)) {
      return false;
    }
    return this.selectedPath === this.docDefPath || this.selectedPath === this.propDocDefPath;
  }

  ngOnInit() {
    this.idAttr   = this.layoutBuilder.id;
    this.isHidden = !this.layoutBuilder.visible;

    this.layoutBuilder.visibleObservable
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(next => {
        this.isHidden = !next;
        this.detectChanges();
      });

    if (this.developerTools) {
      this.developerTools.eventBus.selectLayout$
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(event => {
          if (!event) {
            return;
          }
          this.selectedPath = event.path;
          this.detectChanges();
          this.cdRef.detectChanges();
        });

      this.developerTools.eventBus.selectProp$
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(event => {
          if (!event) {
            return;
          }
          this.selectedPath = event.path;
          this.detectChanges();
          this.cdRef.detectChanges();
        });
    }

    this.detectChanges();

    // Tooltip handling
    if (this.tooltipTemplateData) {
      if (this.tooltipDependencies.length) {
        for (const dependency of this.tooltipDependencies) {
          const dependencyAbsolutePath = this.layoutBuilder.abstractPathToAbsolute(dependency);
          this.layoutBuilder.rootBuilder.listenForStatusChange(dependencyAbsolutePath)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((status) => {
              if (status.status !== PropStatus.Pending) {
                this.detectChanges();
              }
            });
        }
      } else {
        if (this.layoutBuilder.rootBuilder.warnings) {
          console.warn(`Layout router [${ this.layoutBuilder.id }] uses tooltip templateData but has not listed any dependencies.`,
            `The component will be updated on every form value change which may decrease performance.`);
        }
        this.layoutBuilder.rootBuilder.propBuilder.statusChange
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((status: PropStatus) => {
            if (status !== PropStatus.Pending) {
              this.detectChanges();
            }
          });
      }
    }
  }

  /**
   * Destroy.
   */
  ngOnDestroy(): void {
    // Unsubscribe from all observables.
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


  private detectChanges() {
    /**
     * We must trigger change detection on the parent component, because host property bindings are part
     * of that component's view.
     */
    if (this.parentCdRef) {
      this.parentCdRef.detectChanges();
    }
  }

  /**
   * Tooltips
   */
  get tooltipAsAttribute() {
    if (this.isTooltipDataObject(this.layout.tooltip)) {
      return this.layout.tooltip.displayAsTitleAttribute || false;
    }
    return false;
  }

  get tooltipAttributeTitle() {
    return this.tooltipAsAttribute ? this.tooltip : null;
  }

  get tooltipEnabled() {
    return this.tooltip && !this.tooltipAsAttribute;
  }

  get tooltipPosition() {
    if (this.isTooltipDataObject(this.layout.tooltip)) {
      return this.layout.tooltip.position || 'below';
    }
    return 'below';
  }

  get tooltip() {
    const tooltipText = this.isTooltipDataObject(this.layout.tooltip)
      ? this.layout.tooltip.title
      : this.layout.tooltip as string;

    const templateData = this.tooltipTemplateData;

    if (templateData) {
      const template = this.translationServer.getTemplate(this.i18n(tooltipText));
      return template(templateData);
    }

    return this.i18n(tooltipText);
  }

  get tooltipTemplateData(): any {
    if (this.isTooltipDataObject(this.layout.tooltip) && this.layout.tooltip.templateData) {

      const ctx = this.layoutBuilder.rootBuilder.getEvalContext({
        layoutBuilder: this.layoutBuilder
      });
      return this.layoutBuilder.rootBuilder.runEvalWithContext(
        (this.layout.tooltip.templateData as any).$evalTranspiled
        || this.layout.tooltip.templateData.$eval, ctx);

    }
  }

  get tooltipDependencies(): string[] {
    if (this.isTooltipDataObject(this.layout.tooltip) && this.layout.tooltip.templateData) {
      return this.layout.tooltip.templateData.dependencies ? this.layout.tooltip.templateData.dependencies || [] : [];
    }
    return [];
  }


  private isTooltipDataObject(x: any): x is {
    title: string;
    templateData?: {
      $eval: string;
    };
    position?: 'above' | 'below' | 'left' | 'right' | 'before' | 'after';
    displayAsTitleAttribute: boolean;
  } {
    return typeof x === 'object' && 'title' in x;
  }

  public onOpenDeveloperContextMenu(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  public onLayoutSelect(event: MouseEvent) {
    if (event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      this.builderEmitLayoutSelectEvent();
    }
  }

  public builderEmitLayoutSelectEvent() {
    if (!this.developerTools) {
      return;
    }
    this.developerTools.eventBus.selectLayout(this.docDefPath, 'preview');
    this.selectedPath = this.docDefPath;
  }

  public builderEmitPropSelectEvent() {
    if (!this.developerTools) {
      return;
    }
    this.developerTools.eventBus.selectProp(this.propDocDefPath, 'preview');
    this.selectedPath = this.propDocDefPath;
  }

  public builderEmitLayoutDeleteEvent() {
    if (!this.developerTools) {
      return;
    }
    this.developerTools.eventBus.remove(this.uuid);
  }

  debugLog(x) {
    console.log(x);
  }
}
