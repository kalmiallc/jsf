import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'jsf-dynamic-context-menu-item',
  templateUrl: './dynamic-context-menu-item.component.html',
  styleUrls: ['./dynamic-context-menu-item.component.scss'],
  
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicContextMenuItemComponent implements OnInit {

  @Input() items;
  @ViewChild('childMenu') public childMenu;

  constructor(public router: Router) {
  }

  ngOnInit() {
  }

}
