import { ConsumeProviderValueOptionsInterface, JsfBuilder, JsfPropBuilderObject } from '../builder';
import {
  isJsfProviderSourceApi,
  isJsfProviderSourceEntity, isJsfProviderSourceEval,
  isJsfProviderSourceVirtualEvent,
  JsfProviderDffEventInterface,
  JsfProviderInterface
} from './interfaces/jsf-provider.interface';
import { isEqual }                                                                from 'lodash';
import { JsfProviderOptionsInterface }                                            from './interfaces/jsf-provider-options.interface';

export class JsfProvider {

  /**
   * Caches requests based on input data.
   */
  private requestQueue: {
    data: any,
    promise: any
  }[] = [];

  /**
   * Caches responses based on input data.
   */
  private responseCache: {
    data: any,
    response: any
  }[] = [];

  private cacheEnabled: boolean;

  constructor(private builder: JsfBuilder,
              private provider: JsfProviderInterface) {

    // Cache will default to true if no option was provided by the user.
    this.cacheEnabled = this.provider.cache !== void 0 ? !!this.provider.cache : true;
  }

  /**
   * Provide data.
   */
  public async provide(options: JsfProviderOptionsInterface): Promise<any> {
    if (!options.consumer) {
      throw new Error(`No consumer provided.`);
    }

    let providerRequestData = null;
    if (options.providerRequestData) {
      const ctx           = this.builder.getEvalContext({
        propBuilder: options.propBuilder
      });
      providerRequestData = this.builder.runEvalWithContext(
        (options.providerRequestData as any).$evalTranspiled || options.providerRequestData.$eval,
        ctx);
    }


    if (isJsfProviderSourceEntity(this.provider.source)) {
      // Provider type => Entity.
      if (!options.propBuilder) {
        throw new Error(`Provider with 'entity' source must be attached to a prop.`);
      }

      if (options.propBuilder.prop.type !== 'object') {
        throw new Error(`Provider with 'entity' source can only provide a prop of type 'object'.`);
      }

      if (options.propBuilder !== options.consumer) {
        throw new Error(`Provider with 'entity' source should have the prop builder it's providing as its own consumer.`);
      }

      if (!(options.propBuilder as JsfPropBuilderObject).properties['_data']) {
        throw new Error(`Object prop must have the '_data' property.`);
      }


      // Check if we have an `_id` property in either the custom request data, or the object's prop.
      let id;
      if (providerRequestData && '_id' in providerRequestData) {
        id = providerRequestData && providerRequestData['_id'];
      } else {
        if (!(options.propBuilder as JsfPropBuilderObject).properties['_id']) {
          throw new Error(`Object prop must have the '_id' property, or you can provide it yourself via 'providerRequestData'.`);
        }

        id = options.propBuilder.getJsonValue()['_id'];
      }


      const consumeProviderValueOptions: ConsumeProviderValueOptionsInterface = this.builder.ready ?
        { mode: options.mode } :
        {
          noResolve    : true,
          noValueChange: true,
          mode         : options.mode
        };

      if (!id) {
        // Return empty value if no ID.
        try { // TODO FIXME without try-catch!
          return await options.consumer.consumeProviderValue({
            _id  : id,
            _data: {}
          }, consumeProviderValueOptions);
        } catch (e) {
          console.error(e);
        }
      } else {
        // Provide from API.
        const response = await this.provideInternal({
          source: this.provider.source,
          data  : options.propBuilder.getJsonValue()
        }, options);

        try { // TODO FIXME without try-catch!
          return await options.consumer.consumeProviderValue(response, {
            ...(consumeProviderValueOptions),
            setToPath: '_data'
          });
        } catch (e) {
          console.error(e);
        }
      }

    } else if (isJsfProviderSourceVirtualEvent(this.provider.source)) {
      // Provider type => Virtual event.
      const response = await this.provideInternal({
        source: this.provider.source,
        data  : providerRequestData
      }, options);

      const consumeProviderValueOptions: ConsumeProviderValueOptionsInterface = this.builder.ready ?
        { mode: options.mode } :
        {
          noResolve    : true,
          noValueChange: true,
          mode         : options.mode
        };
      try { // TODO FIXME without try-catch!
        return await options.consumer.consumeProviderValue(response, consumeProviderValueOptions);
      } catch (e) {
        console.error(e);
      }

    } else if (isJsfProviderSourceEval(this.provider.source)) {

      // Provider type => Eval.
      const response = await this.provideInternal({
        source: this.provider.source,
        data  : providerRequestData
      }, options);

      const consumeProviderValueOptions: ConsumeProviderValueOptionsInterface = this.builder.ready ?
        { mode: options.mode } :
        {
          noResolve    : true,
          noValueChange: true,
          mode         : options.mode
        };
      try { // TODO FIXME without try-catch!
        return await options.consumer.consumeProviderValue(response, consumeProviderValueOptions);
      } catch (e) {
        console.error(e);
      }

    } else if (isJsfProviderSourceApi(this.provider.source)) {
      let apiRoute = this.provider.source.api;
      if (typeof apiRoute === 'object' && '$eval' in apiRoute) {
        apiRoute = this.builder.runEval((apiRoute as any).$evalTranspiled || apiRoute.$eval);
      }

      // Provider type => API.
      const response = await this.provideInternal({
        source: {
          ...(this.provider.source),
          api: apiRoute
        },
        data  : providerRequestData
      }, options);

      const consumeProviderValueOptions: ConsumeProviderValueOptionsInterface = this.builder.ready ?
        { mode: options.mode } :
        {
          noResolve    : true,
          noValueChange: true,
          mode         : options.mode
        };
      try { // TODO FIXME without try-catch!
        return await options.consumer.consumeProviderValue(response, consumeProviderValueOptions);
      } catch (e) {
        console.error(e);
      }

    } else {
      throw new Error(`Unknown source '${ this.provider }'`);
    }
  }

