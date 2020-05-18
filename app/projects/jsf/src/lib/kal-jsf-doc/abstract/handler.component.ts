import {
  JsfAbstractHandlerBuilder,
  JsfAbstractPropBuilder,
  JsfBuilder,
  JsfI18nObject,
  JsfLayoutBuilderFactory,
  JsfPropBuilder,
  JsfPropLayoutBuilder,
  JsfUnknownLayoutBuilder,
  PropStatus,
  PropStatusChangeInterface
}                                                         from '@kalmia/jsf-common-es2015';
import { ShowValidationMessagesDirective }                from '../directives/show-validation-messages.directive';
import { JsfErrorStateMatcher }                           from '../../utilities';
import { ChangeDetectorRef, OnDestroy, OnInit, Optional } from '@angular/core';
import { Subject }                                        from 'rxjs';
import { takeUntil }                                      from 'rxjs/operators';


export abstract class AbstractPropHandlerComponent<PropBuilder extends JsfAbstractPropBuilder<any, any, any, any>,
  JsfHandler extends JsfAbstractHandlerBuilder<PropBuilder>> implements OnInit, OnDestroy {

  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  layoutBuilder: JsfPropLayoutBuilder<PropBuilder>;

  errorStateMatcher: JsfErrorStateMatcher;

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
          this.cdRef.markForCheck();
          this.cdRef.detectChanges();
        }
      });

    this.showValidation.state$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.cdRef.markForCheck();
        this.cdRef.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

    if (this.showValidation) {
      this.showValidation.unregisterChildControlValidationState(this);
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


  /**
   * Get prop value.
   */
  get value() {
    return this.propBuilder.getValue();
  }

  /**
   * Set prop value.
   * @param x value
   */
  set value(x: any) {
    if (x !== this.propBuilder.getValue()) {
      this.propBuilder.setValue(x)
        .catch(e => {
          console.error(e);
          throw e;
        });
      this.touched = true;
      this.dirty   = true;
    }
  }

  /**
   * Get value of the entire form.
   */
  get formValue(): any {
    return this.propBuilder.rootProp;
  }

  /**
   * Get the prop builder. Returns your custom handler builder instance.
   */
  get propBuilder(): PropBuilder {
    return this.layoutBuilder.propBuilder as PropBuilder;
  }

  /**
   * Get the custom prop builder for this handler.
   */
  get handlerBuilder(): JsfHandler {
    return this.layoutBuilder.propBuilder.handler as JsfHandler;
  }

  /**
   * Get the root prop builder.
   */
  get rootPropBuilder(): JsfPropBuilder {
    return this.layoutBuilder.propBuilder.rootProp as JsfPropBuilder;
  }

  /**
   * Get the JsfBuilder instance.
   */
  get jsfBuilder(): JsfBuilder {
    return this.layoutBuilder.rootBuilder;
  }

  /**
   * Get the unique ID for this handler
   */
  get id(): string {
    return this.layoutBuilder.id + '-' + this.propBuilder.id;
  }

  /**
   * Get the prop schema.
   */
  get propSchema(): any {
    return this.layoutBuilder.propBuilder.prop;
  }

  /**
   * Get the layout schema.
   */
  get layoutSchema(): any {
    return this.layoutBuilder.layout;
  }

  /**
   * Get the handler schema.
   */
  get handlerSchema(): any {
    return this.layoutBuilder.propBuilder.prop.handler;
  }

  /**
   * Get disabled state.
   */
  get disabled(): boolean {
    return this.propBuilder.disabled;
  }

  /**
   * Get enabled state.
   */
  get enabled(): boolean {
    return this.propBuilder.enabled;
  }

  /**
   * Get the global theme preferences.
   */
  get globalThemePreferences() {
    return this.layoutBuilder.rootBuilder.layoutBuilder.preferences;
  }

  /**
   * Get translation for a piece of text.
   * @param source text to translate
   */
  public i18n(source: string | JsfI18nObject): string {
    return this.layoutBuilder.translationServer.get(source);
  }


  /*************************************
   * Utilities
   *************************************/

  /**
   * Create a virtual layout builder.
   * @param layout JSF doc layout schema.
   */
  protected createVirtualLayoutBuilder(layout: any): JsfUnknownLayoutBuilder {
    return JsfLayoutBuilderFactory.create(layout,
      this.layoutBuilder.rootBuilder,
      this.layoutBuilder,
      { arrayPropMap: this.layoutBuilder.arrayPropMap, docDefPath: '__HANDLER_LAYOUT__' }
    );
  }

}
