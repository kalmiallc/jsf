import { JsfStyles, JsfUnknownLayout } from '../index';
import { JsfLayoutOnClickInterface }   from '../interfaces/layout-on-click.interface';
import { DefLayout, DefProp, DefExtends }          from '../../jsf-for-jsf/decorators';

@DefLayout({
  type : 'div',
  items: [
    {
      key: '$comment'
    },
    {
      key: '$mode'
    },
    {
      key: 'htmlClass'
    },
    {
      key: 'htmlOuterClass'
    },
    {
      key: 'tooltip'
    }
  ]
})

export abstract class JsfAbstractLayout {

  /**
   * @ignore
   */
  __uuid?: string;

  /**
   * Intended for notes to schema maintainers, as opposed to "description" which is suitable for display to end users
   */
  @DefProp({
    type : 'string',
    title: 'Comment'
  })
  $comment?: string;

  /**
   * Will be rendered only if proper mode exists in doc.$modes.
   * You can use ! to negate.
   *
   * Examples:
   * - ["!new", "role-user"]
   * - "new"
   */
  @DefProp([
    {
      type : 'string',
      title: 'Mode',
    },
    {
      type : 'array',
      title: 'Mode',
      items: []
    },
    {
      type      : 'object',
      title     : 'Mode',
      properties: {
        $eval       : {
          type : 'string',
          title: 'Eval'
        },
        dependencies: {
          type : 'string',
          title: 'Dependencies',
        }
      }
    }
  ])
  $mode?: string | string[] | {

    /**
     * Return true or false, only input available is $modes (list of modes).
     * Example: `return $modes.indexOf('public') > -1 && $modes.indexOf('new') === -1`
     */
    $eval: string;
    $evalTranspiled?: string;
  };

  /**
   * ID for this layout element. Similar to HTML id selector.
   */
  @DefProp({
    type : 'string',
    title: 'ID'
  })
  id?: string;

  /**
   * Class applied on the layout router element.
   */
  @DefProp({
    type : 'string',
    title: 'HTML outer class'
  })
  htmlOuterClass?: string;
  /**
   * Class applied on the inner element.
   */
  @DefProp({
    type : 'string',
    title: 'HTML class'
  })
  htmlClass?: string;

  /** @deprecated **/
  @DefProp({
    type : 'string',
    title: 'Label HTML class'
  })
  labelHtmlClass?: string;
  /** @deprecated **/
  @DefProp({
    type : 'string',
    title: 'Field HTML class'
  })
  fieldHtmlClass?: string;

  /**
   * Styles
   * @deprecated
   */
  styles?: JsfStyles;

  /**
   * Theme preferences overrides.
   */
  preferences?: any;

  /**
   * Handler preferences overrides.
   */
  handlerPreferences?: any;


  /**
   * Eval string.
   *
   * Special props:
   * - $val
   * - $form
   * Expected output boolean.
   */
  @DefProp([
    {
      type : 'string',
      title: 'Visible if',
    },
    {
      type      : 'object',
      title     : 'Visible if',
      properties: {
        $eval             : {
          type : 'string',
          title: 'Eval'
        },
        dependencies      : {
          type : 'array',
          title: 'Dependencies',
          items: []
        },
        layoutDependencies: {
          type : 'array',
          title: 'Layout dependencies',
          items: []
        }
      }
    }
  ])
  visibleIf?: string | {
    /**ay
     * Eval function body
     */
    $eval: string;

    /**
     * Form value dependencies. You can put asterisk at the end.
     * Example:
     *  - a.b.c
     *  - a.b.c.d.f.g.h
     *  - a.d[]
     *  - a.d[].r.t[].d
     *
     *  If you need * support ask for it.
     */
    dependencies: string[];

    /**
     * Id of layout.
     */
    layoutDependencies: string[];
  };

  @DefProp({
    type      : 'object',
    title     : 'Build if',
    properties: {
      $eval       : {
        type : 'string',
        title: 'Eval'
      },
      dependencies: {
        type : 'string',
        title: 'Eval transpiled'
      },
    }
  })
  buildIf?: {
    $eval: string;

    /**
     * @ignore
     */
    $evalTranspiled?: string;
  };

  @DefProp({
    type : 'array',
    title: 'Translatable fields',
    items: []
  })
  translatableFields?: string[];

  /**
   * On click trigger. You can also specify an array of actions to run in order.
   */
  onClick?: JsfLayoutOnClickInterface | JsfLayoutOnClickInterface[];

  /**
   * Tooltip message which will be displayed on hover.
   */
  @DefProp([
    {
      type : 'string',
      title: 'Tooltip',
    },
    {
      type      : 'object',
      title     : 'Tooltip',
      properties: {
        title                  : {
          type : 'string',
          title: 'Title'
        },
        templateData           : {
          type      : 'object',
          title     : 'Template data',
          properties: {
            $eval       : {
              type : 'string',
              title: 'Eval'
            },
            dependencies: {
              type : 'array',
              title: 'Dependencies',
              items: []
            },
          }
        },
        position               : {
          type       : 'string',
          title      : 'Position',
          description: 'Choose above, below, left, right, before or after'
        },
        displayAsTitleAttribute: {
          type : 'boolean',
          title: 'Display as title attribute'
        }
      }
    }
  ])
  tooltip?: string | {
    /**
     * Tooltip text
     */
    title: string;
    /**
     * Template data for `text` property
     */
    templateData?: {
      $eval: string;
      dependencies?: string[]
    };
    /**
     * Position of the tooltip
     */
    position?: 'above' | 'below' | 'left' | 'right' | 'before' | 'after';
    /**
     * Flag indicating whether the tooltip should be displayed as the html `title` attribute
     */
    displayAsTitleAttribute: boolean;
  };


  /**
   * Analytics events to track.
   *
   * `category` is the name/description of the layout item.
   * `track` can be either names of the layout item's events, or an object containing
   * the event name you wish to track and a more user-friendly name to use when sending it
   * to the analytics vendor.
   */
  analytics?: {
    category: string;
    track: Array<string | { event: string, as: string }>
  };
}
@DefExtends('JsfAbstractLayout')
export abstract class JsfAbstractSpecialLayout<Type> extends JsfAbstractLayout {
  type: Type;
  items?: never;
  key?: never;
}

export abstract class JsfAbstractPropLayout extends JsfAbstractLayout {
  key: string;

  notitle?: boolean;
  placeholder?: string;
}

export abstract class JsfAbstractItemsLayout<Type> extends JsfAbstractLayout {
  key?: never;
  type: Type;

  @DefProp('JsfUnknownLayout[]')
  items: JsfUnknownLayout[];
}
