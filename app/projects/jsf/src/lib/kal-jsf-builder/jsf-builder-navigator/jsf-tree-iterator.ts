import { JsfUnknownLayout, JsfUnknownProp, isPropArray, isPropObject } from '@kalmia/jsf-common-es2015';
import { omit } from 'lodash';

let uniqIdCount    = 0;
const uniqIdPrefix = 'S' + (+new Date()) + '_';

export abstract class JsfTreeIterator<documentChunkType> {
  children: JsfTreeIterator<documentChunkType>[];
  data: any

  constructor(public documentChunk: any, public parent: JsfTreeIterator<documentChunkType>, public uuid: string, public title: string) {
    this.children = [];
    this.data = {
      isType: documentChunk.type ? true : false,
      value: documentChunk.type || documentChunk.key
    }
   }

  toJson(): string {
    // build back document from tree and return it as json string
    return JSON.stringify(this.chopTree());
  };
  abstract chopTree(): any;
  abstract buildTree(root: documentChunkType);
}

export class JsfPropIterator extends JsfTreeIterator<JsfUnknownProp> {
  constructor(schema: JsfUnknownProp, parent: JsfTreeIterator<JsfUnknownProp> = null, uuid: string, title: string) {
    super(schema, parent, uuid, title);
    this.buildTree();
  }
  chopTree() {
    const doc = {};

    return doc;
  }
  buildTree() {
    // schema = this.documentChunk
    // check if object or array with provided function (which)
    if (isPropArray(this.documentChunk as any)) {

    } else if (isPropObject(this.documentChunk as any)) {

      // iterate items and extract children
      for (let child in this.documentChunk.properties || []) {
        // create new iterator from child and append it to children array
        this.children.push(new JsfPropIterator(this.documentChunk.properties[child], this, uniqIdPrefix + (++uniqIdCount), `${child} <${this.documentChunk.properties[child].type}>`));
      }
    }
    return;
  }
}


export class JsfLayoutIterator extends JsfTreeIterator<JsfUnknownLayout> {
  constructor(layout: JsfUnknownLayout, parent: JsfTreeIterator<JsfUnknownLayout> = null, uuid: string, title: string) {
    super(layout, parent, uuid, title);
    this.buildTree();
  }
  chopTree() {
    const items = [];
    this.children.map(child => {
      items.push(child.chopTree());
    });
    if (this.data.isType) {
      return {
        type: this.data.value,
        items
      }
    } else {
      return {
        key: this.data.value
      }
    }
  }
  buildTree() {
    // layout = this.documentChunk
    // check if it has type and key => if it has type and no key you can iterate items
    if (this.documentChunk.type && !this.documentChunk.key) {
      for (let child in this.documentChunk.items || []) {
        // create new iterator from child and append it to children array
        this.children.push(new JsfLayoutIterator(this.documentChunk.items[child], this, uniqIdPrefix + (++uniqIdCount), `${this.documentChunk.items[child].type || this.documentChunk.items[child].key} <${this.documentChunk.items[child].htmlClass}>`));
      }
    }
    return;
  }
}
