import { ChangeDetectorRef, Directive, Injector, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, NgControl, ValidationErrors, Validator }     from '@angular/forms';
import { JsfPropBuilder, JsfPropLayoutBuilder, PropStatus }                           from '@kalmia/jsf-common-es2015';
import { ShowValidationMessagesDirective }                                            from './show-validation-messages.directive';
import { Subject }                                                                    from 'rxjs';
import { takeUntil }                                                                  from 'rxjs/operators';

/**
 * This directive listens for status change on props and passes any errors to angular forms API,
 * so that frameworks such as Material can pick up on them and display them automatically.
 */
@Directive({
  selector : '[jsfPropValidator]',
  providers: [{ provide: NG_VALIDATORS, useExisting: PropValidatorDirective, multi: true }]
})
export class PropValidatorDirective implements Validator, OnInit, OnDestroy {

  private _onPropValidated: () => void;

  private _control: NgControl;

  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(private cdRef: ChangeDetectorRef,
              private injector: Injector,
              @Optional() private showValidation: ShowValidationMessagesDirective) {
  }

  @Input('jsfPropValidator')
  layoutBuilder: JsfPropLayoutBuilder<JsfPropBuilder>;


  ngOnInit() {
    // Trigger validation when prop status changes
    this.layoutBuilder.propBuilder.statusChange
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(status => {
        if (status === PropStatus.Valid || status === PropStatus.Invalid) {
          this._onPropValidated();
        }
      });

    // Trigger validation when show validation state changes
    if (this.showValidation) {
      this.showValidation.state$
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(newState => {
          if (newState) {
            if (this._onPropValidated) {
              this._onPropValidated();
            }
          }
        });
    }

    this._control = this.injector.get(NgControl); // tslint:disable-line
  }

  /**
   * Destroy.
   */
  ngOnDestroy(): void {
    // Unsubscribe from all observables.
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  validate(control: AbstractControl): ValidationErrors | null {
    // Suppress errors if validation message state is not true, and the control is not dirty
    if (this.showValidation && this.showValidation.state === false) {
      if (!this._control.dirty) {
        return null;
      }
    }

    const errors = this.layoutBuilder.propBuilder.errors;
    if (errors && errors.length > 0) {
      return errors.reduce((acc, x) => {
        acc[x.errorCode] = x.interpolatedMessage;
        return acc;
      }, {} as ValidationErrors);
    }

    return null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this._onPropValidated = fn;
  }

}
