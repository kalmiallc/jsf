import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, Pipe, ViewChild } from '@angular/core';
import { Bind, JsfBuilder, JsfDocument, JsfPropObject, JsfLayoutDiv, jsfForJsf } from '@kalmia/jsf-common-es2015';
import { EventBusService } from '../services/event-bus.service';
import { TreeComponent, ITreeOptions, TREE_ACTIONS, TreeModel, TreeNode } from 'angular-tree-component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BuilderEventSelectLayout, BuilderEventSelectProp, BuilderEventRefresh } from '../interfaces/events';
import { get, set, cloneDeep } from 'lodash';
import { MatMenuTrigger } from '@angular/material';
import { JsfPropIterator, JsfLayoutIterator } from './jsf-tree-iterator';

export interface NodeModel {
  name: string;
  title: string;
  id: number;
  type: 'prop' | 'layout';
  docType: string;
  path: string;
  children: NodeModel[];
}

@Component({
  selector: 'jsf-builder-navigator',
  templateUrl: './jsf-builder-navigator.component.html',
  styleUrls: ['./jsf-builder-navigator.component.scss'],
  providers: [
    EventBusService
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JsfBuilderNavigatorComponent implements OnInit {
  // get event
  @Input()
  eventBusService: EventBusService;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  @Input()
  builder: JsfBuilder;

  // Get document
  @Input()
  doc: JsfDocument;

  treeData: NodeModel[];
  propData: NodeModel[];
  layoutData: NodeModel[];

  id = 0;

  mode: 'Schema' | 'Layout' = 'Schema';

  toggleOptions: Array<String> = ['Schema', 'Layout'];
  debugButton: Array<String> = ['propData', 'layoutData'];

  @ViewChild(TreeComponent)
  private tree: TreeComponent;

  clickedNode: TreeNode;
  selectedNode: TreeNode;
  clipboardNode: TreeNode = null;

  // tree options
  options: ITreeOptions;

  // mat menu
  @ViewChild(MatMenuTrigger)
  contextMenu: MatMenuTrigger;

  contextMenuPosition = { x: '0px', y: '0px' };

  testIterator() {
    const doc = JSON.parse(`{
      "$description": "Basic",
      "$schema": "http://jsf.kalmia.si/draft-1",
      "$theme": "rounded/amber",
      "$dirtyList": [
          "orderCostInput"
      ],
      "schema": {
          "type": "object",
          "properties": {
              "firstName": {
                  "title": "First name",
                  "type": "string",
                  "required": true
              },
              "firstNameNoTitle": {
                  "type": "string"
              },
              "firstNameNoPlaceholder": {
                  "type": "string"
              },
              "firstNameDisabled": {
                  "type": "string",
                  "required": true,
                  "enabledIf": "return false"
              },
              "firstNameMultiline": {
                  "title": "First name multiline",
                  "type": "string",
                  "required": true,
                  "multiline": true
              },
              "message": {
                  "title": "Message",
                  "type": "string",
                  "minLength": 10,
                  "enabledIf": {
                      "$eval": "return $val.firstName === 'A'",
                      "dependencies": [
                          "firstName"
                      ]
                  }
              },
              "numberInput": {
                  "type": "integer",
                  "title": "Number input (linked to dropdown)",
                  "required": true
              },
              "numberInputNoTitle": {
                  "type": "integer"
              },
              "numberInputNoPlaceholder": {
                  "type": "integer"
              },
              "numberInputDisabled": {
                  "type": "integer",
                  "enabledIf": "return false"
              },
              "dateInput": {
                  "title": "Date input",
                  "type": "date"
              },
              "dropdownInput": {
                  "type": "string",
                  "title": "Select an option",
                  "required": true,
                  "handler": {
                      "type": "common/dropdown",
                      "values": [
                          {
                              "value": "value1",
                              "label": "> 5",
                              "enabledIf": {
                                  "$eval": "return $val.numberInput > 5",
                                  "dependencies": [
                                      "numberInput"
                                  ]
                              }
                          },
                          {
                              "value": "value2",
                              "label": "<= 5",
                              "enabledIf": {
                                  "$eval": "return !$val.numberInput || $val.numberInput <= 5",
                                  "dependencies": [
                                      "numberInput"
                                  ]
                              }
                          },
                          {
                              "value": "value3",
                              "label": "Value 3"
                          },
                          {
                              "value": "value4",
                              "label": "Value 4"
                          },
                          {
                              "value": "value5",
                              "label": "Value 5"
                          }
                      ]
                  }
              },
              "dropdownInputDisabled": {
                  "type": "string",
                  "enabledIf": "return false",
                  "handler": {
                      "type": "common/dropdown",
                      "values": [
                          {
                              "value": "value1",
                              "label": "Value 1"
                          },
                          {
                              "value": "value2",
                              "label": "Value 2"
                          },
                          {
                              "value": "value3",
                              "label": "Value 3"
                          },
                          {
                              "value": "value4",
                              "label": "Value 4"
                          },
                          {
                              "value": "value5",
                              "label": "Value 5"
                          }
                      ]
                  }
              },
              "booleanInput1": {
                  "type": "boolean",
                  "title": "Boolean input (linked to disabled button)"
              },
              "buttonToggleInput1": {
                  "type": "string",
                  "title": "Button toggle input",
                  "handler": {
                      "type": "common/button-toggle",
                      "values": [
                          {
                              "value": "AccessControl",
                              "label": "Access Control",
                              "icon": "https://avatar-cdn.atlassian.com/8934b9f38626b81a0515fd961f40cb9d"
                          },
                          {
                              "value": "TimeAndAttendance",
                              "label": "Time & Attendance",
                              "icon": "https://avatar-cdn.atlassian.com/8934b9f38626b81a0515fd961f40cb9d"
                          },
                          {
                              "value": "Both",
                              "label": "Both",
                              "icon": "https://avatar-cdn.atlassian.com/8934b9f38626b81a0515fd961f40cb9d"
                          }
                      ]
                  }
              },
              "buttonToggleInput2": {
                  "type": "array",
                  "title": "Button toggle input",
                  "handler": {
                      "type": "common/button-toggle",
                      "values": [
                          {
                              "value": "AccessControl",
                              "label": "Access Control",
                              "icon": "https://avatar-cdn.atlassian.com/8934b9f38626b81a0515fd961f40cb9d"
                          },
                          {
                              "value": "TimeAndAttendance",
                              "label": "Time & Attendance",
                              "icon": "https://avatar-cdn.atlassian.com/8934b9f38626b81a0515fd961f40cb9d"
                          }
                      ]
                  },
                  "items": {
                      "type": "string"
                  }
              },
              "arrayInput1": {
                  "type": "array",
                  "title": "Expansion panels",
                  "items": {
                      "type": "object",
                      "properties": {
                          "inputA": {
                              "type": "string",
                              "title": "Input A",
                              "required": true
                          },
                          "inputB": {
                              "type": "string",
                              "handler": {
                                  "type": "common/dropdown",
                                  "values": [
                                      {
                                          "value": "a1",
                                          "label": "Value 1"
                                      },
                                      {
                                          "value": "a2",
                                          "label": "Value 2"
                                      },
                                      {
                                          "value": "a3",
                                          "label": "Value 3"
                                      },
                                      {
                                          "value": "a4",
                                          "label": "Value 4"
                                      }
                                  ]
                              }
                          }
                      }
                  }
              },
              "colorInput1": {
                  "type": "string",
                  "title": "Color",
                  "handler": {
                      "type": "common/color-picker",
                      "options": {
                          "mode": "ral"
                      }
                  }
              },
              "colorInput2": {
                  "type": "string",
                  "title": "Color",
                  "handler": {
                      "type": "common/color-picker",
                      "options": {
                          "mode": "custom"
                      },
                      "values": [
                          {
                              "value": "wood1",
                              "label": "Mahagonij",
                              "icon": "http://www.mkl-systems.si/uploads/mkld/Dvizna/img/panel_mahagonij.jpg",
                              "lightness": "dark"
                          },
                          {
                              "value": "wood2",
                              "label": "Temni hrast",
                              "icon": "http://www.mkl-systems.si/uploads/mkld/Dvizna/img/panel_oreh.jpg",
                              "lightness": "dark"
                          },
                          {
                              "value": "wood3",
                              "label": "Naravni hrast",
                              "icon": "http://www.mkl-systems.si/uploads/mkld/Dvizna/img/panel_naravni_hrast.jpg",
                              "lightness": "dark"
                          },
                          {
                              "value": "wood4",
                              "label": "Rustikal",
                              "icon": "http://www.mkl-systems.si/uploads/mkld/Dvizna/img/panel_zlati_hrast.jpg",
                              "lightness": "dark"
                          },
                          {
                              "value": "wood5",
                              "label": "Zlati hrast",
                              "icon": "http://www.mkl-systems.si/uploads/mkld/Dvizna/img/panel_temni_hrast.jpg",
                              "lightness": "dark"
                          }
                      ]
                  }
              },
              "colorInput3": {
                  "type": "string",
                  "title": "Color",
                  "handler": {
                      "type": "common/color-picker",
                      "options": {
                          "mode": "custom"
                      },
                      "values": [
                          {
                              "value": "color-1",
                              "label": "Red",
                              "color": "#ff0d1e"
                          },
                          {
                              "value": "color-2",
                              "label": "Orange",
                              "color": "#ffc318"
                          },
                          {
                              "value": "color-3",
                              "label": "Yellow",
                              "color": "#feff1c"
                          },
                          {
                              "value": "color-4",
                              "label": "Green",
                              "color": "#56e02f"
                          },
                          {
                              "value": "color-5",
                              "label": "Cyan",
                              "color": "#44e0cb"
                          },
                          {
                              "value": "color-6",
                              "label": "Blue",
                              "color": "#486dff"
                          },
                          {
                              "value": "color-7",
                              "label": "Purple",
                              "color": "#c642ff"
                          }
                      ]
                  }
              },
              "orderCostInput": {
                  "type": "number"
              },
              "orderCost": {
                  "type": "object",
                  "handler": {
                      "type": "common/cost"
                  },
                  "properties": {
                      "loading": {
                          "type": "boolean"
                      },
                      "data": {
                          "type": "object",
                          "handler": {
                              "type": "any"
                          },
                          "properties": {},
                          "default": {}
                      }
                  }
              },
              "sliderInput1": {
                  "type": "number",
                  "minimum": 0,
                  "maximum": 100,
                  "handler": {
                      "type": "common/slider"
                  }
              },
              "sliderInput2": {
                  "type": "integer",
                  "minimum": 0,
                  "maximum": 1000,
                  "handler": {
                      "type": "common/slider",
                      "maximum": 10000,
                      "step": 100
                  }
              },
              "sliderInput3": {
                  "type": "integer",
                  "enabledIf": {
                      "$eval": "return $val.sliderInput2 >= 5000",
                      "dependencies": [
                          "sliderInput2"
                      ]
                  },
                  "handler": {
                      "type": "common/slider",
                      "minimum": -50,
                      "maximum": 50
                  }
              },
              "phase": {
                  "type": "number",
                  "default": 0
              }
          }
      },
      "layout": {
          "type": "div",
          "items": [
              {
                  "type": "div",
                  "htmlClass": "wrapper",
                  "items": [
                      {
                          "type": "div",
                          "htmlClass": "container",
                          "items": [
                              {
                                  "type": "image",
                                  "src": "https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif",
                                  "height": "100px"
                              },
                              {
                                  "type": "stepper",
                                  "id": "@stepper-primary",
                                  "variant": "horizontal",
                                  "items": [
                                      {
                                          "type": "step",
                                          "title": "Intro",
                                          "items": [
                                              {
                                                  "type": "row",
                                                  "items": [
                                                      {
                                                          "type": "col",
                                                          "xs": 12,
                                                          "lg": 8,
                                                          "items": [
                                                              {
                                                                  "type": "row",
                                                                  "items": [
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "items": [
                                                                              {
                                                                                  "type": "heading",
                                                                                  "title": "Fill in your contact info",
                                                                                  "level": 1
                                                                              },
                                                                              {
                                                                                  "type": "heading",
                                                                                  "title": "Fill in your contact info",
                                                                                  "level": 2
                                                                              },
                                                                              {
                                                                                  "type": "heading",
                                                                                  "title": "Fill in your contact info",
                                                                                  "level": 3
                                                                              },
                                                                              {
                                                                                  "type": "heading",
                                                                                  "title": "Fill in your contact info",
                                                                                  "level": 4
                                                                              },
                                                                              {
                                                                                  "type": "heading",
                                                                                  "title": "Fill in your contact info",
                                                                                  "level": 5
                                                                              },
                                                                              {
                                                                                  "type": "heading",
                                                                                  "title": "Fill in your contact info",
                                                                                  "level": 6
                                                                              },
                                                                              {
                                                                                  "type": "span",
                                                                                  "title": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
                                                                              },
                                                                              {
                                                                                  "type": "paragraph",
                                                                                  "title": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
                                                                              },
                                                                              {
                                                                                  "type": "anchor",
                                                                                  "title": "(Link) Lorem ipsum dolor sit amet",
                                                                                  "href": "https://salesqueze.com/"
                                                                              },
                                                                              {
                                                                                  "type": "anchor",
                                                                                  "title": "(Link no href) Lorem ipsum dolor sit amet"
                                                                              },
                                                                              {
                                                                                  "type": "paragraph",
                                                                                  "title": "Don't click this",
                                                                                  "onClick": {
                                                                                      "navigateTo": {
                                                                                          "path": "/playground"
                                                                                      }
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "items": [
                                                                              {
                                                                                  "key": "phase",
                                                                                  "preferences": {
                                                                                      "step": 0.25
                                                                                  }
                                                                              },
                                                                              {
                                                                                  "type": "progress-tracker",
                                                                                  "step": {
                                                                                      "$eval": "return $val.phase",
                                                                                      "dependencies": [
                                                                                          "phase"
                                                                                      ]
                                                                                  },
                                                                                  "items": [
                                                                                      {
                                                                                          "type": "progress-tracker-step",
                                                                                          "title": "Step 1",
                                                                                          "description": "Lorem ipsum dolor sit amet.",
                                                                                          "onClick": [],
                                                                                          "disabled": {
                                                                                              "$eval": "return true"
                                                                                          }
                                                                                      },
                                                                                      {
                                                                                          "type": "progress-tracker-step",
                                                                                          "title": "Step 2",
                                                                                          "description": "Nam mollis tristique erat vel tristique. Aliquam erat volutpat. Mauris et vestibulum nisi. Duis molestie nisl sed scelerisque vestibulum. Nam placerat tristique placerat."
                                                                                      },
                                                                                      {
                                                                                          "type": "progress-tracker-step",
                                                                                          "title": "Step 3",
                                                                                          "description": "Integer semper dolor ac auctor rutrum. Duis porta ipsum vitae mi bibendum bibendum."
                                                                                      },
                                                                                      {
                                                                                          "type": "progress-tracker-step",
                                                                                          "title": "Step 4",
                                                                                          "description": "Curabitur mollis magna at blandit vestibulum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae."
                                                                                      }
                                                                                  ]
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "firstName",
                                                                                  "placeholder": "First name",
                                                                                  "preferences": {
                                                                                      "variant": "standard"
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "firstNameNoTitle",
                                                                                  "placeholder": "First name",
                                                                                  "preferences": {
                                                                                      "variant": "standard"
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "firstName",
                                                                                  "placeholder": "First name",
                                                                                  "preferences": {
                                                                                      "variant": "standard"
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "firstNameNoTitle",
                                                                                  "placeholder": "First name",
                                                                                  "preferences": {
                                                                                      "variant": "standard"
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "firstNameNoPlaceholder",
                                                                                  "preferences": {
                                                                                      "variant": "standard"
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "firstNameDisabled",
                                                                                  "preferences": {
                                                                                      "variant": "standard"
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "firstNameMultiline",
                                                                                  "preferences": {
                                                                                      "variant": "standard"
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "firstNameMultiline",
                                                                                  "preferences": {
                                                                                      "variant": "small"
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "firstName",
                                                                                  "placeholder": "First name",
                                                                                  "preferences": {
                                                                                      "variant": "small"
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "firstNameNoTitle",
                                                                                  "placeholder": "First name",
                                                                                  "preferences": {
                                                                                      "variant": "small"
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "firstNameNoPlaceholder",
                                                                                  "preferences": {
                                                                                      "variant": "small"
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "firstNameDisabled",
                                                                                  "preferences": {
                                                                                      "variant": "small"
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "numberInput",
                                                                                  "placeholder": "0000",
                                                                                  "preferences": {
                                                                                      "variant": "standard",
                                                                                      "stepperButtons": true
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "numberInputNoTitle",
                                                                                  "placeholder": "0000",
                                                                                  "preferences": {
                                                                                      "variant": "standard",
                                                                                      "stepperButtons": true
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "numberInputNoPlaceholder",
                                                                                  "preferences": {
                                                                                      "variant": "standard",
                                                                                      "stepperButtons": true
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "numberInputDisabled",
                                                                                  "preferences": {
                                                                                      "variant": "standard",
                                                                                      "stepperButtons": true
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "numberInput",
                                                                                  "placeholder": "0000",
                                                                                  "preferences": {
                                                                                      "variant": "small",
                                                                                      "stepperButtons": true
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "numberInputNoTitle",
                                                                                  "placeholder": "0000",
                                                                                  "preferences": {
                                                                                      "variant": "small",
                                                                                      "stepperButtons": true
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "numberInputNoPlaceholder",
                                                                                  "preferences": {
                                                                                      "variant": "small",
                                                                                      "stepperButtons": true
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "numberInputDisabled",
                                                                                  "preferences": {
                                                                                      "variant": "small",
                                                                                      "stepperButtons": true
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "dropdownInput",
                                                                                  "handlerPreferences": {
                                                                                      "stepperButtons": false
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "dropdownInputDisabled",
                                                                                  "handlerPreferences": {
                                                                                      "stepperButtons": false
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "dropdownInput",
                                                                                  "handlerPreferences": {
                                                                                      "stepperButtons": true
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "dropdownInputDisabled",
                                                                                  "handlerPreferences": {
                                                                                      "stepperButtons": true
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "dropdownInput",
                                                                                  "preferences": {
                                                                                      "variant": "small"
                                                                                  },
                                                                                  "handlerPreferences": {
                                                                                      "stepperButtons": false
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "dropdownInputDisabled",
                                                                                  "preferences": {
                                                                                      "variant": "small"
                                                                                  },
                                                                                  "handlerPreferences": {
                                                                                      "stepperButtons": false
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "dropdownInput",
                                                                                  "preferences": {
                                                                                      "variant": "small"
                                                                                  },
                                                                                  "handlerPreferences": {
                                                                                      "stepperButtons": true
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "dropdownInputDisabled",
                                                                                  "preferences": {
                                                                                      "variant": "small"
                                                                                  },
                                                                                  "handlerPreferences": {
                                                                                      "stepperButtons": true
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "booleanInput1",
                                                                                  "preferences": {
                                                                                      "variant": "slider"
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "booleanInput1",
                                                                                  "preferences": {
                                                                                      "variant": "checkbox"
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "sm": 6,
                                                                          "items": [
                                                                              {
                                                                                  "key": "dateInput"
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "items": [
                                                                              {
                                                                                  "type": "row",
                                                                                  "htmlClass": "text-center my-3",
                                                                                  "items": [
                                                                                      {
                                                                                          "type": "col",
                                                                                          "items": [
                                                                                              {
                                                                                                  "type": "button",
                                                                                                  "title": "Button - Basic",
                                                                                                  "preferences": {
                                                                                                      "color": "primary",
                                                                                                      "variant": "basic",
                                                                                                      "size": "normal"
                                                                                                  }
                                                                                              }
                                                                                          ]
                                                                                      },
                                                                                      {
                                                                                          "type": "col",
                                                                                          "items": [
                                                                                              {
                                                                                                  "type": "button",
                                                                                                  "title": "Button - Raised",
                                                                                                  "preferences": {
                                                                                                      "color": "primary",
                                                                                                      "variant": "raised",
                                                                                                      "size": "normal"
                                                                                                  }
                                                                                              }
                                                                                          ]
                                                                                      },
                                                                                      {
                                                                                          "type": "col",
                                                                                          "items": [
                                                                                              {
                                                                                                  "type": "button",
                                                                                                  "title": "Button - Stroked",
                                                                                                  "preferences": {
                                                                                                      "color": "primary",
                                                                                                      "variant": "stroked",
                                                                                                      "size": "normal"
                                                                                                  }
                                                                                              }
                                                                                          ]
                                                                                      },
                                                                                      {
                                                                                          "type": "col",
                                                                                          "items": [
                                                                                              {
                                                                                                  "type": "button",
                                                                                                  "title": "Button - Flat",
                                                                                                  "preferences": {
                                                                                                      "color": "primary",
                                                                                                      "variant": "flat",
                                                                                                      "size": "normal"
                                                                                                  }
                                                                                              }
                                                                                          ]
                                                                                      },
                                                                                      {
                                                                                          "type": "col",
                                                                                          "items": [
                                                                                              {
                                                                                                  "type": "button",
                                                                                                  "title": "Fab",
                                                                                                  "preferences": {
                                                                                                      "color": "primary",
                                                                                                      "variant": "fab",
                                                                                                      "size": "normal"
                                                                                                  }
                                                                                              }
                                                                                          ]
                                                                                      },
                                                                                      {
                                                                                          "type": "col",
                                                                                          "items": [
                                                                                              {
                                                                                                  "type": "button",
                                                                                                  "title": "MF",
                                                                                                  "preferences": {
                                                                                                      "color": "primary",
                                                                                                      "variant": "mini-fab",
                                                                                                      "size": "normal"
                                                                                                  }
                                                                                              }
                                                                                          ]
                                                                                      },
                                                                                      {
                                                                                          "type": "col",
                                                                                          "items": [
                                                                                              {
                                                                                                  "type": "button",
                                                                                                  "title": "Disabled button",
                                                                                                  "preferences": {
                                                                                                      "color": "primary",
                                                                                                      "variant": "flat",
                                                                                                      "size": "normal"
                                                                                                  },
                                                                                                  "disabled": {
                                                                                                      "$eval": "return $val.booleanInput1;",
                                                                                                      "dependencies": [
                                                                                                          "booleanInput1"
                                                                                                      ]
                                                                                                  }
                                                                                              }
                                                                                          ]
                                                                                      }
                                                                                  ]
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "items": [
                                                                              {
                                                                                  "type": "row",
                                                                                  "htmlClass": "text-center my-3",
                                                                                  "items": [
                                                                                      {
                                                                                          "type": "col",
                                                                                          "items": [
                                                                                              {
                                                                                                  "type": "button",
                                                                                                  "title": "Button - Basic",
                                                                                                  "preferences": {
                                                                                                      "color": "primary",
                                                                                                      "variant": "basic",
                                                                                                      "size": "large"
                                                                                                  }
                                                                                              }
                                                                                          ]
                                                                                      },
                                                                                      {
                                                                                          "type": "col",
                                                                                          "items": [
                                                                                              {
                                                                                                  "type": "button",
                                                                                                  "title": "Button - Raised",
                                                                                                  "preferences": {
                                                                                                      "color": "primary",
                                                                                                      "variant": "raised",
                                                                                                      "size": "large"
                                                                                                  }
                                                                                              }
                                                                                          ]
                                                                                      },
                                                                                      {
                                                                                          "type": "col",
                                                                                          "items": [
                                                                                              {
                                                                                                  "type": "button",
                                                                                                  "title": "Button - Stroked",
                                                                                                  "preferences": {
                                                                                                      "color": "primary",
                                                                                                      "variant": "stroked",
                                                                                                      "size": "large"
                                                                                                  }
                                                                                              }
                                                                                          ]
                                                                                      },
                                                                                      {
                                                                                          "type": "col",
                                                                                          "items": [
                                                                                              {
                                                                                                  "type": "button",
                                                                                                  "title": "Button - Flat",
                                                                                                  "preferences": {
                                                                                                      "color": "primary",
                                                                                                      "variant": "flat",
                                                                                                      "size": "large"
                                                                                                  }
                                                                                              }
                                                                                          ]
                                                                                      },
                                                                                      {
                                                                                          "type": "col",
                                                                                          "items": [
                                                                                              {
                                                                                                  "type": "button",
                                                                                                  "title": "Fab",
                                                                                                  "preferences": {
                                                                                                      "color": "primary",
                                                                                                      "variant": "fab",
                                                                                                      "size": "large"
                                                                                                  }
                                                                                              }
                                                                                          ]
                                                                                      },
                                                                                      {
                                                                                          "type": "col",
                                                                                          "items": [
                                                                                              {
                                                                                                  "type": "button",
                                                                                                  "title": "MF",
                                                                                                  "preferences": {
                                                                                                      "color": "primary",
                                                                                                      "variant": "mini-fab",
                                                                                                      "size": "large"
                                                                                                  }
                                                                                              }
                                                                                          ]
                                                                                      }
                                                                                  ]
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "items": [
                                                                              {
                                                                                  "key": "buttonToggleInput1",
                                                                                  "handlerPreferences": {
                                                                                      "variant": "basic"
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "items": [
                                                                              {
                                                                                  "key": "buttonToggleInput1",
                                                                                  "handlerPreferences": {
                                                                                      "variant": "tile",
                                                                                      "displayModeBreakpoint": "475px",
                                                                                      "scaleModeTilesPerRow": 3
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "items": [
                                                                              {
                                                                                  "key": "buttonToggleInput2",
                                                                                  "handlerPreferences": {
                                                                                      "variant": "basic"
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "items": [
                                                                              {
                                                                                  "key": "buttonToggleInput2",
                                                                                  "handlerPreferences": {
                                                                                      "variant": "tile",
                                                                                      "displayModeBreakpoint": "475px",
                                                                                      "scaleModeTilesPerRow": 3
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "items": [
                                                                              {
                                                                                  "type": "expansion-panel",
                                                                                  "key": "arrayInput1",
                                                                                  "items": [
                                                                                      {
                                                                                          "type": "expansion-panel-header",
                                                                                          "items": [
                                                                                              {
                                                                                                  "type": "row",
                                                                                                  "items": [
                                                                                                      {
                                                                                                          "type": "col",
                                                                                                          "xs": 4,
                                                                                                          "items": [
                                                                                                              {
                                                                                                                  "type": "span",
                                                                                                                  "title": "Panel"
                                                                                                              }
                                                                                                          ]
                                                                                                      },
                                                                                                      {
                                                                                                          "type": "col",
                                                                                                          "xs": 6,
                                                                                                          "items": [
                                                                                                              {
                                                                                                                  "type": "span",
                                                                                                                  "title": "Description {{ value }}",
                                                                                                                  "templateData": {
                                                                                                                      "$eval": "return { value: $getItemValue('arrayInput1[]').inputA || '' }",
                                                                                                                      "dependencies": [
                                                                                                                          "arrayInput1[]"
                                                                                                                      ]
                                                                                                                  }
                                                                                                              }
                                                                                                          ]
                                                                                                      }
                                                                                                  ]
                                                                                              }
                                                                                          ]
                                                                                      },
                                                                                      {
                                                                                          "type": "expansion-panel-content",
                                                                                          "items": [
                                                                                              {
                                                                                                  "type": "row",
                                                                                                  "items": [
                                                                                                      {
                                                                                                          "type": "col",
                                                                                                          "xs": 12,
                                                                                                          "items": [
                                                                                                              {
                                                                                                                  "key": "arrayInput1[].inputA"
                                                                                                              }
                                                                                                          ]
                                                                                                      },
                                                                                                      {
                                                                                                          "type": "col",
                                                                                                          "xs": 12,
                                                                                                          "items": [
                                                                                                              {
                                                                                                                  "key": "arrayInput1[].inputB"
                                                                                                              }
                                                                                                          ]
                                                                                                      },
                                                                                                      {
                                                                                                          "type": "array-item-remove",
                                                                                                          "title": "Delete"
                                                                                                      }
                                                                                                  ]
                                                                                              }
                                                                                          ]
                                                                                      }
                                                                                  ]
                                                                              },
                                                                              {
                                                                                  "type": "array-item-add",
                                                                                  "path": "arrayInput1",
                                                                                  "title": "Add item",
                                                                                  "value": {
                                                                                      "inputB": "a2"
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "span",
                                                                          "title": "Expansion panel element count: {{ value }}",
                                                                          "templateData": {
                                                                              "$eval": "return { value: $val.arrayInput1.length }",
                                                                              "dependencies": [
                                                                                  "arrayInput1[]"
                                                                              ]
                                                                          }
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "htmlClass": "my-3",
                                                                          "items": [
                                                                              {
                                                                                  "type": "hr"
                                                                              },
                                                                              {
                                                                                  "type": "menu",
                                                                                  "title": "Menu",
                                                                                  "items": [
                                                                                      {
                                                                                          "type": "menu-item",
                                                                                          "title": "Option 1",
                                                                                          "icon": "bookmark",
                                                                                          "description": "Bookmark",
                                                                                          "items": [
                                                                                              {
                                                                                                  "type": "menu-item",
                                                                                                  "title": "Suboption 1"
                                                                                              },
                                                                                              {
                                                                                                  "type": "menu-item",
                                                                                                  "title": "Suboption 2"
                                                                                              },
                                                                                              {
                                                                                                  "type": "hr"
                                                                                              },
                                                                                              {
                                                                                                  "type": "menu-item",
                                                                                                  "title": "Suboption 3"
                                                                                              },
                                                                                              {
                                                                                                  "type": "menu-item",
                                                                                                  "title": "Suboption 4"
                                                                                              },
                                                                                              {
                                                                                                  "type": "menu-item",
                                                                                                  "title": "Suboption 5",
                                                                                                  "description": "Test",
                                                                                                  "items": [
                                                                                                      {
                                                                                                          "type": "menu-item",
                                                                                                          "title": "Suboption 1"
                                                                                                      },
                                                                                                      {
                                                                                                          "type": "hr"
                                                                                                      },
                                                                                                      {
                                                                                                          "type": "menu-item",
                                                                                                          "title": "Suboption 2",
                                                                                                          "description": "ABC",
                                                                                                          "icon": "spellcheck"
                                                                                                      }
                                                                                                  ]
                                                                                              }
                                                                                          ]
                                                                                      },
                                                                                      {
                                                                                          "type": "menu-item",
                                                                                          "title": "Option 2",
                                                                                          "icon": "grade"
                                                                                      },
                                                                                      {
                                                                                          "type": "menu-item",
                                                                                          "title": "Option 3",
                                                                                          "icon": "playlist_add"
                                                                                      }
                                                                                  ]
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "htmlClass": "my-3",
                                                                          "items": [
                                                                              {
                                                                                  "key": "colorInput1",
                                                                                  "handlerPreferences": {
                                                                                      "height": "200px",
                                                                                      "searchable": true
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "htmlClass": "my-3",
                                                                          "items": [
                                                                              {
                                                                                  "key": "colorInput2"
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "htmlClass": "my-3",
                                                                          "items": [
                                                                              {
                                                                                  "key": "colorInput3",
                                                                                  "handlerPreferences": {
                                                                                      "tilesPerRow": 8
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 6,
                                                                          "htmlClass": "my-3",
                                                                          "items": [
                                                                              {
                                                                                  "key": "colorInput2",
                                                                                  "handlerPreferences": {
                                                                                      "variant": "popover-menu"
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 6,
                                                                          "htmlClass": "my-3",
                                                                          "items": [
                                                                              {
                                                                                  "key": "colorInput3",
                                                                                  "handlerPreferences": {
                                                                                      "variant": "popover-menu",
                                                                                      "tilesPerRow": 4
                                                                                  }
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "htmlClass": "my-3 d-flex align-items-center __background-color--grey",
                                                                          "items": [
                                                                              {
                                                                                  "type": "icon",
                                                                                  "icon": "sync"
                                                                              },
                                                                              {
                                                                                  "type": "icon",
                                                                                  "htmlClass": "__color--primary",
                                                                                  "icon": "sync#spin-ccw"
                                                                              },
                                                                              {
                                                                                  "type": "icon",
                                                                                  "icon": "sync#spin-cw"
                                                                              },
                                                                              {
                                                                                  "type": "icon",
                                                                                  "icon": "sync"
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "htmlClass": "my-3 __background-color--grey",
                                                                          "items": [
                                                                              {
                                                                                  "type": "icon",
                                                                                  "icon": "sync"
                                                                              },
                                                                              {
                                                                                  "type": "icon",
                                                                                  "htmlClass": "__color--primary",
                                                                                  "icon": "sync#spin-ccw"
                                                                              },
                                                                              {
                                                                                  "type": "icon",
                                                                                  "icon": "sync#spin-cw"
                                                                              },
                                                                              {
                                                                                  "type": "icon",
                                                                                  "icon": "sync"
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "htmlClass": "my-3",
                                                                          "items": [
                                                                              {
                                                                                  "type": "div",
                                                                                  "htmlClass": "border rounded p-3",
                                                                                  "items": [
                                                                                      {
                                                                                          "type": "heading",
                                                                                          "level": 5,
                                                                                          "title": "Cost handler - Enter a number in the input below to trigger"
                                                                                      },
                                                                                      {
                                                                                          "key": "orderCostInput"
                                                                                      },
                                                                                      {
                                                                                          "key": "orderCost"
                                                                                      },
                                                                                      {
                                                                                          "type": "span",
                                                                                          "title": "Total cost: {{ value }}€",
                                                                                          "templateData": {
                                                                                              "$eval": "return { value: $val.orderCost.data.total }",
                                                                                              "dependencies": [
                                                                                                  "orderCost"
                                                                                              ]
                                                                                          }
                                                                                      }
                                                                                  ]
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "items": [
                                                                              {
                                                                                  "type": "progress-bar",
                                                                                  "mode": "determinate",
                                                                                  "progress": 35,
                                                                                  "htmlClass": "mb-2"
                                                                              },
                                                                              {
                                                                                  "type": "progress-bar",
                                                                                  "mode": "indeterminate",
                                                                                  "color": "accent",
                                                                                  "htmlClass": "mb-2"
                                                                              },
                                                                              {
                                                                                  "type": "progress-bar",
                                                                                  "mode": "buffer",
                                                                                  "progress": 70,
                                                                                  "color": "warn",
                                                                                  "htmlClass": "mb-2"
                                                                              },
                                                                              {
                                                                                  "type": "progress-bar",
                                                                                  "mode": "query",
                                                                                  "htmlClass": "mb-2"
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "items": [
                                                                              {
                                                                                  "type": "tabset",
                                                                                  "items": [
                                                                                      {
                                                                                          "type": "tab",
                                                                                          "title": "Tab title 1",
                                                                                          "items": [
                                                                                              {
                                                                                                  "type": "heading",
                                                                                                  "level": 1,
                                                                                                  "title": "Heading 1"
                                                                                              },
                                                                                              {
                                                                                                  "type": "heading",
                                                                                                  "level": 2,
                                                                                                  "title": "Heading 2"
                                                                                              },
                                                                                              {
                                                                                                  "type": "heading",
                                                                                                  "level": 3,
                                                                                                  "title": "Heading 3"
                                                                                              },
                                                                                              {
                                                                                                  "type": "heading",
                                                                                                  "level": 4,
                                                                                                  "title": "Heading 4"
                                                                                              },
                                                                                              {
                                                                                                  "type": "heading",
                                                                                                  "level": 5,
                                                                                                  "title": "Heading 5"
                                                                                              },
                                                                                              {
                                                                                                  "type": "heading",
                                                                                                  "level": 6,
                                                                                                  "title": "Heading 6"
                                                                                              },
                                                                                              {
                                                                                                  "type": "span",
                                                                                                  "title": "Test1"
                                                                                              }
                                                                                          ]
                                                                                      },
                                                                                      {
                                                                                          "type": "tab",
                                                                                          "title": "Tab title 2",
                                                                                          "items": [
                                                                                              {
                                                                                                  "type": "span",
                                                                                                  "title": "Test2"
                                                                                              }
                                                                                          ]
                                                                                      },
                                                                                      {
                                                                                          "type": "tab",
                                                                                          "title": "Tab title 3",
                                                                                          "items": [
                                                                                              {
                                                                                                  "type": "span",
                                                                                                  "title": "Test3"
                                                                                              }
                                                                                          ]
                                                                                      },
                                                                                      {
                                                                                          "type": "tab",
                                                                                          "title": "Tab title 4",
                                                                                          "items": [
                                                                                              {
                                                                                                  "type": "span",
                                                                                                  "title": "Test4"
                                                                                              }
                                                                                          ]
                                                                                      },
                                                                                      {
                                                                                          "type": "tab",
                                                                                          "title": "Tab title 5",
                                                                                          "items": [
                                                                                              {
                                                                                                  "type": "span",
                                                                                                  "title": "Test5"
                                                                                              }
                                                                                          ]
                                                                                      },
                                                                                      {
                                                                                          "type": "tab",
                                                                                          "title": "Tab title 6",
                                                                                          "items": [
                                                                                              {
                                                                                                  "type": "span",
                                                                                                  "title": "Test6"
                                                                                              }
                                                                                          ]
                                                                                      },
                                                                                      {
                                                                                          "type": "tab",
                                                                                          "title": "Tab title 7",
                                                                                          "items": [
                                                                                              {
                                                                                                  "type": "span",
                                                                                                  "title": "Test7"
                                                                                              }
                                                                                          ]
                                                                                      }
                                                                                  ]
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "htmlClass": "my-3",
                                                                          "items": [
                                                                              {
                                                                                  "type": "list",
                                                                                  "items": [
                                                                                      {
                                                                                          "type": "list-item",
                                                                                          "items": [
                                                                                              {
                                                                                                  "type": "span",
                                                                                                  "title": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                                                                                              }
                                                                                          ]
                                                                                      },
                                                                                      {
                                                                                          "type": "list-item",
                                                                                          "items": [
                                                                                              {
                                                                                                  "type": "span",
                                                                                                  "title": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                                                                                              },
                                                                                              {
                                                                                                  "type": "list",
                                                                                                  "items": [
                                                                                                      {
                                                                                                          "type": "list-item",
                                                                                                          "items": [
                                                                                                              {
                                                                                                                  "type": "span",
                                                                                                                  "title": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                                                                                                              }
                                                                                                          ]
                                                                                                      },
                                                                                                      {
                                                                                                          "type": "list-item",
                                                                                                          "items": [
                                                                                                              {
                                                                                                                  "type": "span",
                                                                                                                  "title": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                                                                                                              }
                                                                                                          ]
                                                                                                      }
                                                                                                  ]
                                                                                              }
                                                                                          ]
                                                                                      }
                                                                                  ]
                                                                              }
                                                                          ]
                                                                      },
                                                                      {
                                                                          "type": "col",
                                                                          "xs": 12,
                                                                          "items": [
                                                                              {
                                                                                  "key": "sliderInput1"
                                                                              },
                                                                              {
                                                                                  "key": "sliderInput1",
                                                                                  "handlerPreferences": {
                                                                                      "tickInterval": "auto"
                                                                                  }
                                                                              },
                                                                              {
                                                                                  "key": "sliderInput1",
                                                                                  "handlerPreferences": {
                                                                                      "thumbLabel": false
                                                                                  }
                                                                              },
                                                                              {
                                                                                  "key": "sliderInput2",
                                                                                  "handlerPreferences": {
                                                                                      "tickInterval": 100,
                                                                                      "thumbLabel": false
                                                                                  }
                                                                              },
                                                                              {
                                                                                  "key": "sliderInput2",
                                                                                  "handlerPreferences": {
                                                                                      "invert": true
                                                                                  }
                                                                              },
                                                                              {
                                                                                  "key": "sliderInput3",
                                                                                  "handlerPreferences": {
                                                                                      "thumbLabel": false
                                                                                  }
                                                                              },
                                                                              {
                                                                                  "key": "sliderInput3",
                                                                                  "handlerPreferences": {
                                                                                      "orientation": "horizontal"
                                                                                  }
                                                                              },
                                                                              {
                                                                                  "key": "sliderInput3",
                                                                                  "handlerPreferences": {
                                                                                      "orientation": "vertical"
                                                                                  }
                                                                              }
                                                                          ]
                                                                      }
                                                                  ]
                                                              }
                                                          ]
                                                      }
                                                  ]
                                              }
                                          ]
                                      },
                                      {
                                          "type": "step",
                                          "title": "Hardware",
                                          "items": []
                                      },
                                      {
                                          "type": "step",
                                          "title": "Software",
                                          "items": []
                                      },
                                      {
                                          "type": "step",
                                          "title": "Governance",
                                          "items": []
                                      },
                                      {
                                          "type": "step",
                                          "title": "Misc & Optimisation",
                                          "items": []
                                      },
                                      {
                                          "type": "step",
                                          "title": "Summary",
                                          "items": []
                                      }
                                  ]
                              },
                              {
                                  "type": "order-summary-overlay",
                                  "items": [
                                      {
                                          "type": "order-summary",
                                          "items": [
                                              {
                                                  "type": "order-summary-static-container",
                                                  "items": [
                                                      {
                                                          "type": "heading",
                                                          "level": 3,
                                                          "htmlClass": "text-center",
                                                          "title": "Order summary"
                                                      },
                                                      {
                                                          "type": "hr"
                                                      }
                                                  ]
                                              },
                                              {
                                                  "type": "order-summary-scroll-container",
                                                  "items": [
                                                      {
                                                          "type": "order-summary-line-item",
                                                          "label": "Access control",
                                                          "value": "Yes"
                                                      },
                                                      {
                                                          "type": "order-summary-line-item",
                                                          "label": "Time & Attendance",
                                                          "value": "Yes"
                                                      },
                                                      {
                                                          "type": "order-summary-line-item",
                                                          "label": "Doors in AC",
                                                          "value": "4"
                                                      },
                                                      {
                                                          "type": "order-summary-line-item",
                                                          "label": "Time clocks",
                                                          "value": "2"
                                                      },
                                                      {
                                                          "type": "order-summary-line-item",
                                                          "label": "Card tech",
                                                          "value": "HID iClass SE"
                                                      },
                                                      {
                                                          "type": "order-summary-line-item",
                                                          "label": "Pin",
                                                          "value": "8 doors"
                                                      },
                                                      {
                                                          "type": "order-summary-line-item",
                                                          "label": "Fingerprint",
                                                          "value": "All doors, 3 included"
                                                      },
                                                      {
                                                          "type": "order-summary-line-item",
                                                          "label": "Users",
                                                          "value": "32"
                                                      },
                                                      {
                                                          "type": "order-summary-line-item",
                                                          "label": "AC admins",
                                                          "value": "3"
                                                      },
                                                      {
                                                          "type": "order-summary-line-item",
                                                          "label": "Clocking users",
                                                          "value": "28"
                                                      },
                                                      {
                                                          "type": "order-summary-line-item",
                                                          "label": "Clock admins",
                                                          "value": "3"
                                                      },
                                                      {
                                                          "type": "order-summary-line-item",
                                                          "label": "Visitor management",
                                                          "value": "Yes, up to 10 at once"
                                                      },
                                                      {
                                                          "type": "order-summary-line-item",
                                                          "label": "VM receptionist",
                                                          "value": "2"
                                                      }
                                                  ]
                                              },
                                              {
                                                  "type": "order-summary-static-container",
                                                  "items": [
                                                      {
                                                          "type": "hr"
                                                      },
                                                      {
                                                          "type": "div",
                                                          "htmlClass": "text-center",
                                                          "items": [
                                                              {
                                                                  "type": "button",
                                                                  "title": "Checkout",
                                                                  "preferences": {
                                                                      "size": "large",
                                                                      "variant": "stroked",
                                                                      "color": "primary"
                                                                  }
                                                              }
                                                          ]
                                                      }
                                                  ]
                                              }
                                          ]
                                      }
                                  ]
                              }
                          ]
                      },
                      {
                          "type": "drawer",
                          "items": [
                              {
                                  "type": "drawer-header",
                                  "items": [
                                      {
                                          "type": "row",
                                          "horizontalAlign": "between",
                                          "items": [
                                              {
                                                  "type": "col",
                                                  "xs": "content",
                                                  "htmlClass": "text-left",
                                                  "items": [
                                                      {
                                                          "type": "row",
                                                          "verticalAlign": "center",
                                                          "items": [
                                                              {
                                                                  "type": "col",
                                                                  "xs": "content",
                                                                  "items": [
                                                                      {
                                                                          "type": "span",
                                                                          "htmlClass": "font-size-h5",
                                                                          "title": "Your price:"
                                                                      }
                                                                  ]
                                                              },
                                                              {
                                                                  "type": "col",
                                                                  "xs": "content",
                                                                  "items": [
                                                                      {
                                                                          "type": "span",
                                                                          "htmlClass": "font-size-h3 pr-2",
                                                                          "title": "{{ value }} EUR (incl. VAT)",
                                                                          "templateData": {
                                                                              "$eval": "return { value: $val.orderCost.data && $val.orderCost.data.total }",
                                                                              "dependencies": [
                                                                                  "orderCost"
                                                                              ]
                                                                          }
                                                                      }
                                                                  ]
                                                              }
                                                          ]
                                                      }
                                                  ]
                                              },
                                              {
                                                  "type": "col",
                                                  "xs": "content",
                                                  "htmlClass": "text-right",
                                                  "items": [
                                                      {
                                                          "type": "button",
                                                          "title": "Previous",
                                                          "onClick": {
                                                              "stepperPrevious": {
                                                                  "id": "@stepper-primary"
                                                              }
                                                          },
                                                          "preferences": {
                                                              "variant": "stroked",
                                                              "size": "small"
                                                          }
                                                      },
                                                      {
                                                          "type": "button",
                                                          "htmlClass": "ml-1",
                                                          "title": "Next",
                                                          "onClick": {
                                                              "stepperNext": {
                                                                  "id": "@stepper-primary"
                                                              }
                                                          },
                                                          "preferences": {
                                                              "size": "small"
                                                          }
                                                      }
                                                  ]
                                              }
                                          ]
                                      }
                                  ]
                              },
                              {
                                  "type": "drawer-content",
                                  "items": [
                                      {
                                          "type": "heading",
                                          "level": 2,
                                          "htmlClass": "mb-3",
                                          "title": "Order summary"
                                      },
                                      {
                                          "type": "heading",
                                          "title": "Something",
                                          "level": 4
                                      },
                                      {
                                          "type": "heading",
                                          "title": "Something",
                                          "level": 5
                                      },
                                      {
                                          "type": "heading",
                                          "title": "Something",
                                          "level": 6
                                      },
                                      {
                                          "type": "span",
                                          "title": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
                                      },
                                      {
                                          "type": "hr"
                                      },
                                      {
                                          "type": "paragraph",
                                          "title": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
                                      },
                                      {
                                          "type": "button",
                                          "title": "I do nothing"
                                      }
                                  ]
                              }
                          ]
                      }
                  ]
              }
          ]
      }
    }`);
    console.log(doc);
    const schemaTree = new JsfPropIterator(doc.schema, null, 'root-schema', 'root-schema');
    const layoutTree = new JsfLayoutIterator(doc.layout, null, 'root-layout', 'root-layout');
    console.log('TEST ITERATOR');
    console.log(schemaTree);
    console.log(layoutTree);
    let choppedLayout = layoutTree.chopTree();
    console.log('Chopped', choppedLayout);
  }

  selectionChanged(item) {
    this.mode = item.value;
    if (item.value === 'Schema') {
      this.treeData = this.propData;
    } else {
      this.treeData = this.layoutData;
    }
  }

  /**
   * Adds new item to node
   */
  addNewNode() {
    // emmit add event for inspector to handle
    this.eventBusService.add(this.clickedNode.id);

    // old logic
    if (this.clickedNode.data.type === 'prop') {
      this.add(
        this.clickedNode,
        {
          type: 'boolean'
        },
        'newProp'
      );
    } else {
      this.eventBusService.selectLayout(this.clickedNode.data.path, 'navigator');
      this.add(
        this.clickedNode,
        {
          type: 'div',
          items: []
        },
        'newLayout'
      );
    }
    this.refresh();
  }
  /**
   * Duplicates clicked node
   */
  duplicateNode() {
    this.duplicate(this.clickedNode);
    this.refresh();
  }
  /**
   * Copies clicked node to clipboard
   */
  copyNode() {
    this.clipboardNode = this.clickedNode;
  }
  /**
   * Pastes node from clipboard
   */
  pasteNode() {
    this.add(this.clickedNode, get(this.doc, this.clipboardNode.data.path), this.clipboardNode.data.name);
    this.refresh();
  }
  /**
   * Removes clicked node
   */
  deleteNode() {
    // emmit delete event for inspector to handle
    this.eventBusService.remove(this.clickedNode.id); //, {type: this.clickedNode.data.type});

    // old logic
    this.remove(this.clickedNode);
    this.refresh();
  }

  @Bind()
  private nodeClick(tree, node, $event) {
    // emmit select event (select prop or select layout)
    if (node.data.title !== 'root') {
      if (node.data.type === 'prop') {
        this.eventBusService.selectProp(node.data.path, 'navigator');
      } else {
        this.eventBusService.selectLayout(node.data.path, 'navigator');
      }
    }
    node.setActiveAndVisible();
    node.focus();
  }
  @Bind()
  private nodeRightClick(tree, node, $event) {
    // prevent default action
    $event.preventDefault();
    $event.stopPropagation();
    // set clicked node
    this.clickedNode = node;
    node.setActiveAndVisible();
    node.focus();
    // show menu
    this.contextMenuPosition.x = $event.clientX + 'px';
    this.contextMenuPosition.y = $event.clientY + 'px';
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }
  @Bind()
  private setNodeClass(node: TreeNode) {
    // return node class
    // return node.id % 2 === 0 ? 'testClass1' : 'testClass2';
    return '';
  }
  @Bind()
  private allowDrop(draggedNode: TreeNode, to) {
    console.log('ALLOW DROP');
    const toNode = to.parent;
    this.canHaveChildren(toNode);
    if (toNode.data.title === 'root') {
      return true;
    } else {
      if (toNode.data.type === 'prop' && ['object', 'array'].indexOf(toNode.data.docType) !== -1) {
        return true;
      } else if (toNode.data.type === 'layout' && ['image', 'span', 'title', 'heading', 'hr'].indexOf(toNode.data.docType) === -1) {
        return true;
      }
    }
    return false;
  }
  onMoveNode($event) {
    // get dragged node info and make a copy
    const tmpNode = cloneDeep(get(this.doc, $event.node.path));
    const parentNode = this.tree.treeModel.getNodeById($event.to.parent.id);
    // delete dragged node
    const draggedNode = this.tree.treeModel.getNodeById($event.node.id);
    // parent is already switched so revert to previous parent
    draggedNode.parent = this.tree.treeModel.getNodeById($event.from.parent.id);
    this.remove(draggedNode);
    // add node to selected location
    this.add(parentNode, tmpNode, $event.node.name, $event.to.index);
    this.refresh();
  }
  debugTree() {
    console.log(this.treeData);
  }
  debugProp() {
    console.log(this.propData);
  }
  debugLayout() {
    console.log(this.layoutData);
  }
  collapseAll() {
    this.tree.treeModel.collapseAll();
  }
  expandAll() {
    this.tree.treeModel.expandAll();
  }

  /**
   * Adds to schema/layout
   */
  addRoot(type: 'prop' | 'layout', item: any, name: string, index?: number) {
    switch (type) {
      case 'prop':
        // get properties/items if they exist, push item to properties/items
        const schema = get(this.doc, 'schema') as JsfPropObject;
        schema.properties = { ...schema.properties, [name]: item };
        this.doc = set(this.doc, 'schema', schema);
        break;
      case 'layout':
        // get items if they exist, push item to items
        const layout = get(this.doc, 'layout') as JsfLayoutDiv;
        const items = (layout.items || []);
        items.splice(index ? index : 0 , 0, item);
        layout.items = items;
        this.doc = set(this.doc, 'layout', layout);
        break;
    }
  }
  /**
   * Adds item to node with name at index
   */
  add(node: TreeNode, item: any, name: string, index?: number) {
    // check if adding to root
    if(node.data.title === 'root') {
      this.addRoot(node.data.type, item, name, index);
    } else {
      switch (node.data.type) {
        case 'prop':
          // get properties/items if they exist, push item to properties/items
          const schema = get(this.doc, node.data.path);
          if (node.data.docType === 'object') {
            schema.properties = { ...schema.properties, [name]: item };
          } else {
            schema.items.properties = { ...schema.items.properties, [name]: item };
          }
          this.doc = set(this.doc, node.data.path, schema);
          break;
        case 'layout':
          // get items if they exist, push item to items
          const layout = get(this.doc, node.data.path);
          const items = (layout.items || []);
          items.splice(index ? index : 0 , 0, item);
          layout.items = items;
          this.doc = set(this.doc, node.data.path, layout);
          break;
      }
    }
  }
  /**
   * Removes node from object/array
   */
  remove(node: TreeNode) {
    // find parent node in doc, node.parent.data.path
    const parent = node.parent && node.parent.data.title !== 'root' ?  get(this.doc, node.parent.data.path) : null;
    /*
      if parent exists and isnt root remove element from parent
      else remove element from schema.properties/items or layout.items
    */
    if (!!parent) {
      switch (node.data.type) {
        case 'prop':
          if (node.parent.data.docType === 'object' && !!parent.properties) {
            delete parent.properties[node.data.name];
          }
          if (node.data.docType === 'array' && !!parent.items) {
            const idx = node.data.path.match(/\d+/g);
            const index = Number(idx[idx.length - 1]);
            parent.items.splice(index, 1);
          }
          this.doc = set(this.doc, node.parent.data.path, parent);
          break;
        case 'layout':
          // get item index from path, delete based on index
          const idx = node.data.path.match(/\d+/g);
          const index = Number(idx[idx.length - 1]);
          parent.items.splice(index, 1);
          this.doc = set(this.doc, node.parent.data.path, parent);
          break;
      }
    } else {
      switch (node.data.type) {
        case 'prop':
          delete (this.doc.schema as JsfPropObject).properties[node.data.name];
          break;
        case 'layout':
          let layout = get(this.doc, 'layout') as JsfLayoutDiv;
          // get item index from path, delete based on index
          const idx = node.data.path.match(/\d+/g);
          const index = Number(idx[idx.length - 1]);
          layout.items.splice(index, 1);
          this.doc = set(this.doc, 'layout', layout);
          break;
      }
    }
  }
  /**
   * Copies node and adds it bellow original
   */
  duplicate(node: TreeNode) {
    // change id
    const dupedNode = cloneDeep(get(this.doc, node.data.path));
    dupedNode.__uuid += '-COPY';
    this.add(node.parent, dupedNode, `${node.data.name}-COPY`, node.index);
  }

  constructor(private cdRef: ChangeDetectorRef) {
    this.options = {
      displayField: 'title',
      allowDrag: true,
      allowDragoverStyling: true,
      allowDrop: this.allowDrop,
      actionMapping: {
        mouse: {
          click: this.nodeClick,
          contextMenu: this.nodeRightClick,
          dblClick: TREE_ACTIONS.TOGGLE_EXPANDED
        }
      },
      // scrollContainer: <HTMLElement>document.body.parentElement,
      // scrollOnActivate: true,
      // useVirtualScroll: true,
      nodeHeight: 10,
      nodeClass: this.setNodeClass,
      dropSlotHeight: 50
    };
  }
  /**
   * Creates builder from recieved this.doc
   */
  private async createBuilder() {
    try {
      this.builder = await JsfBuilder.create(this.doc, {
        safeMode: true
      });
      return;
    } catch(e) {
      // show error on screen
      alert(e);
      return;
    }
  }


  // system
  public async ngOnInit() {
    // build trees
    await this.rebuildTree(true);
    // Log all emitted events for debugging
    this.eventBusService.onDocumentEdit$.subscribe(async value => {
      await this.rebuildTree();
      this.detectChanges();
    });

    this.eventBusService.selectLayout$
      .subscribe(value => {
        if (!value || value.source === 'navigator') {
          return;
        }
        this.mode = 'Layout';
        this.treeData = this.layoutData;
        this.reloadSelected(value.path);
      });

    this.eventBusService.selectProp$
      .subscribe(value => {
        if (!value || value.source === 'navigator') {
          return;
        }
        this.mode = 'Schema';
        this.treeData = this.propData;
        this.reloadSelected(value.path);
      });

    this.detectChanges();
  }

  reloadSelected(path) {
    this.detectChanges();
    this.selectedNode = this.tree.treeModel.getNodeBy(node => {
      return node.data.path === path;
    });

    if (!this.selectedNode) {
      throw new Error(`Unable to ${event.type} node at ${path}`);
    }
    // expand all parents and scroll to selected
    this.selectedNode.setActiveAndVisible();
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
  private refresh() {
    this.detectChanges();
    this.eventBusService.onDocumentEdit();
  }

  // helper functions
  private async rebuildTree(init: boolean = false) {
    // reset uniq id
    this.id = 0;
    // if not init
    if (!init) {
      // create new builder from updated this.doc
      await this.createBuilder();
    }
    // rebuild the trees from builder
    this.propData = this.extractPropRoot(this.builder.propBuilder);
    this.layoutData = this.extractLayoutRoot(this.builder.layoutBuilder);
    // set display data
    if (this.mode === 'Schema') {
      this.treeData = this.propData;
    }
    else {
      this.treeData = this.layoutData;
    }
  }
  capitalize(string: string) {
    return string.replace(/^\w/, c => c.toUpperCase());
  }
  private canHaveChildren(node: TreeNode) {
    if (node.data.title === 'root') {
      return true;
    } else {
      if (node.data.type === 'prop' && ['object', 'array'].indexOf(node.data.docType) !== -1) {
        return true;
      } else if (node.data.type === 'layout') {

        const layoutType = node.data.docType.split('-').reduce((acc, x) => {
          return acc + this.capitalize(x);
        }, 'JsfLayout');

        return true;
      }
    }
  }

  // get data from builder functions
  private extractPropRoot(prop): NodeModel[] {
    // if no props return null
    if ((!prop.propertiesArray || prop.propertiesArray.length === 0) && (!prop.items || prop.items.length === 0)) {
      return null;
    }
    // else go over all children and extract their children
    // if object -> propertiesArray
    // if array -> items
    const children = [];
    for (const child of prop.propertiesArray || []) {
      children.push(this.extractPropRec(child));
    }
    for (const child of prop.items || []) {
      children.push(this.extractPropRec(child));
    }
    // return results
    return [
      {
        name: 'root',
        title: 'root',
        id: prop.prop.__uuid,
        type: 'prop',
        docType: '',
        path: '',
        children: children.filter(c => !!c)
      }
    ];
  }
  private extractPropRec(prop): NodeModel {
    // if prop doesn't exist return null
    if (!prop) {
      return null;
    }
    const children = [];
    for (const child of prop.propertiesArray || []) {
      children.push(this.extractPropRec(child));
    }
    for (const child of prop.items || []) {
      children.push(this.extractPropRec(child));
    }
    return {
      type: 'prop',
      docType: prop.prop && prop.prop.type ? prop.prop.type : '',
      path: prop.docDefPath,
      name: prop.propName,
      title: `${prop.propName} <${prop.prop && prop.prop.type ? prop.prop.type : ''}>`,
      id: prop.prop.__uuid,
      children
    };
  }
  private extractLayoutRoot(layout): NodeModel[] {
    // if no children
    if (!layout.items || layout.items.length === 0) {
      return null;
    }
    // else go over all children and extract their children
    const children = [];
    for (const child of layout.items) {
      children.push(this.extractLayoutRec(child));
    }
    // return results
    return [
      {
        name: 'root',
        title: 'root',
        id: layout.layout.__uuid,
        type: 'layout',
        docType: '',
        path: '',
        children
      }
    ];
  }
  private extractLayoutRec(layout): NodeModel {
    // if layout doesn't exist return null
    if (!layout) {
      return null;
    }
    const children = [];
    for (const child of layout.items || []) {
      children.push(this.extractLayoutRec(child));
    }
    return {
      type: 'layout',
      docType: layout.type,
      path: layout.docDefPath,
      name: layout.type || layout.key,
      title: `${layout.type || layout.key} <${layout.layout && layout.layout.htmlClass ? layout.layout.htmlClass : ''}>`,
      id: layout.layout.__uuid,
      children
    };
  }
}
