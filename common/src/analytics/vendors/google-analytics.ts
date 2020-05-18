export interface JsfAnalyticsConfigurationGoogleAnalytics {
  /**
   * Google Analytics tracking ID.
   */
  trackingId: string;

  /**
   * GA ecommerce settings
   */
  ecommerce: {

    /**
     * Whether ecommerce tracking is enabled
     */
    enabled: boolean;

    sendAsVirtualPageviews?: boolean;

    /**
     * Custom events to send on certain actions
     */
    customEvents?: {

      /**
       * Post submit hook
       */
      postSubmit?: {
        action: string,
        category: string,
      }
    }

  };
}
