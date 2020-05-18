import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit }           from '@angular/core';
import { JsfLayoutImage, JsfSpecialLayoutBuilder, PropStatus, PropStatusChangeInterface } from '@kalmia/jsf-common-es2015';
import { AbstractSpecialLayoutComponent }                                                 from '../../../abstract/special-layout.component';
import { BuilderDeveloperToolsInterface }                                                 from '../../../builder-developer-tools.interface';
import { takeUntil }                                                                      from 'rxjs/operators';
import { DomSanitizer }                                                                   from '@angular/platform-browser';

@Component({
  selector       : 'jsf-layout-image',
  template       : `
      <ng-container *ngIf="!displayAsBackgroundImage">
          <img class="jsf-layout-image jsf-layout-image-display-mode-image"
               [ngClass]="htmlClass"
               *ngIf="image"
               [src]="image"
               (click)="handleLayoutClick($event)"
               [style.width]="width || ''"
               [style.height]="height || ''"/>
      </ng-container>

      <ng-container *ngIf="displayAsBackgroundImage">
          <div class="jsf-layout-image jsf-layout-image-display-mode-background"
               [ngClass]="htmlClass"
               *ngIf="image"
               (click)="handleLayoutClick($event)"
               [style.width]="width || ''"
               [style.height]="height || ''"
               [style.background-image]="getBackgroundImageStyle(image)"
               [style.background-position]="'center'"
               [style.background-size]="'cover'">
          </div>

      </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class LayoutImageComponent extends AbstractSpecialLayoutComponent<JsfLayoutImage> implements OnInit {

  @Input()
  layoutBuilder: JsfSpecialLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  private _image: string;

  constructor(private cdRef: ChangeDetectorRef,
              protected sanitizer: DomSanitizer) {
    super();
  }

  get image(): string {
    return this._image;
  }

  getBackgroundImageStyle(url: string) {
    return this.sanitizer.bypassSecurityTrustStyle(`url('${ url }')`);
  }

  get src(): string {
    return this.layout.src as any;
  }

  get width(): string {
    return this.layout.width;
  }

  get height(): string {
    return this.layout.height;
  }

  get dependencies(): string[] {
    return this.isEvalObject(this.src) ? this.src.dependencies || [] : [];
  }

  get displayAsBackgroundImage(): boolean {
    return !!this.layout.displayAsBackgroundImage;
  }

  ngOnInit(): void {
    this.getImage();

    if (this.isEvalObject(this.src)) {
      if (this.dependencies.length) {
        for (const dependency of this.dependencies) {
          const dependencyAbsolutePath = this.layoutBuilder.abstractPathToAbsolute(dependency);
          this.layoutBuilder.rootBuilder.listenForStatusChange(dependencyAbsolutePath)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((status: PropStatusChangeInterface) => {
              if (status.status !== PropStatus.Pending) {
                this.getImage();
              }
            });
        }
      } else {
        if (this.layoutBuilder.rootBuilder.warnings) {
          console.warn(`Layout 'image' [${ this.layoutBuilder.id }] uses an eval object for 'src' but has not listed any dependencies.`,
            `The component will be updated on every form value change which may decrease performance.`);
        }
        this.layoutBuilder.rootBuilder.propBuilder.statusChange
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((status: PropStatus) => {
            if (status !== PropStatus.Pending) {
              this.getImage();
            }
          });
      }
    }
  }

  private getImage() {
    if (this.isEvalObject(this.src)) {

      const ctx   = this.layoutBuilder.rootBuilder.getEvalContext({
        layoutBuilder: this.layoutBuilder
      });
      this._image = this.layoutBuilder.rootBuilder.runEvalWithContext(
        (this.src as any).$evalTranspiled || this.src.$eval, ctx);
    } else {
      this._image = this.src;
    }

    this.cdRef.detectChanges();
  }

  private isEvalObject(x: any): x is { $eval: string, dependencies?: string[] } {
    return typeof x === 'object' && '$eval' in x;
  }

}
