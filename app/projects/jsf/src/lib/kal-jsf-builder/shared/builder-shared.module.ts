import { NgModule }                     from '@angular/core';
import { CommonModule }                 from '@angular/common';
import { AngularSplitModule }           from 'angular-split';
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

import { DynamicContextMenuComponent } from './dynamic-context-menu/dynamic-context-menu.component';
import { DynamicContextMenuItemComponent } from './dynamic-context-menu/dynamic-context-menu-item/dynamic-context-menu-item.component';

@NgModule({
  imports     : [
    CommonModule,
    AngularSplitModule,
    TreeModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatIconModule,
    MatTooltipModule,
    MonacoEditorModule
  ],
  declarations: [
    DynamicContextMenuComponent,
    DynamicContextMenuItemComponent
  ],
  exports     : [
    DynamicContextMenuComponent,
    DynamicContextMenuItemComponent
  ]
})
export class BuilderSharedModule {}
