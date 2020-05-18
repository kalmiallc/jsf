export enum JsfProviderExecutorStatus {
  /**
   * Provider is idle and waiting for a new request.
   */
  Idle    = 'IDLE',
  /**
   * Provider is fetching data.
   */
  Pending = 'PENDING',
  /**
   * Provider failed.
   */
  Failed  = 'FAILED'
}
