import { JsfAbstractLayout, JsfAbstractLayoutBuilder } from '@kalmia/jsf-common-es2015';
import { OnDestroy }                                   from '@angular/core';
import { Subject }                                     from 'rxjs';

export class AnalyticsEvent {
  category: string;
  event: string;
  as: string;
}

function isAnalyticsEventObject(x: any): x is AnalyticsEvent {
  return typeof x === 'object' && 'event' in x && 'as' in x;
}

export abstract class AbstractLayoutComponent implements OnDestroy {

  protected ngUnsubscribe: Subject<void> = new Subject();

  layoutBuilder: JsfAbstractLayoutBuilder<JsfAbstractLayout>;

  get layout(): any {
    return this.layoutBuilder && this.layoutBuilder.layout;
  }

  get htmlOuterClass() {
    return this.layout.htmlOuterClass || '';
  }

  get htmlClass() {
    return this.layout.htmlClass || '';
  }

  get analyticsEnabled(): boolean {
    return !!this.layout.analytics;
  }

  get analyticsCategory(): string {
    return this.layout.analytics.category;
  }

  get analyticsEvents(): AnalyticsEvent[] {
    const actions: AnalyticsEvent[] = [];
    for (const x of this.layout.analytics.track) {
      if (isAnalyticsEventObject(x)) {
        actions.push({
          category: this.analyticsCategory,
          event   : x.event,
          as      : x.as
        });
      } else {
        actions.push({
          category: this.analyticsCategory,
          event   : x as string,
          as      : x as string
        });
      }
    }
    return actions;
  }

  hasAnalyticsEvent(eventName: string): boolean {
    return this.analyticsEnabled && this.analyticsEvents.findIndex(x => x.event === eventName) >= 0;
  }

  getAnalyticsEventData(eventName: string): AnalyticsEvent {
    return this.analyticsEvents.find(x => x.event === eventName);
  }

  async handleLayoutClick($event: any) {
    return this.layoutBuilder.onClick($event);
  }

  registerLayoutComponent(): void {
    if (this.layout.id) {
      this.layoutBuilder.rootBuilder.registerLayoutComponent(this.layout.id, this);
    }
  }

  unregisterLayoutComponent(): void {
    if (this.layout.id) {
      this.layoutBuilder.rootBuilder.unregisterLayoutComponent(this.layout.id);
    }
  }

  setLayoutState(key: string, value: any): any {
    if (this.layout.id) {
      this.layoutBuilder.rootBuilder.setLayoutStateUnderSameIds(
        [this.layout.id, this.layoutBuilder.id, this.layoutBuilder.idGroup],
        key,
        value
      );
    }
  }

  getLayoutState(key: string): any {
    if (this.layout.id) {
      return this.layoutBuilder.rootBuilder.getLayoutState(this.layout.id, key);
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
