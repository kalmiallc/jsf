import { Injectable, NgModuleFactory, OnDestroy } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModuleCacheService implements OnDestroy {

  constructor() { }

  private cachedModules: { [key: string]: NgModuleFactory<any> } = {};

  public get(key: string): NgModuleFactory<any> {
    return this.cachedModules[key];
  }

  public has(key: string): boolean {
    return this.cachedModules[key] !== void 0;
  }

  public store(key: string, module: NgModuleFactory<any>) {
    this.cachedModules[key] = module;
  }


  public ngOnDestroy(): void {
    // Delete reference to the cached modules for GC.
    this.cachedModules = void 0;
  }
}
