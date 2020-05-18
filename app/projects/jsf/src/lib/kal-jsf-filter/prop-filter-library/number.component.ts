import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { JsfBuilder, JsfPropBuilderNumber }                                        from '@kalmia/jsf-common-es2015';
import { AbstractFilterPropComponent }                                             from '../abstract/filter-prop.component';
import { FilterItemInterface }                                                     from '../filter-item.interface';


@Component({
  selector       : 'jsf-filter-prop-number',
  template       : `
    <div class="jsf-filter-prop jsf-filter-prop-number">
      <mat-form-field  appearance="outline" color="primary">
        <mat-label *ngIf="filterItem.title">{{ i18n(filterItem.title) }}</mat-label>
        <input type="number" matInput [(ngModel)]="value">
      </mat-form-field>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class FilterPropNumberComponent extends AbstractFilterPropComponent<JsfPropBuilderNumber> implements OnInit {

  @Input()
  filterItem: FilterItemInterface;

  @Input()
  public jsfBuilder: JsfBuilder;

  @Output() queryChange = new EventEmitter<any>();

  set value(x: any) {
    this.filterItem.value = {
      type : 'number',
      value: x
    };
    this.queryChange.emit(this.filterItem.value);
  }

  get value(): any {
    return this.filterItem.value && this.filterItem.value.value;
  }


  constructor() {
    super();
  }

  ngOnInit() {
  }

}
