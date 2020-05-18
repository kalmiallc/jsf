import { ChangeDetectionStrategy, Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { JsfDocument, jsfForJsf } from '@kalmia/jsf-common-es2015';
import { get, set, omit } from 'lodash';
import { EventBusService } from '../services/event-bus.service';
import { MatMenuTrigger } from '@angular/material';


@Component({
  selector: 'jsf-builder-inspector',
  templateUrl: './jsf-builder-inspector.component.html',
  styleUrls: ['./jsf-builder-inspector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JsfBuilderInspectorComponent implements OnInit {

  // Get document
  @Input()
  doc: JsfDocument;

  propType;
  currentPath;
  selectedProp;
  selectedPropLayout = null;
  errorMessage: string;
  selectedPropItems;
  showItems = false;
  view: String = 'UI';
  theme: String = 'Light';
  definitionsList;

  // UI view settings
  propLayouts: { value?: any, builder?: any, error?: any, jsfDoc?: JsfDocument }[] = jsfForJsf.getJsfDefinitionsList()
    .map(x => jsfForJsf.getJsfComponent(x));


  // json view settings
  public editorOptions = {
    theme: 'vs',
    language: 'json',
    automaticLayout: true,
    fontSize: 14,
    fontFamily: 'Roboto Mono',
  };

  _editorContent;
  public get editorContent(): string {
    return this._editorContent;
  }
  public set editorContent(value: string) {
    this._editorContent = value;
  }





  constructor(
    public eventBusService: EventBusService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Listen to events and update prop layout 
    this.eventBusService.selectLayout$
      .subscribe(event => {
        if (!event) {
          return;
        }
            this.changeSelectedPropLayout(event.path);
      });
      this.eventBusService.selectProp$
      .subscribe(event => {
        if (!event) {
          return;
        }
            this.changeSelectedPropLayout(event.path);
      });
  }


  changeSelectedPropLayout(path: string) {
    this.currentPath = path;
    this.propType = path.split('.')[0];
    this.selectedProp = get(this.doc, path);

    // Omit items array if 'Show items[]' is false
    if (!this.showItems) {
      this.selectedPropItems = this.selectedProp.items;
      this._editorContent = JSON.stringify(omit(this.selectedProp, 'items'), null, 4);
    } else {
      this._editorContent = JSON.stringify(this.selectedProp, null, 4);
    }

    // Update layout definition and value
    this.selectedPropLayout = this.getSelectedPropLayout(this.selectedProp.type);
    if (this.selectedPropLayout) {
      this.selectedPropLayout.jsfDoc.value = this.selectedProp;
    }

    if (this.selectedPropLayout && this.selectedPropLayout.builder) {
      this.selectedPropLayout.builder.setJsonValue(this.selectedProp);
    }
    console.log(this.selectedPropLayout);

    // Trigger change detection
    this.detectChanges();
  }

  getSelectedPropLayout(type: string) {
    const propTitle = this.propType === 'layout' ? 'JsfLayout' + type : 'JsfProp' + type;

    for (const layout of this.propLayouts) {
      if (layout && layout.jsfDoc.$description.toLowerCase() === propTitle.toLowerCase()) {
        return layout;
      }
    }
  }

  refreshSelectedPropLayout() {
    console.log('Someone emitted refresh event');
    // this.selectedPropLayout = null;
    // this.selectedProp = null;
  }

  save() {
    switch (this.view) {
      case 'UI':
        let currValue = get(this.doc, this.currentPath);
        const newValue = this.selectedPropLayout.builder.getJsonValue();

        currValue = {
          ...newValue,
          type: currValue.type,
          preferences: currValue.preferences
        };
        for (const prop in currValue) {
          if (newValue.prop === null) {
            delete currValue[prop];
          } else if (prop === 'buildIf' || prop === 'visibleIf') {
            if (currValue[prop]) {
              currValue[prop].$eval = 'return true';
            }
          }
        }

        set(this.doc, this.currentPath, currValue);

        // refreshing JSON value
        if (!this.showItems) {
          this.selectedPropItems = this.selectedProp.items;
          this._editorContent = JSON.stringify(omit(currValue, 'items'), null, 4);
        } else {
          this._editorContent = JSON.stringify(currValue, null, 4);
        }
        break;

      case 'JSON':
        const newJsonValue = JSON.parse(this.editorContent);

        if (!this.showItems) {
          newJsonValue.items = this.selectedPropItems;
        }

        set(this.doc, this.currentPath, newJsonValue);
        if (this.selectedPropLayout && this.selectedPropLayout.builder) {
          this.selectedPropLayout.builder.setJsonValue(newJsonValue);
        }

        break;
    }

    this.changeSelectedPropLayout(this.currentPath);

    this.refresh();

  }

  viewChange(view: string) {
    this.view = view;
  }

  toggleDarkMode() {
    this.theme === 'Light' ? this.theme = 'Dark' : this.theme = 'Light';
    this.themeChanged(this.theme);
  }

  themeChanged(theme) {
    switch (theme) {
      case 'Dark': monaco.editor.setTheme('vs-dark'); break;
      case 'Light': monaco.editor.setTheme('vs'); break;
    }
  }

  private detectChanges() {
    if (this.cdRef) {
      this.cdRef.detectChanges();
    }
  }

  private refresh() {
    this.detectChanges();
    this.eventBusService.onDocumentEdit();
  }

  jsfErrorOnItem(item: any, e: any) {
    item.error = e;
  }

  jsfError(item: any) {
    return this.jsfErrorOnItem.bind(this, item);
  }

  jsfBuilderOnItem(item: any, builder: any) {
    item.builder = builder;
  }

  jsfBuilder(item: any) {
    return this.jsfBuilderOnItem.bind(this, item);
  }

  getValue(item: any) {
    console.log(item.builder.getJsonValue());
  }

}
