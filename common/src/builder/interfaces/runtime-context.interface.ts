/**
 * This interface is used to pass runtime data from the Angular app to core.
 */
export interface JsfRuntimeContext {
  /**
   * Running application instance data.
   */
  application: {
    /**
     * Current application language.
     */
    language: string;
  };
}
