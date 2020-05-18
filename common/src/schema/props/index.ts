import { JsfPropNull }                                               from './prop-null';
import { JsfPropObject, JsfPropObjectJsonValue, JsfPropObjectValue } from './prop-object';
import { JsfPropArray, JsfPropArrayJsonValue, JsfPropArrayValue }    from './prop-array';
import { JsfPropString }                                             from './prop-string';
import { JsfPropInteger, JsfPropNumber }                             from './prop-number';
import { JsfPropBoolean }                                            from './prop-boolean';
import { JsfPropRef }                                                from './prop-ref';
import { JsfPropId }                                                 from './prop-id';
import { JsfPropDate }                                               from './prop-date';
import { ObjectID }                                                  from '../../builder/props/index';
import { JsfPropBinary }                                             from './prop-binary';

export * from './prop-null';
export * from './prop-object';
export * from './prop-array';
export * from './prop-string';
export * from './prop-number';
export * from './prop-boolean';
export * from './prop-ref';
export * from './prop-id';
export * from './prop-date';

export type JsfPropTypes =
  'null'
  | 'object'
  | 'array'
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'id'
  | 'date'
  | 'ref'
  | 'binary';

export type JsfProp =
  JsfPropNull
  | JsfPropObject
  | JsfPropArray
  | JsfPropString
  | JsfPropNumber
  | JsfPropInteger
  | JsfPropBoolean
  | JsfPropBinary
  | JsfPropId
  | JsfPropDate
  | JsfPropRef
  ;

export type JsfPropValue =
  null
  | JsfPropObjectValue
  | JsfPropArrayValue
  | string
  | number
  | boolean
  | ObjectID
  | ArrayBuffer
  | Date;
export type JsfPropJsonValue = null | JsfPropObjectJsonValue | JsfPropArrayJsonValue | string | number | boolean;

export function isPropNull(prop: JsfProp): prop is JsfPropNull { return prop.type === 'null'; }

export function isPropObject(prop: JsfProp): prop is JsfPropObject { return prop.type === 'object'; }

export function isPropArray(prop: JsfProp): prop is JsfPropArray { return prop.type === 'array'; }

export function isPropString(prop: JsfProp): prop is JsfPropString { return prop.type === 'string'; }

export function isPropNumber(prop: JsfProp): prop is JsfPropNumber { return prop.type === 'number'; }

export function isPropInteger(prop: JsfProp): prop is JsfPropInteger { return prop.type === 'integer'; }

export function isPropBoolean(prop: JsfProp): prop is JsfPropBoolean { return prop.type === 'boolean'; }

export function isPropBinary(prop: JsfProp): prop is JsfPropBinary { return prop.type === 'binary'; }

export function isPropId(prop: JsfProp): prop is JsfPropId { return prop.type === 'id'; }

export function isPropRef(prop: JsfProp): prop is JsfPropRef { return prop.type === 'ref'; }

export function isPropDate(prop: JsfProp): prop is JsfPropDate { return prop.type === 'date'; }


