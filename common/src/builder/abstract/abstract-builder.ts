import { JsfTranslatableMessage, JsfTranslationServer } from '../../translations';

export abstract class JsfAbstractBuilder {

  abstract validate(options?: { force?: boolean }): Promise<boolean>;

  abstract getJsonValue(): any;

  abstract getValue(): any;

  abstract lock(lockKey?: Symbol): Symbol;

  abstract isDiff(lockKey: Symbol): boolean;

  abstract getDiff(lockKey: Symbol): any;
  abstract getDiffKeys(lockKey: Symbol): string[];

  abstract getJsonDiff(lockKey: Symbol): any;

  abstract async getPropTranslatableStrings(): Promise<JsfTranslatableMessage[]>;

  abstract getStaticTranslatableStrings(): JsfTranslatableMessage[];

  abstract get translationServer(): JsfTranslationServer;

  // abstract reset(value?: any, options?: { [optionKey: string]: any }): void;
  // abstract setErrors(errors: ValidationErrors | null, opts: { [optionKey: string]: any }): void;
  // abstract getError(errorCode: string, path?: string[]): any;
  // abstract hasError(errorCode: string, path?: string[]): boolean;
}
