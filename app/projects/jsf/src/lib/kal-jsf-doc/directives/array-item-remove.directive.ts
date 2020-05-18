import { Directive, EventEmitter, Input, Output } from '@angular/core';

@Directive({
  selector: '[jsfArrayItemRemove]'
})
export class ArrayItemRemoveDirective {

  @Output()
  public jsfArrayItemRemove: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  /**
   * Call this method to trigger the removal of the array item.
   */
  public remove(): void {
    this.jsfArrayItemRemove.next();
  }

}
