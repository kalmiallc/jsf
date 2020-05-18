import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, Optional }              from '@angular/core';
import { AbstractPropLayoutComponent }                                                                 from '../abstract/prop-layout.component';
import { JsfAbstractLayout, JsfAbstractLayoutBuilder, JsfArrayPropLayoutBuilder, JsfPropBuilderArray } from '@kalmia/jsf-common-es2015';
import { ShowValidationMessagesDirective }                                                             from '../directives/show-validation-messages.directive';
import { takeUntil }                                                                                   from 'rxjs/operators';
import { BuilderDeveloperToolsInterface }                                                              from '../builder-developer-tools.interface';


@Component({
  selector       : 'jsf-prop-array',
  template       : `
      <div class="jsf-prop jsf-prop-array" (click)="handleLayoutClick($event)" [ngClass]="htmlClass">
          <ng-container *ngFor="let itemLayouts of items; let i = index">
              <jsf-prop-array-item [layoutBuilder]="layoutBuilder"
                                   [developerTools]="developerTools"
                                   [index]="i"
                                   [itemLayouts]="itemLayouts"
                                   (jsfArrayItemRemove)="removeAt(i)">
              </jsf-prop-array-item>
          </ng-container>
      </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class PropArrayComponent extends AbstractPropLayoutComponent<JsfPropBuilderArray> implements OnInit {

  @Input()
  layoutBuilder: JsfArrayPropLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  get items(): JsfAbstractLayoutBuilder<JsfAbstractLayout>[][] {
    return this.layoutBuilder.items || [];
  }

  get isFixedItems() {
    return this.propBuilder.isFixedItems;
  }

  constructor(protected cdRef: ChangeDetectorRef,
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
  }

  async add() {
    return this.propBuilder.add();
  }

  async removeAt(index: number) {
    return this.propBuilder.removeAt(index);
  }
}


@Component({
  selector       : 'jsf-prop-array-item',
  template       : `
      <jsf-layout-router *ngFor="let itemLayout of itemLayouts; let i = index"
                         class="jsf-prop-array-item"
                         [layoutBuilder]="itemLayout"
                         [developerTools]="developerTools">
      </jsf-layout-router>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class PropArrayItemComponent implements OnInit {

  /**
   * This is the layout builder for the array.
   */
  @Input()
  layoutBuilder: JsfArrayPropLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  @Input()
  index: number;

  @Input()
  itemLayouts: JsfAbstractLayoutBuilder<JsfAbstractLayout>[];

  ngOnInit() {
  }

  async remove() {
    return this.layoutBuilder.propBuilder.removeAt(this.index);
  }
}

