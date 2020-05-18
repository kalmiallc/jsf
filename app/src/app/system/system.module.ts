import { ErrorHandler, NgModule } from '@angular/core';
import { CommonModule }           from '@angular/common';
import { AppErrorHandler }        from './error-handler';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [
    {
      provide: ErrorHandler,
      useClass: AppErrorHandler,
    }
  ]
})
export class SystemModule { }
