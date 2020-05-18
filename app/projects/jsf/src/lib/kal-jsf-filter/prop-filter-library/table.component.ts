import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { JsfBuilder, JsfPropBuilderArray }                                         from '@kalmia/jsf-common-es2015';
import { FilterItemInterface }                                                     from '../filter-item.interface';
import { AbstractFilterPropComponent }                                             from '../abstract/filter-prop.component';

@Component({
  selector       : 'jsf-filter-prop-table',
  template       : `
    <div class="jsf-filter-prop jsf-filter-prop-table">

    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class FilterPropTableComponent extends AbstractFilterPropComponent<JsfPropBuilderArray> implements OnInit {

  @Input()
  filterItem: FilterItemInterface;

  @Input()
  public jsfBuilder: JsfBuilder;

  @Output() queryChange = new EventEmitter<any>();

  set value(x: any) {
    this.filterItem.value = x;
    this.queryChange.emit(this.filterItem.value);
  }

  get value(): any {
    return this.filterItem.value;
  }

  constructor() {
    super();
  }

  ngOnInit() {
  }
}
