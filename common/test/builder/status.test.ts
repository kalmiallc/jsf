import { JsfBuilder }                                               from '../../src/builder';
import { JsfDocument, JsfLayoutDiv, JsfPropBoolean, JsfPropObject } from '../../src';


const doc: JsfDocument = {
  schema: new JsfPropObject({
    type      : 'object',
    properties: {
      condForP3P4          : {
        type: 'string'
      },
      rollerShadesPositions: new JsfPropObject({
        type      : 'object',
        properties: {
          p3p4: new JsfPropBoolean({
            type     : 'boolean',
            title    : 'P3 - P4',
            enabledIf: {
              $eval       : ` return $val.condForP3P4 === 'PASS'; `,
              dependencies: ['condForP3P4'],
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

describe('Status test', () => {

  let builder: JsfBuilder;

  it('Should be valid', async (done) => {
    builder = await JsfBuilder.create(doc, { withoutHandlers: true, skipValidation: false });

    const rollerShadesPositions = (builder as any).propBuilder.properties.rollerShadesPositions;
    const p3p4                  = rollerShadesPositions.properties.p3p4;
    const condForP3P4           = (builder as any).propBuilder.properties.condForP3P4;

    expect(condForP3P4.valid).toBeTruthy();
    expect(rollerShadesPositions.valid).toBeTruthy();
    expect(p3p4.disabled).toBeTruthy();

    await condForP3P4.setValue('PASS');

    expect(p3p4.valid).toBeTruthy();
    done();
  });
});
