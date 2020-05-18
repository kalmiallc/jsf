import {
  isPropArray,
  isPropBinary,
  isPropBoolean,
  isPropDate,
  isPropId,
  isPropInteger,
  isPropNull,
  isPropNumber,
  isPropObject,
  isPropRef,
  isPropString,
  JsfProp
} from '../../schema/index';
import { JsfPropBuilder, JsfPropBuilderBinary, JsfPropBuilderDate, JsfPropBuilderRef } from '../props/index';
import { JsfPropBuilderNull } from '../props/prop-builder-null';
import { JsfPropBuilderObject }  from '../props/prop-builder-object';
import { JsfPropBuilderArray }   from '../props/prop-builder-array';
import { JsfPropBuilderString }  from '../props/prop-builder-string';
import {
  JsfPropBuilderInteger,
  JsfPropBuilderNumber
}                                from '../props/prop-builder-number';
import { JsfPropBuilderId }      from '../props/prop-builder-id';
import { JsfPropBuilderBoolean } from '../props/prop-builder-boolean';
import { JsfUnknownPropBuilder } from '../abstract/index';
import { JsfBuilder }            from '../jsf-builder';
import { SafeModeTypes }         from '../abstract';


export class JsfPropBuilderFactory {

  static createEmpty(prop: JsfProp, rootBuilder: JsfBuilder) {
    return (new (JsfPropBuilderFactory.getBuilderClass(prop))(rootBuilder));
  }

  static create(data: {
    prop: JsfProp,
    docDefPath: string,
    parentProp?: JsfPropBuilder,
    rootProp?: JsfPropBuilder,
    propName: string,
    rootBuilder: JsfBuilder,
    safeMode?: SafeModeTypes
  }) {
    return (new (JsfPropBuilderFactory.getBuilderClass(data.prop))(data.rootBuilder)).onInit(data);
  }

  static getBuilderClass(prop: JsfProp): new (rootBuilder: JsfBuilder) => JsfUnknownPropBuilder {
    if (isPropNull(prop)) { return JsfPropBuilderNull; }
    if (isPropObject(prop)) { return JsfPropBuilderObject; }
    if (isPropArray(prop)) { return JsfPropBuilderArray; }
    if (isPropString(prop)) { return JsfPropBuilderString; }
    if (isPropNumber(prop)) { return JsfPropBuilderNumber; }
    if (isPropInteger(prop)) { return JsfPropBuilderInteger; }
    if (isPropBoolean(prop)) { return JsfPropBuilderBoolean; }
    if (isPropId(prop)) { return JsfPropBuilderId; }
    if (isPropRef(prop)) { return JsfPropBuilderRef; }
    if (isPropBinary(prop)) { return JsfPropBuilderBinary; }
    if (isPropDate(prop)) { return JsfPropBuilderDate; }

    throw new Error(`Unknown prop: [${ JSON.stringify(prop) }]`);
  }
}
