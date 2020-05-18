import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { JsfLayoutD3, JsfSpecialLayoutBuilder }                                                           from '@kalmia/jsf-common-es2015';
import { AbstractSpecialLayoutComponent }                                                                 from '../../../abstract/special-layout.component';
import { ScriptInjectorService }                                                                          from '../../../services/script-injector.service';
import { Chart, d3Config }                                                                                from './d3';
import { ChartSunburst }                                                                       from './charts/chart.sunburst';
import { BuilderDeveloperToolsInterface }                                                      from '../../../builder-developer-tools.interface';


let chartCount = 0;

@Component({
  selector       : 'jsf-layout-d3',
  template       : `
    <div class="jsf-layout-d3" [ngClass]="htmlClass" [style.height]="layout.height">

      <div class="d3-container" id="jsf-d3-chart-{{ chartId }}"></div>

    </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class LayoutD3Component extends AbstractSpecialLayoutComponent<JsfLayoutD3> implements OnInit, OnDestroy, AfterViewInit {

  @Input()
  layoutBuilder: JsfSpecialLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  public chartId = ++chartCount;

  // Flag indicating whether D3 library is loaded.
  private libraryLoaded = false;

  // Chart element container
  private chart: Chart;


  get chartType() {
    return this.layout.chartType;
  }

  async ngOnInit() {
    await this.injectD3();
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
    this.destroyChart();
  }

  ngAfterViewInit(): void {
  }

  constructor(private scriptInjector: ScriptInjectorService,
              private cdRef: ChangeDetectorRef) {
    super();
  }

  /**
   * Inject the D3 library.
   */
  private async injectD3() {
    await this.scriptInjector.injectScriptFromUrl(d3Config.libraryUrl);
    this.libraryLoaded = true;
    this.createChart();
  }

  private createChart() {
    this.chart = new (this.getChartRenderer())(
      this.layoutBuilder,
      `#jsf-d3-chart-${ this.chartId }.d3-container`
    );

    this.chart.create();

    this.cdRef.detectChanges();
  }

  private destroyChart() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private getChartRenderer(): any {
    switch (this.chartType) {
      case 'sunburst':
        return ChartSunburst;
      default:
        throw new Error(`Unknown chart type '${ this.chartType }'`);
    }
  }

}
