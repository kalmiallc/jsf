import { Injectable }                      from '@angular/core';
import { JsfAbstractAuthCustomerProvider } from '@kalmia/jsf-common-es2015';

/**
 * This is a mock implementation of the auth customer provider!
 * For a working example see the implementation in configurator-app.
 */

@Injectable({
  providedIn: 'root'
})
export class AuthCustomerProvider extends JsfAbstractAuthCustomerProvider {

  provide(): any {
    return null;
  }

}
