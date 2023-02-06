import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SECURE_PATH } from '@app/common/constants';
import { BasicLayoutComponent } from '@app/layouts/basic-layout/basic-layout.component';
import { ChangelogComponent } from '@views/nsv-changelog/nsv-changelog.component';
import { PerfilComponent } from '../../views/preferencias/perfil/perfil.component';

const routes: Routes = [
  {
    path: '',
    component: BasicLayoutComponent,
    children: [
      // { path: 'home', redirectTo: '/agritareo' },
      { path: 'perfil', component: PerfilComponent },
      { path: 'changelog', component: ChangelogComponent },
      // {
      //   path: 'configuration',
      //   component: TreeLayoutComponent,
      //   canActivateChild: [TabsRouteGuard],
      //   children: [
      //     { path: '', redirectTo: 'user-config', pathMatch: 'full' },
      //     {
      //       path: 'sys-config',
      //       component: SystemConfigurationComponent,
      //       data: {
      //         viewId: 'BV001',
      //         title: 'Configuración General',
      //         icon: 'fas fa-cog'
      //       },
      //       canDeactivate: [DeactivateViewGuard]
      //     },
      //     {
      //       path: 'password',
      //       component: ChangePasswordComponent,
      //       data: {
      //         viewId: 'BV003',
      //         title: 'Cambio de contraseña',
      //         icon: 'fas fa-key'
      //       },
      //       canDeactivate: [DeactivateViewGuard]
      //     },
      //     {
      //       path: 'user-config',
      //       component: UserConfigComponent,
      //       data: {
      //         viewId: 'BV002',
      //         title: 'Configuraciones Personales',
      //         icon: 'fas fa-user-cog'
      //       },
      //       canDeactivate: [DeactivateViewGuard]
      //     }
      //   ]
      // },
      // {
      //   path: 'administration',
      //   loadChildren: () => import('../administration/administration.module').then(m => m.AdministrationModule),
      //   canLoad: [ModuleGuard],
      //   canActivate: [ModuleGuard]
      // },
      { path: '', redirectTo: SECURE_PATH }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreferenciasRoutingModule { }
