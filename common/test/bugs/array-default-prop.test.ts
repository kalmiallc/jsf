import { JsfBuilder }                  from '../../src/builder';
import { JsfDefinition, JsfPropArray } from '../../src';


export const jsfDefinition: JsfDefinition = {
  $schema: 'user',

  $theme: 'rounded-admin/red',

  schema: {
    type      : 'object',
    properties: {
      'parks': {
        'type' : 'array',
        'items': {
          'type': 'object',
          'properties': {
            'title': {
              'type': 'string',
              'default': 'Yellowstone national park'
            },
          }
        },
      },
    },
  },
  'layout' : {
    'type' : 'div',
    'items': []
  }
};

describe('Array Default bug', () => {

  it('BUG: Default property not working', async (done) => {
    let builder: JsfBuilder = await JsfBuilder.create(jsfDefinition, { withoutHandlers: false });

    const control = (builder.propBuilder as any).properties.parks;
    const arrayItem = await control.add();

    const val = builder.getValue();

    expect(val.parks[0].title).toBeDefined();

    done();
  });
});
