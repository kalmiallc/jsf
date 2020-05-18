import { NgModule }                     from '@angular/core';
import { CommonModule }                 from '@angular/common';
import { KalJsfBuilderComponent }       from './kal-jsf-builder.component';
import { JsfBuilderNavigatorComponent } from './jsf-builder-navigator/jsf-builder-navigator.component';
import { JsfBuilderInspectorComponent } from './jsf-builder-inspector/jsf-builder-inspector.component';
import { MatTreeModule }                from '@angular/material/tree';
import { LayoutNamePipe }               from './pipes/layoutName.pipe';
import { AngularSplitModule }           from 'angular-split';
import { JsfModule }                    from '../jsf.module';
import {
  MatButtonModule,
  MatButtonToggleModule,
  MatCheckboxModule,
  MatIconModule,
  MatTooltipModule,
  MatMenuModule
}                                       from '@angular/material';
import { MonacoEditorModule }           from 'ngx-monaco-editor';
import { FormsModule }                  from '@angular/forms';
import { TreeModule }                   from 'angular-tree-component';
import { BuilderSharedModule }          from './shared/builder-shared.module';

@NgModule({
  imports     : [
    CommonModule,
    JsfModule,
    AngularSplitModule,
    MatTreeModule,
    TreeModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatIconModule,
    MatTooltipModule,
    MonacoEditorModule,
    FormsModule,
    BuilderSharedModule
  ],
  declarations: [
    KalJsfBuilderComponent,
    JsfBuilderInspectorComponent,
    JsfBuilderNavigatorComponent,
    LayoutNamePipe
  ],
  exports     : [
    KalJsfBuilderComponent
  ]
})
export class KalJsfBuilderModule {}
