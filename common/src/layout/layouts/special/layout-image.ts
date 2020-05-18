import { JsfAbstractSpecialLayout }       from '../../abstract/abstract-layout';
import { DefLayout, DefProp, DefExtends, DefCategory } from '../../../jsf-for-jsf/decorators';

@DefLayout({
  type : 'div',
  items: [
    {
      type: 'div',
      htmlClass: 'ml-2 mt-3',
      items: [
        {
          type: 'heading',
          title: 'Source',
          level: 5
        },
        {
          key: 'src.$eval'
        },
        {
          key: 'src.dependencies'
        }        
      ]
    },
    {
      key: 'width'
    },
    {
      key: 'height'
    },
  ]
})
@DefExtends('JsfAbstractSpecialLayout')
@DefCategory('Layout')
export class JsfLayoutImage extends JsfAbstractSpecialLayout<'image'> {

  @DefProp([
    
    {
      type      : 'object',
      title     : 'Source',
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
      type : 'string',
      title: 'Source',
    }
  ])
  src: string | {
    $eval: string,
    dependencies?: string[]
  };

  @DefProp({
    type : 'string',
    title: 'Width',
  })
  width?: string;

  @DefProp({
    type : 'string',
    title: 'Height',
  })
  height?: string;

  /**
   * If set to true the image tag will be replaced with a div with background image set.
   * In this case the width and height are required, otherwise you will not see anything displayed.
   */
  displayAsBackgroundImage?: boolean;

  constructor(data: JsfLayoutImage) {
    super();
    Object.assign(this, data);
  }
}

