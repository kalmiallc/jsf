import { JsfBuilder }  from '../../src/builder';
import { JsfDocument } from '../../src';


const doc: JsfDocument = {
  'schema': {
    'type'      : 'object',
    'properties': {
      'foo': {
        type : 'array',
        items: {
          type      : 'object',
          properties: {
            bar: {
              type : 'array',
              items: {
                type      : 'object',
                properties: {
                  cat: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  'layout': {
    'type' : 'array',
    'key'  : 'foo',
    'items': [
      {
        type : 'div',
        items: [
          {
            'type' : 'array',
            'key'  : 'foo[].bar',
            'items': [
              {
                type : 'span',
                title: 'It works!'
              }
            ]
          }
        ]
      }
    ]
  },
  'value' : {
    foo: [
      {
        bar: [
          {
            cat: 'Miiijaw.'
          }
        ]
      },
      {
        bar: [
          {
            cat: 'Meeejeawwww.'
          }
        ]
      }
    ]
  }
};

describe('array-get-prop-item', () => {

  it('Test nested getPropItem function.', async (done) => {
    const builder            = await JsfBuilder.create(doc);
    const layoutBuilder: any = builder.layoutBuilder;

    expect((builder.layoutBuilder as any).items.length).toEqual(2);

    // Must be DESC order.
    const longerKeyPath  = layoutBuilder.items['1']['0'].items['0'].items['0']['0'].arrayPropKeys[0];
    const shorterKeyPath = layoutBuilder.items['1']['0'].items['0'].items['0']['0'].arrayPropKeys[1];
    expect(longerKeyPath.length).toBeGreaterThan(shorterKeyPath.length);

    const propItems      = layoutBuilder.items[1][0].getPropItem('foo[].bar');       // <=== USAGE
    const propItemObj    = layoutBuilder.items[1][0].getPropItem('foo[].bar[]');     // <=== USAGE
    const propItemObjCat = layoutBuilder.items[1][0].getPropItem('foo[].bar[].cat'); // <=== USAGE

    const trueItems      = (builder.propBuilder as any).properties.foo.items['1'].properties.bar;
    const trueItemObj    = (builder.propBuilder as any).properties.foo.items['1'].properties.bar.items['0'];
    const trueItemObjCat = (builder.propBuilder as any).properties.foo.items['1'].properties.bar.items['0'].properties.cat;


    const propItems_path      = propItems.path;
    const propItemObj_path    = propItemObj.path;
    const propItemObjCat_path = propItemObjCat.path;

    const trueItems_path      = trueItems.path;
    const trueItemObj_path    = trueItemObj.path;
    const trueItemObjCat_path = trueItemObjCat.path;

    expect(trueItems_path).toEqual(propItems_path);
    expect(trueItemObj_path).toEqual(propItemObj_path);
    expect(trueItemObjCat_path).toEqual(propItemObjCat_path);

    expect(trueItems).toEqual(propItems);
    expect(trueItemObj).toEqual(propItemObj);
    expect(trueItemObjCat).toEqual(propItemObjCat);

    done();
  });
});
