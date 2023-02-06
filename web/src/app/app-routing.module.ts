import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from '@views/login/login.component';
import { ModuleGuard } from './guards/module.guard';
import { ModuleResolver } from './services/module.resolve.service';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  { path: '', redirectTo: '/agritareo', pathMatch: 'full' },
  {
    path: 'agritareo',
    resolve: { module: ModuleResolver },
    loadChildren: () => import('./modules/agritareo/agritareo.module').then(m => m.AgritareoModule),
    canLoad: [ModuleGuard],
    canActivate: [ModuleGuard]
  },
  {
    path: 'preferencias',
    resolve: { module: ModuleResolver },
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/preferencias/preferencias.module').then(m => m.PreferenciasModule),
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
  providers: [ModuleResolver]
})
export class AppRoutingModule { }
