import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { JsfBuilder, JsfPropBuilderString }                                        from '@kalmia/jsf-common-es2015';
import { AbstractFilterPropComponent }                                             from '../abstract/filter-prop.component';
import { FilterItemInterface }                                                     from '../filter-item.interface';


@Component({
  selector       : 'jsf-filter-prop-string',
  template       : `
    <div class="jsf-filter-prop jsf-filter-prop-string">
      <mat-form-field appearance="outline" color="primary">
        <mat-label *ngIf="filterItem.title">{{ i18n(filterItem.title) }}</mat-label>
        <input matInput [(ngModel)]="value">
      </mat-form-field>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})

export class FilterPropStringComponent extends AbstractFilterPropComponent<JsfPropBuilderString> implements OnInit {

  @Input()
  filterItem: FilterItemInterface;

  @Input()
  public jsfBuilder: JsfBuilder;

  @Output() queryChange = new EventEmitter<any>();

  set value(x: any) {
    this.filterItem.value = {
      type : 'string',
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
