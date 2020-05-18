import { NgModule }             from '@angular/core';
import { CommonModule }         from '@angular/common';
import { FormOutletComponent }  from './form-outlet.component';
import { BaseThemeComponent }   from './base-theme.component';
import { JsfComponentsModule }  from '../../jsf-components.module';
import { FormsModule }          from '@angular/forms';
import { ThemeOutletComponent } from './theme-outlet.component';
import { RouterModule }         from '@angular/router';
import { SharedModule }         from '../shared/shared.module';

@NgModule({
  imports        : [
    CommonModule,
    SharedModule,
    FormsModule,
    RouterModule,
    JsfComponentsModule
  ],
  declarations   : [
    FormOutletComponent,
    ThemeOutletComponent,
    BaseThemeComponent
  ],
  entryComponents: [
    FormOutletComponent,
    ThemeOutletComponent
  ],
  exports        : [
    FormOutletComponent,
    ThemeOutletComponent,
    BaseThemeComponent
  ]
})
export class JsfThemeModule {}
