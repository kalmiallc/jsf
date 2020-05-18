import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Input, OnInit, Optional } from '@angular/core';
import { AbstractPropLayoutComponent }                                                                  from '../abstract/prop-layout.component';
import {
  JsfAbstractLayoutBuilder,
  JsfLayoutPropTablePreferences,
  JsfPropBuilderArray,
  JsfTablePropLayoutBuilder, JsfUnknownLayout
} from '@kalmia/jsf-common-es2015';
import {
  Breakpoint,
  JsfResponsiveService
}                                                                                                       from '../services/responsive.service';
import { ShowValidationMessagesDirective }                                                              from '../directives/show-validation-messages.directive';
import { takeUntil }                                                                                    from 'rxjs/operators';
import { BuilderDeveloperToolsInterface }                                                               from '../builder-developer-tools.interface';

@Component({
  selector       : 'jsf-prop-table',
  template       : `
      <div class="jsf-prop jsf-prop-table" [ngClass]="htmlClass">
          <table mat-table [dataSource]="items" [trackBy]="trackByFnRows" [style.table-layout]="tableLayoutStyle">
              <ng-container *ngFor="let header of headers; let i = index; trackBy: trackByFnHeaders" [matColumnDef]="header.id">

                  <th mat-header-cell
                      *matHeaderCellDef
                      [style.width]="getHeaderWidth(header.layout.id)">
                      <jsf-layout-router [layoutBuilder]="header" [developerTools]="developerTools"></jsf-layout-router>
                  </th>

                  <td mat-cell *matCellDef="let itemColumn; let rowIndex = index"
                      (jsfArrayItemRemove)="remove(rowIndex)">
                      <jsf-layout-router [layoutBuilder]="itemColumn[i]" [developerTools]="developerTools"></jsf-layout-router>
                  </td>
              </ng-container>

              <tr mat-header-row
                  *matHeaderRowDef="headersPropIds">
              </tr>

              <tr mat-row
                  *matRowDef="let row; let i = index; columns: headersPropIds;"
                  (click)="rowClick(i)">
              </tr>

          </table>
      </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : [
      `
          .mat-table {
              width: 100%;
          }
    `]
})
export class PropTableComponent extends AbstractPropLayoutComponent<JsfPropBuilderArray> implements OnInit {

  @Input()
  layoutBuilder: JsfTablePropLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  private _items: any   = [];
  private _headers: any = [];
  private _headersPropIds: any = [];

  private headerWidths = {};

  get tableLayoutStyle() {
    return !!Object.keys(this.themePreferences.columnWidthBreakpoints).length ? 'fixed' : 'auto';
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.updateHeaderWidths();
    this.updateHeaders();
    this.detectChanges();
  }

  get items() {
    return this._items;
  }

  get headers() {
    return this._headers;
  }

  get headersPropIds() {
    return this._headersPropIds;
  }

  get filteredItems() {
    return (this.layoutBuilder.items || []).map(columns =>
      columns.filter((column, idx) => this.isHeaderVisible(this.layoutBuilder.headers[idx].layout.id))
    );
  }

  constructor(private responsiveService: JsfResponsiveService,
              protected cdRef: ChangeDetectorRef,
              @Optional() protected showValidation: ShowValidationMessagesDirective) {
    super(cdRef, showValidation);
  }

  ngOnInit() {
    // Override subscription logic - listen only for add, remove or set of array values.
    this.propBuilder.onItemsSet
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.detectChanges();
      });

    this.propBuilder.onItemAdd
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.detectChanges();
      });

    this.propBuilder.onItemRemove
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.detectChanges();
      });

    this.showValidation.state$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.detectChanges();
      });

    // Update state immediately
    this.updateHeaderWidths();
    this.updateHeaders();
    this.detectChanges();
  }

  // Override
  protected detectChanges(): void {
    this.updateItems();
    super.detectChanges();
  }

  updateItems() {
    this._items = this.filteredItems;
  }

  updateHeaders() {
    this._headers = this.layoutBuilder.headers.filter(x => this.isHeaderVisible(x.layout.id));
    this._headersPropIds = this.headers.map(x => x.id);
  }

  isHeaderVisible(headerId: string): boolean {
    return headerId ? this.getHeaderWidth(headerId) !== null : true;
  }

  getHeaderWidth(headerId: string) {
    if (!headerId) {
      return null;
    }

    return this.headerWidths[headerId];
  }

  private updateHeaderWidths() {
    const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl']; // In ascending order...

    this.headerWidths = {};

    for (const breakpoint of breakpoints.reverse()) {
      const breakpointMatched = this.responsiveService.isBreakpointMatched(breakpoint);

      const breakpointPreferences = this.themePreferences.columnWidthBreakpoints[breakpoint];
      if (breakpointPreferences) {
        for (const columnName of Object.keys(breakpointPreferences)) {
          if (breakpointMatched && !this.headerWidths[columnName]) {
            this.headerWidths[columnName] = breakpointPreferences[columnName];
          }
        }
      }
    }
  }

  async rowClick(idx: number) {
    return this.handleLayoutClick(this.propBuilder.getValue()[idx]);
  }


  async remove(itemIndex: number) {
    return this.layoutBuilder.propBuilder.removeAt(itemIndex);
  }

  trackByFnHeaders(index, item: JsfAbstractLayoutBuilder<JsfUnknownLayout>) {
    return item.id;
  }

  trackByFnRows(index, item: JsfAbstractLayoutBuilder<JsfUnknownLayout>[]) {
    return item.map(x => x.id).join('@');
  }

  get themePreferences(): JsfLayoutPropTablePreferences {
    return {
      /* Defaults */
      columnWidthBreakpoints: {},

      /* Global overrides */
      ...(this.globalThemePreferences ? this.globalThemePreferences.table : {}),

      /* Layout overrides */
      ...(this.localThemePreferences || {})
    } as JsfLayoutPropTablePreferences;
  }
}
