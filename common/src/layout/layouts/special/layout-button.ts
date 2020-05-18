import { JsfAbstractSpecialLayout }       from '../../abstract/abstract-layout';
import { DefLayout, DefProp, DefExtends, DefCategory } from '../../../jsf-for-jsf/decorators';

@DefLayout({
  type : 'div',
  items: [
    {
      key: 'title'
    },
    {
      key: 'icon'
    },
    {
      key: 'submit'
    },
    {
      key: 'scrollToTop'
    },
    {
      type: 'div',
      htmlClass: 'ml-2 mt-3',
      items: [
        {
          type: 'heading',
          title: 'Disabled',
          level: 5
        },
        {
          key: 'disabled.$eval'
        },
        {
          key: 'disabled.dependencies'
        }        
      ]
    }
  ]
})
@DefExtends('JsfAbstractSpecialLayout')
@DefCategory('Buttons & Indicators')
export class JsfLayoutButton extends JsfAbstractSpecialLayout<'button'> {

  @DefProp({
    type : 'string',
    title: 'Title'
  })
  title?: string;

  @DefProp({
    type      : 'object',
    title     : 'Title template data',
    properties: {
      $eval       : {
        type : 'string',
        title: 'Eval'
      },
      dependencies: {
        type : 'array',
        title: 'Dependencies',
        items: [
          {
            type: 'string'
          }
        ]
      },
    }
  })
  titleTemplateData?: {
    $eval: string;
    dependencies?: string[];
  };

  @DefProp({
    type : 'string',
    title: 'Icon'
  })
  icon?: string;

  /**
   * @deprecated Use onClick `submit` option instead.
   */
  @DefProp({
    type : 'boolean',
    title: 'Submit'
  })
  submit?: boolean;

  @DefProp({
    type : 'boolean',
    title: 'Scroll to top'
  })
  scrollToTop?: boolean;

  @DefProp([
    {
      type      : 'object',
      title     : 'Disabled',
      properties: {
        $eval       : {
          type : 'string',
          title: 'Eval'
        },
        dependencies: {
          type : 'array',
          title: 'Dependencies',
          items: [
            {
              type: 'string'
            }
          ]
        },
      }
    },
    {
      type : 'boolean',
      title: 'Disabled'
    }
  ])
  disabled?: {
    $eval: string;
    dependencies: string[];
  } | boolean;

  @DefProp('JsfLayoutButtonPreferences')
  preferences?: JsfLayoutButtonPreferences;

  constructor(data: JsfLayoutButton) {
    super();
    Object.assign(this, data);
  }
}

export interface JsfLayoutButtonPreferences {
  /**
   * Color of the selection highlight.
   * Default is 'none'.
   */
  color?: 'none' | 'primary' | 'accent';
  /**
   * Button variant.
   * Default is 'basic'.
   */
  variant: 'basic' | 'raised' | 'flat' | 'stroked' | 'icon' | 'fab' | 'mini-fab';
  /**
   * Button size.
   */
  size: 'normal' | 'large' | 'small';
  /**
   * Whether ripples are disabled.
   * Default is False.
   */
  disableRipple?: boolean;
}
