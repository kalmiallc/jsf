import { Chart }                                 from '../d3';
import { uniq }                                  from 'lodash';
import { PropStatus, PropStatusChangeInterface } from '@kalmia/jsf-common-es2015';
import { Subject }                               from 'rxjs';
import { takeUntil }                             from 'rxjs/operators';

declare const d3;


export class ChartSunburst extends Chart {

  protected unsubscribe: Subject<void> = new Subject<void>();

  private renderWidth  = 860;
  private renderHeight = 480;

  private fontSize = 16;

  private radius;
  private polylineRadius;
  private polylineEdge;

  private arc;
  private polylineArc;

  private format;

  private hierarchy;
  private maxDepth;


  render(): void {
    const chartData = this.getChartData();

    this.updateHierarchy(chartData);
    this.updateArcGenerators();

    const root = this.partition();

    this.svgElement.selectAll('*').remove();

    this.svgElement.attr('transform', 'translate(' + this.renderWidth / 2 + ',' + this.renderHeight / 2 + ')');

    // Arcs
    this.svgElement.append('g')
      .attr('class', 'arcs')
      .selectAll('path')
      .data(root.descendants().filter(d => d.depth))
      .enter().append('path')
      .attr('fill', d => this.color(d.data.color))
      .attr('class', d => this.class(d.data.color))
      .attr('d', this.arc)
      .append('title')
      .text(d => `${ d.ancestors().map(x => x.data.name).filter(x => !!x).reverse().join('/') }\n${ this.format(d.value) }`);

    // Text group element
    /*
     const textSelection = this.svgElement.append('g')
     .attr('class', 'labels')
     .attr('pointer-events', 'none')
     .attr('text-anchor', 'middle')
     .selectAll('text')
     .data(root.descendants().filter(d => d.depth && (d.y0 + d.y1) / 2 * (d.x1 - d.x0) > 12))
     .enter();

     // Label
     textSelection.append('text')
     .attr('transform', function (d) {
     const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
     const y = ((d.y0 - (d.y1 - d.y0)) + (d.y1 - (d.y1 - d.y0))) / 2;
     return `rotate(${ x - 90 }) translate(${ y },${ x < 180 ? -5 : 5 }) rotate(${ x < 180 ? 0 : 180 })`;
     })
     .attr('dy', '0.35em')
     .style('font-weight', 'bold')
     .style('fill', d => this.color(d.data.labelColor))
     .attr('class', d => this.class(d.data.labelColor))
     .text(d => d.data.name);

     // Value
     textSelection.append('text')
     .attr('transform', function (d) {
     const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
     const y = ((d.y0 - (d.y1 - d.y0)) + (d.y1 - (d.y1 - d.y0))) / 2;
     return `rotate(${ x - 90 }) translate(${ y },${ x < 180 ? 5 : -5 }) rotate(${ x < 180 ? 0 : 180 })`;
     })
     .attr('dy', '0.35em')
     .style('fill', d => this.color(d.data.labelColor))
     .attr('class', d => this.class(d.data.labelColor))
     .text(d => d.data.value);
     */


    // Labels
    const text = this.svgElement
      .append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(root.descendants().filter(d => d.depth && d.data.name && d.value !== 0));

    const labelsRightPositions = [];
    const labelsLeftPositions  = [];

    text.enter()
      .append('text')
      .attr('dy', '.35em')
      .text((d) => {
        return `${ d.data.name } (${ d.value })`;
      })
      .attr('transform', (d) => {
        const originalData  = d;
        const originalRight = this.midAngle(d) < Math.PI;
        d                   = Object.assign({}, d);

        let guard = 0;

        while (guard < 360) {
          const right = this.midAngle(d) < Math.PI;
          const pos   = this.polylineArc.centroid(d);
          pos[0]      = this.polylineEdge * 1.05 * (right ? 1 : -1);

          let overlap = false;
          if (right) {
            for (const x of labelsRightPositions) {
              if (Math.abs(pos[1] - x[1]) < this.fontSize) {
                overlap = true;
                break;
              }
            }
          } else {
            for (const x of labelsLeftPositions) {
              if (Math.abs(pos[1] - x[1]) < this.fontSize) {
                overlap = true;
                break;
              }
            }
          }

          if (overlap) {
            d.x0 += (Math.PI * 2) / 360 * (originalRight ? 1 : -1);
            d.x1 += (Math.PI * 2) / 360 * (originalRight ? 1 : -1);
          } else {
            if (right) {
              labelsRightPositions.push(pos);
            } else {
              labelsLeftPositions.push(pos);
            }
            originalData.labelData = {
              ...(originalData),
              x0: d.x0,
              x1: d.x1
            };
            return `translate(${ pos })`;
          }

          guard++;
        }

        if (this.layoutBuilder.rootBuilder.warnings) {
          console.warn(`Polyline guard is ${ guard }`);
        }
      })
      .attr('text-anchor', (d) => {
        return this.midAngle(d.labelData) < Math.PI ? 'start' : 'end';
      });


    // Polylines
    const polyline = this.svgElement
      .append('g')
      .attr('class', 'polylines')
      .selectAll('polyline')
      .data(root.descendants().filter(d => d.depth && d.data.name && d.value !== 0));

    const polylinesRightPositions = [];
    const polylinesLeftPositions  = [];

    polyline.enter()
      .append('polyline')
      .style('stroke', 'black')
      .style('stroke-width', '2px')
      .style('opacity', '.3')
      .style('fill', 'none')
      .attr('points', (d) => {
        const originalData  = d;
        const originalRight = this.midAngle(d) < Math.PI;
        d                   = Object.assign({}, d);

        let guard = 0;

        while (guard < 360) {
          const right = this.midAngle(d) < Math.PI;
          const pos   = this.polylineArc.centroid(d);
          pos[0]      = this.polylineEdge * (right ? 1 : -1);

          let overlap = false;
          if (right) {
            for (const x of polylinesRightPositions) {
              if (Math.abs(pos[1] - x[1]) < this.fontSize) {
                overlap = true;
                break;
              }
            }
          } else {
            for (const x of polylinesLeftPositions) {
              if (Math.abs(pos[1] - x[1]) < this.fontSize) {
                overlap = true;
                break;
              }
            }
          }

          if (overlap) {
            d.x0 += (Math.PI * 2) / 360 * (originalRight ? 1 : -1);
            d.x1 += (Math.PI * 2) / 360 * (originalRight ? 1 : -1);
          } else {
            if (right) {
              polylinesRightPositions.push(pos);
            } else {
              polylinesLeftPositions.push(pos);
            }
            return [this.arc.centroid(originalData), this.polylineArc.centroid(d), pos];
          }

          guard++;
        }

        if (this.layoutBuilder.rootBuilder.warnings) {
          console.warn(`Polyline guard is ${ guard }`);
        }
      });

    // Set view box
    this.svgElement
      .select(function () { return this.parentNode; })
      .attr('viewBox', `${ 0 } ${ 0 } ${ this.renderWidth } ${ this.renderHeight }`);
  }

