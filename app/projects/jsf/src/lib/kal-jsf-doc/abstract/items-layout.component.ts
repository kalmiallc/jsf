import {
  JsfAbstractLayout,
  JsfAbstractLayoutBuilder,
  JsfI18nObject,
  JsfItemsLayout,
  JsfItemsLayoutBuilder,
  JsfLayoutItemsPreferencesInterface,
  JsfLayoutPreferencesInterface,
  JsfStyles
}                                         from '@kalmia/jsf-common-es2015';
import { AbstractLayoutComponent }        from './layout.component';
import { Input }                          from '@angular/core';
import { BuilderDeveloperToolsInterface } from '@kalmia/jsf-app/lib/kal-jsf-doc/builder-developer-tools.interface';

export abstract class AbstractItemsLayoutComponent<LayoutType extends JsfItemsLayout> extends AbstractLayoutComponent {

  layoutBuilder: JsfItemsLayoutBuilder;

  developerTools?: BuilderDeveloperToolsInterface;

  get layout(): LayoutType {
    return this.layoutBuilder && this.layoutBuilder.layout as LayoutType;
  }

  get id() {
    return this.layoutBuilder.id;
  }

  private getStyles(layout: JsfAbstractLayout = this.layout): JsfStyles {
    return layout && layout.styles; // tslint:disable-line
  }

  getLayoutClass(layout: JsfAbstractLayout = this.layout): string {
    return layout.htmlOuterClass;
  }

  getLayoutInnerClass(layout: JsfAbstractLayout = this.layout): string {
    return layout.htmlClass;
  }

  getLayoutStyle(layout: JsfAbstractLayout = this.layout): any {
    const styles = {};

    if (layout && this.getStyles(layout)) {
      styles['display'] = this.getStyles(layout).display;

      styles['flex-direction']  = this.getStyles(layout).flexDirection;
      styles['flex-wrap']       = this.getStyles(layout).flexWrap;
      styles['flex-flow']       = this.getStyles(layout).flexFlow;
      styles['justify-content'] = this.getStyles(layout).justifyContent;
      styles['align-items']     = this.getStyles(layout).alignItems;
      styles['align-content']   = this.getStyles(layout).alignContent;
      styles['order']           = this.getStyles(layout).order;
      styles['flex-grow']       = this.getStyles(layout).flexGrow;
      styles['flex-shrink']     = this.getStyles(layout).flexShrink;
      styles['flex-basis']      = this.getStyles(layout).flexBasis;
      styles['flex']            = this.getStyles(layout).flex;
      styles['align-self']      = this.getStyles(layout).alignSelf;

      Object.keys(styles).forEach((key) => (styles[key] === undefined) && delete styles[key]);
    }

    return styles;
  }

  getLayoutInnerStyle(layout: JsfAbstractLayout = this.layout) {
    return this.getLayoutStyle(layout);
  }

  getLayoutItemClass(item: JsfAbstractLayoutBuilder<JsfAbstractLayout>): string {
    return this.getLayoutClass(item.layout);
  }

  getLayoutItemStyle(item: JsfAbstractLayoutBuilder<JsfAbstractLayout>): any {
    return this.getLayoutStyle(item.layout);
  }

  get globalThemePreferences(): JsfLayoutPreferencesInterface {
    return this.layoutBuilder.rootBuilder.layoutBuilder.preferences;
  }

  get localThemePreferences() {
    return this.layout.preferences as JsfLayoutItemsPreferencesInterface;
  }

  get translationServer() {
    return this.layoutBuilder.translationServer;
  }

  i18n(source: string | JsfI18nObject): string {
    return this.translationServer.get(source);
  }

}
