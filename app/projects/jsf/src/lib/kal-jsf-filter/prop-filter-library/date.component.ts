import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { JsfBuilder, JsfPropBuilderDate }                                          from '@kalmia/jsf-common-es2015';
import { AbstractFilterPropComponent }                                             from '../abstract/filter-prop.component';
import { FilterItemInterface }                                                     from '../filter-item.interface';

@Component({
  selector       : 'jsf-filter-prop-date',
  template       : `
    <div class="jsf-filter-prop jsf-filter-prop-date">
      <div class="d-flex">
        <mat-form-field appearance="outline" color="primary">
          <mat-label>{{ i18n(messages.from) }}</mat-label>
          <input matInput
                 [(ngModel)]="valueFrom"
                 [matDatepicker]="pickerFrom"
                 [max]="valueTo">
          <mat-datepicker-toggle matSuffix [for]="pickerFrom"></mat-datepicker-toggle>
          <mat-datepicker #pickerFrom></mat-datepicker>
        </mat-form-field>

        <mat-form-field class="ml-1" appearance="outline" color="primary">
          <mat-label>{{ i18n(messages.to) }}</mat-label>
          <input matInput
                 [(ngModel)]="valueTo"
                 [matDatepicker]="pickerTo"
                 [min]="valueFrom">
          <mat-datepicker-toggle matSuffix [for]="pickerTo"></mat-datepicker-toggle>
          <mat-datepicker #pickerTo></mat-datepicker>
        </mat-form-field>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : [],
})
export class FilterPropDateComponent extends AbstractFilterPropComponent<JsfPropBuilderDate> implements OnInit {

  @Input()
  filterItem: FilterItemInterface;

  @Input()
  public jsfBuilder: JsfBuilder;

  @Output() queryChange = new EventEmitter<any>();

  set valueFrom(x: any) {
    this.value = {
      from: x,
      to  : (this.value || {}).to
    };
  }

  get valueFrom(): any {
    return (this.value || {}).from;
  }

  set valueTo(x: any) {
    this.value = {
      from: (this.value || {}).from,
      to  : x
    };
  }

  get valueTo(): any {
    return (this.value || {}).to;
  }


  set value(x: any) {
    this.filterItem.value = {
      type : 'date',
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
