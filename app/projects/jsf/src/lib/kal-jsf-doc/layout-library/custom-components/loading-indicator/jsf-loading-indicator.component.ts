import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'jsf-loading-indicator',
  templateUrl: './jsf-loading-indicator.component.html',
  styleUrls: ['./jsf-loading-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JsfLoadingIndicatorComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
