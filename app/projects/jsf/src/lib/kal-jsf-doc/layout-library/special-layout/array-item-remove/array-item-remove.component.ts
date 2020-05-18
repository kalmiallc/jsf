import { ChangeDetectionStrategy, Component, Input, SkipSelf }                           from '@angular/core';
import { AbstractSpecialLayoutComponent }                                                from '../../../abstract/special-layout.component';
import { JsfLayoutArrayItemRemove, JsfLayoutButtonPreferences, JsfSpecialLayoutBuilder } from '@kalmia/jsf-common-es2015';
import { ArrayItemRemoveDirective }                                                      from '../../../directives/array-item-remove.directive';
import { BuilderDeveloperToolsInterface }                                                from '../../../builder-developer-tools.interface';

@Component({
  selector       : 'jsf-layout-array-item-remove',
  template       : `
    <ng-container [ngSwitch]="themePreferences.variant">
      <button *ngSwitchCase="'basic'"
              type="button"
              class="jsf-layout-array-item-remove"
              [class.jsf-layout-array-item-remove-normal]="isSizeNormal()"
              [class.jsf-layout-array-item-remove-small]="isSizeSmall()"
              [class.jsf-layout-array-item-remove-large]="isSizeLarge()"
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
              class="jsf-layout-array-item-remove"
              [class.jsf-layout-array-item-remove-normal]="isSizeNormal()"
              [class.jsf-layout-array-item-remove-small]="isSizeSmall()"
              [class.jsf-layout-array-item-remove-large]="isSizeLarge()"
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
              class="jsf-layout-array-item-remove"
              [class.jsf-layout-array-item-remove-normal]="isSizeNormal()"
              [class.jsf-layout-array-item-remove-small]="isSizeSmall()"
              [class.jsf-layout-array-item-remove-large]="isSizeLarge()"
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
              class="jsf-layout-array-item-remove"
              [class.jsf-layout-array-item-remove-normal]="isSizeNormal()"
              [class.jsf-layout-array-item-remove-small]="isSizeSmall()"
              [class.jsf-layout-array-item-remove-large]="isSizeLarge()"
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
              class="jsf-layout-array-item-remove"
              [class.jsf-layout-array-item-remove-normal]="isSizeNormal()"
              [class.jsf-layout-array-item-remove-small]="isSizeSmall()"
              [class.jsf-layout-array-item-remove-large]="isSizeLarge()"
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
              class="jsf-layout-array-item-remove"
              [class.jsf-layout-array-item-remove-normal]="isSizeNormal()"
              [class.jsf-layout-array-item-remove-small]="isSizeSmall()"
              [class.jsf-layout-array-item-remove-large]="isSizeLarge()"
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
              class="jsf-layout-array-item-remove"
              [class.jsf-layout-array-item-remove-normal]="isSizeNormal()"
              [class.jsf-layout-array-item-remove-small]="isSizeSmall()"
              [class.jsf-layout-array-item-remove-large]="isSizeLarge()"
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
export class LayoutArrayItemRemoveComponent extends AbstractSpecialLayoutComponent<JsfLayoutArrayItemRemove> {

  @Input()
  layoutBuilder: JsfSpecialLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  constructor(@SkipSelf() public arrayItemRemoveDirective: ArrayItemRemoveDirective) {
    super();
  }

  get title(): string {
    return this.i18n(this.layout.title);
  }

  get icon(): string {
    return this.layout.icon;
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

    this.arrayItemRemoveDirective.remove();
  }

  isSizeNormal = () => this.themePreferences.size === 'normal';
  isSizeSmall  = () => this.themePreferences.size === 'small';
  isSizeLarge  = () => this.themePreferences.size === 'large';

}
