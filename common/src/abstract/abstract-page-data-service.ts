export interface JsfBreadcrumbFragment {
  path: string;
  label: string;
}

export abstract class JsfAbstractPageDataService {

  /**
   * Returns an array of breadcrumb fragments in order
   */
  abstract getActiveBreadcrumbs(): JsfBreadcrumbFragment[];

  /**
   * Returns the name of the active page title
   */
  abstract getActivePageTitle(): string;

}
