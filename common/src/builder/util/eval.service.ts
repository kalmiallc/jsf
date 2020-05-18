import { JsfEvalRuntimeError }                                               from '../../errors';
import { JsfUnknownLayoutBuilder }                                                              from '../layout';
import { JsfI18nObject }                                                                        from '../../translations';
import { JsfBuilder }                                                                           from '../jsf-builder';
import * as lodash                                                                         from 'lodash';
import * as moment                                                                              from 'moment';
import { Moment } from 'moment';
import { JsfUnknownPropBuilder }                                                                from '../abstract';
import {
  jsfClipboardClear,
  jsfClipboardClearAll,
  jsfClipboardClearMany,
  jsfClipboardGet,
  jsfClipboardKeys
} from './clipboard';

export interface EvalContextOptions {
  layoutBuilder?: JsfUnknownLayoutBuilder;
  propBuilder?: JsfUnknownPropBuilder;
  extraContextParams?: { [key: string]: any };
}

export const evalService = new class {
  /**
   * Function cache.
   */
  functionCache = {};

  /**
   * Gets the static eval context.
   * This contains helper methods & functions which do not depends on the runtime context of the evaluating function.
   */
  getStaticEvalContext(builder: JsfBuilder) {
    const locale = builder.runtimeContext ? builder.runtimeContext.application.language : 'en';

    return {
      $moment: moment,
      _: lodash,

      $locale: locale,

      $format: {
        currency: (value: number, currency = 'EUR') => {
          return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
        },
        number: (value: number, minimumFractionDigits = 0, maximumFractionDigits = void 0) => {
          return new Intl.NumberFormat(locale, { minimumFractionDigits, maximumFractionDigits }).format(value);
        },
        date: (date: string | Date | Moment) => {
          return moment(date).locale(locale).format('L');
        },
        dateTime: (date: string | Date | Moment) => {
          return moment(date).locale(locale).format('L LT');
        }
      },
    };
  }


  /**
   * Gets the eval context.
   */
  getEvalContext(builder: JsfBuilder, options: EvalContextOptions = {}): any {
    if (!builder.propBuilder) {
      throw new Error(`JsfBuilder.propBuilder === ${ builder.propBuilder } | Cannot generate eval context.`);
    }

    let linkedContext;
    if (builder.linkedBuilder) {
      linkedContext = evalService.getEvalContext(builder.linkedBuilder, options);
    }

    const context = {
      ... this.getStaticEvalContext(builder),

      $linked: linkedContext,

      $val: new Proxy({}, {
        get: (target, name: string) => {
          const control = builder.propBuilder.getControlByPath(name);
          return control.getValue();
        }
      }),

      $form   : builder,
      $builder: builder.propBuilder,
      $objects: builder.$evalObjects,

      $layoutState: (id, key) => builder.getLayoutState(id, key),
      $i18n       : (source: string | JsfI18nObject) => builder.translationServer.get(source),

      $setValue  : (x: any, y: any) => builder.setJsonValue(x, y),
      $patchValue: (x: any, y: any) => builder.patchJsonValue(x, y),

      $clipboard : {
        get: jsfClipboardGet,
        keys: jsfClipboardKeys,
        clearAll: jsfClipboardClearAll,
        clear: jsfClipboardClear,
        clearMany: jsfClipboardClearMany,
      },

      $getItemIndex     : (key) => {
        if (!options.layoutBuilder) {
          throw new Error(`'$getItem' cannot be used outside of layout schema.`);
        }
        return options.layoutBuilder.getPropItem(key).index;
      },
      $getItem     : (key) => {
        if (!options.layoutBuilder) {
          throw new Error(`'$getItem' cannot be used outside of layout schema.`);
        }
        return options.layoutBuilder.getPropItem(key);
      },
      $getItemValue: (key) => {
        if (!options.layoutBuilder) {
          throw new Error(`'$getItemValue' cannot be used outside of layout schema.`);
        }
        return options.layoutBuilder.getPropItem(key).getValue();
      },

      $getPropIndex     : (key) => {
        if (!options.propBuilder) {
          throw new Error(`'$getProp' cannot be used outside of prop schema.`);
        }
        return options.propBuilder.getSibling(key).index;
      },
      $getProp     : (key) => {
        if (!options.propBuilder) {
          throw new Error(`'$getProp' cannot be used outside of prop schema.`);
        }
        return options.propBuilder.getSibling(key);
      },
      $getPropValue: (key) => {
        if (!options.propBuilder) {
          throw new Error(`'$getPropValue' cannot be used outside of prop schema.`);
        }
        return options.propBuilder.getSibling(key).getValue();
      },
      $propVal: new Proxy({}, {
        get: (target, name: string) => {
          if (!options.propBuilder) {
            throw new Error(`'$propVal' cannot be used outside of prop schema.`);
          }
          return options.propBuilder.getValue();
        }
      }),

      $clientConfig: builder.clientConfig,

      /**
       * @deprecated use #isMode
       */
      $mode  : (key) => builder.modes.indexOf(key) > -1,

      $isMode: (key) => builder.modes.indexOf(key) > -1,

      $user    : builder.authUserProvider && builder.authUserProvider.provide(),
      $customer: builder.authCustomerProvider && builder.authCustomerProvider.provide(),

      $delayedUpdate: (cb) => builder.resolver.runWithDelayedUpdate(cb),

      ...(options.extraContextParams || {})
    };

    // Handle special cases such as accessing `$val` by itself, where we want to return the whole document value instead of the proxy object itself.
    const contextProxy = new Proxy(context, {
      get: (target, name: string) => {
        if (name === '$val') {
          return builder.propBuilder.getJsonValue();
        } else {
          return target[name];
        }
      }
    });

    return contextProxy;
  }

  /**
   * Run a piece of code with context
   */
  runEvalWithContext(lambda: string, context: any): any {
    try {
      let fn = this.functionCache[lambda];
      if (!fn) {
        fn                         = new Function(`
          with (this) {
            ${ lambda }
          }
        `);
        this.functionCache[lambda] = fn;
      }

      return fn.bind(context)();
    } catch (e) {
      throw new JsfEvalRuntimeError({
        eval: lambda,
        context,

        exception   : e,
        errorMessage: e.message,
        errorStack  : e.stack
      });
    }
  }
};
