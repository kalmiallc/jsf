import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { AbstractPropLayoutComponent }                                                               from '../abstract/prop-layout.component';
import {
  JsfAbstractLayout,
  JsfAbstractLayoutBuilder,
  JsfExpansionPanelPropLayoutBuilder,
  JsfLayoutPropExpansionPanel,
  JsfLayoutPropExpansionPanelPreferences,
  JsfPropBuilderArray
}                                                                                                    from '@kalmia/jsf-common-es2015';
import { ShowValidationMessagesDirective }                                                           from '../directives/show-validation-messages.directive';
import { takeUntil }                                                                                 from 'rxjs/operators';
import { BuilderDeveloperToolsInterface }                                                            from '../builder-developer-tools.interface';

@Component({
  selector       : 'jsf-prop-expansion-panel',
  template       : `
      <div class="jsf-prop jsf-prop-expansion-panel" [ngClass]="htmlClass">
          <mat-accordion [multi]="multi">
              <mat-expansion-panel *ngFor="let layoutBuilders of items; let first = first; let last = last; let i = index;"
                                   [class.expansion-panel-invalid]="isExpansionPanelErrorStateVisible(layoutBuilders) && !isExpansionPanelDisabled(layoutBuilders)"
                                   #jsfShowValidationMessages="jsfShowValidationMessages"
                                   [jsfShowValidationMessages]="isExpansionPanelErrorStateVisible(layoutBuilders)"
                                   [expanded]="step === i"
                                   [disabled]="isExpansionPanelDisabled(layoutBuilders)"
                                   (opened)="panelOpened(i)"
                                   (closed)="panelClosed(i)"
                                   (afterCollapse)="panelCollapsed(i)"
                                   (jsfArrayItemRemove)="remove(i)">
                  <mat-expansion-panel-header>
                      <mat-panel-title *ngIf="getHeaderLayoutBuilder(layoutBuilders)">
                          <jsf-layout-router [layoutBuilder]="getHeaderLayoutBuilder(layoutBuilders)"
                                             [developerTools]="developerTools">
                          </jsf-layout-router>
                      </mat-panel-title>
                  </mat-expansion-panel-header>

                  <div class="expansion-panel-content" *ngIf="isPanelContentVisible(i)">
                      <jsf-layout-router [layoutBuilder]="getContentLayoutBuilder(layoutBuilders)"
                                         [developerTools]="developerTools">
                      </jsf-layout-router>
                  </div>

                  <mat-action-row *ngIf="!multi && !(first && last)">
                      <button type="button" mat-icon-button color="primary" (click)="prevStep()" *ngIf="!first">
                          <mat-icon>navigate_before</mat-icon>
                      </button>
                      <button type="button" mat-icon-button color="primary" (click)="nextStep()" *ngIf="!last">
                          <mat-icon>navigate_next</mat-icon>
                      </button>
                  </mat-action-row>
              </mat-expansion-panel>
          </mat-accordion>
      </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class PropExpansionPanelComponent extends AbstractPropLayoutComponent<JsfPropBuilderArray> implements OnInit, OnDestroy {
  private expansionPanelPropsWithVisibleErrorState = [];

  @Input()
  layoutBuilder: JsfExpansionPanelPropLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  private _panelOnIndexOpen = {};

  private _step = 0;
  get step(): number {
    return this._step;
  }

  set step(value: number) {
    this._step = value;
  }

  get items() {
    return this.layoutBuilder.items;
  }

  get multi() {
    return (this.layout as JsfLayoutPropExpansionPanel).multi;
  }

  get forceValidationMessagesVisible(): boolean {
    return this.showValidation && this.showValidation.state;
  }

  constructor(protected cdRef: ChangeDetectorRef,
              @Optional() protected showValidation: ShowValidationMessagesDirective) {
    super(cdRef, showValidation);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.registerLayoutComponent();

    this.layoutBuilder.propBuilder.onItemAdd
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(x => {
        if (this.cdRef) {
          this.step = x.index; // Show the newly-added item.
          this.cdRef.detectChanges();
        }
      });

    this.layoutBuilder.propBuilder.onItemRemove
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(x => {
        if (this.cdRef) {
          const totalItems = this.value.length; // This here will already contain the new amount of items.
          if (x.index >= totalItems) {
            this.step = totalItems - 1;
          }
          this.cdRef.detectChanges();
        }
      });

    this.layoutBuilder.propBuilder.onItemsSet
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(x => {
        if (this.cdRef) {
          this.cdRef.detectChanges();
        }
      });


    this.showValidation.state$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(x => {
        if (this.cdRef) {
          this.detectChanges();
        }
      });
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();

    this.unregisterLayoutComponent();
  }

  panelOpened(index: number) {
    this.setStep(index);
    this.setLayoutState('activePanelIndex', index);
    this._panelOnIndexOpen[index] = true;
  }

  panelClosed(index: number) {
    this.setExpansionPanelErrorStateVisible(index);
    if (this.getLayoutState('activePanelIndex') === index) {
      this.setLayoutState('activePanelIndex', void 0);
    }
  }

  panelCollapsed(index: number) {
    this._panelOnIndexOpen[index] = false;
  }

  isPanelContentVisible(index: number) {
    return !!this._panelOnIndexOpen[index] || this.step === index;
  }

  protected detectChanges(): void {
    this._panelOnIndexOpen = {};
    super.detectChanges();
  }

  setStep(index: number) {
    this.step = index;
    this.cdRef.detectChanges();
  }

  setExpansionPanelErrorStateVisible(stepIndex: number) {
    const header    = this.getHeaderLayoutBuilder(this.items[stepIndex]);
    const arrayItem = header.getPropItem(this.propBuilder.abstractPath);

    if (this.expansionPanelPropsWithVisibleErrorState.indexOf(arrayItem) === -1) {
      this.expansionPanelPropsWithVisibleErrorState.push(arrayItem);
    }

    this.cdRef.detectChanges();
  }

  nextStep() {
    let newStep = this.step;

    while (true) {
      newStep++;

      if (newStep > this.items.length - 1) {
        break;
      }

      const header    = this.getHeaderLayoutBuilder(this.items[newStep]);
      const arrayItem = header.getPropItem(this.propBuilder.abstractPath);

      if (!arrayItem.disabled) {
        this.step = newStep;
        break;
      }
    }
  }

  prevStep() {
    let newStep = this.step;

    while (true) {
      newStep--;

      if (newStep < 0) {
        break;
      }

      const header    = this.getHeaderLayoutBuilder(this.items[newStep]);
      const arrayItem = header.getPropItem(this.propBuilder.abstractPath);

      if (!arrayItem.disabled) {
        this.step = newStep;
        break;
      }
    }
  }

  getHeaderLayoutBuilder(layoutBuilders: JsfAbstractLayoutBuilder<JsfAbstractLayout>[]) {
    return layoutBuilders.find(x => x.type === 'expansion-panel-header');
  }

  getContentLayoutBuilder(layoutBuilders: JsfAbstractLayoutBuilder<JsfAbstractLayout>[]) {
    return layoutBuilders.find(x => x.type === 'expansion-panel-content');
  }

  isExpansionPanelErrorStateVisible(layoutBuilders: JsfAbstractLayoutBuilder<JsfAbstractLayout>[]) {
    const header    = this.getHeaderLayoutBuilder(layoutBuilders);
    const arrayItem = header.getPropItem(this.propBuilder.abstractPath);

    return !arrayItem.legit &&
      (this.forceValidationMessagesVisible || this.expansionPanelPropsWithVisibleErrorState.indexOf(arrayItem) > -1);
  }

  isExpansionPanelDisabled(layoutBuilders: JsfAbstractLayoutBuilder<JsfAbstractLayout>[]) {
    const header    = this.getHeaderLayoutBuilder(layoutBuilders);
    const arrayItem = header.getPropItem(this.propBuilder.abstractPath);

    return arrayItem.disabled;
  }

  async remove(itemIndex: number) {
    return this.layoutBuilder.propBuilder.removeAt(itemIndex);
  }

  get themePreferences(): JsfLayoutPropExpansionPanelPreferences {
    return {
      /* Defaults */

      /* Global overrides */
      ...(this.globalThemePreferences ? this.globalThemePreferences.expansionPanel : {}),

      /* Layout overrides */
      ...(this.localThemePreferences || {})
    } as JsfLayoutPropExpansionPanelPreferences;
  }
}