  create(): void {
    this.format = d3.format(',d');

    this.svgElement = d3.select(this.containerElementSelector)
      .append('svg')
      .style('width', '100%')
      .style('height', '100%')
      .style('font-size', `${ this.fontSize }px`)
      .style('font-weight', 'bold')
      .append('g');

    this.render();

    // Subscribe to dependencies
    const chartData = this.getChartData();

    if (chartData.dependencies.length) {
      for (const dependency of chartData.dependencies) {
        const dependencyAbsolutePath = this.layoutBuilder.abstractPathToAbsolute(dependency);
        this.layoutBuilder.rootBuilder.listenForStatusChange(dependencyAbsolutePath)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe((status: PropStatusChangeInterface) => {
            if (status.status !== PropStatus.Pending) {
              this.render();

            }
          });
      }
    } else {
      if (this.layoutBuilder.rootBuilder.warnings) {
        console.warn(`Chart 'sunburst' [${ this.layoutBuilder.id }] uses templateData but has not listed any dependencies.`,
          `The component will be updated on every form value change which may decrease performance.`);
      }
      this.layoutBuilder.rootBuilder.propBuilder.statusChange
        .pipe(takeUntil(this.unsubscribe))
        .subscribe((status: PropStatus) => {
          if (status !== PropStatus.Pending) {
            this.render();
          }
        });

    }
  }

