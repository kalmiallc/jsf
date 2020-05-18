import { Renderer } from '../renderer';

export class TextureLoader {

  constructor(private renderer: Renderer) {
  }

  public async loadTexture(image: string): Promise<PIXI.Texture> {
    if (!image) {
      return PIXI.Texture.EMPTY;
    }

    if (image.startsWith('http://') || image.startsWith('https://')) {
      // Directly load from url
      const resource = await this.renderer.resourceLoader.loadResource(image, image);
      return resource.data.texture;

    } else if (image.indexOf('/') > -1) {
      // Sprite sheet
      const tokens = image.split('/');
      if (tokens.length !== 2) {
        throw new Error(`Invalid image name format '${ image }'`);
      }

      const resourceName = tokens[0];
      const spriteName   = tokens[1];

      const resourceDef = this.renderer.resourceLoader.getResourceDefinition(resourceName);
      const resource    = await this.renderer.resourceLoader.loadResource(resourceName, resourceDef);

      if (!resource.data.textures) {
        throw new Error(`Specified image is not a spritesheet?`);
      }
      if (!resource.data.textures[spriteName]) {
        throw new Error(`Sprite '${ spriteName }' not found in sprite sheet`);
      }

      return resource.data.textures[spriteName];
    } else {
      // Named sprite
      const resourceDef = this.renderer.resourceLoader.getResourceDefinition(image);
      const resource    = await this.renderer.resourceLoader.loadResource(image, resourceDef);

      return resource.data.texture;
    }
  }

}
