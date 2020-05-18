import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'jsf-overlay',
  templateUrl: './jsf-overlay.component.html',
  styleUrls: ['./jsf-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JsfOverlayComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
