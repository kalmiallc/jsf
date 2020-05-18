import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { JsfLayoutIcon, JsfSpecialLayoutBuilder }    from '@kalmia/jsf-common-es2015';
import { AbstractSpecialLayoutComponent }            from '../../../abstract/special-layout.component';
import { BuilderDeveloperToolsInterface }            from '../../../builder-developer-tools.interface';

@Component({
  selector       : 'jsf-layout-icon',
  template       : `
      <jsf-icon [ngClass]="htmlClass"
                [icon]="icon"
                [size]="size"
                (click)="handleLayoutClick($event)">
      </jsf-icon>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class LayoutIconComponent extends AbstractSpecialLayoutComponent<JsfLayoutIcon> {

  @Input()
  layoutBuilder: JsfSpecialLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  get icon(): string {
    return this.layout.icon;
  }

  get color(): string {
    return this.layout.color;
  }

  get size(): string {
    return this.layout.size;
  }

}
