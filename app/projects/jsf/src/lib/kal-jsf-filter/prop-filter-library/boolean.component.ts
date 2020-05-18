import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { JsfBuilder, JsfPropBuilderBoolean }                                       from '@kalmia/jsf-common-es2015';
import { AbstractFilterPropComponent }                                             from '../abstract/filter-prop.component';
import { FilterItemInterface }                                                     from '../filter-item.interface';

@Component({
  selector       : 'jsf-filter-prop-boolean',
  template       : `
    <div class="jsf-filter-prop jsf-filter-prop-boolean">
      <mat-checkbox [(ngModel)]="value">{{ i18n(filterItem.title) }}</mat-checkbox>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class FilterPropBooleanComponent extends AbstractFilterPropComponent<JsfPropBuilderBoolean> implements OnInit {

  @Input()
  filterItem: FilterItemInterface;

  @Input()
  public jsfBuilder: JsfBuilder;

  @Output() queryChange = new EventEmitter<any>();

  set value(x: any) {
    this.filterItem.value = {
      type : 'boolean',
      value: x
    };
    this.queryChange.emit(this.filterItem.value);
  }

  get value(): any {
    return this.filterItem.value && this.filterItem.value.value;
  }

  ngOnInit() {
  }

}
