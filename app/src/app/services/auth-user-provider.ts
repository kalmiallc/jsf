import { Injectable }                  from '@angular/core';
import { JsfAbstractAuthUserProvider } from '@kalmia/jsf-common-es2015';

/**
 * This is a mock implementation of the auth customer provider!
 * For a working example see the implementation in configurator-app.
 */

@Injectable({
  providedIn: 'root'
})
export class AuthUserProvider extends JsfAbstractAuthUserProvider {

  provide(): any {
    return null;
  }

}
