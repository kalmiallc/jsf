import { JsfAbstractBuilder }    from './abstract-builder';
import { JsfUnknownPropBuilder } from './abstract-prop-builder';
import { ValidationError }       from './abstract-validation-error';
import {
  AddOrRemoveItemValueOptionsInterface,
  ConsumeProviderValueOptionsInterface,
  PatchValueOptionsInterface,
  SetValueOptionsInterface
}                                from '../interfaces/set-value-options.interface';
import { Subject }               from 'rxjs';
import { JsfPropLayoutBuilder }  from '../layout';

export type JsfUnknownHandlerBuilder = JsfAbstractHandlerBuilder<any>;

export abstract class JsfAbstractHandlerBuilder<BuilderType extends JsfUnknownPropBuilder> extends JsfAbstractBuilder {

  /**
   * Handler type (unique across all handler types).
   */
  abstract type: string;

  builder: BuilderType;

  protected unsubscribe: Subject<void> = new Subject<void>();

  get errors() {
    return this.builder.errors;
  }

  set errors(x: ValidationError[]) {
    this.builder.errors = x;
  }

  get errorsExist() {
    return this.builder.errorsExist;
  }

  get errorsNotExist() {
    return this.builder.errorsNotExist;
  }

  constructor(builder: BuilderType) {
    super();
    this.builder = builder;
  }

  onInit() {
  }

  onDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  afterDynamicInit(): void {}

  getJsonValue() {
    return this.builder.getJsonValue();
  }

  getDependenciesForEnabledIf() {
    return [];
  }

  getDependenciesForValidate() {
    return [];
  }

  beforeLayoutBuildHook(layoutBuilder: JsfPropLayoutBuilder<any>) {}
  beforeChildrenSchemaBuildHook() {}

  abstract setValue(value: any, options: SetValueOptionsInterface): void;

  abstract patchValue(value: any, options: PatchValueOptionsInterface): void;

  abstract consumeProviderValue(value: any, options: ConsumeProviderValueOptionsInterface): Promise<void>;

}
