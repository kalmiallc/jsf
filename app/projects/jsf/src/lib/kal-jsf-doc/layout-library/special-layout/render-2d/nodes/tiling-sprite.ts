import { Node }                                                 from './abstract/node';
import { NodeProperty, NodePropertyGetter, NodePropertySetter } from './abstract/node-decorators';
import { deg2rad, rad2deg }                                     from '../helpers/math';
import { TextureLoader }                                        from '../helpers/texture-loader';
import Color                                                    from 'color';

export class TilingSprite extends Node<PIXI.TilingSprite> {

  @NodeProperty()
  public name: string;

  @NodeProperty()
  public image: string;

  @NodeProperty()
  public visible: boolean;

  @NodeProperty()
  public x: number;

  @NodeProperty()
  public y: number;

  @NodeProperty(['scaleX'])
  public width: number;

  @NodeProperty(['scaleY'])
  public height: number;

  @NodeProperty(['width'])
  public scaleX: number;

  @NodeProperty(['height'])
  public scaleY: number;

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
  public tilePositionX: number;

  @NodeProperty()
  public tilePositionY: number;

  @NodeProperty()
  public tileScaleX: number;

  @NodeProperty()
  public tileScaleY: number;


  private _textureLoader: TextureLoader;
  private _texture: PIXI.Texture;

  protected async createDisplayObject() {
    this._texture      = await this._textureLoader.loadTexture(this.image);
    this.displayObject = new PIXI.TilingSprite(this._texture, this._texture.width, this._texture.height);
  }

  protected async destroyDisplayObject() {
    this.displayObject.destroy();
  }

  protected onNodeCreated() {
    super.onNodeCreated();
    this._textureLoader = new TextureLoader(this.renderer);
  }

  @NodePropertySetter('image')
  setTilingSpriteImage(oldValue?: any) {
    // Note that pixi.js will cache the textures for us, so don't call `destroy()` on it because you will break the reference
    // and then wonder why you spent 3 hours trying to figure out why things are not working like they're supposed to
    return (async () => {
      this._texture              = await this._textureLoader.loadTexture(this.image);
      this.displayObject.texture = this._texture;
    })();
  }

  @NodePropertyGetter('image')
  getTilingSpriteImage() {
    const resource = this._texture.baseTexture.resource as PIXI.resources.ImageResource;
    return resource && resource.url;
  }

  @NodePropertySetter('scaleX')
  setTilingSpriteScaleX() {
    this.displayObject.scale.x = this.scaleX;
  }

  @NodePropertyGetter('scaleX')
  getTilingSpriteScaleX() {
    return this.displayObject.scale.x;
  }

  @NodePropertySetter('scaleY')
  setTilingSpriteScaleY() {
    this.displayObject.scale.y = this.scaleY;
  }

  @NodePropertyGetter('scaleY')
  getTilingSpriteScaleY() {
    return this.displayObject.scale.y;
  }

  @NodePropertySetter('anchorX')
  setTilingSpriteAnchorX() {
    this.displayObject.anchor.x = this.anchorX;
  }

  @NodePropertyGetter('anchorX')
  getTilingSpriteAnchorX() {
    return this.displayObject.anchor.x;
  }

  @NodePropertySetter('anchorY')
  setTilingSpriteAnchorY() {
    this.displayObject.anchor.y = this.anchorY;
  }

  @NodePropertyGetter('anchorY')
  getTilingSpriteAnchorY() {
    return this.displayObject.anchor.y;
  }

  @NodePropertySetter('pivotX')
  setTilingSpritePivotX() {
    this.displayObject.pivot.x = this.pivotX;
  }

  @NodePropertyGetter('pivotX')
  getTilingSpritePivotX() {
    return this.displayObject.pivot.x;
  }

  @NodePropertySetter('pivotY')
  setTilingSpritePivotY() {
    this.displayObject.pivot.y = this.pivotY;
  }

  @NodePropertyGetter('pivotY')
  getTilingSpritePivotY() {
    return this.displayObject.pivot.y;
  }

  @NodePropertySetter('rotation')
  setTilingSpriteRotation() {
    this.displayObject.rotation = deg2rad(this.rotation);
  }

  @NodePropertyGetter('rotation')
  getTilingSpriteRotation() {
    return rad2deg(this.displayObject.rotation);
  }

  @NodePropertySetter('color')
  setTilingSpriteColor() {
    this.displayObject.tint = Color(this.color).rgbNumber();
  }

  @NodePropertyGetter('color')
  getTilingSpriteColor() {
    return Color(this.displayObject.tint).hex();
  }

  @NodePropertySetter('tilePositionX')
  setTilingSpriteTilePositionX() {
    this.displayObject.tilePosition.x = this.tilePositionX;
  }

  @NodePropertyGetter('tilePositionX')
  getTilingSpriteTilePositionX() {
    return this.displayObject.tilePosition.x;
  }

  @NodePropertySetter('tilePositionY')
  setTilingSpriteTilePositionY() {
    this.displayObject.tilePosition.y = this.tilePositionY;
  }

  @NodePropertyGetter('tilePositionY')
  getTilingSpriteTilePositionY() {
    return this.displayObject.tilePosition.y;
  }

  @NodePropertySetter('tileScaleX')
  setTilingSpriteTileScaleX() {
    this.displayObject.tileScale.x = this.tileScaleX;
  }

  @NodePropertyGetter('tileScaleX')
  getTilingSpriteTileScaleX() {
    return this.displayObject.tileScale.x;
  }

  @NodePropertySetter('tileScaleY')
  setTilingSpriteTileScaleY() {
    this.displayObject.tileScale.y = this.tileScaleY;
  }

  @NodePropertyGetter('tileScaleY')
  getTilingSpriteTileScaleY() {
    return this.displayObject.tileScale.y;
  }

}
