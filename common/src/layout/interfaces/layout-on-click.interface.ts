import { JsfValueOptionsType } from './value-options.type';

export interface JsfLayoutOnClickInterface {

  /**
   * Condition to check if we should run this action.
   */
  condition?: {
                $eval: string;
              } | any;

  /**
   * Aborts the current action, or if the action is a part of a chain of actions the whole chain will be interrupted.
   * Return `true` to abort.
   */
  abort?: {
            $eval: string;
          } | boolean;


  /**
   * Code to run.
   */
  $eval?: string;

  /**
   * Emit event to outside world.
   */
  emit?: {
    /**
     * Run this action on linked form.
     */
    onLinked?: boolean;

    /**
     * Event name so you know what event is from where.
     */
    event: string;

    /**
     * Value to add to event.
     */
    value?: JsfValueOptionsType
  };

  /**
   * Set value, optionally from a specific path.
   */
  setValue: {
    /**
     * Run this action on linked form.
     */
    onLinked?: boolean;

    /**
     * If not set it sets to root.
     */
    path?: string;

    /**
     * Value to set.
     */
    value: JsfValueOptionsType;

    noResolve?: boolean;
    noValueChange?: boolean;
  };

  /**
   * Patch value, optionally from a specific path.
   */
  patchValue: {
    /**
     * Run this action on linked form.
     */
    onLinked?: boolean;

    /**
     * If not set it sets to root.
     */
    path?: string;

    /**
     * Value to patch.
     */
    value: JsfValueOptionsType;

    noResolve?: boolean;
    noValueChange?: boolean;
  };

  /**
   * Validate form. This does not work with header-type forms in DFF.
   * This will trigger a full form validation and will then display errors in the entire form.
   * If the form is invalid this will abort the event chain!
   */
  validate?: boolean;

  /**
   * Submit form.
   */
  submit?: boolean | {
    /**
     * Run this action on linked form.
     */
    onLinked?: boolean;

    /**
     * Whether to create a new revision.
     */
    createRevision?: boolean;
    /**
     * Whether to create a new fork.
     */
    createFork?: boolean;

    /**
     * Optional eval to run after the response from the submission has been received.
     * This eval will have a special `$response` context variable containing the document returned from the server.
     */
    mapResponseData?: {
      $eval: string,
    }
  };


  /**
   * @deprecated
   */
  submitToLinked?: boolean;

  /**
   * Add item to array at given path.
   */
  arrayItemAdd?: {
    /**
     * Run this action on linked form.
     */
    onLinked?: boolean;

    path: string;

    /**
     * Default is SET
     */
    mode?: 'set' | 'patch';

    value?: {
              $eval: string;
            } | any;
  };

  /**
   * Remove item from array at given path.
   */
  arrayItemRemove?: {
    /**
     * Run this action on linked form.
     */
    onLinked?: boolean;

    path: string;

    index: {
             $eval: string;
           } | number;
  };

  /**
   * Navigate the user to another route or an absolute URL.
   */
  navigateTo?: {
    // If set to true it will cause a page reload and ignore everything else.
    reload?: boolean;

    // Where to redirect to. Can be an Angular route or an absolute url.
    path?: {
             $eval: string;
           } | any;

    // Optional query parameters to append to the path.
    // This should be an object mapping query property names to values.
    // Example:
    //   {
    //      "abc": 123,
    //      "xyz": "foo"
    //   }
    //
    // This will result in the following query string: "?abc=123&xyz=foo"
    query?: {
              $eval: string;
            } | { [key: string]: any }

    // How to handle parameters in a router link.
    queryParamsHandling?: 'merge' | 'preserve' | '';

    // Is the path relative to the currently activated route (only applicable if we are redirecting to an Angular route)
    relative?: boolean;

    // Should the page open in a new window?
    // Default is 'false' for relative Angular routes and 'true' for absolute links.
    openInNewWindow?: boolean;

    // Pass the current form value to the new route, which may consume it if it supports this feature.
    // You can either pass `true` to copy everything, or provide an object specifying the target path on the form to
    // set the value to and an optional eval which can modify data before sending it. If you do not provide the value
    // eval then the entire form value will be used.
    transferFormValue?: {
                          path?: string;
                          value?: {
                                    $eval: string;
                                  } | any;
                        } | boolean;
  };

  /**
   * Trigger a DFF action, with an optional value. The value may only be applicable to some actions and can also be
   * ignored by the form's context. For example, you can pass the ID of the document to delete in the form table,
   * however in the form view it will automatically delete the currently open document and there is no way to override
   * that behavior.
   */
  dff?: {
    /**
     * Run this action on linked form.
     */
    onLinked?: boolean;

    action: 'load' | 'save' | 'delete' | 'retry' | 'runCustomEvent' | 'runVirtualEvent';
    value?: {
              $eval: string;
            } | any;

    /**
     * Optional eval to run after the response from the event has been received.
     * This eval will have a special `$response` context variable containing the document returned from the server.
     */
    mapResponseData?: {
      $eval: string,
    }
  };

  /**
   * Show dialog with a given DFF key.
   */
  showDialog?: {
    key: string;
    data?: {
             $eval: string;
           } | any;
  };

  /**
   * Hide the currently open dialog.
   */
  hideDialog?: boolean;

  /**
   * Open form in a dialog.
   */
  openFormDialog?: {
    /**
     * DFF key of the form to open. Currently only form view is supported (not table or dialog, for example).
     */
    dffKey: {
              $eval: string;
            } | string;

    /**
     * ID of document to load. If not provided the form will load in "new" mode.
     */
    documentId?: {
                   $eval: string;
                 } | string;

    /**
     * Optional value to transfer.
     */
    transferFormValue?: {
                          path?: string;
                          value?: {
                                    $eval: string;
                                  } | any;
                        } | boolean;
    /**
     * Whether the event chain should be aborted if the dialog is dismissed (for example when the user clicks on the backdrop instead of submitting the form).
     */
    abortOnDismiss?: {
                       $eval: string;
                     } | string;
    /**
     * Optional eval to run after the form dialog has closed.
     * This eval will have a special `$response` context variable containing the last form document state.
     */
    mapResponseData?: {
      $eval: string,
    }
  };

  /**
   * Close the current form if loaded in a dialog.
   * You can optionally specify that the dialog should be dismissed instead (may abort event chain).
   */
  closeFormDialog?: boolean | {
    dismiss: boolean
  };


  /**
   * Show a generic loading indicator.
   */
  showLoadingIndicator?: boolean;

  /**
   * Hide the loading indicator.
   */
  hideLoadingIndicator?: boolean;

  /**
   * Moves the stepper with provided id to the next step if possible.
   */
  stepperNext?: {
    id: string;
  };

  /**
   * Moves the stepper with provided id to the previous step if possible.
   */
  stepperPrevious?: {
    id: string;
  };

  /**
   * Clipboard - Copy and paste to/from local storage
   */
  clipboard?: {

    /**
     * Empty clipboard
     */
    clear: string[] | string | boolean;

    copy: {
      /**
       * Under what key to store copied value.
       */
      key: JsfValueOptionsType;

      /**
       * Value to copy.
       */
      value?: JsfValueOptionsType;
    }
  };

  /**
   * Run service action.
   */
  runServiceAction: {
    /**
     * Run action on linked form.
     */
    onLinked?: boolean;

    service: JsfValueOptionsType;
    action: JsfValueOptionsType;
    data?: JsfValueOptionsType;
  };
}
