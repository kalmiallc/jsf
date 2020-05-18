import { JsfAbstractSpecialLayout }       from '../../abstract/abstract-layout';

export class JsfLayoutRef extends JsfAbstractSpecialLayout<'$ref'> {

  type: never;

  /**
   * Internal import:
   * - #/definitions/abc
   * External import:
   * - /abc
   */
  $ref: string;

  set?: {
    path: string;
    value: any;
  }[];

  constructor(data: JsfLayoutRef) {
    super();
    Object.assign(this, data);
  }
}
