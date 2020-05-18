import { NgModule }            from '@angular/core';
import { CommonModule }        from '@angular/common';
import { KalJsfBuilderModule } from './kal-jsf-builder/kal-jsf-builder.module';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    KalJsfBuilderModule
  ]
})
export class JsfBuilderModule {}
