import { Component }          from '@angular/core';
import * as OverlayScrollbars from 'overlayscrollbars';

@Component({
  selector   : 'app-root',
  templateUrl: './app.component.html',
  styleUrls  : ['./app.component.scss']
})
export class AppComponent {
  title = 'app-demo';

  public readonly scrollOptions: OverlayScrollbars.Options = {
    overflowBehavior: {
      x: 'hidden',
      y: 'scroll'
    },
    resize          : 'none',
    paddingAbsolute : true
  };

}
