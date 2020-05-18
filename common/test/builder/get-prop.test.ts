import { JsfBuilder }                                                                           from '../../src/builder';
import { JsfDocument, JsfLayoutDiv, JsfPropArray, JsfPropNumber, JsfPropObject, JsfPropString } from '../../src';

const doc: JsfDocument = {
  schema: new JsfPropObject({
    type      : 'object',
    properties: {
      arrayProp: new JsfPropArray({
        type : 'array',
        items: {
          type      : 'object',
          properties: {
            arrayPropString: new JsfPropString({
              type: 'string'
            }),
            nestedArray    : new JsfPropArray({
              type : 'array',
              items: {
                type      : 'object',
                properties: {
                  nestedArrayString: new JsfPropString({
                    type     : 'string',
                    enabledIf: {
                      $eval       : `return $getProp('arrayProp[].arrayPropString').getJsonValue() !== 'B'`,
                      dependencies: ['arrayProp[].arrayPropString']
                    }
                  }),
                  nestedArrayNumber: new JsfPropNumber({
                    type     : 'number',
                    enabledIf: {
                      $eval       : `return $getPropValue('arrayProp[].arrayPropString') !== 'B'`,
                      dependencies: ['arrayProp[].arrayPropString']
                    }
                  }),
                  nestedArrayLinked: new JsfPropNumber({
                    type     : 'number',
                    enabledIf: {
                      $eval       : `return $getPropValue('arrayProp[].nestedArray[].nestedArrayNumber') !== 3`,
                      dependencies: ['arrayProp[].nestedArray[].nestedArrayNumber']
                    }
                  })
                }
              }
            })
          }
        },
      })
    },
  }),
  layout: new JsfLayoutDiv({
    type : 'div',
    items: []
  }),
  value : {
    arrayProp: [
      {
        arrayPropString: 'A',
        nestedArray    : [
          {
            nestedArrayString: 'TESTVALUE',
            nestedArrayNumber: 1,
            nestedArrayLinked: 11,
          }
        ]
      },
      {
        arrayPropString: 'B',
        nestedArray    : [
          {
            nestedArrayString: 'TESTVALUE2',
            nestedArrayNumber: 2,
            nestedArrayLinked: 22,
          }
        ]
      },
      {
        arrayPropString: 'C',
        nestedArray    : [
          {
            nestedArrayString: 'TESTVALUE3',
            nestedArrayNumber: 3,
            nestedArrayLinked: 33,
          }
        ]
      },
    ]
  }
};

describe('Get prop', () => {

  let builder: JsfBuilder;

  it('should disable controls', async (done) => {
    builder = await JsfBuilder.create(doc);

    const value = builder.getJsonValue();

    expect(value).toMatchSnapshot();

    done();
  });
});
