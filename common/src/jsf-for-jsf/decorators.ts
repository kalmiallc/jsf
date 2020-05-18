import { JsfProp } from '../schema/props';
import { JsfUnknownLayout } from '../layout';
import { JsfDocument } from '../jsf-document';
import { isArray, isPlainObject, mapValues, groupBy, omit } from 'lodash';

export const jsfRawStore: {
  [key: string]: {
    parent?: string,
    category?: string,
    deprecated?: boolean,
    layout?: JsfUnknownLayout[],
    schema?: { [key: string]: JsfProp | JsfProp[] | string | string[] }
  }
} = {};

export const jsfForJsf = new class {


  getJsfDefinitionsList() {
    return Object.keys(jsfRawStore).filter(x => !x.startsWith('JsfAbstract'));
  }

  getSidebarList() {
    return this.getJsfDefinitionsList()
      .map(key => ({ key, value: jsfRawStore[key] }))
      .reduce((a, c) => {
        if (c.key.startsWith('JsfProp')) {
          a.props.push({
            category: c.value.category,
            type: this.convertToKebabCase(c.key.substr(7)),
            name: c.key,
          })
        } else if (c.key.startsWith('JsfLayout')) {
          a.layouts.push({
            category: c.value.category,
            type: this.convertToKebabCase(c.key.substr(9)),
            name: c.key,
          })
        } else {
          console.warn('JSF Class name should start with JsfProp or JsfLayout prefix.');
        }
        return a;
      }, {
        layouts: [], props: []
      });
  }

  convertToKebabCase(string: string) {
    string = string.charAt(0).toLowerCase() + string.slice(1);
    const convertedString = string.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    return convertedString;
  }

  getRawJsfDefinition(key: string, isDeep?: boolean) {
    const x = { ...(jsfRawStore[key] || {}) };
    x.layout = x.layout || [];
    if (x.parent) {
      const p = this.getRawJsfDefinition(x.parent, true);
      x.layout = [
        ...x.layout,

        ...((p.layout.length || 1) ? [{
          type: 'heading',
          level: 4,
          title: x.parent
        } as any] : []),

        ...p.layout,
      ];
      x.schema = { ...p.schema, ...x.schema };
    }
    return x;
  }

  getJsfComponent(key: string, value?: any): { error?: any, jsfDoc?: JsfDocument } {
    try {
      const rawDef = this.getRawJsfDefinition(key);

      const schema: JsfProp = {
        type: 'object',
        properties: rawDef.schema
      } as any;

      const layout: JsfUnknownLayout = {
        type: 'div',
        items: rawDef.layout
      };

      return {
        jsfDoc: {
          $title: key,
          $description: key,
          $theme: 'rounded/yellowgreen',
          schema: schema,
          layout: layout,
          value
        }
      }
    } catch (error) {
      return {
        error
      }
    }
  };
};

export function JsfDefDeprecated(): any {
  // tslint:disable-next-line:only-arrow-functions
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    jsfRawStore[target.name] = jsfRawStore[target.name] || {};
    jsfRawStore[target.name].deprecated = true;
  };
}

export function DefCategory(category: string): any {
  // tslint:disable-next-line:only-arrow-functions
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    jsfRawStore[target.name] = jsfRawStore[target.name] || {};
    jsfRawStore[target.name].category = category;
  };
}

export function DefExtends(parent: string): any {
  // tslint:disable-next-line:only-arrow-functions
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    jsfRawStore[target.name] = jsfRawStore[target.name] || {};
    jsfRawStore[target.name].parent = parent;
  };
}


export function DefLayout(layout: JsfUnknownLayout | JsfUnknownLayout[] | any): any {
  // tslint:disable-next-line:only-arrow-functions
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    jsfRawStore[target.name] = jsfRawStore[target.name] || {};
    jsfRawStore[target.name].layout = isArray(layout) ? [layout[0]] : [layout];
  };
}


export function DefProp(schema: JsfProp | JsfProp[] | string | string[]): any {
  // tslint:disable-next-line:only-arrow-functions
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    jsfRawStore[target.constructor.name] = jsfRawStore[target.constructor.name] || {};
    jsfRawStore[target.constructor.name].schema = jsfRawStore[target.constructor.name].schema || {};

    if (isPlainObject(schema)) {
      jsfRawStore[target.constructor.name].schema[propertyName] = schema;
    } else if (isArray(schema)) {
      jsfRawStore[target.constructor.name].schema[propertyName] = schema[0];
    } else {
      delete jsfRawStore[target.constructor.name].schema[propertyName];
    }
  };
}
