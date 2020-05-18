import { JsfAbstractItemsLayout }         from '../../abstract/abstract-layout';
import { DefExtends, DefLayout, DefProp, DefCategory } from '../../../jsf-for-jsf/decorators';
import { JsfUnknownLayout } from '../../index';

@DefLayout({
  type : 'div',
  items: [
    {
      key: 'xs'
    },
    {
      key: 'sm'
    },
    {
      key: 'md'
    },
    {
      key: 'lg'
    },
    {
      key: 'xl'
    },
    {
      type: 'div',
      htmlClass: 'ml-2 mt-3',
      items: [
        {
          type: 'heading',
          title: 'Offset',
          level: 5
        },
        {
          key: 'offset.xs'
        },
        {
          key: 'offset.sm'
        },
        {
          key: 'offset.md'
        },
        {
          key: 'offset.lg'
        },
        {
          key: 'offset.xl'
        }
      ]
    },
    {
      type: 'div',
      htmlClass: 'ml-2 mt-3',
      items: [
        {
          type: 'heading',
          title: 'Order',
          level: 5
        },
        {
          key: 'order.xs'
        },
        {
          key: 'order.sm'
        },
        {
          key: 'order.md'
        },
        {
          key: 'order.lg'
        },
        {
          key: 'order.xl'
        }
      ]
    },    
    {
      key: 'verticalAlign'
    }
  ]
})
@DefExtends('JsfAbstractItemsLayout')
@DefCategory('Layout')
export class JsfLayoutCol extends JsfAbstractItemsLayout<'col'> {
  @DefProp('JsfUnknownLayout[]')
  items: JsfUnknownLayout[];
  /**
   * Column widths.
   */
  @DefProp([
    {
      type : 'number',
      title: 'Width extra small'
    },
    {
      type       : 'string',
      title      : 'Width extra small',
      description: 'Choose auto or content'
    }
  ])
  xs?: number | 'auto' | 'content' | 'none';

  @DefProp([
    {
      type : 'number',
      title: 'Width small'
    },
    {
      type       : 'string',
      title      : 'Width small',
      description: 'Choose auto or content'
    }
  ])
  sm?: number | 'auto' | 'content' | 'none';

  @DefProp([
    {
      type : 'number',
      title: 'Width medium'
    },
    {
      type       : 'string',
      title      : 'Width medium',
      description: 'Choose auto or content'
    }
  ])
  md?: number | 'auto' | 'content' | 'none';

  @DefProp([
    {
      type : 'number',
      title: 'Width large'
    },
    {
      type       : 'string',
      title      : 'Width large',
      description: 'Choose auto or content'
    }
  ])
  lg?: number | 'auto' | 'content' | 'none';

  @DefProp([
    {
      type : 'number',
      title: 'Width extra large'
    },
    {
      type       : 'string',
      title      : 'Width extra large',
      description: 'Choose auto or content'
    }
  ])
  xl?: number | 'auto' | 'content' | 'none';

  /**
   * Column offsets.
   */

  @DefProp({
    type      : 'object',
    title     : 'Offset',
    properties: {
      xs: {
        type : 'number',
        title: 'Offset extra small'
      },
      sm: {
        type : 'number',
        title: 'Offset small'
      },
      md: {
        type : 'number',
        title: 'Offset medium'
      },
      lg: {
        type : 'number',
        title: 'Offset large'
      },
      xl: {
        type : 'number',
        title: 'Offset extra large'
      }
    }
  })
  offset: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };

  /**
   * Visual order in row.
   */
  @DefProp([
    {
      type      : 'object',
      title     : 'Order',
      properties: {
        xs: {
          type : 'number',
          title: 'Order extra small'
        },
        sm: {
          type : 'number',
          title: 'Order small'
        },
        md: {
          type : 'number',
          title: 'Order medium'
        },
        lg: {
          type : 'number',
          title: 'Order large'
        },
        xl: {
          type : 'number',
          title: 'Order extra large'
        }
      }
    },
    {
      type       : 'string',
      title      : 'Order',
      description: 'Choose first or last'
    }
  ])
  order?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  } | 'first' | 'last';

  /**
   * Vertical alignment for self.
   */
  @DefProp({
    type       : 'string',
    title      : 'Vertical align',
    description: 'Choose start, center or end'
  })
  verticalAlign: 'start' | 'center' | 'end';


  constructor(data: JsfLayoutCol) {
    super();
    Object.assign(this, data);
  }
}
