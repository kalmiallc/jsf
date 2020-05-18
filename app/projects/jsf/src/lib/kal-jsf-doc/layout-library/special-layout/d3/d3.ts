import { JsfBuilder, JsfLayoutD3, JsfSpecialLayoutBuilder, JsfUnknownPropBuilder } from '@kalmia/jsf-common-es2015';

export const d3Config = {

  libraryUrl: 'https://d3js.org/d3.v5.min.js'

};

declare const d3;

export abstract class Chart {

  protected svgElement;

  protected get layout(): JsfLayoutD3 {
    return this.layoutBuilder.layout as JsfLayoutD3;
  }

  protected get builder(): JsfBuilder {
    return this.layoutBuilder.rootBuilder;
  }

  protected get rootProp(): JsfUnknownPropBuilder {
    return this.builder.propBuilder;
  }

  constructor(protected layoutBuilder: JsfSpecialLayoutBuilder,
              protected containerElementSelector: string,
              protected chartOptions?: any) {
  }


  /**
   * Initial creation of the chart & all elements.
   */
  abstract create(): void;

  /**
   * Called when component is destroyed.
   */
  abstract destroy(): void;

  /**
   * Update the chart manually.
   */
  abstract render(): void;

}
