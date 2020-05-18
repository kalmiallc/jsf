import { NgModule }                   from '@angular/core';
import { RouterModule, Routes }       from '@angular/router';
import { LayoutNavigationComponent }  from './layout/layout-navigation/layout-navigation.component';
import { LayoutEmptyComponent }       from './layout/layout-empty/layout-empty.component';

export const routes: Routes = [
  {
    path     : '',
    component: LayoutNavigationComponent,
    children : [
      {
        path      : '',
        redirectTo: '/playground',
        pathMatch : 'full',
      },
      {
        path        : 'playground',
        loadChildren: './playground/playground.module#PlaygroundModule',
      },
    ],
  },
  {
    path      : '**',
    redirectTo: '/',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
