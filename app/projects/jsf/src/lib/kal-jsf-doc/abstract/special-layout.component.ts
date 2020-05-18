import {
  JsfI18nObject,
  JsfLayoutPreferencesInterface,
  JsfLayoutSpecialPreferencesInterface,
  JsfSpecialLayout,
  JsfSpecialLayoutBuilder
}                                         from '@kalmia/jsf-common-es2015';
import { AbstractLayoutComponent }        from './layout.component';
import { BuilderDeveloperToolsInterface } from '../builder-developer-tools.interface';

export abstract class AbstractSpecialLayoutComponent<LayoutType extends JsfSpecialLayout> extends AbstractLayoutComponent {

  layoutBuilder: JsfSpecialLayoutBuilder;

  developerTools?: BuilderDeveloperToolsInterface;

  get layout(): LayoutType {
    return this.layoutBuilder && this.layoutBuilder.layout as LayoutType;
  }

  get id() {
    return this.layoutBuilder.id;
  }

  get globalThemePreferences(): JsfLayoutPreferencesInterface {
    return this.layoutBuilder.rootBuilder.layoutBuilder.preferences;
  }

  get localThemePreferences() {
    return this.layout.preferences as JsfLayoutSpecialPreferencesInterface;
  }

  get translationServer() {
    return this.layoutBuilder.translationServer;
  }

  i18n(source: string | JsfI18nObject): string {
    return this.translationServer.get(source);
  }

}
