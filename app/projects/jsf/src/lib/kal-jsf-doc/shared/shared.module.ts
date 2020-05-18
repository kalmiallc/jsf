import { NgModule }         from '@angular/core';
import {
  MatButtonModule,
  MatButtonToggleModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatMenuModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatTooltipModule
}                                  from '@angular/material';
import { CommonModule }            from '@angular/common';
import { ScrollingModule }         from '@angular/cdk/scrolling';
import { MomentDateModule }        from '@angular/material-moment-adapter';
import { MatToolbarModule }        from '@angular/material/toolbar';
import { OverlayscrollbarsModule } from 'overlayscrollbars-ngx';

@NgModule({
  imports     : [
    CommonModule
  ],
  declarations: [],
  exports     : [
    MomentDateModule,

    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSliderModule,
    MatStepperModule,
    MatTabsModule,
    MatTooltipModule,
    MatTableModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatDialogModule,
    MatToolbarModule,

    ScrollingModule,
    OverlayscrollbarsModule
  ]
})
export class SharedModule {}
