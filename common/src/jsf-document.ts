import { JsfPropJsonValue } from './schema/index';
import { JsfDefinition }    from './jsf-definition';

export class JsfDocument extends JsfDefinition {
  /**
   * Object to populate the form with default or previously submitted values.
   */
  value?: JsfPropJsonValue;
}
