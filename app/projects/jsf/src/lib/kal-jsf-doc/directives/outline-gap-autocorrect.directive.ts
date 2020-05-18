import { AfterViewInit, Directive, NgZone } from '@angular/core';
import { MatFormField }                     from '@angular/material';

/**
 * This directive updates the Material form field outline gap.
 * Required mostly for Safari.
 *
 * Must be attached to a mat-form-field element!
 */
@Directive({
  selector: '[jsfOutlineGapAutocorrect]'
})
export class OutlineGapAutocorrectDirective implements AfterViewInit {

  constructor(private hostFormField: MatFormField,
              private ngZone: NgZone) {
  }

  ngAfterViewInit() {
    // The following monstrosity is required for some older versions of Safari.
    // For some reason the gap is not calculated correctly and must be manually updated here.
    //
    this.updateOutlineGap();

    // Sometimes, even when we reach this point the gap will still not be correct.
    // So we recalculate it after a small delay.
    setTimeout(() => {
      this.updateOutlineGap();
    }, 2500);

    // At this point, if your gap is still not correct, have fun fixing it :)
  }

  private updateOutlineGap() {
    this.ngZone.run(() => {
      this.hostFormField.updateOutlineGap();
    });
  }
}
