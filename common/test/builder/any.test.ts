import { JsfBuilder }  from '../../src/builder';
import { JsfDocument } from '../../src';


const doc: JsfDocument = {
  'schema': {
    'type'      : 'object',
    'handler'   : {
      'type': 'any'
    },
    'properties': {
      park: { type: 'string', minLength: 1 }
    }
  },
  'layout': {
    'type'  : 'div',
    'styles': {
      'grid': 'row'
    },
    'items' : []
  }
};

describe('Any test', () => {

  let builder: JsfBuilder;

  /*it('Should be invalid', async (d) => {
    builder = await JsfBuilder.create(doc, { withoutHandlers: false, skipValidation: true });
    builder.setValue({ park: 'dsdsdsdsds'});
    const val = builder.getValue();
    expect(val).toEqual({ park: 'dsdsdsdsds'});
    d();
  });*/

  it('Should be any', async () => {
    builder = new JsfBuilder(doc, { withoutHandlers: false, skipValidation: true });
    builder.setValue({ n: null, a: 1, b: { c: 2 }, d: [1, 2, 3]});
    const val = builder.getValue();

    expect(val).toEqual({ n: null, a: 1, b: { c: 2 }, d: [1, 2, 3]});
  });
});
