import { JsfBuilder }                  from '../../src/builder';
import { JsfDefinition, JsfPropArray } from '../../src';


export const jsfDef: JsfDefinition = {
  '$schema': 'config',
  'schema' : {
    'type'      : 'object',
    'properties': {
      a: {
        'type'      : 'object',
        'properties': {},
        'handler'   : {
          type: 'any'
        }
      }
    },
  },
  'layout' : {
    'type' : 'div',
    'items': []
  }
};


describe('Any bugs', () => {

  it('bug 2', async (d) => {
    const builder = await JsfBuilder.create(jsfDef);

    await builder.patchJsonValue({
      a: {
        bar: 'foo'
      }
    });

    const val     = builder.getValue();
    const valJson = builder.getJsonValue();

    expect(val.a).toHaveProperty('bar');
    expect(valJson.a).toHaveProperty('bar');

    d();
  });

  it('bug 3 handler returns empty val', async (d) => {
    const builder = await JsfBuilder.create({
      ...jsfDef,
      value: {
        a: {
          bar: 'foo'
        }
      }
    }, {
      headless    : true
    });


    const val     = builder.getValue();
    const valJson = builder.getJsonValue();

    expect(val.a).toHaveProperty('bar');
    expect(valJson.a).toHaveProperty('bar');

    d();
  });
});
