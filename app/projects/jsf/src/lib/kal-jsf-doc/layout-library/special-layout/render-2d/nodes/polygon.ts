import { Node }                                                 from './abstract/node';
import { NodeProperty, NodePropertyGetter, NodePropertySetter } from './abstract/node-decorators';
import { deg2rad, rad2deg }                                     from '../helpers/math';
import { TextureLoader }                                        from '../helpers/texture-loader';
import { isNil }                                                from 'lodash';
import Color                                                    from 'color';

export class Polygon extends Node<PIXI.Container> {

  @NodeProperty()
  public name: string;

  @NodeProperty()
  public visible: boolean;

  @NodeProperty()
  public x: number;

  @NodeProperty()
  public y: number;

  @NodeProperty()
  public points: number[][];

  @NodeProperty()
  public autoClosePath: boolean;

  @NodeProperty()
  public scaleX: number;

  @NodeProperty()
  public scaleY: number;

  @NodeProperty()
  public pivotX: number;

  @NodeProperty()
  public pivotY: number;

  @NodeProperty()
  public rotation: number;

  @NodeProperty()
  public lineWidth: number;

  @NodeProperty()
  public lineColor: string;

  @NodeProperty()
  public lineImage: string;

  @NodeProperty()
  public lineAlpha: number;

  @NodeProperty()
  public lineAlignment: number;

  @NodeProperty()
  public fillColor: string;

  @NodeProperty()
  public fillImage: string;

  @NodeProperty()
  public fillAlpha: number;

  @NodeProperty()
  public fillScaleX: number;

  @NodeProperty()
  public fillScaleY: number;

  @NodeProperty()
  public fillPositionX: number;

  @NodeProperty()
  public fillPositionY: number;

  @NodeProperty()
  public alpha: number;


  private _textureLoader: TextureLoader;
  private _fillTexture: PIXI.Texture;
  private _lineTexture: PIXI.Texture;
  private _graphics: PIXI.Graphics;

  protected async createDisplayObject() {
    this._graphics     = new PIXI.Graphics();
    this.displayObject = this._graphics;
  }

  protected async destroyDisplayObject() {
    this.displayObject.destroy();
  }

  protected onNodeCreated() {
    super.onNodeCreated();
    this._textureLoader = new TextureLoader(this.renderer);
  }

  private drawPolygon() {
    this._graphics.clear();

    let isFill = false;
    let isPath = false;

    // Begin fill
    const fillImage  = !isNil(this.fillImage) ? this._fillTexture : null;
    const fillColor  = !isNil(this.fillColor) ? Color(this.fillColor).rgbNumber() : null;
    const fillAlpha  = !isNil(this.fillAlpha) ? this.fillAlpha : 1.0;
    const fillScaleX = !isNil(this.fillScaleX) ? this.fillScaleX : 1.0;
    const fillScaleY = !isNil(this.fillScaleY) ? this.fillScaleY : 1.0;
    const fillPositionX = !isNil(this.fillPositionX) ? this.fillPositionX : 0.0;
    const fillPositionY = !isNil(this.fillPositionY) ? this.fillPositionY : 0.0;

    if (!isNil(fillImage)) {
      const transformMatrix = new PIXI.Matrix(
        // X scale | X skew | Y skew
        fillScaleX, 0, 0,
        // Y scale | X translation | Y translation
        fillScaleY, fillPositionX, fillPositionY
      );

      this._graphics.beginTextureFill({
        texture: fillImage,
        color  : fillColor,
        alpha  : fillAlpha,
        matrix : transformMatrix
      });

      isFill = true;
    } else if (!isNil(fillColor)) {
      this._graphics.beginFill(fillColor, fillAlpha);

      isFill = true;
    }

    // Begin line style
    const lineWidth     = !isNil(this.lineWidth) ? this.lineWidth : 0.0;
    const lineColor     = !isNil(this.lineColor) ? Color(this.lineColor).rgbNumber() : 0x00; // Black
    const lineImage     = !isNil(this.lineImage) ? this._lineTexture : null;
    const lineAlpha     = !isNil(this.lineAlpha) ? this.lineAlpha : 1.0;
    const lineAlignment = !isNil(this.lineAlignment) ? this.lineAlignment : 0.5;

    if (!isNil(lineImage)) {
      this._graphics.lineTextureStyle({
        width    : lineWidth,
        texture  : lineImage,
        color    : lineColor,
        alpha    : lineAlpha,
        alignment: lineAlignment
      });
    } else {
      this._graphics.lineStyle(lineWidth, lineColor, lineAlpha, lineAlignment);
    }


    // Draw points
    if (this.points && this.points.length) {
      isPath = true;

      for (let i = 0; i < this.points.length; i++) {
        const point = this.points[i];

        if (i === 0) {
          this._graphics.moveTo(point[0], point[1]);
        } else {
          this._graphics.lineTo(point[0], point[1]);
        }
      }
    }

    // Close path
    if (isPath && this.autoClosePath) {
      this._graphics.closePath();
    }

    // End fill
    if (isFill) {
      this._graphics.endFill();
    }
  }

