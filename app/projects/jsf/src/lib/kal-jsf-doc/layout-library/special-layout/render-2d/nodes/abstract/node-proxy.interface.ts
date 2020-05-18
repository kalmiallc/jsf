export interface NodeProxyInterface {
  // Holds the names of properties that were modified
  __modifiedPropertyList: string[];

  [propertyName: string]: any;
}

export function isNodeProxyInterface(x: any): x is NodeProxyInterface {
  return typeof x === 'object' && '__modifiedPropertyList' in x;
}
