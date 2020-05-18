export enum NodeEvent {
  /**
   * Fires when node was created and entered the scene tree
   */
  Create  = 'create',

  /**
   * Fires when node is about to exit the scene tree and be destroyed
   */
  Destroy = 'destroy',
  /**
   * Fires on every animation frame
   */
  Tick    = 'tick',
  /**
   * Fires when any of the listed dependencies' value changes
   */
  Update  = 'update',
}
