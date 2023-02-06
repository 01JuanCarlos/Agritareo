
import { AgmCoreModule } from '@agm/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NsSerieNumeroComponent } from '@app/components/business/ns-serie-numero/ns-serie-numero.component';
import { DataListComponent } from '@app/components/data-list/data-list.component';
import { FooterComponent } from '@app/components/footer/footer.component';
import { FormControlsModule } from '@app/components/form-controls/form-controls.module';
import { Select2ControlComponent } from '@app/components/form-controls/select2-control/select2-control.component';
import { NavbarComponent } from '@app/components/navbar/navbar.component';
import { NavigationModule } from '@app/components/navigation/navigation.module';
import { NestableModule } from '@app/components/nestable/nestable.module';
import { NsAutocompleteComponent } from '@app/components/ns-autocomplete/ns-autocomplete.component';
import { NsAutocomplete2Component } from '@app/components/ns-autocomplete2/ns-autocomplete2.component';
import { NsBreadcrumbComponent } from '@app/components/ns-breadcrumb/ns-breadcrumb.component';
import { NsButtonComponent } from '@app/components/ns-button/ns-button.component';
import { NsChartModule } from '@app/components/ns-chart/ns-chart.module';
import { NsDatagridComponent } from '@app/components/ns-datagrid/ns-datagrid.component';
import { NsDetailSectionComponent } from '@app/components/ns-detail-section/ns-detail-section.component';
import { NsFinderComponent } from '@app/components/ns-finder/ns-finder.component';
import { NsGroupListComponent } from '@app/components/ns-group-list/ns-group-list.component';
import { NsImageUploaderComponent } from '@app/components/ns-image-uploader/ns-image-uploader.component';
import { NsMapModule } from '@app/components/ns-map/ns-map.module';
import { NsModalModule } from '@app/components/ns-modal/ns-modal.module';
import { NsNavComponent } from '@app/components/ns-nav/ns-nav.component';
import { NsSideTabsModule } from '@app/components/ns-sidetabs/ns-sidetabs.module';
import { NsSplitTabsComponent } from '@app/components/ns-split-tabs/ns-split-tabs.component';
import { NsTabsModule } from '@app/components/ns-tabs/ns-tabs.module';
import { NsToolBarComponent } from '@app/components/ns-toolbar/ns-toolbar.component';
import { NsTreeComponent } from '@app/components/ns-tree/ns-tree.component';
import { NsUploaderComponent } from '@app/components/ns-uploader/ns-uploader.component';
import { SidebarNavigationComponent } from '@app/components/sidebar-navigation/sidebar-navigation.component';
import { SidebarToolsComponent } from '@app/components/sidebar-tools/sidebar-tools.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { SpeechComponent } from '@app/components/speech/speech.component';
import { TableSimpleComponent } from '@app/components/table-simple/table-simple.component';
import { TableComponent } from '@app/components/table/table.component';
import { TopbarComponent } from '@app/components/topbar/topbar.component';
import { DisableIfUnauthorizedDirective } from '@app/directives/disable-if-unauthorized.directive';
import { EditableDirective } from '@app/directives/editable.directive';
import { HideIfUnauthorizedDirective } from '@app/directives/hide-if-unauthorized.directive';
import { ModalDirective } from '@app/directives/modal.directive';
import { NsTemplate } from '@app/directives/ns-template.directive';
// import { AdminLayoutComponent } from '@app/layouts/admin-layout/admin-layout.component';
import { BasicLayoutComponent } from '@app/layouts/basic-layout/basic-layout.component';
import { NsReporteLayoutComponent } from '@app/layouts/ns-reporte-layout/ns-reporte-layout.component';
// import { NsMntFormLayoutComponent } from '@app/layouts/ns-mnt-form-layout/ns-mnt-form-layout.component';
import { TreeContainerLayoutComponent } from '@app/layouts/tree-container-layout/tree-container-layout.component';
// import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { TreeLayoutComponent } from '@app/layouts/tree-layout/tree-layout.component';
import { AppService } from '@app/services/app.service';
import { AuthService } from '@app/services/auth-services/auth.service';
import { FormService } from '@app/services/util-services/form.service';
import { DisableFormComponent } from '@forms/disable-form-component/disable-form.component';
import { FrmTableSettingsComponent } from '@forms/frm-table-settings/frm-table-settings.component';
import { TranslateModule } from '@ngx-translate/core';
import { AngularSplitModule } from 'angular-split';
import { NgDragDropModule } from 'ng-drag-drop';
import { SortablejsModule } from 'ngx-sortablejs';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DialogModule } from 'primeng/dialog';
import { PaginatorModule } from 'primeng/paginator';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { TreeModule } from 'primeng/tree';
import { TreeTableModule } from 'primeng/treetable';
import { ModalDialogModule } from '../../libraries/modal';

