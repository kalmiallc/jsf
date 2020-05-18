import { Directive, HostListener, OnInit, Self, Input } from '@angular/core';
import { NgControl }                                    from '@angular/forms';
import { DecimalPipe }                                  from '@angular/common';

@Directive({
  selector : '[jsfNumberInputAutoCorrect]',
  providers: [DecimalPipe]
})
export class NumberInputAutocorrectDirective implements OnInit {

  constructor(
    @Self() public ngControl: NgControl) {}

  @HostListener('blur') onBlur() {
    // Caution: The following will NOT set the `dirty` flag on the abstract control.
    // You should do this manually elsewhere if required!

    // Used to correct / remove leading 0 from numbers
    this.ngControl.control.setValue(this.ngControl.value);
  }

  ngOnInit() {}

}
