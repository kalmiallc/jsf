import { Injectable }               from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  BuilderEventAdd,
  BuilderEventDelete,
  BuilderEventRefresh,
  BuilderEventSelectLayout,
  BuilderEventSelectProp
}                                   from '../interfaces/events';

@Injectable()
export class EventBusService {

  public selectLayout$: BehaviorSubject<BuilderEventSelectLayout> = new BehaviorSubject<BuilderEventSelectLayout>(null);
  public selectProp$: BehaviorSubject<BuilderEventSelectProp>     = new BehaviorSubject<BuilderEventSelectProp>(null);
  public onDocumentEdit$: Subject<BuilderEventRefresh>            = new Subject<BuilderEventRefresh>();
  public add$: Subject<BuilderEventAdd>                           = new Subject<BuilderEventAdd>();
  public delete$: Subject<BuilderEventDelete>                     = new Subject<BuilderEventDelete>();

  selectLayout(path: string, source: 'navigator' | 'preview') {
    console.log(`[builder][event][${ source }] select layout ${ path }`);
    this.selectLayout$.next({
      path,
      source
    });
    this.selectProp$.next(null);
  }

  selectProp(path: string, source: 'navigator' | 'preview') {
    console.log(`[builder][event][${ source }] select prop ${ path }`);
    this.selectProp$.next({
      path,
      source
    });
    this.selectLayout$.next(null);
  }

  onDocumentEdit() {
    console.log(`[builder][event] document edited`);
    this.onDocumentEdit$.next({});
  }

  add(id: string) {
    console.log(`[builder][event] add ${ id }`);
    this.add$.next({
      id
    });
    this.onDocumentEdit();
  }

  remove(id: string) {
    console.log(`[builder][event] remove ${ id }`);
    this.delete$.next({
      id
    });
    this.onDocumentEdit();
  }
}
