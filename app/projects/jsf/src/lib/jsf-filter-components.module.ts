import { NgModule }     from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { SharedModule } from './kal-jsf-doc/shared/shared.module';

import { FilterPropStringComponent }            from './kal-jsf-filter/prop-filter-library/string.component';
import { FilterPropArrayComponent }             from './kal-jsf-filter/prop-filter-library/array.component';
import { FilterPropNumberComponent }            from './kal-jsf-filter/prop-filter-library/number.component';
import { FilterPropBinaryComponent }            from './kal-jsf-filter/prop-filter-library/binary.component';
import { FilterPropBooleanComponent }           from './kal-jsf-filter/prop-filter-library/boolean.component';
import { FilterPropDateComponent }              from './kal-jsf-filter/prop-filter-library/date.component';
import { FilterPropIdComponent }                from './kal-jsf-filter/prop-filter-library/id.component';
import { FilterPropIntegerComponent }           from './kal-jsf-filter/prop-filter-library/integer.component';
import { FilterPropObjectComponent }            from './kal-jsf-filter/prop-filter-library/object.component';
import { FilterPropRefComponent }               from './kal-jsf-filter/prop-filter-library/ref.component';
import { FilterPropTableComponent }             from './kal-jsf-filter/prop-filter-library/table.component';
import { FilterHandlerCommonDropdownComponent } from './kal-jsf-filter/handler-filter-library/common/dropdown.component';
import { FilterHandlerCommonRadioComponent }    from './kal-jsf-filter/handler-filter-library/common/radio.component';
import { FilterHandlerCommonButtonToggleComponent } from './kal-jsf-filter/handler-filter-library/common/button-toggle.component';

@NgModule({
  imports     : [
    CommonModule,
    SharedModule,
    FormsModule
  ],
  declarations: [
    FilterPropStringComponent,
    FilterPropNumberComponent,
    FilterPropArrayComponent,
    FilterPropBinaryComponent,
    FilterPropBooleanComponent,
    FilterPropDateComponent,
    FilterPropIdComponent,
    FilterPropIntegerComponent,
    FilterPropObjectComponent,
    FilterPropRefComponent,
    FilterPropTableComponent,

    FilterHandlerCommonDropdownComponent,
    FilterHandlerCommonButtonToggleComponent,
    FilterHandlerCommonRadioComponent
  ],
  exports     : [
    FilterPropStringComponent,
    FilterPropNumberComponent,
    FilterPropArrayComponent,
    FilterPropBinaryComponent,
    FilterPropBooleanComponent,
    FilterPropDateComponent,
    FilterPropIdComponent,
    FilterPropIntegerComponent,
    FilterPropObjectComponent,
    FilterPropRefComponent,
    FilterPropTableComponent,

    FilterHandlerCommonDropdownComponent,
    FilterHandlerCommonButtonToggleComponent,
    FilterHandlerCommonRadioComponent
  ]
})
export class JsfFilterComponentsModule {}
