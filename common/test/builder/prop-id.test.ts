import { JsfBuilder }                               from '../../src/builder';
import { JsfDocument, JsfLayoutDiv, JsfPropObject } from '../../src';
import * as BsonObjectID                            from 'bson-objectid';

const doc: JsfDocument = {
  schema: new JsfPropObject({
    type      : 'object',
    properties: {
      id: {
        type : 'id',
      },
      idEmpty: {
        type : 'id',
      },
    },
  }),

  layout: new JsfLayoutDiv({
    type : 'div',
    items: []
  }),

  value: {
    'id': (BsonObjectID as any)().toString()
  },
};


describe('Prop id', () => {

  let builder: JsfBuilder;

  it('BsonObjectID', async (done) => {
    builder = await JsfBuilder.create(doc);

    const val = builder.getValue();
    const jsonVal = builder.getJsonValue();

    const lock = builder.lock();
    const diff = builder.getDiff(lock);

    await builder.setValue({
      'id': (BsonObjectID as any)()
    });

    const diffB = builder.getDiff(lock);
    const jsonDiffB = builder.getJsonDiff(lock);

    expect(typeof (builder.propBuilder as any).properties.id.value !== 'string').toBeTruthy();
    expect(diff).toBeUndefined();
    expect(diffB.id).not.toBeUndefined();
    expect(jsonDiffB.id).not.toBeUndefined();

    expect(diffB.idEmpty).toBeUndefined();
    expect(jsonDiffB.idEmpty).toBeUndefined();

    done();
  });

  it('BsonObjectID patch value', async (done) => {
    const builderA = new JsfBuilder(doc);
    const builderB = await JsfBuilder.create(doc);


    await builderB.patchJsonValue({
      'id': '5cda6bc92919f56efcaae1cf'
    });

    const val = await builderB.getValue();

    done();
  });
});
