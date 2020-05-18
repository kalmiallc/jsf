import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, Optional } from '@angular/core';
import { AbstractPropLayoutComponent }                                                    from '../abstract/prop-layout.component';
import { JsfPropBuilderObject, JsfPropLayoutBuilder }                                     from '@kalmia/jsf-common-es2015';
import { ShowValidationMessagesDirective }                                                from '../directives/show-validation-messages.directive';
import { BuilderDeveloperToolsInterface }                                                 from '../builder-developer-tools.interface';


@Component({
  selector       : 'jsf-prop-object',
  template       : `
      <div class="jsf-prop jsf-prop-object" (click)="handleLayoutClick($event)" [ngClass]="htmlClass">
          <div class="description">{{ i18n(prop?.description) }}</div>
          <label *ngIf="prop?.title"
                 [attr.for]="id"
                 [ngClass]="layout?.labelHtmlClass || ''"
                 [style.display]="layout?.notitle ? 'none' : ''"
                 [innerHTML]="i18n(prop?.title)"></label>
          <pre>{{ propBuilder.getJsonValue() | json }}</pre>

          <jsf-error-messages *ngIf="hasErrors" [messages]="interpolatedErrors"></jsf-error-messages>
      </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class PropObjectComponent extends AbstractPropLayoutComponent<JsfPropBuilderObject> implements OnInit {

  @Input()
  layoutBuilder: JsfPropLayoutBuilder<JsfPropBuilderObject>;

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
