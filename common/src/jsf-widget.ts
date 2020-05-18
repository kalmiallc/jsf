import { JsfDefinition } from './jsf-definition';
import { JsfPropRef }    from './schema/props';

export class JsfWidget {

  /**
   * Enable scroll inside widget.
   */
  scroll?: boolean;

  /**
   * Optional classes to apply to this widget's JSF doc component.
   */
  htmlClass?: string;

  /**
   * If set widget can filter data source for other widgets & itself (not recommended).
   * In order for filtering to work JSF definition must contain filter property in schema.
   * From this property data for filter query is taken out and used by DFF in order to make request.
   *
   * Special case if filter is array, then system will call event data-source:dff::list:by-group and not default one.
   */
  filter?: string;

  /**
   * Defines what data source should be loaded for widget.
   * Widget can get this data via $events, event is triggered on data load / change.
   *
   *
   * - data-source:dff::list
   * - data-source:dff::virtual-event:widget-banchmark
   * - data-source:dff::custom-event
   *
   * You can also be specific for example if you have user dashboard but need orders list data:
   * - data-source:dff:order:list
   *
   * Special case if filter is array, then system will call event data-source:dff::list/0 and data-source:dff::list/* and not default one.
   * But if data-source:dff::list filter object is changed normal call is triggered. that allows you to reset data on load.
   *
   * Every event also contains time of load trigger and filter hash, so you have option to discard old data.
   */
  dataSource?: string;

  /**
   * JSF definition for widget.
   */
  definition: JsfDefinition | JsfPropRef;
}

