import { Injectable }                  from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { OverlayScrollbarsComponent }  from 'overlayscrollbars-ngx';

@Injectable()
export class JsfScrollService {

  private _formScrollElement: OverlayScrollbarsComponent;
  private _customScrollElement: OverlayScrollbarsComponent;

  private _scrollableElement: BehaviorSubject<OverlayScrollbarsComponent> = new BehaviorSubject<OverlayScrollbarsComponent>(void 0);

  public get scrollableElement(): OverlayScrollbarsComponent {
    return this._scrollableElement.value;
  }
  public get scrollableElement$(): Observable<OverlayScrollbarsComponent> {
    return this._scrollableElement.asObservable();
  }


  public registerFormScrollableElement(el: OverlayScrollbarsComponent) {
    if (!el) {
      return;
    }

    this.clearScrollableElementClasses();
    this._formScrollElement = el;
    this.updateScrollableElement();
  }

  public registerCustomScrollableElement(el: OverlayScrollbarsComponent) {
    if (!el) {
      return;
    }

    this.clearScrollableElementClasses();
    this._customScrollElement = el;
    this.updateScrollableElement();
  }

  private updateScrollableElement() {
    const activeScrollElement = this._customScrollElement || this._formScrollElement;
    activeScrollElement.osTarget().classList.add('__jsf-scroll-element');

    this._scrollableElement.next(activeScrollElement);
  }

  private clearScrollableElementClasses() {
    if (this._customScrollElement) {
      this._customScrollElement.osTarget().classList.remove('__jsf-scroll-element');
    }
    if (this._formScrollElement) {
      this._formScrollElement.osTarget().classList.remove('__jsf-scroll-element');
    }
  }

  public scrollToTop(el: OverlayScrollbarsComponent = this.scrollableElement) {
    if (el) {
      el.osInstance().scroll({ x: 0, y: 0}, 800, 'easeOutQuart');
    } else {
      window.scrollTo({
        top     : 0,
        left    : 0,
        behavior: 'smooth',
      });
    }
  }

}
