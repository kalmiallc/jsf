export enum NodeState {
  /**
   * Node is being created
   */
  Creating = 'CREATING',
  /**
   * Node was created but not yet added to the scene tree
   */
  Created = 'CREATED',
  /**
   * Node was created, added to the scene tree and is being rendered
   */
  Active = 'ACTIVE',
  /**
   * Node is about to be destroyed and may still have some animations running
   */
  Destroying = 'DESTROYING',
  /**
   * Node was destroyed and removed from the scene tree
   */
  Destroyed = 'DESTROYED'
}

