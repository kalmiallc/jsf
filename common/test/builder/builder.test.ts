import { testDocument }                      from './document';
import { JsfBuilder } from '../../src/builder';

describe('JsfBuilder', () => {

  let builder: JsfBuilder;

  it('Basic JsfBuilder functionality', async () => {
    builder = await JsfBuilder.create(testDocument);
    const value = builder.getValue();
    expect(value).toMatchSnapshot();

    const jsonValue = builder.getJsonValue();
    expect(jsonValue).toMatchSnapshot();

    expect(builder.propBuilder.statusTree()).toMatchSnapshot();
  });

  // it('Value change propagation', async () => {
  //   const trace: any[] = [];
  //   const res = builder.valueChange.subscribe(next => {
  //     trace.push(next);
  //   });
  //   await builder.patchValue({
  //     'basic': {
  //       'username': 'ABC'
  //     }
  //   });
  //   expect(trace).toMatchSnapshot();
  // });
});
