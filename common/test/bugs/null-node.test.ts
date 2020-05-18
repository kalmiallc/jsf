import { JsfBuilder }                  from '../../src/builder';
import { JsfDefinition, JsfPropArray } from '../../src';


export const jsfDefinitionForConfigService: JsfDefinition = {
  '$schema': 'config',
  'schema' : {
    'type'      : 'object',
    'properties': {
      configSecrets: new JsfPropArray({
        type : 'array',
        items: {
          type: 'string'
        }
      } as any)
    }
  },
  'layout' : {
    'type' : 'div',
    'items': []
  }
};

const value = {
  'key'   : 'jsf',
  'config': {
    'common/payment-braintree': {
      'backend' : {
        '__SOURCE'   : 'solBtConf',
        'environment': 'Sandbox',
        'merchantId' : '1',
        'publicKey'  : '2',
        'privateKey' : '3'
      },
      'frontend': {}
    }
  }
};

describe('Null node', () => {

  let builder: JsfBuilder;

  it('bug 1', async () => {
    builder = await JsfBuilder.create(jsfDefinitionForConfigService);

    await builder.setValue(value);

    expect(builder.propBuilder.valid).toBeTruthy();
  });
});
