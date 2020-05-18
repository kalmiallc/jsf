import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { JsfBuilder, JsfPropBuilderObject }                                        from '@kalmia/jsf-common-es2015';
import { AbstractFilterPropComponent }                                             from '../abstract/filter-prop.component';
import { FilterItemInterface }                                                     from '../filter-item.interface';


@Component({
  selector       : 'jsf-filter-prop-object',
  template       : `
    <div class="jsf-filter-prop jsf-filter-prop-object">

    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class FilterPropObjectComponent extends AbstractFilterPropComponent<JsfPropBuilderObject> implements OnInit {

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