  @NodePropertySetter('points')
  setPolygonPoints() {
    if (!this.points) {
      console.warn('No points provided for polygon');
    }
    this.drawPolygon();
  }

  @NodePropertyGetter('points')
  getPolygonPoints() {
    return this.points;
  }

  @NodePropertySetter('autoClosePath')
  setPolygonAutoClosePath() {
    this.drawPolygon();
  }

  @NodePropertyGetter('autoClosePath')
  getPolygonAutoClosePath() {
    return !isNil(this.autoClosePath) ? this.autoClosePath : true;
  }

  @NodePropertySetter('scaleX')
  setPolygonScaleX() {
    this.displayObject.scale.x = this.scaleX;
  }

  @NodePropertyGetter('scaleX')
  getPolygonScaleX() {
    return this.displayObject.scale.x;
  }

  @NodePropertySetter('scaleY')
  setPolygonScaleY() {
    this.displayObject.scale.y = this.scaleY;
  }

  @NodePropertyGetter('scaleY')
  getPolygonScaleY() {
    return this.displayObject.scale.y;
  }

  @NodePropertySetter('pivotX')
  setPolygonPivotX() {
    this.displayObject.pivot.x = this.pivotX;
  }

  @NodePropertyGetter('pivotX')
  getPolygonPivotX() {
    return this.displayObject.pivot.x;
  }

  @NodePropertySetter('pivotY')
  setPolygonPivotY() {
    this.displayObject.pivot.y = this.pivotY;
  }

  @NodePropertyGetter('pivotY')
  getPolygonPivotY() {
    return this.displayObject.pivot.y;
  }

  @NodePropertySetter('rotation')
  setPolygonRotation() {
    this.displayObject.rotation = deg2rad(this.rotation);
  }

  @NodePropertyGetter('rotation')
  getPolygonRotation() {
    return rad2deg(this.displayObject.rotation);
  }

  @NodePropertySetter('lineWidth')
  setPolygonLineWidth() {
    this.drawPolygon();
  }

  @NodePropertyGetter('lineWidth')
  getPolygonLineWidth() {
    return this.lineWidth;
  }

  @NodePropertySetter('lineColor')
  setPolygonLineColor() {
    this.drawPolygon();
  }

  @NodePropertyGetter('lineColor')
  getPolygonLineColor() {
    return this.lineColor;
  }

  @NodePropertySetter('lineImage')
  setPolygonLineImage() {
    return (async () => {
      this._lineTexture = await this._textureLoader.loadTexture(this.lineImage);
      this.drawPolygon();
    })();
  }

  @NodePropertyGetter('lineImage')
  getPolygonLineImage() {
    return this.lineImage;
  }

  @NodePropertySetter('lineAlpha')
  setPolygonLineAlpha() {
    this.drawPolygon();
  }

  @NodePropertyGetter('lineAlpha')
  getPolygonLineAlpha() {
    return this.lineAlpha;
  }

  @NodePropertySetter('lineAlignment')
  setPolygonLineAlignment() {
    this.drawPolygon();
  }

  @NodePropertyGetter('lineAlignment')
  getPolygonLineAlignment() {
    return this.lineAlignment;
  }

  @NodePropertySetter('fillColor')
  setPolygonFillColor() {
    this.drawPolygon();
  }

  @NodePropertyGetter('fillColor')
  getPolygonFillColor() {
    return this.fillColor;
  }

  @NodePropertySetter('fillImage')
  setPolygonFillImage() {
    return (async () => {
      this._fillTexture = await this._textureLoader.loadTexture(this.fillImage);
      this.drawPolygon();
    })();
  }

  @NodePropertyGetter('fillImage')
  getPolygonFillImage() {
    return this.fillImage;
  }

  @NodePropertySetter('fillAlpha')
  setPolygonFillAlpha() {
    this.drawPolygon();
  }

  @NodePropertyGetter('fillAlpha')
  getPolygonFillAlpha() {
    return this.fillAlpha;
  }

  @NodePropertySetter('fillScaleX')
  setPolygonFillScaleX() {
    this.drawPolygon();
  }

  @NodePropertyGetter('fillScaleX')
  getPolygonFillScaleX() {
    return this.fillScaleX;
  }

  @NodePropertySetter('fillScaleY')
  setPolygonFillScaleY() {
    this.drawPolygon();
  }

  @NodePropertyGetter('fillScaleY')
  getPolygonFillScaleY() {
    return this.fillScaleY;
  }

  @NodePropertySetter('fillPositionX')
  setPolygonFillPositionX() {
    this.drawPolygon();
  }

  @NodePropertyGetter('fillPositionX')
  getPolygonFillPositionX() {
    return this.fillPositionX;
  }

  @NodePropertySetter('fillPositionY')
  setPolygonFillPositionY() {
    this.drawPolygon();
  }

  @NodePropertyGetter('fillPositionY')
  getPolygonFillPositionY() {
    return this.fillPositionY;
  }
}
