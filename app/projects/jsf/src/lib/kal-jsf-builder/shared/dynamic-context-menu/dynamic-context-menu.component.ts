import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { JsfBuilder, JsfDocument, JsfPropObject, JsfLayoutDiv, jsfForJsf } from '@kalmia/jsf-common-es2015';
import { MatMenuTrigger } from '@angular/material';
import _ from 'lodash';

@Component({
  selector: 'jsf-dynamic-context-menu',
  templateUrl: './dynamic-context-menu.component.html',
  styleUrls: ['./dynamic-context-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicContextMenuComponent implements OnInit {

  navItems = [
    {
      displayName: 'AngularMix',
      iconName: 'close',
      children: [
        {
          displayName: 'Speakers',
          iconName: 'group',
          children: [
            {
              displayName: 'Michael Prentice',
              iconName: 'person',
              route: 'michael-prentice',
              children: [
                {
                  displayName: 'Delight your Organization',
                  iconName: 'star_rate',
                  route: 'material-design'
                }
              ]
            },
            {
              displayName: 'Stephen Fluin',
              iconName: 'person',
              route: 'stephen-fluin',
              children: [
                {
                  displayName: 'What\'s up with the Web?',
                  iconName: 'star_rate',
                  route: 'what-up-web'
                }
              ]
            },
            {
              displayName: 'Mike Brocchi',
              iconName: 'person',
              route: 'mike-brocchi',
              children: [
                {
                  displayName: 'My ally, the CLI',
                  iconName: 'star_rate',
                  route: 'my-ally-cli'
                },
                {
                  displayName: 'Become an Angular Tailor',
                  iconName: 'star_rate',
                  route: 'become-angular-tailer'
                }
              ]
            }
          ]
        },
        {
          displayName: 'Sessions',
          iconName: 'speaker_notes',
          children: [
            {
              displayName: 'Delight your Organization',
              iconName: 'star_rate',
              route: 'material-design'
            },
            {
              displayName: 'What\'s up with the Web?',
              iconName: 'star_rate',
              route: 'what-up-web'
            },
            {
              displayName: 'My ally, the CLI',
              iconName: 'star_rate',
              route: 'my-ally-cli'
            },
            {
              displayName: 'Become an Angular Tailor',
              iconName: 'star_rate',
              route: 'become-angular-tailer'
            }
          ]
        },
        {
          displayName: 'Feedback',
          iconName: 'feedback',
          route: 'feedback'
        }
      ]
    }
  ];

  // mat menu
  @ViewChild(MatMenuTrigger)
  contextMenu: MatMenuTrigger;
  contextMenuSubMenuItems;

  contextMenuPosition = { x: '352px', y: '757px' };

  getMenuItems() {
    // if (this.mode === 'Schema') {
    //   this.contextMenuSubMenuItems = jsfForJsf.getSidebarList().props;
    // } else {
      // get all definitions
      const uncategorizedDefs = jsfForJsf.getSidebarList().layouts;
      // group items by category
      const categorizedDefs = _.mapValues(_.groupBy(uncategorizedDefs, 'category'), defList => defList);
      const categorizedDefsArray = Object.keys(categorizedDefs).map(key => ({items: categorizedDefs[key], name: key}));

      console.log(categorizedDefsArray);
      this.contextMenuSubMenuItems = categorizedDefsArray;

    // }
  }

  addNewElement(item) {
    console.log('Item to add: ', item);
  }

  constructor() { }

  ngOnInit() {
  }

  onContextMenuOpen($event) {
    // prevent default action
    $event.preventDefault();
    $event.stopPropagation();

    // set clicked node
    // this.clickedNode = node;
    // node.setActiveAndVisible();
    // node.focus();
    // Get possible menu items
    this.getMenuItems();

    // show menu
    this.contextMenuPosition.x = $event.clientX + 'px';
    this.contextMenuPosition.y = $event.clientY + 'px';
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

}
