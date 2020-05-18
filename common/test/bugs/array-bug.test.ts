import { JsfBuilder, JsfPropBuilderArray } from '../../src/builder';
import { JsfDefinition, JsfPropArray }     from '../../src';


export const jsfDefinition: JsfDefinition = {
  $schema: 'user',

  $theme: 'rounded-admin/red',

  schema: {
    type      : 'object',
    properties: {
      'id': {
        'type': 'string'
      },
      'camPartners': {
        'type' : 'array',
        'items': {
          'type': 'object',
          'properties': {
            'id': {
              'type': 'string'
            },
            'copy': {
              'type': 'object',
              'handler': {
                'type': 'any'
              },
              'properties': {}
            }
          }
        },
      },
      a: {
        type: 'object',
        properties: {
          'camPartners': {
            'type' : 'array',
            'items': {
              'type': 'object',
              'properties': {
                'id': {
                  'type': 'string'
                },
                'copy': {
                  'type': 'object',
                  'handler': {
                    'type': 'any'
                  },
                  'properties': {}
                }
              }
            },
          },
        }
      }
    } as any,
  },
  'layout' : {
    'type' : 'div',
    'items': []
  }
};

describe('Array bug', () => {

  it('bug 1', async (d) => {
    let builder: JsfBuilder = await JsfBuilder.create(jsfDefinition, { withoutHandlers: false });

    const control = (builder.propBuilder as any).properties.a.properties.camPartners;
    const control2 = (builder.propBuilder as any).properties.camPartners;

    let called = false as any;
    control.valueChange.subscribe(x => {
      called = x;
    });

    // await builder.patchValue({id: '5cdbb8d982dcd29de869678b'});
    // builder.listenForValueChange()

    const arrayItem = await control2.add();
    await arrayItem.patchJsonValue({
      id: '5cdbb8d982dcd29de869678b',
      copy: {
        name: 'Test name'
      }
    });

    const val = builder.getValue();

    expect(called).toBeFalsy();

    d();
  });

  it('bug 2', async (d) => {
    let builder: JsfBuilder = await JsfBuilder.create(jsfDefinition, { withoutHandlers: false });

    const control = (builder.propBuilder as any).properties.a.properties.camPartners as JsfPropBuilderArray;

    await control.setJsonValue(null);
    await control.setValue(null);
    await control.patchValue(null);
    await control.patchJsonValue(null);

    await control.add();
    await control.setJsonValue([{
      id: '5cdbb8d982dcd29de869678b',
      copy: {
        name: 'Test name'
      }
    }]);

    await control.setJsonValue(null);
    await control.setValue(null);
    await control.patchValue(null);
    await control.patchJsonValue(null);

    d();
  });
});