  public destroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  private updateArcGenerators() {
    this.radius         = (this.renderHeight / 2) * 0.8;
    this.polylineRadius = (this.renderHeight / 2) * 0.9;
    this.polylineEdge   = (this.renderHeight / 2) * 0.95;

    const bandRadius = this.radius / this.maxDepth;

    this.arc = d3.arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      // .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
      // .padRadius(this.radius / 2)
      .innerRadius(d => d.y0 - bandRadius)
      .outerRadius(d => d.y1 - bandRadius /*- 1*/);

    this.polylineArc = d3.arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padRadius(this.radius / 2)
      .innerRadius(this.polylineRadius)
      .outerRadius(this.polylineRadius);
  }

  private partition() {
    return d3.partition()
      .size([2 * Math.PI, this.radius + (this.radius / this.maxDepth)])(this.hierarchy);
  }

  private updateHierarchy(data: any) {
    this.hierarchy = d3.hierarchy(data)
      .sum(d => d.value);
    // .sort((a, b) => b.value - a.value);

    this.maxDepth = 0;
    this.hierarchy.eachBefore(x => {
      if (x.value < 0) {
        if (this.layoutBuilder.rootBuilder.warnings) {
          console.warn(`Arc has negative value (${ x.value })`, x);
        }
      }
      this.maxDepth = Math.max(x.depth, this.maxDepth);
    });
  }

  private color(x: string) {
    if (x && x.startsWith('#')) {
      return x;
    }
  }

  private class(x: string) {
    if (x && !x.startsWith('#')) {
      return `__fill--${ x }`;
    }
  }

  private midAngle(d) {
    return d.x0 + (d.x1 - d.x0) / 2;
  }

  private getChartData() {
    const chartData = {
      maxDepth: 0
    };

    const dataSets = this.layout.dataSets;
    if (!dataSets || dataSets.length !== 1) {
      throw new Error('Pie chart requires exactly one data set.');
    }

    const dataSet: any = dataSets[0];

    const childrenData = this.fetchChildrenData(dataSet);

    const data = {
      name        : '',
      children    : childrenData.chartData,
      dependencies: uniq(childrenData.dependencies)
    };

    return data;
  }

  private fetchChildrenData(dataSetChildren: any[], chartData: any[] = []) {
    const dependencies = [];

    for (const child of dataSetChildren) {
      const o: any = {
        name       : child.label,
        color      : child.color,
        strokeColor: child.strokeColor
      };

      if (child.value && child.children) {
        throw new Error(`Data set item can't have both value and children property.`);
      }

      if (child.value) {
        // Has value
        if (child.value.key) {
          o.value = this.rootProp.getControlByPath(child.value.key).getValue();
          dependencies.push(child.value.key);
        } else if (child.value.const) {
          o.value = child.value.const;
        } else if (child.value.$eval) {
          const ctx = this.builder.getEvalContext();
          o.value   = this.builder.runEvalWithContext((child.value as any).$evalTranspiled || child.value.$eval, ctx);
          dependencies.push(...(child.value.dependencies || []));
        } else {
          throw new Error('No value provided');
        }
      }

      if (child.children) {
        // Has children
        const data         = [];
        const childrenData = this.fetchChildrenData(child.children, data);

        o.children = childrenData.chartData;
        dependencies.push(...childrenData.dependencies);
      }

      chartData.push(o);
    }

    return {
      chartData,
      dependencies
    };
  }
}
