import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { JsfLayoutHr, JsfSpecialLayoutBuilder }      from '@kalmia/jsf-common-es2015';
import { AbstractSpecialLayoutComponent }            from '../../../abstract/special-layout.component';
import { BuilderDeveloperToolsInterface }            from '../../../builder-developer-tools.interface';

@Component({
  selector       : 'jsf-layout-hr',
  template       : `
    <hr class="jsf-layout-hr" (click)="handleLayoutClick($event)" [ngClass]="htmlClass"/>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class LayoutHrComponent extends AbstractSpecialLayoutComponent<JsfLayoutHr> {

  @Input()
  layoutBuilder: JsfSpecialLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

}
