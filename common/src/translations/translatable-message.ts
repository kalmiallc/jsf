export interface JsfI18nObject {
  id: string;
  val: string;
}

export class JsfTranslatableMessage {
  id: string;
  value: string;

  constructor(value: string, id?: string) {
    this.value = String(value);
    this.id    = id !== undefined ? String(id) : String(value);
  }
}

export function isI18nObject(x: any): x is JsfI18nObject {
  return (
    typeof x === 'object'
    && 'id' in x
    && 'val' in x
  );
}
