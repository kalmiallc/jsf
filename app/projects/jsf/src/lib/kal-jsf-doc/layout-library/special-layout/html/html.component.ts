import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { JsfLayoutHtml, JsfSpecialLayoutBuilder, PropStatus, PropStatusChangeInterface }                              from '@kalmia/jsf-common-es2015';
import { AbstractSpecialLayoutComponent }                                                                             from '../../../abstract/special-layout.component';
import { DomSanitizer }                                                                                               from '@angular/platform-browser';
import { BuilderDeveloperToolsInterface }                                                                             from '../../../builder-developer-tools.interface';
import { takeUntil }                                                                                      from 'rxjs/operators';

@Component({
  selector       : 'jsf-layout-html',
  template       : `
      <div class="jsf-layout-html"
           [ngClass]="htmlClass"
           (click)="handleLayoutClick($event)"
           #html>
      </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles         : []
})
export class LayoutHtmlComponent extends AbstractSpecialLayoutComponent<JsfLayoutHtml> implements OnInit, AfterViewInit {

  @Input()
  layoutBuilder: JsfSpecialLayoutBuilder;

  @Input()
  developerTools?: BuilderDeveloperToolsInterface;

  private templatedHtml: string;

  private fragment: DocumentFragment;

  @ViewChild('html')
  private containerElement: ElementRef;

  constructor(private sanitizer: DomSanitizer,
              private cdRef: ChangeDetectorRef) {
    super();
  }

  get dependencies(): string[] {
    return this.layout.templateData ? this.layout.templateData.dependencies || [] : [];
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
                this.updateHtml();
              }
            });
        }
      } else {
        if (this.layoutBuilder.rootBuilder.warnings) {
          console.warn(`Layout 'html' [${ this.layoutBuilder.id }] uses templateData but has not listed any dependencies.`,
            `The component will be updated on every form value change which may decrease performance.`);
        }
        this.layoutBuilder.rootBuilder.propBuilder.statusChange
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((status: PropStatus) => {
            if (status !== PropStatus.Pending) {
              this.updateHtml();
            }
          });
      }
    }
  }

  get html(): string {
    const templateData = this.getTemplateData();

    if (templateData) {
      const template = this.translationServer.getTemplate(this.i18n(this.layout.html));
      return template(templateData);
    }
    return this.i18n(this.layout.html);
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

  private updateHtml() {
    const html = this.html;
    if (html === this.templatedHtml) {
      return;
    }

    this.templatedHtml = html;

    while (this.containerElement.nativeElement.firstChild) {
      this.containerElement.nativeElement.removeChild(this.containerElement.nativeElement.lastChild);
    }

    this.fragment = document.createRange().createContextualFragment(this.templatedHtml);
    this.containerElement.nativeElement.appendChild(this.fragment);
  }

  public ngAfterViewInit(): void {
    this.updateHtml();
  }
}
