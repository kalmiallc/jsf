import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';
import { JsfModule }                from '../jsf.module';
import { KalJsfDashboardComponent } from './kal-jsf-dashboard.component';
import { GridsterModule }           from 'angular-gridster2';
import { SharedModule }             from '../kal-jsf-doc/shared/shared.module';

@NgModule({
  imports     : [
    CommonModule,
    JsfModule,
    SharedModule,
    GridsterModule
  ],
  declarations: [
    KalJsfDashboardComponent
  ],
  exports     : [
    KalJsfDashboardComponent
  ]
})
export class KalJsfDashboardModule {}
