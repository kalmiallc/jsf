import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  Optional,
  Output,
  QueryList,
  SkipSelf,
  TemplateRef,
  ViewChildren,
  ViewEncapsulation
}                                                                                 from '@angular/core';
import { ErrorStateMatcher, MatStepLabel, MatStepperIcon, MatStepperIconContext } from '@angular/material';
import { jsfStepperAnimations }                                                   from './jsf-stepper-animations';
import { Directionality }                                                         from '@angular/cdk/bidi';
import { DOCUMENT }                                                               from '@angular/common';
import {
  CdkStep,
  CdkStepper,
  STEP_STATE,
  StepContentPositionState,
  STEPPER_GLOBAL_OPTIONS,
  StepperOptions,
  StepperSelectionEvent,
  StepState
}                                                                                 from '@angular/cdk/stepper';
import { FormControl, FormGroupDirective, NgForm }                                from '@angular/forms';
import { coerceNumberProperty }                                                   from '@angular/cdk/coercion';
import { JsfStepHeader }                                                          from './step-header/jsf-step-header.component';
import { Subject }                                                                from 'rxjs';
import { distinctUntilChanged, takeUntil }                                        from 'rxjs/operators';
import { AnimationEvent }                                                         from '@angular/animations';

/** Change event emitted on selection changes. */
export class JsfStepperSelectionEvent extends StepperSelectionEvent {
  /** Flag indicating whether the newly selected step was a fallback because we tried moving to an invalid step. */
  preventedMoveToInvalidStep: boolean;
}


