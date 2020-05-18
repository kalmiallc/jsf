import { JsfProviderAbstractTrigger }          from './abstract/jsf-provider-abstract-trigger';
import { Subject, timer }                      from 'rxjs';
import { takeUntil }                           from 'rxjs/operators';
import { JsfProviderIntervalTriggerInterface } from '../interfaces/jsf-provider-custom-trigger.interface';

export class JsfProviderIntervalTrigger extends JsfProviderAbstractTrigger<JsfProviderIntervalTriggerInterface> {

  private _active                    = false;
  private unsubscribe: Subject<void> = new Subject<void>();

  public async register(): Promise<void> {
    this._active = true;
    this.schedule();
  }

  public async unregister(): Promise<void> {
    this._active = false;

    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  private schedule() {
    if (!this._active) {
      return;
    }

    timer(this.trigger.interval)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(async () => {
        await this.executor.provideImmediately();
        this.schedule();
      });
  }
}
