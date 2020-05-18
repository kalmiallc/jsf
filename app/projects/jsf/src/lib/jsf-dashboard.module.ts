import { NgModule }              from '@angular/core';
import { CommonModule }          from '@angular/common';
import { KalJsfDashboardModule } from './kal-jsf-dashboard/kal-jsf-dashboard.module';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    KalJsfDashboardModule
  ]
})
export class JsfDashboardModule {}
