import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { JsfBuilder, JsfPropBuilderId }                                            from '@kalmia/jsf-common-es2015';
import { AbstractFilterPropComponent }                                             from '../abstract/filter-prop.component';
import { FilterItemInterface }                                                     from '../filter-item.interface';


@Component({
  selector       : 'jsf-filter-prop-id',
  template       : `
    <div class="jsf-filter-prop jsf-filter-prop-id">
      <mat-form-field  appearance="outline" color="primary">
        <mat-label *ngIf="filterItem.title">{{ i18n(filterItem.title) }}</mat-label>
        <input matInput [(ngModel)]="value">
      </mat-form-field>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class FilterPropIdComponent extends AbstractFilterPropComponent<JsfPropBuilderId> implements OnInit {

  @Input()
  filterItem: FilterItemInterface;

  @Input()
  public jsfBuilder: JsfBuilder;

  @Output() queryChange = new EventEmitter<any>();

  set value(x: any) {
    this.filterItem.value = {
      type : 'id',
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
