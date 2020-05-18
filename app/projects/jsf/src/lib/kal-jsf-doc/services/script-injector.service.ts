import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScriptInjectorService {

  private loaderPromises: any = {};

  private injected: any = [];

  private isInjected(x: string): boolean {
    return this.injected.indexOf(x) > -1;
  }

  private setInjected(x: string): void {
    this.injected.push(x);
  }

  /**
   * Inject script from a url.
   * @param url The script url
   * @param identifier Identifier for the script to check if it is already loaded
   */
  public async injectScriptFromUrl(url: string, identifier?: any) {
    if (!identifier) {
      identifier = url;
    }

    if (this.loaderPromises[url]) {
      return this.loaderPromises[url];
    }

    if (this.isInjected(identifier)) {
      console.warn(`"${ identifier }" already injected, skipping.`);
      return Promise.resolve(true);
    }

    this.loaderPromises[url] = new Promise((resolve, reject) => {
      const scriptElement = document.createElement('script') as HTMLScriptElement;
      scriptElement.type  = 'text/javascript';
      scriptElement.charset = 'utf-8';
      scriptElement.async = true;

      scriptElement.addEventListener('load', (event) => {
        this.onScriptLoad(event, identifier, resolve, reject);
      }, false);

      scriptElement.addEventListener('error', (event) => {
        this.onScriptError(event, identifier, resolve, reject);
      }, false);

      scriptElement.src   = url;

      document.getElementsByTagName('head')[0].appendChild(scriptElement);
    });

    return await this.loaderPromises[url];
  }

  /**
   * Injects a piece of code as a script.
   * @param code Code to inject
   * @param identifier Identifier for the script to check if it is already loaded
   */
  public async injectScript(code: string, identifier?: any) {
    if (!identifier) {
      identifier = code;
    }

    const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));

    await this.injectScriptFromUrl(url, identifier);

    URL.revokeObjectURL(url);
  }

  private onScriptLoad(event: Event, identifier: any, resolve: (value?: any) => void, reject: (reason?: any) => void) {
    // console.log('onScriptLoad', event);
    this.setInjected(identifier);
    resolve();
  }

  private onScriptError(event: Event, identifier: any, resolve: (value?: any) => void, reject: (reason?: any) => void) {
    // console.log('onScriptLoad', event);
    reject(`[${ ScriptInjectorService.name }] Script injection failed: ${ identifier }`);
  }
}
