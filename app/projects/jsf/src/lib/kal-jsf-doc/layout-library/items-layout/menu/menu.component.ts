import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AbstractItemsLayoutComponent }                                         from '../../../abstract/items-layout.component';
import {
  JsfItemsLayoutBuilder,
  JsfLayoutButtonPreferences,
  JsfLayoutMenu,
  PropStatus,
  PropStatusChangeInterface
}                                                                               from '@kalmia/jsf-common-es2015';
import { BuilderDeveloperToolsInterface }                                       from '@kalmia/jsf-app/lib/kal-jsf-doc/builder-developer-tools.interface';
import { takeUntil }                                                            from 'rxjs/operators';


@Component({
  selector       : 'jsf-layout-menu',
  template       : `
      <!-- Important: We need inline-block display on this element to emulate regular material button layout -->
      <div class="jsf-layout-menu d-inline-block"
           [ngClass]="getLayoutInnerClass()"
           [ngStyle]="getLayoutInnerStyle()"
           (click)="handleLayoutClick($event)">
          <ng-container [ngSwitch]="themePreferences.variant">
              <button *ngSwitchCase="'basic'"
                      [type]="type"
                      class="jsf-layout-menu"
                      [class.jsf-layout-menu-normal]="isSizeNormal()"
                      [class.jsf-layout-menu-small]="isSizeSmall()"
                      [class.jsf-layout-menu-large]="isSizeLarge()"
                      [ngClass]="htmlClass"
                      [disabled]="disabled"
                      [matMenuTriggerFor]="rootMenu"
                      mat-button
                      (click)="dispatchClickEvents($event)"
                      [color]="themePreferences.color"
                      [disableRipple]="themePreferences.disableRipple">
                  <mat-icon *ngIf="icon">{{ icon }}</mat-icon>
                  <span class="jsf-button-title" *ngIf="title">{{ title }}</span>
                  <mat-icon class="mr-n2">keyboard_arrow_down</mat-icon>
              </button>
              <button *ngSwitchCase="'raised'"
                      [type]="type"
                      class="jsf-layout-menu"
                      [class.jsf-layout-menu-normal]="isSizeNormal()"
                      [class.jsf-layout-menu-small]="isSizeSmall()"
                      [class.jsf-layout-menu-large]="isSizeLarge()"
                      [ngClass]="htmlClass"
                      [disabled]="disabled"
                      [matMenuTriggerFor]="rootMenu"
                      mat-raised-button
                      (click)="dispatchClickEvents($event)"
                      [color]="themePreferences.color !== 'none' && themePreferences.color"
                      [disableRipple]="themePreferences.disableRipple">
                  <mat-icon *ngIf="icon">{{ icon }}</mat-icon>
                  <span class="jsf-button-title" *ngIf="title">{{ title }}</span>
                  <mat-icon class="mr-n2">keyboard_arrow_down</mat-icon>
              </button>
              <button *ngSwitchCase="'stroked'"
                      [type]="type"
                      class="jsf-layout-menu"
                      [class.jsf-layout-menu-normal]="isSizeNormal()"
                      [class.jsf-layout-menu-small]="isSizeSmall()"
                      [class.jsf-layout-menu-large]="isSizeLarge()"
                      [ngClass]="htmlClass"
                      [disabled]="disabled"
                      [matMenuTriggerFor]="rootMenu"
                      mat-stroked-button
                      (click)="dispatchClickEvents($event)"
                      [color]="themePreferences.color !== 'none' && themePreferences.color"
                      [disableRipple]="themePreferences.disableRipple">
                  <mat-icon *ngIf="icon">{{ icon }}</mat-icon>
                  <span class="jsf-button-title" *ngIf="title">{{ title }}</span>
                  <mat-icon class="mr-n2">keyboard_arrow_down</mat-icon>
              </button>
              <button *ngSwitchCase="'flat'"
                      [type]="type"
                      class="jsf-layout-menu"
                      [class.jsf-layout-menu-normal]="isSizeNormal()"
                      [class.jsf-layout-menu-small]="isSizeSmall()"
                      [class.jsf-layout-menu-large]="isSizeLarge()"
                      [ngClass]="htmlClass"
                      [disabled]="disabled"
                      [matMenuTriggerFor]="rootMenu"
                      mat-flat-button
                      (click)="dispatchClickEvents($event)"
                      [color]="themePreferences.color !== 'none' && themePreferences.color"
                      [disableRipple]="themePreferences.disableRipple">
                  <mat-icon *ngIf="icon">{{ icon }}</mat-icon>
                  <span class="jsf-button-title" *ngIf="title">{{ title }}</span>
                  <mat-icon class="mr-n2">keyboard_arrow_down</mat-icon>
              </button>
              <button *ngSwitchCase="'icon'"
                      [type]="type"
                      class="jsf-layout-menu"
                      [class.jsf-layout-menu-normal]="isSizeNormal()"
                      [class.jsf-layout-menu-small]="isSizeSmall()"
                      [class.jsf-layout-menu-large]="isSizeLarge()"
                      [ngClass]="htmlClass"
                      [disabled]="disabled"
                      [matMenuTriggerFor]="rootMenu"
                      mat-icon-button
                      (click)="dispatchClickEvents($event)"
                      [color]="themePreferences.color !== 'none' && themePreferences.color"
                      [disableRipple]="themePreferences.disableRipple">
                  <mat-icon *ngIf="icon">{{ icon }}</mat-icon>
                  <span class="jsf-button-title" *ngIf="title">{{ title }}</span>
                  <!-- No additional arrow for icon-type menu button -->
                  <!-- <mat-icon class="mr-n2">keyboard_arrow_down</mat-icon> -->
              </button>
              <button *ngSwitchCase="'fab'"
                      [type]="type"
                      class="jsf-layout-menu"
                      [class.jsf-layout-menu-normal]="isSizeNormal()"
                      [class.jsf-layout-menu-small]="isSizeSmall()"
                      [class.jsf-layout-menu-large]="isSizeLarge()"
                      [ngClass]="htmlClass"
                      [disabled]="disabled"
                      [matMenuTriggerFor]="rootMenu"
                      mat-fab
                      (click)="dispatchClickEvents($event)"
                      [color]="themePreferences.color !== 'none' && themePreferences.color"
                      [disableRipple]="themePreferences.disableRipple">
                  <mat-icon *ngIf="icon">{{ icon }}</mat-icon>
                  <span class="jsf-button-title" *ngIf="title">{{ title }}</span>
                  <mat-icon class="mr-n2">keyboard_arrow_down</mat-icon>
              </button>
              <button *ngSwitchCase="'mini-fab'"
                      [type]="type"
                      class="jsf-layout-menu"
                      [class.jsf-layout-menu-normal]="isSizeNormal()"
                      [class.jsf-layout-menu-small]="isSizeSmall()"
                      [class.jsf-layout-menu-large]="isSizeLarge()"
                      [ngClass]="htmlClass"
                      [disabled]="disabled"
                      [matMenuTriggerFor]="rootMenu"
                      mat-mini-fab
                      (click)="dispatchClickEvents($event)"
                      [color]="themePreferences.color !== 'none' && themePreferences.color"
                      [disableRipple]="themePreferences.disableRipple">
                  <mat-icon *ngIf="icon">{{ icon }}</mat-icon>
                  <span class="jsf-button-title" *ngIf="title">{{ title }}</span>
                  <mat-icon class="mr-n2">keyboard_arrow_down</mat-icon>
              </button>
              <pre *ngSwitchDefault>Unknown button variant {{ layoutBuilder.layout | json }}</pre>
          </ng-container>

          <mat-menu #rootMenu="matMenu">
              <jsf-layout-router *ngFor="let item of layoutBuilder.items"
                                 [layoutBuilder]="item"
                                 [developerTools]="developerTools"
                                 [ngClass]="getLayoutItemClass(item)"
                                 [ngStyle]="getLayoutItemStyle(item)">
              </jsf-layout-router>
          </mat-menu>
      </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class LayoutMenuComponent extends AbstractItemsLayoutComponent<JsfLayoutMenu> implements OnInit {

  @Input()
  layoutBuilder: JsfItemsLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  constructor(private cdRef: ChangeDetectorRef) {
    super();
  }

  get title(): string {
    const templateData = this.getTemplateData();

    if (templateData) {
      const template = this.translationServer.getTemplate(this.i18n(this.layout.title));
      return template(templateData);
    }

    return this.i18n(this.layout.title);
  }

  get dependencies(): string[] {
    return this.layout.templateData ? this.layout.templateData.dependencies || [] : [];
  }

  get icon(): string {
    return this.layout.icon;
  }

  get type(): string {
    return 'button';
  }

  get disabled(): boolean {
    return false;
  }

  get themePreferences(): JsfLayoutButtonPreferences {
    return {
      /* Defaults */
      color        : 'none',
      variant      : 'basic',
      size         : 'normal',
      disableRipple: false,

      /* Global overrides */
      ...(this.globalThemePreferences ? this.globalThemePreferences.button : {}),

      /* Layout overrides */
      ...(this.localThemePreferences || {})
    } as JsfLayoutButtonPreferences;
  }

  async dispatchClickEvents(event: any) {
    await this.handleLayoutClick(event);
  }

  ngOnInit(): void {
    if (this.layout.templateData) {
      if (this.dependencies.length) {
        for (const dependency of this.dependencies) {
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
          console.warn(`Layout 'menu' [${ this.layoutBuilder.id }] uses templateData but has not listed any dependencies.`,
            `The component will be updated on every form value change which may decrease performance.`);
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

  getTemplateData(): any {
    if (this.layout.templateData) {

      const ctx = this.layoutBuilder.rootBuilder.getEvalContext({
        layoutBuilder: this.layoutBuilder
      });
      return this.layoutBuilder.rootBuilder.runEvalWithContext(
        (this.layout.templateData as any).$evalTranspiled || this.layout.templateData.$eval, ctx);

    }
  }

  isSizeNormal = () => this.themePreferences.size === 'normal';
  isSizeSmall  = () => this.themePreferences.size === 'small';
  isSizeLarge  = () => this.themePreferences.size === 'large';

}
