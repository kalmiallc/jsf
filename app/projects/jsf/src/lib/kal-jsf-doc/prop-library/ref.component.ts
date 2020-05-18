import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, Optional } from '@angular/core';
import { AbstractPropLayoutComponent }                                                    from '../abstract/prop-layout.component';
import { JsfPropBuilderRef, JsfPropLayoutBuilder }                                        from '@kalmia/jsf-common-es2015';
import { ShowValidationMessagesDirective }                                                from '../directives/show-validation-messages.directive';
import { BuilderDeveloperToolsInterface }                                                 from '../builder-developer-tools.interface';


@Component({
  selector       : 'jsf-prop-ref',
  template       : `
      <div class="jsf-prop jsf-prop-ref" (click)="handleLayoutClick($event)" [ngClass]="htmlClass">
          <label *ngIf="prop?.title"
                 [attr.for]="id"
                 [ngClass]="layout?.labelHtmlClass || ''"
                 [style.display]="layout?.notitle ? 'none' : ''"
                 [innerHTML]="i18n(prop?.title)"></label>
          <p>{{ i18n(prop?.description) }}</p>
          <pre>Ref is not supported!</pre>
      </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class PropRefComponent extends AbstractPropLayoutComponent<JsfPropBuilderRef> implements OnInit {

  @Input()
  layoutBuilder: JsfPropLayoutBuilder<JsfPropBuilderRef>;

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
