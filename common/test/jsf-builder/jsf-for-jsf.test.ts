import { JsfBuilder }                          from '../../src/builder';
import { JsfDocument, jsfForJsf, jsfRawStore } from '../../src';

describe('Jsf decorators', () => {

  it('JSF store setup', () => {
    const raw = jsfRawStore;
    const sidebar = jsfForJsf.getSidebarList();
    for (const x of jsfForJsf.getJsfDefinitionsList()) {
      jsfForJsf.getJsfComponent(x);
    }

    console.log(JsfBuilder, JsfDocument);
  });
});

