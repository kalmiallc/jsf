import { JsfBuilder }                               from '../../src/builder';
import { JsfDocument, JsfLayoutDiv, JsfPropObject } from '../../src';

const doc: JsfDocument = {
  schema: new JsfPropObject({
    type      : 'object',
    properties: {
      trigger: {
        type         : 'string',
        onValueChange: {
          updateDependencyValue: [
            {
              mode : 'patch',
              key  : 'a',
              value: {
                default: true,
              }
            },
            {
              key  : 'c',
              value: {
                const: 'KONSTANTA',
              }
            },
            {
              key  : 'b',
              value: {
                $eval: 'return "123123"',
              }
            }
          ]
        }
      },
      a      : {
        type   : 'string',
        default: 'privzeto',
        onValueChange: {
          updateDependencyValue: [
            {
              key  : 'd',
              value: {
                const: 'KONSTANTA ZA DDD'
              }
            },
            {
              key  : 'obj',
              value: {
                default: true
              }
            }
          ]
        }
      },
      b      : {
        type: 'string',
      },
      c      : {
        type: 'string',
      },
      d      : {
        type: 'string',
      },
      obj: {
        type: 'object',
        properties: {
          objProp1: {
            type: 'string',
            default: '123'
          }
        }
      }
    },
  }),
  layout: new JsfLayoutDiv({
    type : 'div',
    items: []
  }),
};

describe('On value change', () => {

  let builder: JsfBuilder;

  it('updateDependencyValue', async (done) => {
    builder = await JsfBuilder.create(doc);

    await builder.patchValue({
      obj: {
        objProp1: 'XYZ'
      }
    });

    await builder.patchValue({
      a: 'sprememba'
    });

    await builder.patchValue({
      trigger: 'UUUUUU'
    });


    const val = builder.getValue();
    expect(val).toMatchSnapshot();

    done();
  });
});
