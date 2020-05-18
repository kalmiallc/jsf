import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  Self,
  Output,
  EventEmitter
}                                         from '@angular/core';
import { Bind, JsfBuilder, JsfDocument }  from '@kalmia/jsf-common-es2015';
import { EventBusService }                from './services/event-bus.service';
import { BuilderDeveloperToolsInterface } from '../kal-jsf-doc/builder-developer-tools.interface';
import { Subject }                        from 'rxjs';
import { takeUntil }                      from 'rxjs/operators';
import { preferences }                    from './preferences/builder-preferences';

@Component({
  selector       : 'jsf-kal-jsf-builder',
  templateUrl    : './kal-jsf-builder.component.html',
  styleUrls      : ['./kal-jsf-builder.component.scss'],
  providers      : [
    EventBusService
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KalJsfBuilderComponent implements OnInit, OnDestroy {

  private ngUnsubscribe: Subject<void> = new Subject<void>();
  public developerTools: BuilderDeveloperToolsInterface;

  formBuilder: JsfBuilder;

  @Input()
  doc: JsfDocument;
  @Output()
  onDocChange = new EventEmitter<JsfDocument>();

  /**
   * Indicates if visible form is latest or not.
   */
  pendingChanges: boolean;

  constructor(private cdRef: ChangeDetectorRef,
              @Self() public eventBusService: EventBusService) {
    // Set up developer tools object
    this.developerTools = {
      eventBus: this.eventBusService
    };
  }

  public ngOnInit(): void {
    // Listeners
    this.eventBusService.onDocumentEdit$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(value => this.onDocumentEdit());

    // Trigger change detection
    this.detectChanges();
  }

  public onDocumentEdit() {
    // set pending changes flag
    this.pendingChanges = true;

    if (this.isCheckedAutoReload()) {
      this.reload();
    }

    this.onDocChange.emit(this.doc);
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private detectChanges() {
    if (this.cdRef) {
      this.cdRef.detectChanges();
    }
  }

  reload() {
    this.doc = Object.assign({}, this.doc);
    this.detectChanges();
    this.pendingChanges = false;
  }

  changeAutoReload(event) {
    preferences.autoReload = event.checked;
    if (preferences.autoReload && this.pendingChanges) {
      this.reload();
    }
  }

  isCheckedAutoReload() {
    return preferences.autoReload;
  }

  showReloadButton() {
    return !this.isCheckedAutoReload() && this.pendingChanges;
  }

  /**
   * JSF handlers.
   */
  @Bind()
  onFormBuilderCreated(formBuilder: JsfBuilder) {
    this.formBuilder = formBuilder;
  }

  @Bind()
  onCustomEvent() {
  }

  @Bind()
  onVirtualEvent() {
  }

  @Bind()
  onNotification() {
  }

  @Bind()
  onFormEvent() {
  }

}
