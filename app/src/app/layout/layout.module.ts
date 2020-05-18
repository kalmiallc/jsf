import { NgModule }                  from '@angular/core';
import { CommonModule }              from '@angular/common';
import { LayoutEmptyComponent }      from './layout-empty/layout-empty.component';
import { LayoutNavigationComponent } from './layout-navigation/layout-navigation.component';
import { RouterModule }              from '@angular/router';
import { SharedModule }              from '../shared/shared.module';

@NgModule({
  imports     : [
    CommonModule,
    RouterModule,
    SharedModule,
  ],
  declarations: [LayoutEmptyComponent, LayoutNavigationComponent],
})
export class LayoutModule {}