export const InitAppServiceFactory = (service: AppService) => {
  return () => service.initApp();
};

export const SettingsAppServiceFactory = (service: AppService) => {
  return () => service.initAppSettings();
};

// AÑADIR AQUI LOS COMPONENTES QUE SE VAN A COMPARTIR

const DecExports = [
  // AdminLayoutComponent,
  BasicLayoutComponent,
  TreeLayoutComponent,
  NsReporteLayoutComponent,

  TableSimpleComponent,

  TreeContainerLayoutComponent,
  NsToolBarComponent,
  NavbarComponent,
  SidebarNavigationComponent,
  SidebarComponent,
  FooterComponent,
  ModalDirective,
  TableComponent,
  DataListComponent,
  NsSplitTabsComponent,
  SidebarToolsComponent,
  Select2ControlComponent,
  NsAutocompleteComponent,
  NsAutocomplete2Component,
  NsDatagridComponent,
  NsSerieNumeroComponent,
  EditableDirective,
  SpeechComponent,
  NsNavComponent,
  NsGroupListComponent,
  NsTemplate,
  NsImageUploaderComponent,
  // NsMntFormLayoutComponent,
  NsBreadcrumbComponent,
  NsFinderComponent,
  NsTreeComponent,
  DisableFormComponent,

  NsButtonComponent,
  NsUploaderComponent,
  TopbarComponent,
  NsDetailSectionComponent,
];

@NgModule({
  declarations: [
    ...DecExports,
    // OrderBy,
    HideIfUnauthorizedDirective,
    DisableIfUnauthorizedDirective,
    FrmTableSettingsComponent,
  ],
  entryComponents: [
    // FrmEdtCabcontaComponent
    FrmTableSettingsComponent
  ],
  imports: [
    // ScrollingModule,
    // InfiniteScrollModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    AngularSplitModule.forRoot(),
    NgDragDropModule.forRoot(),
    SortablejsModule.forRoot({ animation: 150 }),
    ButtonModule,
    DialogModule,
    ModalDialogModule,
    NsModalModule,
    TabMenuModule,
    TreeModule,
    ContextMenuModule,
    TreeTableModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyChGp_dPQTRCiN1DufCyfxgFJ_akyO3ans'
    }),
    CheckboxModule,
    FormControlsModule, // Módulo que integra todos los controles comunes de formulario.
    NavigationModule,
    NestableModule,
    NsTabsModule,
    NsSideTabsModule,
    VirtualScrollerModule,
    TabViewModule,
    NsChartModule,
    NsMapModule,
    PaginatorModule
  ],

  exports: [
    ...DecExports,
    FormControlsModule,
    NavigationModule,
    NestableModule,
    NsTabsModule,
    NsSideTabsModule,
    RouterModule,
    FormsModule,
    NsModalModule,
    ReactiveFormsModule,
    HttpClientModule,
    TranslateModule,
    TabMenuModule,
    TreeModule,
    ContextMenuModule,
    TreeTableModule,
    AgmCoreModule,
    CheckboxModule,
    HideIfUnauthorizedDirective,
    DisableIfUnauthorizedDirective,
    TabViewModule,
    NsChartModule,
    NsMapModule
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [
        FormService,
        AppService,
        AuthService,
        {
          provide: APP_INITIALIZER, useFactory: InitAppServiceFactory,
          deps: [AppService],
          multi: true
        },
        {
          provide: APP_INITIALIZER, useFactory: SettingsAppServiceFactory,
          deps: [AppService],
          multi: true
        }
      ]
    };
  }
}
