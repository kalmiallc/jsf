import { JsfBuilder, PropStatus }                                   from '../../src/builder';
import { JsfDocument, JsfLayoutDiv, JsfPropBoolean, JsfPropObject } from '../../src';

const doc: JsfDocument = {
  schema: new JsfPropObject({
    type      : 'object',
    properties: {
      conditionalPropA     : {
        type     : 'string',
        enabledIf: {
          $eval       : `return !!($val.areas && $val.areas.A12)`,
          dependencies: ['areas.A12'],
        },
      },
      conditionalPropB     : {
        type     : 'string',
        enabledIf: {
          $eval       : `return !!($val.areas && $val.areas.A12)`,
          dependencies: ['areas'],
        },
      },
      conditionalPropC     : {
        type     : 'string',
        enabledIf: {
          $eval       : `return !!($val.areas && $val.areas.B24)`,
          dependencies: ['areas.B24'],
        },
      },
      conditionalPropD     : {
        type     : 'string',
        enabledIf: {
          $eval       : `return !!($val.areas && $val.areas.B24)`,
          dependencies: ['areas'],
        },
      },
      condForB24          : {
        type: 'string'
      },
      areas: new JsfPropObject({
        type      : 'object',
        properties: {
          A12: new JsfPropBoolean({
            type : 'boolean'
          }),
          B24: new JsfPropBoolean({
            type     : 'boolean',
            enabledIf: {
              $eval       : ` return $val.condForB24 === 'PASS'; `,
              dependencies: ['condForB24'],
            },
          }),
        }
      })
    },
  }),

  layout: new JsfLayoutDiv({
    type : 'div',
    items: []
  })
};


describe('Enabled if', () => {

  let builder: JsfBuilder;

  it('via root setValue', async () => {
    builder = await JsfBuilder.create(doc);

    expect((builder.propBuilder as any).properties.conditionalPropA.status).toBe(PropStatus.Disabled);
    expect((builder.propBuilder as any).properties.conditionalPropB.status).toBe(PropStatus.Disabled);

    await builder.setValue({
      areas: {
        A12: true
      }
    });

    expect((builder.propBuilder as any).properties.conditionalPropA.status).not.toBe(PropStatus.Disabled);
    expect((builder.propBuilder as any).properties.conditionalPropB.status).not.toBe(PropStatus.Disabled);
  });

  it('direct setValue on prop', async () => {
    builder = await JsfBuilder.create(doc);

    expect((builder.propBuilder as any).properties.conditionalPropA.status).toBe(PropStatus.Disabled);
    expect((builder.propBuilder as any).properties.conditionalPropB.status).toBe(PropStatus.Disabled);

    await (builder.propBuilder as any).properties.areas.properties.A12.setValue(true);

    expect((builder.propBuilder as any).properties.conditionalPropA.status).not.toBe(PropStatus.Disabled);
    // any).properties.conditionalPropB.status).not.toBe(PropStatus.Disabled);
  });

  it('via root setValue B24', async () => {
    builder = await JsfBuilder.create(doc);

    expect((builder.propBuilder as any).properties.conditionalPropC.status).toBe(PropStatus.Disabled);
    expect((builder.propBuilder as any).properties.conditionalPropD.status).toBe(PropStatus.Disabled);

    await builder.setValue({
      areas: {
        B24: true
      }
    });

    expect((builder.propBuilder as any).properties.conditionalPropC.status).toBe(PropStatus.Disabled);
    expect((builder.propBuilder as any).properties.conditionalPropD.status).toBe(PropStatus.Disabled);

    await builder.setValue({
      condForB24          : 'PASS',
      areas: {
        B24: true
      }
    });

    expect((builder.propBuilder as any).properties.conditionalPropC.status).not.toBe(PropStatus.Disabled);
    expect((builder.propBuilder as any).properties.conditionalPropD.status).not.toBe(PropStatus.Disabled);
  });

  it('via direct setValue condForB24', async () => {
    builder = await JsfBuilder.create(doc);

    expect((builder.propBuilder as any).properties.conditionalPropC.status).toBe(PropStatus.Disabled);
    expect((builder.propBuilder as any).properties.conditionalPropD.status).toBe(PropStatus.Disabled);

    expect((builder.propBuilder as any).properties.areas.properties.B24.status).toBe(PropStatus.Disabled);

    await builder.setValue({
      areas: {
        B24: true
      }
    });

    expect((builder.propBuilder as any).properties.conditionalPropC.status).toBe(PropStatus.Disabled); // since B24 is
                                                                                                       // disabled
    expect((builder.propBuilder as any).properties.conditionalPropD.status).toBe(PropStatus.Disabled);

    await (builder.propBuilder as any).properties.condForB24.setValue('PASS');

    await builder.resolver.updateStatus(builder.propBuilder);

    expect((builder.propBuilder as any).properties.areas.properties.B24.status).toBe(PropStatus.Valid);

    expect((builder.propBuilder as any).properties.conditionalPropC.status).not.toBe(PropStatus.Disabled);
    expect((builder.propBuilder as any).properties.conditionalPropD.status).not.toBe(PropStatus.Disabled);
  });
});
