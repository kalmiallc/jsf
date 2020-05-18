export interface SetValueOptionsInterface {
  skipConst?: boolean;

  /**
   * Should be used only when you are manually updating status and validating props after.
   */
  noResolve?: boolean;

  noValueChange?: boolean;
}

export interface PatchValueOptionsInterface {

  /**
   * Should be used only when you are manually validating props after.
   */
  noResolve?: boolean;

  noValueChange?: boolean;
}

export interface ConsumeProviderValueOptionsInterface {

  /**
   * Should be used only when you are manually validating props after.
   */
  noResolve?: boolean;

  noValueChange?: boolean;

  /**
   * Update mode.
   */
  mode: 'set' | 'patch';

  /**
   * Optional relative path on which to set the value to.
   */
  setToPath?: string;
}

export interface AddOrRemoveItemValueOptionsInterface {

  /**
   * Should be used only when you are manually validating props after.
   */
  noResolve?: boolean;

  noValueChange?: boolean;

  triggerChildrenInit?: boolean;
}

