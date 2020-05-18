import { ChangeDetectionStrategy, Component, Input, OnInit }                                               from '@angular/core';
import { AbstractSpecialLayoutComponent }                                                                  from '../../../abstract/special-layout.component';
import { JsfLayoutArrayItemAdd, JsfLayoutButtonPreferences, JsfPropBuilderArray, JsfSpecialLayoutBuilder } from '@kalmia/jsf-common-es2015';
import { BuilderDeveloperToolsInterface }                                                                  from '../../../builder-developer-tools.interface';

@Component({
  selector       : 'jsf-layout-array-item-add',
  template       : `
    <ng-container [ngSwitch]="themePreferences.variant">
      <button *ngSwitchCase="'basic'"
              type="button"
              class="jsf-layout-array-item-add"
              [class.jsf-layout-array-item-add-normal]="isSizeNormal()"
              [class.jsf-layout-array-item-add-small]="isSizeSmall()"
              [class.jsf-layout-array-item-add-large]="isSizeLarge()"
              [ngClass]="htmlClass"
              mat-button
              (click)="dispatchClickEvents($event)"
              [color]="themePreferences.color"
              [disableRipple]="themePreferences.disableRipple">
        <mat-icon *ngIf="icon">{{ icon }}</mat-icon>
        <span class="jsf-button-title" *ngIf="title">{{ title }}</span>
      </button>
      <button *ngSwitchCase="'raised'"
              type="button"
              class="jsf-layout-array-item-add"
              [class.jsf-layout-array-item-add-normal]="isSizeNormal()"
              [class.jsf-layout-array-item-add-small]="isSizeSmall()"
              [class.jsf-layout-array-item-add-large]="isSizeLarge()"
              [ngClass]="htmlClass"
              mat-raised-button
              (click)="dispatchClickEvents($event)"
              [color]="themePreferences.color !== 'none' && themePreferences.color"
              [disableRipple]="themePreferences.disableRipple">
        <mat-icon *ngIf="icon">{{ icon }}</mat-icon>
        <span class="jsf-button-title" *ngIf="title">{{ title }}</span>
      </button>
      <button *ngSwitchCase="'stroked'"
              type="button"
              class="jsf-layout-array-item-add"
              [class.jsf-layout-array-item-add-normal]="isSizeNormal()"
              [class.jsf-layout-array-item-add-small]="isSizeSmall()"
              [class.jsf-layout-array-item-add-large]="isSizeLarge()"
              [ngClass]="htmlClass"
              mat-stroked-button
              (click)="dispatchClickEvents($event)"
              [color]="themePreferences.color !== 'none' && themePreferences.color"
              [disableRipple]="themePreferences.disableRipple">
        <mat-icon *ngIf="icon">{{ icon }}</mat-icon>
        <span class="jsf-button-title" *ngIf="title">{{ title }}</span>
      </button>
      <button *ngSwitchCase="'flat'"
              type="button"
              class="jsf-layout-array-item-add"
              [class.jsf-layout-array-item-add-normal]="isSizeNormal()"
              [class.jsf-layout-array-item-add-small]="isSizeSmall()"
              [class.jsf-layout-array-item-add-large]="isSizeLarge()"
              [ngClass]="htmlClass"
              mat-flat-button
              (click)="dispatchClickEvents($event)"
              [color]="themePreferences.color !== 'none' && themePreferences.color"
              [disableRipple]="themePreferences.disableRipple">
        <mat-icon *ngIf="icon">{{ icon }}</mat-icon>
        <span class="jsf-button-title" *ngIf="title">{{ title }}</span>
      </button>
      <button *ngSwitchCase="'icon'"
              type="button"
              class="jsf-layout-array-item-add"
              [class.jsf-layout-array-item-add-normal]="isSizeNormal()"
              [class.jsf-layout-array-item-add-small]="isSizeSmall()"
              [class.jsf-layout-array-item-add-large]="isSizeLarge()"
              [ngClass]="htmlClass"
              mat-icon-button
              (click)="dispatchClickEvents($event)"
              [color]="themePreferences.color !== 'none' && themePreferences.color"
              [disableRipple]="themePreferences.disableRipple">
        <mat-icon *ngIf="icon">{{ icon }}</mat-icon>
        <span class="jsf-button-title" *ngIf="title">{{ title }}</span>
      </button>
      <button *ngSwitchCase="'fab'"
              type="button"
              class="jsf-layout-array-item-add"
              [class.jsf-layout-array-item-add-normal]="isSizeNormal()"
              [class.jsf-layout-array-item-add-small]="isSizeSmall()"
              [class.jsf-layout-array-item-add-large]="isSizeLarge()"
              [ngClass]="htmlClass"
              mat-fab
              (click)="dispatchClickEvents($event)"
              [color]="themePreferences.color !== 'none' && themePreferences.color"
              [disableRipple]="themePreferences.disableRipple">
        <mat-icon *ngIf="icon">{{ icon }}</mat-icon>
        <span class="jsf-button-title" *ngIf="title">{{ title }}</span>
      </button>
      <button *ngSwitchCase="'mini-fab'"
              type="button"
              class="jsf-layout-array-item-add"
              [class.jsf-layout-array-item-add-normal]="isSizeNormal()"
              [class.jsf-layout-array-item-add-small]="isSizeSmall()"
              [class.jsf-layout-array-item-add-large]="isSizeLarge()"
              [ngClass]="htmlClass"
              mat-mini-fab
              (click)="dispatchClickEvents($event)"
              [color]="themePreferences.color !== 'none' && themePreferences.color"
              [disableRipple]="themePreferences.disableRipple">
        <mat-icon *ngIf="icon">{{ icon }}</mat-icon>
        <span class="jsf-button-title" *ngIf="title">{{ title }}</span>
      </button>
      <pre *ngSwitchDefault>Unknown button variant {{ layoutBuilder.layout | json }}</pre>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class LayoutArrayItemAddComponent extends AbstractSpecialLayoutComponent<JsfLayoutArrayItemAdd> implements OnInit {

  @Input()
  layoutBuilder: JsfSpecialLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  get title(): string {
    return this.i18n(this.layout.title);
  }

  get icon(): string {
    return this.layout.icon;
  }

  get path(): string {
    return this.layout.path;
  }

  get value(): any {
    return this.layout.value;
  }

  get disabled(): boolean {
    return this.arrayProp.disabled;
  }

  get arrayProp(): JsfPropBuilderArray {
    return this.layoutBuilder.getPropItem(this.path) as any;
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

    let value = this.value;
    if (typeof value === 'object' && '$eval' in value) {
      const ctx = this.layoutBuilder.rootBuilder.getEvalContext({
        layoutBuilder: this.layoutBuilder
      });
      value     = this.layoutBuilder.rootBuilder.runEvalWithContext(
        (value as any).$evalTranspiled
        || value.$eval, ctx);
    }
    await this.arrayProp.add(value || void 0);
  }

  ngOnInit() {
    if (!this.path) {
      throw new Error(`You must provide the 'path' property on the 'array-item-add' layout`);
    }
  }

  isSizeNormal = () => this.themePreferences.size === 'normal';
  isSizeSmall  = () => this.themePreferences.size === 'small';
  isSizeLarge  = () => this.themePreferences.size === 'large';

}
