import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ChangelogComponent } from '@views/nsv-changelog/nsv-changelog.component';
import { PerfilComponent } from '../../views/preferencias/perfil/perfil.component';
import { SharedModule } from '../shared/shared.module';
import { PreferenciasRoutingModule } from './preferencias-routing.module';


@NgModule({
  declarations: [
    PerfilComponent,
    ChangelogComponent,
    // UserConfigComponent,
    // ChangePasswordComponent,
    // SystemConfigurationComponent,
    // UserProfileComponent,
    // FrmMntReportListComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    PreferenciasRoutingModule
  ]
})
export class PreferenciasModule { }
