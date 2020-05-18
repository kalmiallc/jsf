import { Observable }                          from 'rxjs';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Injectable }                          from '@angular/core';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type BreakpointOrCustomSize = Breakpoint | string;

export interface JsfBreakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export const jsfDefaultBreakpoints: JsfBreakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200
};

@Injectable({
  providedIn: 'root'
})
export class JsfResponsiveService {

  /**
   * Breakpoint sizes.
   */
  private _breakpoints: JsfBreakpoints = jsfDefaultBreakpoints;

  public get breakpoints() {
    return this._breakpoints;
  }

  public set breakpoints(breakpoints: JsfBreakpoints) {
    this._breakpoints = breakpoints;
  }

  constructor(private breakpointObserver: BreakpointObserver) {
  }

  /**
   * Returns true if given breakpoint is currently active.
   * @param breakpoint breakpoint name or custom size with units.
   */
  public isBreakpointMatched(breakpoint: BreakpointOrCustomSize): boolean {
    let matchSize;
    if (this.breakpoints[breakpoint] !== undefined) {
      matchSize = `${ this.breakpoints[breakpoint] }px`;
    } else {
      matchSize = `${ breakpoint }`;
    }

    return this.breakpointObserver.isMatched(`(min-width: ${ matchSize })`);
  }

  /**
   * Match a breakpoint or custom screen size (up).
   * @param breakpoint breakpoint name or custom size with units.
   */
  public matchMediaBreakpointUp(breakpoint: BreakpointOrCustomSize): Observable<BreakpointState> {
    let matchSize;
    if (this.breakpoints[breakpoint] !== undefined) {
      matchSize = `${ this.breakpoints[breakpoint] }px`;
    } else {
      matchSize = `${ breakpoint }`;
    }

    // before anything is rendered...
    return this.breakpointObserver
      .observe([`(min-width: ${ matchSize })`]);
  }

}
