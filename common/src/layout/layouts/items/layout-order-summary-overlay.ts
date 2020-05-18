import { JsfAbstractItemsLayout }         from '../../abstract/abstract-layout';
import { DefLayout, DefProp, DefExtends, DefCategory } from '../../../jsf-for-jsf/decorators';
import { JsfLayoutOrderSummary } from './layout-order-summary';

@DefLayout({
  type : 'div',
  items: [
    {
      key: 'floatModeChangeBreakpoint'
    },
    {
      key: 'floatHorizontalAlign'
    },
    {
      key: 'staticHorizontalAlign'
    },
    {
      type: 'div',
      htmlClass: 'ml-2 mt-3',
      items: [
        {
          type: 'heading',
          title: 'Column size',
          level: 5
        },
        {
          key: 'columnSize.xs'
        },
        {
          key: 'columnSize.sm'
        },
        {
          key: 'columnSize.md'
        },
        {
          key: 'columnSize.lg'
        },
        {
          key: 'columnSize.xl'
        }
      ]
    }
    

  ]
})
@DefExtends('JsfAbstractItemsLayout')
@DefCategory('Layout')
export class JsfLayoutOrderSummaryOverlay extends JsfAbstractItemsLayout<'order-summary-overlay'> {
  @DefProp('JsfLayoutOrderSummary[]')
  items: JsfLayoutOrderSummary[];
  /**
   * The screen size at which the mode changes from static to floating.
   */
  @DefProp({
    type       : 'string',
    title      : 'Float mode change breakpoint',
    description: 'Choose xs, sm, md, lg or xl'
  })
  floatModeChangeBreakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Horizontal alignment.
   */
  @DefProp({
    type       : 'string',
    title      : 'Float horizontal align',
    description: 'Choose start, center or end'
  })
  floatHorizontalAlign?: 'start' | 'center' | 'end';

  fullHeight?: boolean;

  @DefProp({
    type       : 'string',
    title      : 'Static horizontal align',
    description: 'Choose start, center or end'
  })
  staticHorizontalAlign?: 'start' | 'center' | 'end';
  /**
   * Column sizes at different breakpoints.
   */

  @DefProp([
    {
      type      : 'object',
      title     : 'Column size',
      properties: {
        xs: {
          type : 'number',
          title: 'Column size extra small '
        },
        sm: {
          type : 'number',
          title: 'Column size small'
        },
        md: {
          type : 'number',
          title: 'Column size medium'
        },
        lg: {
          type : 'number',
          title: 'Column size large'
        },
        xl: {
          type : 'number',
          title: 'Column size extra large'
        }

      }
    },
    {
      type      : 'object',
      title     : 'Column size',
      properties: {
        xs: {
          type       : 'string',
          title      : 'Extra small column size',
          description: 'Choose auto or content'
        },
        sm: {
          type       : 'string',
          title      : 'Small column size',
          description: 'Choose auto or content'
        },
        md: {
          type       : 'string',
          title      : 'Medium column size',
          description: 'Choose auto or content'
        },
        lg: {
          type       : 'string',
          title      : 'Large column size',
          description: 'Choose auto or content'
        },
        xl: {
          type       : 'string',
          title      : 'Extra large column size',
          description: 'Choose auto or content'
        }

      }
    }
  ])
  columnSize?: {
    xs?: number | 'auto' | 'content';
    sm?: number | 'auto' | 'content';
    md?: number | 'auto' | 'content';
    lg?: number | 'auto' | 'content';
    xl?: number | 'auto' | 'content';
  };

  constructor(data: JsfLayoutOrderSummaryOverlay) {
    super();
    Object.assign(this, data);
  }
}
