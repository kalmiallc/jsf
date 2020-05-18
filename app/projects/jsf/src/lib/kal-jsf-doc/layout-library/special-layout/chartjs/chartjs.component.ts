import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
}                                                                                           from '@angular/core';
import { JsfLayoutChartJS, JsfSpecialLayoutBuilder, PropStatus, PropStatusChangeInterface } from '@kalmia/jsf-common-es2015';
import { AbstractSpecialLayoutComponent }                                                   from '../../../abstract/special-layout.component';
import { ScriptInjectorService }                                                            from '../../../services/script-injector.service';
import { BuilderDeveloperToolsInterface }                                                   from '../../../builder-developer-tools.interface';
import { takeUntil }                                                                        from 'rxjs/operators';
import Color                                                                                from 'color';

export const chartjsConfig = {

  libraryUrl: 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.3/Chart.bundle.min.js',

  pluginUrls: [
    'https://cdn.jsdelivr.net/npm/chartjs-plugin-deferred@1.0.1',
    'https://cdn.jsdelivr.net/npm/chartjs-plugin-style@0.5.0/dist/chartjs-plugin-style.min.js'
  ]
};

declare const Chart: any;


let chartCount = 0;

@Component({
  selector       : 'jsf-layout-chartjs',
  template       : `
      <div class="jsf-layout-chartjs" [ngClass]="htmlClass"
           [style.height]="layout.height"
           [style.width]="layout.width">

          <div class="chartjs-container">
              <canvas id="jsf-chartjs-chart-{{ chartId }}" #canvas></canvas>
          </div>

      </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : [
      `
          /* Reqired for responsive sizing */
          .chartjs-container {
              position: relative;
              width:    100%;
              height:   100%;
          }
    `
  ]
})
export class LayoutChartJSComponent extends AbstractSpecialLayoutComponent<JsfLayoutChartJS> implements OnInit, OnDestroy, AfterViewInit {

  @Input()
  layoutBuilder: JsfSpecialLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  @ViewChild('canvas')
  private canvasRef: ElementRef;

  private libraryLoaded = false;

  private chart: any;


  public chartId = ++chartCount;


  constructor(private scriptInjector: ScriptInjectorService,
              private cdRef: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {

  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();

    this.chart.destroy();
    this.chart = void 0;
  }

  public async ngAfterViewInit() {
    await this.bootstrap();
    await this.createChart();
  }

  private async bootstrap() {
    await this.injectChartJS();

    /**
     * Subscribe to chart config dependencies.
     */
    if (typeof this.layout.config === 'object' && '$eval' in this.layout.config) {
      const dependencies = this.layout.config.dependencies;

      if (dependencies.length) {
        for (const dependency of dependencies) {
          const dependencyAbsolutePath = this.layoutBuilder.abstractPathToAbsolute(dependency);
          this.layoutBuilder.rootBuilder.listenForStatusChange(dependencyAbsolutePath)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((status: PropStatusChangeInterface) => {
              if (status.status !== PropStatus.Pending) {
                this.updateChart().catch(console.error);
              }
            });
        }
      } else {
        if (this.layoutBuilder.rootBuilder.warnings) {
          console.warn(`Layout 'chartjs' [${ this.layoutBuilder.id }] uses $eval config but has not listed any dependencies.`,
            `The component will never be updated.`);
        }
      }
    }
  }

  private async createChart() {
    const canvasElement = this.canvasRef.nativeElement as HTMLCanvasElement;

    this.chart = new Chart(canvasElement, this.getChartConfig());
  }

  private async updateChart() {
    if (!this.chart) {
      return;
    }

    const config = this.getChartConfig();

    this.chart.data = config.data;
    // this.chart.options = config.options;

    this.chart.update();
  }

  private getChartConfig() {
    if (typeof this.layout.config === 'object' && '$eval' in this.layout.config) {
      const ctx = this.layoutBuilder.rootBuilder.getEvalContext({
        layoutBuilder     : this.layoutBuilder,
        extraContextParams: {
          $color: Color
        }
      });
      return this.layoutBuilder.rootBuilder.runEvalWithContext(
        (this.layout.config as any).$evalTranspiled || this.layout.config.$eval, ctx);

    } else {
      return this.layout.config;
    }
  }

  /**
   * Inject the ChartJS library.
   */
  private async injectChartJS() {
    if (!this.libraryLoaded) {
      await this.scriptInjector.injectScriptFromUrl(chartjsConfig.libraryUrl);

      for (const pluginUrl of chartjsConfig.pluginUrls) {
        await this.scriptInjector.injectScriptFromUrl(pluginUrl);
      }

      this.libraryLoaded = true;
    }
  }


}
