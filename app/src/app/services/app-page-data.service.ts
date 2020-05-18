import { Injectable }                                        from '@angular/core';
import { JsfAbstractPageDataService, JsfBreadcrumbFragment } from '@kalmia/jsf-common-es2015';

@Injectable({
  providedIn: 'root'
})
export class AppPageDataService extends JsfAbstractPageDataService {

  constructor() {
    super();
  }

  private _breadcrumbs = [];
  private _title = 'Demo';

  getActiveBreadcrumbs(): JsfBreadcrumbFragment[] {
    return this._breadcrumbs;
  }

  getActivePageTitle(): string {
    return this._title;
  }

}
