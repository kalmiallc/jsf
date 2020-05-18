import { Directive, Input } from '@angular/core';


@Directive({
  selector: '[layoutProgressTrackerStepController]'
})
export class LayoutProgressTrackerStepControllerDirective {

  @Input('progressTrackerStepIndex')
  index: number;

  @Input('progressTrackerStepLast')
  last: boolean;

  @Input('progressTrackerStepCompleted')
  completed: boolean;

  @Input('progressTrackerStepActive')
  active: boolean;

  private _progress: number;
  @Input('progressTrackerStepProgress')
  public set progress(value: number) {
    this._progress = Math.max(0, Math.min(value, 1));
  }
  public get progress(): number {
    return this._progress;
  }

  constructor() { }
}
