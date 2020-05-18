import {
  JsfAbstractPropBuilder, JsfArrayPropLayoutBuilder,
  JsfI18nObject,
  JsfLayoutPropPreferences,
  JsfPropLayoutBuilder,
  PropStatus,
  PropStatusChangeInterface
} from '@kalmia/jsf-common-es2015';
import { AbstractLayoutComponent }                                 from './layout.component';
import { ChangeDetectorRef, OnDestroy, OnInit, Optional }          from '@angular/core';
import { ControlValidationState, ShowValidationMessagesDirective } from '../directives/show-validation-messages.directive';
import { JsfErrorStateMatcher }                                    from '../../utilities';
import { Subscription }                                            from 'rxjs';
import { takeUntil }                                               from 'rxjs/operators';

export abstract class AbstractPropLayoutComponent<PropBuilder extends JsfAbstractPropBuilder<any, any, any, any>>
  extends AbstractLayoutComponent implements ControlValidationState, OnInit, OnDestroy {

  layoutBuilder: JsfPropLayoutBuilder<PropBuilder> | JsfArrayPropLayoutBuilder;

  errorStateMatcher: JsfErrorStateMatcher;

  private _changeDetectionSubscription: Subscription;
  private _validationStateChangeSubscription: Subscription;

  private _touched: boolean;
  private _dirty: boolean;

  get dirty(): boolean {
    return this._dirty;
  }

  set dirty(value: boolean) {
    this._dirty = value;
  }

  get touched(): boolean {
    return this._touched;
  }

  set touched(value: boolean) {
    this._touched = value;
  }

  get invalid() {
    return this.propBuilder.invalid;
  }

  constructor(protected cdRef: ChangeDetectorRef,
              @Optional() protected showValidation: ShowValidationMessagesDirective) {
    super();
    this.errorStateMatcher = new JsfErrorStateMatcher(showValidation);

    if (showValidation) {
      showValidation.registerChildControlValidationState(this);
    }
  }

  ngOnInit(): void {
    const dependencyAbsolutePath = this.propBuilder.convertAbstractSiblingPathToPath(this.propBuilder.abstractPath);
    this.propBuilder.rootBuilder.listenForStatusChange(dependencyAbsolutePath)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((status: PropStatusChangeInterface) => {
        if (status.status !== PropStatus.Pending) {
          this.detectChanges();
        }
      });

    this.showValidation.state$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.detectChanges();
      });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();

    if (this.showValidation) {
      this.showValidation.unregisterChildControlValidationState(this);
    }
  }

  protected detectChanges(): void {
    if (this.cdRef) {
      this.cdRef.detectChanges();
    }
  }

  /**
   * Returns true if prop should show errors.
   */
  get hasErrors(): boolean {
    const forceStatus = this.showValidation && this.showValidation.state;
    return this.invalid && (this.dirty || forceStatus);
  }

  get errors() {
    return this.propBuilder.errors;
  }

  get interpolatedErrors() {
    return this.errors.map(x => x.interpolatedMessage);
  }

  set value(x: any) {
    if (x !== this.propBuilder.getValue()) {
      this.propBuilder.setValue(x)
        .catch(e => {
          throw e;
        });
      this.touched = true;
      this.dirty   = true;
    }
  }

  get value(): any {
    return this.propBuilder.getValue();
  }

  get id() {
    return this.layoutBuilder.id;
  }

  get prop() {
    return this.layoutBuilder.propBuilder.prop;
  }

  get propBuilder(): PropBuilder {
    return this.layoutBuilder.propBuilder as PropBuilder;
  }

  get layout() {
    return this.layoutBuilder.layout;
  }

  get handler() {
    return this.layoutBuilder.propBuilder.prop.handler;
  }

  get handlerBuilder() {
    return this.layoutBuilder.propBuilder.handler;
  }

  get globalThemePreferences() {
    return this.layoutBuilder.rootBuilder.layoutBuilder.preferences;
  }

  get localThemePreferences() {
    return this.layout.preferences as JsfLayoutPropPreferences;
  }

  get translationServer() {
    return this.layoutBuilder.translationServer;
  }

  i18n(source: string | JsfI18nObject): string {
    return this.translationServer.get(source);
  }

}