  private async provideInternal(data: JsfProviderDffEventInterface, options: JsfProviderOptionsInterface): Promise<any> {
    let response;
    if (this.cacheEnabled) {
      const cachedResponse = this.responseCache.find(x => isEqual(data, x.data));
      if (cachedResponse !== void 0) {
        response = cachedResponse.response;
      }
    }

    if (!response) {
      // Check if a request with this data set is already in queue.
      let request = !this.cacheEnabled ? null : this.requestQueue.find(x => {
        // If the source is an entity, compare only the IDs. Otherwise compare all the data.
        if (isJsfProviderSourceEntity(data.source)) {
          return isEqual(data.data._id, x.data.data._id);
        } else {
          return isEqual(data, x.data);
        }
      });
      
      if (request) {
        // A request is already pending so await it here.
        response = await request.promise;
      } else {
        // Create a new provide request.

        const builder: JsfBuilder = this.builder.linkedBuilder || this.builder;

        if (isJsfProviderSourceEval(data.source)) {
          // For eval case only.
          const ctx = builder.getEvalContext({
            propBuilder: options.propBuilder,
            extraContextParams: {
              $providerRequestData: data.data
            }
          });

          // tslint:disable-next-line
          response = builder.runEvalWithContext((data.source as any).$evalTranspiled || data.source.$eval, ctx);
        } else {
          // Everything other than eval.
          const p                   = builder.runOnFormEventHook({
            event: `dff:provide`,
            value: data
          });

          request = {
            data,
            promise: p
          };

          this.requestQueue.push(request);

          response = await p;
        }
      }

      // Remove the request from the requests queue.
      if (request) {
        this.requestQueue = this.requestQueue.filter(x => x !== request);
      }

      // Add response to cache.
      if (this.cacheEnabled) {
        this.responseCache.push({
          data,
          response
        });
      }
    }

    // Run the response through the provider's value mapper.
    if (this.provider.mapResponseData) {
      const ctx = this.builder.getEvalContext({
        propBuilder       : options.propBuilder,
        extraContextParams: {
          $response: response
        }
      });
      response  = this.builder.runEvalWithContext(
        (this.provider.mapResponseData as any).$evalTranspiled || this.provider.mapResponseData.$eval,
        ctx);
    }

    // Run the response through the executor's value mapper.
    if (options.mapResponseData) {
      const ctx = this.builder.getEvalContext({
        propBuilder       : options.propBuilder,
        extraContextParams: {
          $response: response
        }
      });
      response  = this.builder.runEvalWithContext(
        (options.mapResponseData as any).$evalTranspiled || options.mapResponseData.$eval,
        ctx);
    }

    return response;
  }

}
