import { Injectable }                                                                             from '@angular/core';
import {
  JsfAbstractRouter,
  JsfRouterNavigationOptionsInterface,
  JsfRouterTransferValueInterface
} from '@kalmia/jsf-common-es2015';
import { ActivatedRoute, Router }                                                                 from '@angular/router';

/**
 * This implementation is outdated compared to the one in configurator-app!
 */

const routerTransferFormValueProperty = '__JSF_TRANSFER_FORM_VALUE__';

@Injectable({
  providedIn: 'root'
})

export class AppRouterService extends JsfAbstractRouter {

  private get activatedRoute(): ActivatedRoute {
    let route = this.router.routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }

  constructor(private router: Router) {
    super();
  }

  async navigateTo(path: string, options?: JsfRouterNavigationOptionsInterface): Promise<boolean> {
    options = {
      reload: false,
      relative: false,

      ... (options || {})
    };

    if (options.reload) {
      this.router.navigateByUrl(this.router.url);
      return true;
    }

    this.router.navigate([path], {
      relativeTo: options.relative ? this.activatedRoute : null,
      state     : {
        [routerTransferFormValueProperty]: options.transferFormValue
      }
    });
    return true;
  }

  async getTransferFormValue(): Promise<JsfRouterTransferValueInterface> {
    const navigation = this.router.getCurrentNavigation();

    if (navigation.extras && navigation.extras.state) {
      return navigation.extras.state && navigation.extras.state[routerTransferFormValueProperty] || null;
    }

    return null;
  }

}
