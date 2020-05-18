import { JsfDefinition } from './jsf-definition';
import { JsfWidget }     from './jsf-widget';

export class JsfDashboard {

  externalDefinitions?: { [widgetKey: string]: JsfDefinition };

  widgets: { [widgetKey: string]: JsfWidget };

  layout: {
    type: 'grid',
    items:
      {
        type: 'grid-cell',
        cols?: number,
        rows?: number,
        x?: number,
        y?: number,
        items: [{
          type: 'widget'
          key: string
        }]
      }[]
  }
}
