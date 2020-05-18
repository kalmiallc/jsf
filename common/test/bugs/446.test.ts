import { JsfBuilder }    from '../../src/builder';
import { JsfDefinition } from '../../src';

export const jsfDef: JsfDefinition = {
  $description: 'BUG 446 - ARRAY DATE',
  $schema     : 'http://jsf.kalmia.si/draft-1',
  $theme      : 'rounded/red',

  $modes: [],

  schema  : {
    type      : 'object',
    properties: {
      nest1: {
        'type' : 'array',
        'items': {
          'type'    : 'object',
          properties: {
            time: {
              type: 'date'
            }
          }
        }
      }
    }
  },
  'layout': {
    'type' : 'div',
    'items': [
      {
        'type' : 'array-item-add',
        'path' : 'nest1',
        'title': 'ADD'
      },
      {
        'type' : 'array',
        'key'  : 'nest1',
        'items': [
          { key: 'nest1[].time' },
          { type: 'hr' }
        ]
      },
    ],
  },
  value   : {
    'nest1': [
      {
        'time': '2019-09-13T00:00:00.000Z'
      }
    ]
  }
} as any;


describe('446 bugs', () => {

  let builder: JsfBuilder;

  it('bug', async (done) => {
    builder = await JsfBuilder.create(jsfDef);

    const val     = builder.getValue();
    const valJson = builder.getJsonValue();

    expect(val.nest1['0'].time instanceof Date).toBeTruthy();
    expect(valJson.nest1['0'].time instanceof Date).toBeFalsy();

    done();
  });
});
