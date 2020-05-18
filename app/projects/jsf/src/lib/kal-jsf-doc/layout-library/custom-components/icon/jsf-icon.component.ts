import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
  selector       : 'jsf-icon',
  templateUrl    : './jsf-icon.component.html',
  styleUrls      : ['./jsf-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JsfIconComponent implements OnInit {

  private _iconProvider: 'material' | 'fontawesome';
  private _iconName: string;
  private _iconModifiers: string[];

  @Input()
  public size = '24px';


  public get iconProvider(): 'material' | 'fontawesome' {
    return this._iconProvider;
  }

  public get iconName(): string {
    return this._iconName;
  }

  public get iconModifiers(): string[] {
    return this._iconModifiers || [];
  }

  public get iconSize(): string {
    return this.size || '24px';
  }

  @Input()
  public get icon(): string {
    if (!this._iconProvider || !this._iconName) {
      return void 0;
    }

    const modifiersString = this.iconModifiers.length ? `#${ this.iconModifiers.join(',') }` : '';
    return `${ this._iconProvider === 'fontawesome' ? 'fa:' : '' }${ this._iconName }${ modifiersString }`;
  }

  public set icon(iconString: string) {
    this._iconProvider = iconString.startsWith('fa:') ? 'fontawesome' : 'material';

    const modifiersStartIndex = iconString.indexOf('#');
    this._iconName            = iconString.slice(this._iconProvider === 'fontawesome' ? 'fa:'.length - 1 : 0, modifiersStartIndex > -1 ? modifiersStartIndex : void 0);

    const modifiersString = modifiersStartIndex > -1 ? iconString.slice(modifiersStartIndex + 1) : '';
    this._iconModifiers   = modifiersString.split(',').map(x => x.trim());
  }

  constructor() { }

  ngOnInit() {
  }

  public hasModifier(name: string) {
    return this._iconModifiers && this._iconModifiers.indexOf(name) > -1;
  }

}
