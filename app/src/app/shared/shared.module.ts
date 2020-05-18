import { NgModule }                                                                                         from '@angular/core';
import { CommonModule }                                                                                     from '@angular/common';
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDividerModule,
  MatIconModule,
  MatMenuModule,
  MatToolbarModule,
} from '@angular/material';
import { FormsModule, ReactiveFormsModule }                                                                 from '@angular/forms';

@NgModule({
  imports     : [
    CommonModule,
  ],
  exports     : [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatCardModule,
    MatDividerModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  declarations: [],
})
export class SharedModule {}
