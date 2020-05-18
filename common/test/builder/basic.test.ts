import { JsfBuilder }                                                           from '../../src/builder';
import { JsfDocument, JsfLayoutDiv, JsfPropDate, JsfPropObject, JsfPropString } from '../../src';

const doc: JsfDocument = {
  schema: new JsfPropObject({
    type      : 'object',
    properties: {
      title: new JsfPropString({
        type   : 'string',
        default: 'ABC'
      }),
      time : new JsfPropDate({
        type: 'date'
      }),
    },
  }),

  layout: new JsfLayoutDiv({
    type : 'div',
    items: []
  }),
};


describe('Basic JSF', () => {

  let builder: JsfBuilder;

  it('default', async () => {
    builder = await JsfBuilder.create(doc);

    const val = builder.getValue();

    expect(val.title).toBe('ABC');
  });

  it('default date test', async (d) => {
    const builderA = await JsfBuilder.create({ ...doc, value: { time: new Date() } } as any);

    await builderA.patchJsonValue({ time: new Date() + '' });
    await builderA.setJsonValue({ time: new Date() + '' });

    await builderA.patchJsonValue({ time: new Date() });
    await builderA.setJsonValue({ time: new Date() });

    await builderA.patchValue({ time: new Date() });
    await builderA.setValue({ time: new Date() });

    d();
  });
});
