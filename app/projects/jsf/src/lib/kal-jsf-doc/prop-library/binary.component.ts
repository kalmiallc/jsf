import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, Optional } from '@angular/core';
import { AbstractPropLayoutComponent }                                                    from '../abstract/prop-layout.component';
import { JsfPropBuilderBinary, JsfPropLayoutBuilder }                                     from '@kalmia/jsf-common-es2015';
import { ShowValidationMessagesDirective }                                                from '../directives/show-validation-messages.directive';
import { BuilderDeveloperToolsInterface }                                                 from '../builder-developer-tools.interface';


@Component({
  selector       : 'jsf-prop-binary',
  template       : `
      <div class="jsf-prop jsf-prop-binary" (click)="handleLayoutClick($event)" [ngClass]="htmlClass">
          <label *ngIf="prop?.title"
                 [attr.for]="id"
                 [ngClass]="layout?.labelHtmlClass || ''"
                 [style.display]="layout?.notitle ? 'none' : ''"
                 [innerHTML]="i18n(prop?.title)"></label>
          <p>{{ i18n(prop?.description) }}</p>
      </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class PropBinaryComponent extends AbstractPropLayoutComponent<JsfPropBuilderBinary> implements OnInit {

  @Input()
  layoutBuilder: JsfPropLayoutBuilder<JsfPropBuilderBinary>;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  constructor(protected cdRef: ChangeDetectorRef,
              @Optional() protected showValidation: ShowValidationMessagesDirective) {
    super(cdRef, showValidation);
  }

  ngOnInit() {
    super.ngOnInit();
  }

}
