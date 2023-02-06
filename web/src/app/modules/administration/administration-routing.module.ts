import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TreeLayoutComponent } from '@app/layouts/tree-layout/tree-layout.component';
import { UsersAccessControlComponent } from '@views/basic-views/access-control/users-access-control/users-access-control.component';
import { ProfileAccessControlComponent } from '@views/basic-views/access-control/profile-access-control/profile-access-control.component';
import { GeneralPreferencesComponent } from '@views/basic-views/company-preferences/general-preferences/general-preferences.component';
import { DeactivateViewGuard } from '@app/guards/deactivate-view.guard';
import { MenuSetupComponent } from '@views/basic-views/company-preferences/menu-setup/menu-setup.component';
import { CompanyRegisterComponent } from '@views/basic-views/company-preferences/company-register/company-register.component';
import { MntTipoCambioComponent } from '@views/administracion/mantenedores/mnt-tipo-cambio/mnt-tipo-cambio.component';
import { MntCompanyParametersComponent } from '@views/administracion/mantenedores/mnt-company-parameters/mnt-company-parameters.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'access-control',
        component: TreeLayoutComponent,
        children: [
          { path: '', redirectTo: 'users', pathMatch: 'full' },
          {
            path: 'users',
            component: UsersAccessControlComponent,
            data: { title: 'Gestion de Usuarios', icon: 'icon-users' }
          },
          {
            path: 'roles',
            component: ProfileAccessControlComponent,
            data: { title: 'Gestion de Perfiles', icon: 'icon-user-lock' }
          }
        ]
      },
      {
        path: 'company-preferences',
        component: TreeLayoutComponent,
        children: [
          { path: '', redirectTo: 'general-settings', pathMatch: 'full' },
          {
            path: 'general-settings',
            component: GeneralPreferencesComponent,
            data: {
              viewId: 'BV003',
              title: 'Preferencias Generales',
              icon: 'icon-office'
            },
            canDeactivate: [DeactivateViewGuard]
          },
          {
            path: 'menu-settings',
            component: MenuSetupComponent,
            data: { title: 'Configuración de Menú', icon: 'icon-cabinet' }
          },
          {
            path: 'company-register',
            component: CompanyRegisterComponent,
            data: { title: 'Lista de Empresas', icon: 'fas fa-warehouse' }
          },
        ]
      },
      {
        path: 'tipo-cambio',
        component: MntTipoCambioComponent
      },
      {
        path: 'module-params',
        component: MntCompanyParametersComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministrationRoutingModule { }
