import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { KalJsfDocComponent }                                                                      from '@kalmia/jsf-app';
import { jsfEnv, Bind, JsfBuilder, JsfDocument, JsfNotificationInterface, LayoutMode }             from '@kalmia/jsf-common-es2015';
import { HttpClient }                                                                              from '@angular/common/http';
import { ApiService }                                                                              from '../services/api.service';
import { ActivatedRoute }                                                                          from '@angular/router';
import { uniq }                                                                                    from 'lodash';
import { exampleNationalParks1309 }                                                                from '../examples/basic/national-parks';


@Component({
  selector       : 'app-playground',
  templateUrl    : './playground.component.html',
  styleUrls      : ['./playground.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaygroundComponent implements OnInit, AfterViewInit {

  public filterQuery: any;
  public sortQuery: any;

  public doc: JsfDocument;
  public exampleName = '';

  public errorMessage = '';

  private lockKey: Symbol;

  public formDiff;
  public translatableStrings;

  public fullscreen = true;

  public storageKey;

  public modes = [
    LayoutMode.New,
    LayoutMode.Public,
    'playground'
  ];

  private _debug = false;
  get debug(): boolean {
    return this._debug;
  }

  set debug(x: boolean) {
    this._debug = x;
    this.cdRef.detectChanges();
  }

  private _showFilter = true;
  get showFilter(): boolean {
    return this._showFilter;
  }

  set showFilter(x: boolean) {
    this._showFilter = x;
    this.cdRef.detectChanges();
  }

  @ViewChild('document')
  private document: KalJsfDocComponent;

  public formBuilder: JsfBuilder;


  public editorOptions = {
    theme          : 'vs',
    language       : 'json',
    automaticLayout: true,
    fontSize       : 14,
    fontFamily     : 'Roboto Mono',
  };

  private _editorContent = JSON.stringify(this.doc, null, 4);
  public get editorContent(): string {
    return this._editorContent;
  }

  public set editorContent(value: string) {
    this._editorContent = value;

    if (this.storageKey) {
      localStorage.setItem('LOCAL-' + this.storageKey, this.editorContent);
    }
    this.updateJsfDocument();
  }

  public exampleSchemas =  [{
    schema: exampleNationalParks1309, label: 'National Parks List Example'
  }];

  constructor(
    public route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    public http: HttpClient,
    public apiService: ApiService
  ) {
    jsfEnv.__uuid = false;
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.storageKey = this.route.snapshot.queryParamMap.get('storage');

    let content: any = JSON.stringify(exampleNationalParks1309, null, 4);
    if (this.storageKey) {
      // use ?storage=<my key>
      // Example: http://localhost:4200/playground?storage=my-custom-123
      content = localStorage.getItem('LOCAL-' + this.storageKey) || JSON.stringify({
        schema: {},
        layout: {}
      });
    }

    if (content !== null) {
      this.editorContent = content;
    }
    this.cdRef.detectChanges();
  }

  updateJsfDocument() {
    try {
      this.doc          = JSON.parse(this.editorContent);
      this.errorMessage = undefined;
    } catch (e) {
      console.error(e);
      this.errorMessage = e.message;
    }
  }

  transpileEvals() {
    const x            = JSON.parse(this.editorContent);
    this.editorContent = JSON.stringify(x, null, 4);
  }

  setExampleSchema(schema: JsfDocument) {
    this.exampleName    = schema.$description;
    this._editorContent = JSON.stringify(schema, null, 4);
  }

  @Bind()
  jsfError(e: any) {
    console.error('/!\\/!\\/!\\ JSF ERROR /!\\/!\\/!\\', e);
    this.errorMessage = e;
  }

  @Bind()
  jsfBuilder(builder: any) {
    this.formBuilder = builder;
    console.log('JSFBuilder instance stored to "window.$jsf"');
    window['$jsf'] = this.formBuilder;
  }

  @Bind()
  async runCustomEvent(eventName: string, eventData: any) {
    console.log('runCustomEvent', eventName, eventData);
  }

  @Bind()
  async runVirtualEvent(eventName: string, eventData: any) {
    console.log('runVirtualEvent', eventName, eventData);
    return new Promise((resolve) => {
      setTimeout(resolve, 2000, { total: Math.random() * 1000 });
    });
  }

  @Bind()
  async handleNotification(notification: JsfNotificationInterface) {
    console.log('notification', notification);
  }

  get formValue() {
    return this.formBuilder && this.formBuilder.getJsonValue();
  }

  setLock() {
    if (!this.formBuilder) {
      return;
    }
    this.lockKey = this.formBuilder.lock();
    this.getDiff();
  }

  getDiff() {
    if (!this.formBuilder) {
      return;
    }
    if (this.lockKey) {
      this.formDiff = this.formBuilder.getJsonDiff(this.lockKey);
      console.log(this.formDiff);
    }
  }

  async getTranslatableStrings() {
    this.translatableStrings =  JSON.stringify(await this.formBuilder.getAllTranslatableStrings());
  }
}
