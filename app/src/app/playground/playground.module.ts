import { NgModule }                from '@angular/core';
import { CommonModule }            from '@angular/common';
import { PlaygroundComponent }     from './playground.component';
import { PlaygroundRoutingModule } from './playground-routing.module';
import { JsfModule }               from '@kalmia/jsf-app';
import { SharedModule }            from '../shared/shared.module';
import { MonacoEditorModule }      from 'ngx-monaco-editor';

@NgModule({
  imports     : [
    CommonModule,
    PlaygroundRoutingModule,
    SharedModule,
    MonacoEditorModule,
    JsfModule
  ],
  declarations: [
    PlaygroundComponent,
  ],
  exports     : [
    PlaygroundComponent,
  ],
})
export class PlaygroundModule {}
