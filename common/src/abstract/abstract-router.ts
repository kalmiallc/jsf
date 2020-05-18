export interface JsfRouterTransferValueInterface {
  path: string;
  value: any;
}

export interface JsfRouterNavigationOptionsInterface {
  // Type of navigation; use 'app' for Angular router or 'absolute' for a window.location change.
  type?: 'app' | 'absolute';

  // Should the page be reloaded?
  reload?: boolean;

  // Should navigation occur relative to the currently activated route.
  relative?: boolean;

  // Optional query string object.
  query?: { [key: string]: any };

  // How to handle parameters in a router link.
  queryParamsHandling?: 'merge' | 'preserve' | '';

  // Should the page open in a new window?
  // Default is 'false' for relative Angular routes and 'true' for absolute links.
  openInNewWindow?: boolean;

  // Transfer form data to the target route.
  transferFormValue?: JsfRouterTransferValueInterface;
}

export abstract class JsfAbstractRouter {

  /**
   * Return `true` if navigation was successful.
   */
  abstract navigateTo(path: string, options?: JsfRouterNavigationOptionsInterface): Promise<boolean>;

  /**
   * Return the transfer value from the router if it exists.
   */
  abstract getTransferFormValue(): Promise<JsfRouterTransferValueInterface>;
}
