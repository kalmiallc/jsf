import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit }           from '@angular/core';
import { JsfLayoutBadge, JsfSpecialLayoutBuilder, PropStatus, PropStatusChangeInterface } from '@kalmia/jsf-common-es2015';
import { AbstractSpecialLayoutComponent }                                                 from '../../../abstract/special-layout.component';
import { BuilderDeveloperToolsInterface }                                                 from '../../../builder-developer-tools.interface';
import { takeUntil }                                                                      from 'rxjs/operators';
import Color                                                                              from 'color';

@Component({
  selector       : 'jsf-layout-badge',
  template       : `
      <div class="jsf-layout-badge" [ngClass]="htmlClass" (click)="handleLayoutClick($event)">
          <div class="jsf-layout-badge-background rounded"
               [class.__background-color--primary-20]="!backgroundColor"
               [ngStyle]="{'background-color': backgroundColor }">
              <div class="jsf-layout-badge-content"
                   [class.__color--primary]="!color"
                   [ngStyle]="{'color': color }">
                  <span>{{ title }}</span>
              </div>
          </div>
      </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : [`
      .jsf-layout-badge {
          display: inline-block;
      }

      .jsf-layout-badge-background {
          display:    inline-block;
          padding:    .2rem .8rem;
          transition: background-color 400ms cubic-bezier(0.25, 0.8, 0.25, 1);
      }

      .jsf-layout-badge-content {
          transition: color 400ms cubic-bezier(0.25, 0.8, 0.25, 1);
      }
  `]
})
export class LayoutBadgeComponent extends AbstractSpecialLayoutComponent<JsfLayoutBadge> implements OnInit {

  @Input()
  layoutBuilder: JsfSpecialLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  private _color: string;
  private _backgroundColor: string;

  constructor(private cdRef: ChangeDetectorRef) {
    super();
  }

  get title(): string {
    const templateData = this.getTitleTemplateData();

    if (templateData) {
      const template = this.translationServer.getTemplate(this.i18n(this.layout.title));
      return template(templateData);
    }

    return this.i18n(this.layout.title);
  }

  get color(): string {
    return this._color;
  }

  get backgroundColor(): string {
    return this._backgroundColor;
  }

  get titleDependencies(): string[] {
    return this.layout.templateData ? this.layout.templateData.dependencies || [] : [];
  }

  get colorDependencies(): string[] {
    return this.isEvalObject(this.layout.color) ? this.layout.color.dependencies || [] : [];
  }

  ngOnInit(): void {
    this.getColor();

    if (this.isEvalObject(this.layout.color)) {
      if (this.colorDependencies.length) {
        for (const dependency of this.colorDependencies) {
          const dependencyAbsolutePath = this.layoutBuilder.abstractPathToAbsolute(dependency);
          this.layoutBuilder.rootBuilder.listenForStatusChange(dependencyAbsolutePath)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((status: PropStatusChangeInterface) => {
              if (status.status !== PropStatus.Pending) {
                this.getColor();
              }
            });
        }
      } else {
        if (this.layoutBuilder.rootBuilder.warnings) {
          console.warn(`Layout 'badge' [${ this.layoutBuilder.id }] uses an eval object for 'color' but has not listed any dependencies.`,
            `The component will be updated on every form value change which may decrease performance.`);
        }
        this.layoutBuilder.rootBuilder.propBuilder.statusChange
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((status: PropStatus) => {
            if (status !== PropStatus.Pending) {
              this.getColor();
            }
          });
      }
    }

    if (this.layout.templateData) {
      if (this.titleDependencies.length) {
        for (const dependency of this.titleDependencies) {
          const dependencyAbsolutePath = this.layoutBuilder.abstractPathToAbsolute(dependency);
          this.layoutBuilder.rootBuilder.listenForStatusChange(dependencyAbsolutePath)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((status: PropStatusChangeInterface) => {
              if (status.status !== PropStatus.Pending) {
                this.cdRef.detectChanges();
              }
            });
        }
      } else {
        if (this.layoutBuilder.rootBuilder.warnings) {
          console.warn(`Layout 'badge' [${ this.layoutBuilder.id }] uses templateData but has not listed any dependencies.`,
            `The component will be updated on every form href change which may decrease performance.`);
        }
        this.layoutBuilder.rootBuilder.propBuilder.statusChange
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((status: PropStatus) => {
            if (status !== PropStatus.Pending) {
              this.cdRef.detectChanges();
            }
          });
      }
    }
  }

  getTitleTemplateData(): any {
    if (this.layout.templateData) {

      const ctx = this.layoutBuilder.rootBuilder.getEvalContext({
        layoutBuilder: this.layoutBuilder
      });
      return this.layoutBuilder.rootBuilder.runEvalWithContext(
        (this.layout.templateData as any).$evalTranspiled || this.layout.templateData.$eval, ctx);

    }
  }

  private getColor() {
    if (this.isEvalObject(this.layout.color)) {

      const ctx   = this.layoutBuilder.rootBuilder.getEvalContext({
        layoutBuilder     : this.layoutBuilder,
        extraContextParams: {
          $color: Color
        }
      });
      const color = this.layoutBuilder.rootBuilder.runEvalWithContext(
        (this.layout.color as any).$evalTranspiled || this.layout.color.$eval, ctx);

      this._color           = color && Color(color).rgb().string();
      this._backgroundColor = color && Color(color).alpha(.2).rgb().string();
    } else {
      this._color           = this.layout.color && Color(this.layout.color).rgb().string();
      this._backgroundColor = this.layout.color && Color(this.layout.color).alpha(.2).rgb().string();
    }

    this.cdRef.detectChanges();
  }

  private isEvalObject(x: any): x is { $eval: string, dependencies?: string[] } {
    return typeof x === 'object' && '$eval' in x;
  }
}
