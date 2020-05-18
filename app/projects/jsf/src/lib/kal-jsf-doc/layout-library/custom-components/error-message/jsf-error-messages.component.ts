import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector       : 'jsf-error-messages',
  templateUrl    : './jsf-error-messages.component.html',
  styleUrls      : ['./jsf-error-messages.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JsfErrorMessagesComponent implements OnInit {

  @Input()
  messages: string[];

  get hasMessages() {
    return this.messages && this.messages.length;
  }

  constructor() { }

  ngOnInit() {
  }

}
