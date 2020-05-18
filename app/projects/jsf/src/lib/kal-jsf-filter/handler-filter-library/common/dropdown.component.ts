import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { JsfBuilder, JsfPropBuilderString }                                        from '@kalmia/jsf-common-es2015';
import { AbstractFilterPropComponent }                                             from '../../abstract/filter-prop.component';
import { FilterItemInterface }                                                     from '../../filter-item.interface';


@Component({
  selector       : 'jsf-filter-handler-common-dropdown',
  template       : `
    <div class="handler jsf-filter-handler-common-dropdown">
      <mat-form-field appearance="outline" color="primary">
        <mat-label *ngIf="filterItem.title">{{ i18n(filterItem.title) }}</mat-label>
        <mat-select [(value)]="value" multiple>
          <mat-option *ngFor="let x of items" [value]="x.value">{{ i18n(x.label) }}</mat-option>
        </mat-select>
      </mat-form-field>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})

export class FilterHandlerCommonDropdownComponent extends AbstractFilterPropComponent<JsfPropBuilderString> implements OnInit {

  @Input()
  filterItem: FilterItemInterface;

  @Input()
  public jsfBuilder: JsfBuilder;

  @Output() queryChange = new EventEmitter<any>();

  get items(): { value: string, label: string }[] {
    return (this.filterItem.jsfProp.prop.handler as any).values;
  }

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
