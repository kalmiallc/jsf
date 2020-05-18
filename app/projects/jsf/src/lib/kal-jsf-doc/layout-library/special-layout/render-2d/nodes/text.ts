import { Node }                                                 from './abstract/node';
import { NodeProperty, NodePropertyGetter, NodePropertySetter } from './abstract/node-decorators';
import { deg2rad, rad2deg }                                     from '../helpers/math';
import Color                                                    from 'color';

export class Text extends Node<PIXI.Text> {

  @NodeProperty()
  public name: string;

  @NodeProperty()
  public text: string;

  @NodeProperty()
  public visible: boolean;

  @NodeProperty()
  public x: number;

  @NodeProperty()
  public y: number;

  @NodeProperty()
  public anchorX: number;

  @NodeProperty()
  public anchorY: number;

  @NodeProperty()
  public pivotX: number;

  @NodeProperty()
  public pivotY: number;

  @NodeProperty()
  public rotation: number;

  @NodeProperty()
  public color: string;

  @NodeProperty()
  public alpha: number;

  @NodeProperty()
  public align: 'left' | 'center' | 'right';

  @NodeProperty()
  public fontFamily: string;

  @NodeProperty()
  public fontSize: number | string;

  @NodeProperty()
  public fontStyle: 'normal' | 'italic' | 'oblique';

  @NodeProperty()
  public fontWeight: 'normal' | 'bold' | 'bolder' | 'lighter' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';


  protected async createDisplayObject() {
    this.displayObject = new PIXI.Text(this.text);
  }

  protected async destroyDisplayObject() {
    this.displayObject.destroy();
  }

  @NodePropertySetter('anchorX')
  setTextAnchorX() {
    this.displayObject.anchor.x = this.anchorX;
  }

  @NodePropertyGetter('anchorX')
  getTextAnchorX() {
    return this.displayObject.anchor.x;
  }

  @NodePropertySetter('anchorY')
  setTextAnchorY() {
    this.displayObject.anchor.y = this.anchorY;
  }

  @NodePropertyGetter('anchorY')
  getTextAnchorY() {
    return this.displayObject.anchor.y;
  }

  @NodePropertySetter('pivotX')
  setTextPivotX() {
    this.displayObject.pivot.x = this.pivotX;
  }

  @NodePropertyGetter('pivotX')
  getTextPivotX() {
    return this.displayObject.pivot.x;
  }

  @NodePropertySetter('pivotY')
  setTextPivotY() {
    this.displayObject.pivot.y = this.pivotY;
  }

  @NodePropertyGetter('pivotY')
  getTextPivotY() {
    return this.displayObject.pivot.y;
  }

  @NodePropertySetter('rotation')
  setTextRotation() {
    this.displayObject.rotation = deg2rad(this.rotation);
  }

  @NodePropertyGetter('rotation')
  getTextRotation() {
    return rad2deg(this.displayObject.rotation);
  }

  @NodePropertySetter('color')
  setTextColor() {
    this.displayObject.tint = Color(this.color).rgbNumber();
  }

  @NodePropertyGetter('color')
  getTextColor() {
    return Color(this.displayObject.tint).hex();
  }

  @NodePropertySetter('align')
  setTextAlign() {
    this.displayObject.style.align = this.align;
  }

  @NodePropertyGetter('align')
  getTextAlign() {
    return this.displayObject.style.align;
  }

  @NodePropertySetter('fontFamily')
  setTextFontFamily() {
    this.displayObject.style.fontFamily = this.fontFamily;
  }

  @NodePropertyGetter('fontFamily')
  getTextFontFamily() {
    return this.displayObject.style.fontFamily;
  }

  @NodePropertySetter('fontSize')
  setTextFontSize() {
    this.displayObject.style.fontSize = this.fontSize;
  }

  @NodePropertyGetter('fontSize')
  getTextFontSize() {
    return this.displayObject.style.fontSize;
  }

  @NodePropertySetter('fontStyle')
  setTextFontStyle() {
    this.displayObject.style.fontStyle = this.fontStyle;
  }

  @NodePropertyGetter('fontStyle')
  getTextFontStyle() {
    return this.displayObject.style.fontStyle;
  }

  @NodePropertySetter('fontWeight')
  setTextFontWeight() {
    this.displayObject.style.fontWeight = this.fontWeight;
  }

  @NodePropertyGetter('fontWeight')
  getTextFontWeight() {
    return this.displayObject.style.fontWeight;
  }
}
