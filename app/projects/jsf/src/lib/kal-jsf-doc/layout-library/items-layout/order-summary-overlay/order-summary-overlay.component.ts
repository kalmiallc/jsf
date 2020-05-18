import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AbstractItemsLayoutComponent }                        from '../../../abstract/items-layout.component';
import { JsfItemsLayoutBuilder, JsfLayoutOrderSummaryOverlay } from '@kalmia/jsf-common-es2015';
import { BreakpointState }                                     from '@angular/cdk/layout';
import { JsfResponsiveService }                                from '../../../services/responsive.service';
import { BuilderDeveloperToolsInterface }                      from '../../../builder-developer-tools.interface';
import { takeUntil }                                           from 'rxjs/operators';

@Component({
  selector       : 'jsf-layout-order-summary-overlay',
  template       : `
    <div class="jsf-layout-order-summary-overlay"
         [id]="id"
         [ngClass]="getLayoutInnerClass()"
         [ngStyle]="getLayoutInnerStyle()"
         [class.mode-float]="isFloatMode"
         [class.mode-static]="!isFloatMode"
         (click)="handleLayoutClick($event)">
      <div class="order-summary-overlay-container-spacer">
        <div class="order-summary-overlay-inner-spacer">
          <div class="overlay-row row no-gutters justify-content-{{ horizontalAlign }}">
            <div class="overlay-col" [ngClass]="columnClasses">
              <div class="overlay-content" [ngClass]="{'overlay-content-full-height': this.isFullHeight }">
                <jsf-layout-router *ngFor="let item of layoutBuilder.items"
                                   [layoutBuilder]="item"
                                   [developerTools]="developerTools"
                                   [ngClass]="getLayoutItemClass(item)"
                                   [ngStyle]="getLayoutItemStyle(item)">
                </jsf-layout-router>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class LayoutOrderSummaryOverlayComponent extends AbstractItemsLayoutComponent<JsfLayoutOrderSummaryOverlay> implements OnInit {

  @Input()
  layoutBuilder: JsfItemsLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  isFloatMode = true;

  constructor(private responsiveService: JsfResponsiveService,
              private cdRef: ChangeDetectorRef) {
    super();
  }

  get floatModeChangeBreakpoint() {
    return this.layout.floatModeChangeBreakpoint || 'lg';
  }

  get horizontalAlign() {
    return this.isFloatMode ? (this.layout.floatHorizontalAlign || 'end') : (this.layout.staticHorizontalAlign || 'center');
  }

  get isFullHeight() {
    return this.layout.fullHeight;
  }

  get columnClasses() {
    const classNames = [];
    if (!this.layout.columnSize) {
      classNames.push('col-12');
      classNames.push('col-sm-10');
      classNames.push('col-md-8');
      classNames.push('col-lg-4');
      classNames.push('col-xl-4');
    } else {
      let anySizeSpecified = false;
      for (const breakpoint of Object.keys(this.responsiveService.breakpoints)) {
        const value = this.layout.columnSize[breakpoint];
        if (value) {
          switch (value) {
            case 'auto':
              classNames.push(`col${ infix(breakpoint) }`);
              anySizeSpecified = true;
              break;
            case 'content':
              classNames.push(`col${ infix(breakpoint) }-auto`);
              anySizeSpecified = true;
              break;
            default:
              classNames.push(`col${ infix(breakpoint) }-${ value }`);
              anySizeSpecified = true;
              break;
          }
        }
      }
      // Add a default `col` class is no size was specified
      if (!anySizeSpecified) {
        classNames.push(`col`);
      }
    }

    return classNames;
  }

  ngOnInit() {
    this.responsiveService.matchMediaBreakpointUp(this.floatModeChangeBreakpoint)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((state: BreakpointState) => {
        this.isFloatMode = state.matches;
        this.cdRef.markForCheck();
      });
  }
}

function infix(breakpoint: string): string {
  return breakpoint === 'xs' ? '' : `-${ breakpoint }`;
}
