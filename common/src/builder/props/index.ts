import { JsfPropBuilderRef }                           from './prop-builder-ref';
import { JsfPropBuilderObject }                        from './prop-builder-object';
import { JsfPropBuilderInteger, JsfPropBuilderNumber } from './prop-builder-number';
import { JsfPropBuilderNull }                          from './prop-builder-null';
import { JsfPropBuilderId }                            from './prop-builder-id';
import { JsfPropBuilderDate }    from './prop-builder-date';
import { JsfPropBuilderBoolean } from './prop-builder-boolean';
import { JsfPropBuilderBinary }  from './prop-builder-binary';
import { JsfPropBuilderArray }   from './prop-builder-array';
import { JsfPropBuilderString }  from './prop-builder-string';
import { JsfUnknownPropBuilder } from '../abstract/index';
import { JsfAbstractProp }       from '../../schema/abstract';

export * from './prop-builder-ref';
export * from './prop-builder-object';
export * from './prop-builder-number';
export * from './prop-builder-null';
export * from './prop-builder-id';
export * from './prop-builder-date';
export * from './prop-builder-boolean';
export * from './prop-builder-binary';
export * from './prop-builder-array';
export * from './prop-builder-string';

export type JsfPropBuilder =
  JsfPropBuilderArray
  | JsfPropBuilderString
  | JsfPropBuilderBinary
  | JsfPropBuilderBoolean
  | JsfPropBuilderDate
  | JsfPropBuilderId
  | JsfPropBuilderNull
  | JsfPropBuilderNumber
  | JsfPropBuilderInteger
  | JsfPropBuilderObject
  | JsfPropBuilderRef;

export function isPropBuilderArray(propBuilder: JsfUnknownPropBuilder): propBuilder is JsfPropBuilderArray {
  return propBuilder instanceof JsfPropBuilderArray;
}

export function isPropBuilderFixedArray(propBuilder: JsfUnknownPropBuilder): propBuilder is JsfPropBuilderArray {
  return propBuilder instanceof JsfPropBuilderArray && propBuilder.isFixedItems;
}

export function isPropBuilderString(propBuilder: JsfUnknownPropBuilder): propBuilder is JsfPropBuilderString {
  return propBuilder instanceof JsfPropBuilderString;
}


export function isJsfPropBuilderBinary(propBuilder: JsfUnknownPropBuilder): propBuilder is JsfPropBuilderBinary {
  return propBuilder instanceof JsfPropBuilderBinary;
}

export function isJsfPropBuilderBoolean(propBuilder: JsfUnknownPropBuilder): propBuilder is JsfPropBuilderBoolean {
  return propBuilder instanceof JsfPropBuilderBoolean;
}

export function isJsfPropBuilderDate(propBuilder: JsfUnknownPropBuilder): propBuilder is JsfPropBuilderDate {
  return propBuilder instanceof JsfPropBuilderDate;
}

export function isJsfPropBuilderId(propBuilder: JsfUnknownPropBuilder): propBuilder is JsfPropBuilderId {
  return propBuilder instanceof JsfPropBuilderId;
}

export function isJsfPropBuilderNull(propBuilder: JsfUnknownPropBuilder): propBuilder is JsfPropBuilderNull {
  return propBuilder instanceof JsfPropBuilderNull;
}

export function isJsfPropBuilderNumber(propBuilder: JsfUnknownPropBuilder): propBuilder is JsfPropBuilderNumber {
  return propBuilder instanceof JsfPropBuilderNumber;
}

export function isJsfPropBuilderInteger(propBuilder: JsfUnknownPropBuilder): propBuilder is JsfPropBuilderInteger {
  return propBuilder instanceof JsfPropBuilderInteger;
}

export function isJsfPropBuilderObject(propBuilder: JsfUnknownPropBuilder): propBuilder is JsfPropBuilderObject {
  return propBuilder instanceof JsfPropBuilderObject;
}

export function isJsfPropBuilderRef(propBuilder: JsfUnknownPropBuilder): propBuilder is JsfPropBuilderRef {
  return propBuilder instanceof JsfPropBuilderRef;
}
