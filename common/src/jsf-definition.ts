import { JsfProp }              from './schema';
import { JsfUnknownLayout }     from './layout';
import { JsfTranslations }      from './translations';
import { JsfAnalytics }         from './analytics';
import { JsfProviderInterface } from './providers';

/**
 * Closely follows https://tools.ietf.org/html/draft-zyp-json-schema-04
 */
export class JsfDefinition {

  $thumbnail?: string;

  /**
   * Set by API when saving. It is same as JSF key
   */
  $key?: string;

  $dff?: {
    /**
     * Set by DFF when loading.
     */
    key?: string;
  };

  /**
   * The "$schema" keyword is both used as a JSON Schema version
   * identifier and the location of a resource which is itself a JSON
   * Schema, which describes any schema written for this particular
   * version.
   *
   * Example: http://json-schema.org/draft-07/schema#
   */
  $schema?: string;

  /**
   * Schema purpose
   */
  $description?: string;

  /**
   * Location of specific document on the web (relative no domain).
   *
   * Example: /order/507f191e810c19729de860ea
   */
  $document?: string;

  /**
   * Static config merged from DB from keys 'jsf-shared-config' + 'jsf-config-<jsf form key>'.
   */
  $config?: any;

  /**
   * What to do when document is initialized and value is set.
   */
  $lifeCycle?: {
    $afterFormInit?: {
      $eval: string;
    };
  };

  /**
   * List of services to load for this document.
   */
  $services?: ({
    name: string;
    config?: { [key: string]: any }
  } | string)[];

  /**
   * What fields should be considered as indexes for better performance.
   */
  $indexes?: {
    fieldOrSpec: string | any,
    options: {
      /**
       * Creates an unique index.
       */
      unique?: boolean;

      /**
       * Creates a sparse index.
       */
      sparse?: boolean;
    }
  }[];


  /**
   * @deprecated
   */
  $submit?: {
    /**
     * Api path responsible for submit. If not set, app will be forced to handle submit.
     */
    $api?: string,

    /**
     * If set, after order send success screen will be displayed.
     *
     * THIS IS STILL USED FOR ME AND ME2 !!! So until not migrated leave it here.
     * @deprecated
     */
    successJsf?: string;
  };

  /**
   * Intended for notes to schema maintainers, as opposed to "description" which is suitable for display to end users
   * (BO).
   */
  $comment?: string;

  /**
   * Used for general style
   */
  $theme?: string;

  /**
   * Used for fine tuning branding. Inserted into <style> tag.
   *
   * You should prefix you classes! So it doesn't clash with others.
   * Format: .jsf--<form-key / schema-key / jsf-key>_whatever-you-like-here
   * Example:
   *  .jsf--order_my-custom-class {}
   */
  $style?: string;

  /**
   * Used for switching layouts. Layout can have key
   */
  $modes?: string[];

  /**
   * Includes css files before rendering form.
   * @deprecated
   */
  $stylesheets?: string[];

  /**
   * Includes script files before rendering form.
   */
  $scripts?: string[];

  // /**
  //  * For MongoDb to know for what collection it this document.
  //  */
  // $collection?: string;

  /**
   * Form title (visible in tab title, can be translated)
   */
  $title?: string;

  /**
   * base64 icon
   */
  $favicon?: string;

  /**
   * List of functions, constants, objects used for eval functions.
   *
   * Examples:
   * - 'return function(a, b, c) {}'
   * - 'return (a, b, c) => {}'
   * - 'return { a: 1 }'
   * - 'return "Hello world"'
   */
  $evalObjects?: { [objectName: string]: string };

  /**
   * Option for JSF form to listen and react to outside events from configurator-app.
   *
   * Example of possible event:
   * - dialog:customer-picked > (arg1:customer object)
   *
   * Example of data source events (data-source:dff:<dff-key if empty is any match>:list):
   * - data-source-filter:dff::list
   *
   * - data-source:dff::list
   * - data-source:dff::virtual-event:widget-banchmark
   * - data-source:dff::custom-event
   *
   * You can also be specific for example if you have user dashboard but need orders list data:
   * - data-source:dff:order:list
   *
   * If both cases are valid best match is used.
   */
  $events?: {
    listen: {
      [eventKey: string]: {

        // Event title used by UI builder
        $title?: string;

        /**
         * You get special extra ctx param: $eventData
         *
         * Example: "$form.patchValue({ customer: $eventData })"
         */
        $eval: string
      }
    }
  };

  /**
   * Map of named providers that can be used by the form.
   * Providers can provide data directly to a prop, or serve to supply values to handlers such as the dropdown handler.
   */
  $providers?: {
    [key: string]: JsfProviderInterface,
  };


  /**
   * Translations for this schema.
   */
  $translations?: JsfTranslations;

  /**
   * Analytics configuration.
   */
  $analytics?: JsfAnalytics;

  /**
   * If not set all is used for marking form $dirty, if empty form is never dirty.
   * Use ! to exclude specific path.
   * Example:
   * [
   *  product.groups,
   *  !product.groups.car.a
   *  !product.groups
   * ]
   */
  $dirtyList?: string[];

  /**
   * JSF definitions for $ref use. This is auto filled by API as external JSF def.!
   */
  $externalDefinitions?: { [key: string]: JsfDefinition };
  $schemaDefinitions?: { [key: string]: JsfProp };
  $layoutDefinitions?: { [key: string]: JsfUnknownLayout };

  /**
   * Object that describes the data model.
   */
  schema: JsfProp;

  /**
   * Array that describes the layout of the form.
   */
  layout?: JsfUnknownLayout;
}
