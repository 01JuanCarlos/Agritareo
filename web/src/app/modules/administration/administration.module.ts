import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FrmMntCompanyComponent } from '@forms/maintainers/frm-mnt-company/frm-mnt-company.component';
import { FrmMntMenuSetupComponent } from '@forms/maintainers/frm-mnt-menu-setup/frm-mnt-menu-setup.component';
import { FrmMntProfileComponent } from '@forms/maintainers/frm-mnt-profile/frm-mnt-profile.component';
import { FrmMntUserComponent } from '@forms/maintainers/frm-mnt-user/frm-mnt-user.component';
import { ProfileAccessControlComponent } from '@views/basic-views/access-control/profile-access-control/profile-access-control.component';
import { UsersAccessControlComponent } from '@views/basic-views/access-control/users-access-control/users-access-control.component';
import { CompanyRegisterComponent } from '@views/basic-views/company-preferences/company-register/company-register.component';
import { GeneralPreferencesComponent } from '@views/basic-views/company-preferences/general-preferences/general-preferences.component';
import { MenuSetupComponent } from '@views/basic-views/company-preferences/menu-setup/menu-setup.component';
import { AdministrationRoutingModule } from './administration-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FrmMntParameterComponent } from '@forms/frm-mnt-company-parameters/frm-mnt-company-parameters.component';
import { MntParametersComponent } from '@forms/frm-mnt-parameters/frm-mnt-parameters.component';
import { MntTipoCambioComponent } from '@views/administracion/mantenedores/mnt-tipo-cambio/mnt-tipo-cambio.component';
import { MntCompanyParametersComponent } from '@views/administracion/mantenedores/mnt-company-parameters/mnt-company-parameters.component';

@NgModule({
  declarations: [
    UsersAccessControlComponent,
    ProfileAccessControlComponent,
    GeneralPreferencesComponent,
    MenuSetupComponent,
    CompanyRegisterComponent,
    FrmMntUserComponent,
    FrmMntProfileComponent,
    FrmMntCompanyComponent,
    FrmMntMenuSetupComponent,
    MntCompanyParametersComponent,
    FrmMntParameterComponent,
    MntParametersComponent,
    MntTipoCambioComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    AdministrationRoutingModule
  ]
})
export class AdministrationModule { }
