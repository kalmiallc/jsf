import { JsfAbstractItemsLayout }         from '../../abstract/abstract-layout';
import { DefLayout, DefProp, DefExtends, DefCategory } from '../../../jsf-for-jsf/decorators';
import { JsfUnknownLayout } from '../../index';

@DefLayout({
  type : 'div',
  items: [
    {
      key: 'title'
    },
    {
      key: 'linearValidationProps'
    },
    {
      key: 'optional'
    },
    {
      key: 'editable'
    }
  ]
})

@DefExtends('JsfAbstractItemsLayout')
@DefCategory('Layout')
export class JsfLayoutStep extends JsfAbstractItemsLayout<'step'> {
  @DefProp('JsfUnknownLayout[]')
  items: JsfUnknownLayout[];
  
  @DefProp({
    type : 'string',
    title: 'Title',
  })
  title?: string;

  @DefProp({
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
      }
    }
  })
  templateData?: {
    $eval: string,
    dependencies?: string[]
  };

  /**
   * Array of prop paths which will be checked to determine if this step is valid
   * @deprecated This is now done automatically
   */
  @DefProp({
    type : 'array',
    title: 'Linear validation props',
    items: [
      {
        type: 'string'
      }
    ]
  })
  linearValidationProps?: string[];

  @DefProp({
    type : 'boolean',
    title: 'Optional',
  })
  optional?: boolean;

  @DefProp({
    type : 'boolean',
    title: 'Editable',
  })
  editable?: boolean;

  @DefProp('JsfLayoutStepPreferences')
  preferences?: JsfLayoutStepPreferences;

  constructor(data: JsfLayoutStep) {
    super();
    Object.assign(this, data);
  }
}

export interface JsfLayoutStepPreferences {
}
