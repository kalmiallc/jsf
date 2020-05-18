import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[jsfHoverClass]'
})
export class HoverClassDirective {

  /**
   * Flag used to keep track of element hover state.
   */
  private _hoverState = false;

  /**
   * List of classes. Can be a string of class names separated by a space, or an array of class names.
   */
  private _classes: string | string[] = '';
  @Input('jsfHoverClass')
  get classes(): string | string[] {
    return this._classes;
  }

  @Input('jsfHoverPropagateFromChildren')
  public propagateFromChildren = true;

  set classes(value: string | string[]) {
    if (this._hoverState) {
      this.removeClasses();
    }
    this._classes = value;
    if (this._hoverState) {
      this.addClasses();
    }
  }

  get classesArray(): string[] {
    return Array.isArray(this._classes) ? this._classes : this._classes.split(' ').filter(x => !!x);
  }

  constructor(private renderer: Renderer2,
              private el: ElementRef) {
  }

  @HostListener('mouseenter') onMouseEnter() {
    if (this.propagateFromChildren) {
      this._hoverState = true;
      this.addClasses();
    }
  }

  @HostListener('mouseleave') onMouseLeave() {
    if (this.propagateFromChildren) {
      this._hoverState = false;
      this.removeClasses();
    }
  }

  @HostListener('mouseover', ['$event']) onMouseOver($event: MouseEvent) {
    if (!this.propagateFromChildren) {
      this._hoverState = true;
      this.addClasses();
      $event.stopPropagation();
    }
  }

  @HostListener('mouseout', ['$event']) onMouseOut($event: MouseEvent) {
    if (!this.propagateFromChildren) {
      this._hoverState = false;
      this.removeClasses();
      $event.stopPropagation();
    }
  }

  private addClasses() {
    for (const x of this.classesArray) {
      this.renderer.addClass(this.el.nativeElement, x);
    }
  }

  private removeClasses() {
    for (const x of this.classesArray) {
      this.renderer.removeClass(this.el.nativeElement, x);
    }
  }

}
