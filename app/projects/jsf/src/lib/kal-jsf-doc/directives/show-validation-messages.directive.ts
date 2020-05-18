import { Directive, Input, OnDestroy, Optional, SkipSelf } from '@angular/core';
import { BehaviorSubject, Observable }                     from 'rxjs';

@Directive({
  selector: '[jsfShowValidationMessages]',
  exportAs: 'jsfShowValidationMessages'
})
export class ShowValidationMessagesDirective implements ControlValidationState, OnDestroy {

  private _childControlValidationStates: ControlValidationState[] = [];

  public get dirty(): boolean {
    for (const control of this._childControlValidationStates) {
      if (control.dirty) {
        return true;
      }
    }
    return false;
  }

  public get touched(): boolean {
    for (const control of this._childControlValidationStates) {
      if (control.touched) {
        return true;
      }
    }
    return false;
  }

  public get invalid(): boolean {
    for (const control of this._childControlValidationStates) {
      if (control.invalid) {
        return true;
      }
    }
    return false;
  }

  public get valid(): boolean {
    return !this.invalid;
  }

  get anyChildControlDirtyAndInvalid() {
    for (const control of this._childControlValidationStates) {
      if (control.dirty && control.invalid) {
        return true;
      }
    }
    return false;
  }


  private _state: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  get state$(): Observable<boolean> {
    return this._state.asObservable();
  }

  @Input('jsfShowValidationMessages')
  get state(): boolean {
    return (this.parent && this.parent.state) || this._state.value;
  }

  set state(x: boolean) {
    const newValue = !!x;
    if (newValue !== this._state.value) {
      this._state.next(newValue);
    }
  }

  constructor(@SkipSelf() @Optional() private parent: ShowValidationMessagesDirective) {
    if (parent) {
      this.parent.registerChildControlValidationState(this);
    }
  }

  ngOnDestroy(): void {
    if (this.parent) {
      this.parent.unregisterChildControlValidationState(this);
    }
  }

  public registerChildControlValidationState(control: ControlValidationState) {
    if (this._childControlValidationStates.indexOf(control) > -1) {
      throw new Error('Control is already registered');
    }
    this._childControlValidationStates.push(control);
  }

  public unregisterChildControlValidationState(control: ControlValidationState) {
    if (this._childControlValidationStates.indexOf(control) === -1) {
      throw new Error('Control is not registered');
    }
    this._childControlValidationStates = this._childControlValidationStates.filter(x => x !== control);
  }
}


export interface ControlValidationState {

  dirty: boolean;
  touched: boolean;

  readonly invalid: boolean;

}
