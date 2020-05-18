import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlaygroundComponent }  from './playground.component';

const routes: Routes = [
  {
    path     : '',
    component: PlaygroundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlaygroundRoutingModule {}
