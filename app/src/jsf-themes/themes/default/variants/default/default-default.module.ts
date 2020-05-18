import { NgModule }                from '@angular/core';
import { CommonModule }            from '@angular/common';
import { DefaultDefaultComponent } from './default-default.component';
import { JsfThemeModule }          from '@kalmia/jsf-app';

@NgModule({
  imports        : [
    CommonModule,
    JsfThemeModule
  ],
  declarations   : [DefaultDefaultComponent],
  entryComponents: [DefaultDefaultComponent],
  exports        : [DefaultDefaultComponent]
})
export class DefaultDefaultModule {

  public static readonly entryComponent = DefaultDefaultComponent;

}
