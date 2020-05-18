import { isJsfLayoutRender2DResourceObject, JsfLayoutRender2DResource } from '@kalmia/jsf-common-es2015';
import { Renderer }                                                     from '../renderer';

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    // tslint:disable-next-line:no-bitwise
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export interface ResourceLoaderOptionsInterface {
  uploadDynamicTexturesToGPU?: boolean;
}

export abstract class ResourceLoaderInstance {

  private static instances: { [instanceKey: string]: ResourceLoader } = {};

  public static getInstance(renderer: Renderer, instanceKey?: string, options: ResourceLoaderOptionsInterface = {}): ResourceLoader {
    if (!instanceKey) {
      instanceKey = uuidv4();
    }
    const instanceName = `__render2d-resourceLoaderInstance-${ instanceKey }`;

    return ResourceLoaderInstance.instances[instanceName] = (ResourceLoaderInstance.instances[instanceName] || new ResourceLoader(renderer, options));
  }

}

export class ResourceLoader {

  private loaderPromiseStack                                         = [];
  private loadedResourceCache: { [name: string]: Promise<Resource> } = {};

  private _resources: { [resourceName: string]: Resource } = {};

  constructor(private renderer: Renderer,
              private options: ResourceLoaderOptionsInterface = {}) {
    this.options = {
      uploadDynamicTexturesToGPU: false,

      ...options
    };
  }

  public registerResources(resources: { [resourceName: string]: string | JsfLayoutRender2DResource }) {
    for (const resourceKey of Object.keys(resources)) {
      const r                      = resources[resourceKey];
      this._resources[resourceKey] = this.toResource(r, false);
    }
  }

  public getResourceDefinition(name: string): Resource {
    if (!this._resources[name]) {
      throw new Error(`Resource '${ name }' not found`);
    }
    return this._resources[name];
  }

  public async preload() {
    const resourceLoadPromises = [];
    const delayedLoadQueue     = [];

    for (const resourceKey of Object.keys(this._resources)) {
      const r = this._resources[resourceKey];
      if (r.definition.preload) {
        resourceLoadPromises.push(this.loadResource(resourceKey, r));
      } else {
        delayedLoadQueue.push({
          resourceKey,
          r
        });
      }
    }

    await Promise.all(resourceLoadPromises);

    // After all the preload resources have loaded start the delayed load of the rest of the resources.
    if (!this.renderer.options.headless) {
      for (const delayedResource of delayedLoadQueue) {
        this.loadResource(delayedResource.resourceKey, delayedResource.r)
          .catch(e => {
            console.error(e);
            throw e;
          });
      }
    }
  }

  public async loadResource(name: string, resource: string | JsfLayoutRender2DResource | Resource): Promise<Resource> {
    if (!name) {
      throw new Error(`No resource name provided`);
    }

    if (!(name.startsWith('http://') || name.startsWith('https://')) && name.indexOf('/') > -1) {
      throw new Error(`Resource name cannot contain '/' character`);
    }

    const r = this.toResource(resource);

    if (this.loadedResourceCache[name]) {
      return this.loadedResourceCache[name];
    }

    const loaderPromise = new Promise<Resource>((resolve) => {
      const loader = new PIXI.Loader();

      loader.add(r.definition.url)
        .pre(addNoCacheParameter)
        .load((_loader, resources) => {
          if (!r.dynamic || (r.dynamic && this.options.uploadDynamicTexturesToGPU)) {
            // Upload texture to GPU.
            // console.log('[RL] Uploading to GPU', name, r.definition.url);

            /* The issue with running our own instance of the plugin is that there will be no throttling done and the page will run slowly.
             const preparePlugin = this.renderer.application.renderer.type === PIXI.RENDERER_TYPE.WEBGL
             ? new PIXI.prepare.Prepare(this.renderer.application.renderer as PIXI.Renderer)
             : new PIXI.prepare.CanvasPrepare(this.renderer.application.renderer as PIXI.CanvasRenderer);
             */

            // preparePlugin.upload(resources[r.definition.url].texture, () => {
            this.renderer.application.renderer.plugins.prepare.upload(resources[r.definition.url].texture, () => {
              // console.log('[RL] Done', name, r.definition.url);
              resolve({
                ...r,
                data: resources[r.definition.url]
              });
            });

          } else {
            // Resolve without upload.
            resolve({
              ...r,
              data: resources[r.definition.url]
            });
          }
        });
    });

    this.loadedResourceCache[name] = loaderPromise;
    this.loaderPromiseStack.push(loaderPromise);

    return loaderPromise;
  }

  /**
   * Resolves when there are no more resources to be loaded since the last call to this method.
   */
  public async allResourcesLoaded() {
    const stack             = Array.from(this.loaderPromiseStack);
    this.loaderPromiseStack = [];

    return Promise.all(stack)
      .then(x => {
        if (this.loaderPromiseStack.length) {
          return this.allResourcesLoaded();
        }
      });
  }

  /**
   * Returns true if pending stack is not empty.
   */
  public hasPendingResources() {
    return !!this.loaderPromiseStack.length;
  }

  private toResource(resource: string | JsfLayoutRender2DResource | Resource, dynamic = true): Resource {
    // Check if already resource
    if (isResource(resource)) {
      return resource;
    }

    const r: Resource = {
      definition: {
        type   : 'sprite',
        preload: true
      },
      data      : null,
      dynamic
    };

    if (isJsfLayoutRender2DResourceObject(resource)) {
      r.definition = {
        ...r.definition,
        ...(resource as any)
      };
    } else {
      r.definition = {
        ...r.definition,
        url: resource
      };
    }

    return r;
  }
}

export interface Resource {
  definition: JsfLayoutRender2DResource;
  data: any;
  dynamic?: boolean; // Not defined in the resources array but instead used directly from an url.
}

function isResource(x: any): x is Resource {
  return typeof x === 'object' && 'definition' in x && 'data' in x;
}

function addNoCacheParameter(resource, next) {
  // Add a query parameter based on current time to force invalidate the cache for the file.
  // const timestamp = new Date().getTime();
  // resource.url    = `${ resource.url }?X-Cache-Invalidate=${ timestamp }`;
  resource.url = `${ resource.url }?X-Cache-Invalidate=Render2D`;

  next();
}
