import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { JsfBuilder, JsfPropBuilderArray }                                         from '@kalmia/jsf-common-es2015';
import { AbstractFilterPropComponent }                                             from '../abstract/filter-prop.component';
import { FilterItemInterface }                                                     from '../filter-item.interface';


@Component({
  selector       : 'jsf-filter-prop-array',
  template       : `
    <div class="jsf-filter-prop jsf-filter-prop-array">

    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class FilterPropArrayComponent extends AbstractFilterPropComponent<JsfPropBuilderArray> implements OnInit {

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

  ngOnInit() {
  }
}