// tslint:disable:component-class-suffix no-inputs-metadata-property no-host-metadata-property
@Component({
  selector       : 'jsf-step',
  templateUrl    : './jsf-step.html',
  providers      : [{ provide: ErrorStateMatcher, useExisting: JsfStep }],
  encapsulation  : ViewEncapsulation.None,
  exportAs       : 'jsfStep',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JsfStep extends CdkStep implements ErrorStateMatcher {
  /** Content for step label given by `<ng-template matStepLabel>`. */
  @ContentChild(MatStepLabel) stepLabel: MatStepLabel;

  /** @breaking-change 8.0.0 remove the `?` after `stepperOptions` */
  constructor(@Inject(forwardRef(() => JsfStepper)) stepper: JsfStepper,
              @SkipSelf() private _errorStateMatcher: ErrorStateMatcher,
              @Optional() @Inject(STEPPER_GLOBAL_OPTIONS) stepperOptions?: StepperOptions) {
    super(stepper, stepperOptions);
  }

  /** Custom error state matcher that additionally checks for validity of interacted form. */
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const originalErrorState = this._errorStateMatcher.isErrorState(control, form);

    // Custom error state checks for the validity of form that is not submitted or touched
    // since user can trigger a form change by calling for another step without directly
    // interacting with the current form.
    const customErrorState = !!(control && control.invalid && this.interacted);

    return originalErrorState || customErrorState;
  }
}


// tslint:disable:directive-class-suffix no-inputs-metadata-property no-host-metadata-property
@Directive({
  selector: '[jsfStepper]'
})
export class JsfStepper extends CdkStepper implements AfterContentInit {
  /** The list of step headers of the steps in the stepper. */
  @ViewChildren(JsfStepHeader) _stepHeader: QueryList<JsfStepHeader>;

  /** Steps that the stepper holds. */
  @ContentChildren(JsfStep) _steps: QueryList<JsfStep>;

  /** Custom icon overrides passed in by the consumer. */
  @ContentChildren(MatStepperIcon) _icons: QueryList<MatStepperIcon>;

  /** Event emitted when the current step is done transitioning in. */
  @Output() readonly animationDone: EventEmitter<void> = new EventEmitter<void>();

  /** Event emitted when the selected step has changed. */
  @Output() selectionChange: EventEmitter<JsfStepperSelectionEvent>
    = new EventEmitter<JsfStepperSelectionEvent>();

  /** Consumer-specified template-refs to be used to override the header icons. */
  _iconOverrides: { [key: string]: TemplateRef<MatStepperIconContext> } = {};

  /** Stream of animation `done` events when the body expands/collapses. */
  _animationDone = new Subject<AnimationEvent>();

  /** The index of the selected step. */
  /** Override CdkStepper */
  @Input()
  get selectedIndex() { return (this as any)._selectedIndex; }

  set selectedIndex(index: number) {
    const _this = (this as any);

    const newIndex = coerceNumberProperty(index);

    if (this.steps) {
      // Ensure that the index can't be out of bounds.
      if (newIndex < 0 || newIndex > this.steps.length - 1) {
        throw Error('cdkStepper: Cannot assign out-of-bounds value to `selectedIndex`.');
      }

      if (!_this._anyControlsInvalidOrPending(newIndex)) {
        if (newIndex >= _this._selectedIndex || this.steps.toArray()[newIndex].editable) {
          _this._updateSelectedItemIndex(index);
        }
      } else {
        // There is a pending or invalid control, find the first valid step we can move to
        let lastValidIndex = 0;
        for (let i = 0; i <= newIndex; i++) {
          if (_this._anyControlsInvalidOrPending(i)) {
            break;
          }
          lastValidIndex = i;
        }

        // Update index and dispatch event with a flag indicating we failed to move to an invalid step
        _this._updateSelectedItemIndex(lastValidIndex, true);
      }
    } else {
      _this._selectedIndex = newIndex;
    }
  }


  ngAfterContentInit() {
    this._icons.forEach(({ name, templateRef }) => this._iconOverrides[name] = templateRef);

    // Mark the component for change detection whenever the content children query changes
    this._steps.changes.pipe(takeUntil(this._destroyed)).subscribe(() => this._stateChanged());

    this._animationDone.pipe(
      // This needs a `distinctUntilChanged` in order to avoid emitting the same event twice due
      // to a bug in animations where the `.done` callback gets invoked twice on some browsers.
      // See https://github.com/angular/angular/issues/24084
      distinctUntilChanged((x, y) => x.fromState === y.fromState && x.toState === y.toState),
      takeUntil(this._destroyed)
    ).subscribe(event => {
      if ((event.toState as StepContentPositionState) === 'current') {
        this.animationDone.emit();
      }
    });
  }

  constructor(@Optional() _dir: Directionality,
              _changeDetectorRef: ChangeDetectorRef,
              // @breaking-change 8.0.0 `_elementRef` and `_document` parameters to become required.
              _elementRef?: ElementRef<HTMLElement>,
              @Inject(DOCUMENT) _document?: any) {
    super(_dir, _changeDetectorRef, _elementRef, _document);


    /**
     * Move along, nothing to see here :)
     *
     */
    (this as any)._updateSelectedItemIndex = (newIndex: number, preventedMove = false): void => {
      const _this = (this as any);

      const stepsArray = this.steps.toArray();
      this.selectionChange.emit({
        selectedIndex             : newIndex,
        previouslySelectedIndex   : _this._selectedIndex,
        selectedStep              : stepsArray[newIndex],
        previouslySelectedStep    : stepsArray[_this._selectedIndex],
        preventedMoveToInvalidStep: preventedMove
      });

      // If focus is inside the stepper, move it to the next header, otherwise it may become
      // lost when the active step content is hidden. We can't be more granular with the check
      // (e.g. checking whether focus is inside the active step), because we don't have a
      // reference to the elements that are rendering out the content.
      _this._containsFocus() ? _this._keyManager.setActiveItem(newIndex) :
        _this._keyManager.updateActiveItemIndex(newIndex);

      _this._selectedIndex = newIndex;
      this._stateChanged();
    };
  }
}


// tslint:disable:component-class-suffix no-inputs-metadata-property no-host-metadata-property
@Component({
  selector       : 'jsf-horizontal-stepper',
  exportAs       : 'jsfHorizontalStepper',
  templateUrl    : './jsf-stepper-horizontal.html',
  styleUrls      : ['./jsf-stepper.component.scss'],
  inputs         : ['selectedIndex'],
  host           : {
    'class'                                    : 'mat-stepper-horizontal',
    '[class.mat-stepper-label-position-end]'   : 'labelPosition == "end"',
    '[class.mat-stepper-label-position-bottom]': 'labelPosition == "bottom"',
    'aria-orientation'                         : 'horizontal',
    'role'                                     : 'tablist'
  },
  animations     : [jsfStepperAnimations.horizontalStepTransition],
  providers      : [{ provide: JsfStepper, useExisting: JsfHorizontalStepper }],
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JsfHorizontalStepper extends JsfStepper {
  /** Whether the label should display in bottom or end position. */
  @Input()
  labelPosition: 'bottom' | 'end' = 'end';

  constructor(
    @Optional() dir: Directionality,
    changeDetectorRef: ChangeDetectorRef,
    elementRef?: ElementRef<HTMLElement>,
    @Inject(DOCUMENT) _document?: any) {
    super(dir, changeDetectorRef, elementRef, _document);

    // Override private methods
    (this as any)._getDefaultIndicatorLogic = this._getDefaultIndicatorLogicOverride;
  }

  /**
   * Override default Material icon behaviour.
   */
  private _getDefaultIndicatorLogicOverride(step: CdkStep, isCurrentStep: boolean): StepState {
    if (step._showError && step.hasError) {
      return STEP_STATE.ERROR;
    } else if (!step.completed || isCurrentStep) {
      return STEP_STATE.NUMBER;
    } else {
      return step.editable ? STEP_STATE.EDIT : STEP_STATE.DONE;
    }
  }
}

@Component({
  selector       : 'jsf-vertical-stepper',
  exportAs       : 'jsfVerticalStepper',
  templateUrl    : './jsf-stepper-vertical.html',
  styleUrls      : ['./jsf-stepper.component.scss'],
  inputs         : ['selectedIndex'],
  host           : {
    'class'           : 'mat-stepper-vertical',
    'aria-orientation': 'vertical',
    'role'            : 'tablist'
  },
  animations     : [jsfStepperAnimations.verticalStepTransition],
  providers      : [{ provide: JsfStepper, useExisting: JsfVerticalStepper }],
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JsfVerticalStepper extends JsfStepper {
  constructor(
    @Optional() dir: Directionality,
    changeDetectorRef: ChangeDetectorRef,
    elementRef?: ElementRef<HTMLElement>,
    @Inject(DOCUMENT) _document?: any) {
    super(dir, changeDetectorRef, elementRef, _document);
    this._orientation = 'vertical';

    // Override private methods
    (this as any)._getDefaultIndicatorLogic = this._getDefaultIndicatorLogicOverride;
  }

  /**
   * Override default Material icon behaviour.
   */
  private _getDefaultIndicatorLogicOverride(step: CdkStep, isCurrentStep: boolean): StepState {
    if (step._showError && step.hasError) {
      return STEP_STATE.ERROR;
    } else if (!step.completed || isCurrentStep) {
      return STEP_STATE.NUMBER;
    } else {
      return step.editable ? STEP_STATE.EDIT : STEP_STATE.DONE;
    }
  }
}
