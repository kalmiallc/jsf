import { JsfI18nObject, JsfUnknownLayoutBuilder }                 from '@kalmia/jsf-common-es2015';
import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { BuilderDeveloperToolsInterface }                         from '../builder-developer-tools.interface';

@Component({
  template       : ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RouterComponent {

  layoutBuilder: JsfUnknownLayoutBuilder;

  @HostBinding('class.hidden')
  public isHidden = false;

  get layout() {
    return this.layoutBuilder.layout;
  }

  get translationServer() {
    return this.layoutBuilder.translationServer;
  }

  i18n(source: string | JsfI18nObject): string {
    return this.translationServer.get(source);
  }
}
