import { JsfBuilder, PropStatus }                                   from '../../src/builder';
import { JsfDocument, JsfLayoutDiv, JsfPropBoolean, JsfPropObject } from '../../src';
import * as BsonObjectID                                            from 'bson-objectid';

const doc: JsfDocument = {
  schema: new JsfPropObject({
    type      : 'object',
    properties: {
      A: {
        type : 'string'
      },
      B: new JsfPropBoolean({
        type: 'boolean',
        enabledIf: {
          $eval: `return $val.A === 'PASS';`,
          dependencies: ['A'],
        },
      }),
      C: {
        type : 'string',
        enabledIf: {
          $eval: `return !!$val.B`,
          dependencies: ['B'],
        },
      },
    },
  }),
  layout: new JsfLayoutDiv({
    type : 'div',
    items: []
  })
};


describe('Enabled if for new reoslver', () => {


  it('C must be disabled', async () => {
    const builder = await JsfBuilder.create(doc);

    expect((builder.propBuilder as any).properties.C.status).toBe(PropStatus.Disabled);
    expect((builder.propBuilder as any).properties.C._enabledIfStatus).toBe(false);

    await builder.setValue({
      B: true
    });

    expect((builder.propBuilder as any).properties.C.status).toBe(PropStatus.Disabled);
    expect((builder.propBuilder as any).properties.C._enabledIfStatus).toBe(false);
  });
});
