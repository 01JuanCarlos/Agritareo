import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NsSiembraCardComponent } from '@app/components/agritareo/card/ns-siembra-card/ns-siembra-card.component';
import { NavigationModule } from '@app/components/navigation/navigation.module';
import { ModalDialogModule } from '@app/libraries/modal';
import { NsWeatherComponent } from '@components/ns-weather/ns-weather.component';
import { BitacoraComponent } from '@views/agritareo/administracion/mnt-listar-bitacora/bitacora/bitacora.component';
import { MntListarBitacoraComponent } from '@views/agritareo/administracion/mnt-listar-bitacora/mnt-listar-bitacora.component';
import { CampaniaAgricolaComponent } from '@views/agritareo/administracion/mnt-listar-campañas-agricolas/campania-agricola/campania-agricola.component';
import { MntListarCampaniasAgricolasComponent } from '@views/agritareo/administracion/mnt-listar-campañas-agricolas/mnt-listar-campanias-agricolas.component';
import { ConceptoAgricolaComponent } from '@views/agritareo/administracion/mnt-listar-conceptos-agricolas/concepto-agricola/concepto-agricola.component';
import { MntListarConceptosAgricolasComponent } from '@views/agritareo/administracion/mnt-listar-conceptos-agricolas/mnt-listar-conceptos-agricolas.component';
import { ControladorRiegoComponent } from '@views/agritareo/administracion/mnt-listar-controladores-de-riego/controlador-riego/controlador-riego.component';
import { MntListarControladoresDeRiegoComponent } from '@views/agritareo/administracion/mnt-listar-controladores-de-riego/mnt-listar-controladores-de-riego.component';
import { CultivoComponent } from '@views/agritareo/administracion/mnt-listar-cultivos/cultivo/cultivo.component';
import { MntListarCultivosComponent } from '@views/agritareo/administracion/mnt-listar-cultivos/mnt-listar-cultivos.component';
import { EstadoFenologicoComponent } from '@views/agritareo/administracion/mnt-listar-estados-fenologicos/estado-fenologico/estado-fenologico.component';
import { MntListarEstadosFenologicosComponent } from '@views/agritareo/administracion/mnt-listar-estados-fenologicos/mnt-listar-estados-fenologicos.component';
import { LoteDeSiembraComponent } from '@views/agritareo/administracion/mnt-listar-lotes-de-siembra/lote-de-siembra/lote-de-siembra.component';
import { MntListarLotesDeSiembraComponent } from '@views/agritareo/administracion/mnt-listar-lotes-de-siembra/mnt-listar-lotes-de-siembra.component';
import { MetodoEvaluacionComponent } from '@views/agritareo/administracion/mnt-listar-metodos-evaluacion/metodo-evaluacion/metodo-evaluacion.component';
import { MntListarMetodosEvaluacionComponent } from '@views/agritareo/administracion/mnt-listar-metodos-evaluacion/mnt-listar-metodos-evaluacion.component';
import { MntListarPlagasComponent } from '@views/agritareo/administracion/mnt-listar-plagas/mnt-listar-plagas.component';
import { MntListarTipoConceptosComponent } from '@views/agritareo/administracion/mnt-listar-tipo-conceptos/mnt-listar-tipo-conceptos.component';
import { TipoConceptoComponent } from '@views/agritareo/administracion/mnt-listar-tipo-conceptos/tipo-concepto/tipo-concepto.component';
import { MntListarTrampasComponent } from '@views/agritareo/administracion/mnt-listar-trampas/mnt-listar-trampas.component';
import { MntListarUsuariosComponent } from '@views/agritareo/administracion/mnt-listar-usuarios/mnt-listar-usuarios.component';
import { UsuarioComponent } from '@views/agritareo/administracion/mnt-listar-usuarios/usuario/usuario.component';
import { MntListarZonasGeograficasComponent } from '@views/agritareo/administracion/mnt-listar-zonas-geograficas/mnt-listar-zonas-geograficas.component';
import { ZonaGeograficaComponent } from '@views/agritareo/administracion/mnt-listar-zonas-geograficas/zona-geografica/zona-geografica.component';
import { AgritareoComponent } from '@views/agritareo/agritareo.component';
import { RepFertilizacionComponent } from '@views/agritareo/reportes/rep-fertilizacion/rep-fertilizacion.component';
import { RepFitosanidadGraficoCruzadoComponent } from '@views/agritareo/reportes/rep-fitosanidad-grafico-cruzado/rep-fitosanidad-grafico-cruzado.component';
import { RepFitosanidadGraficoComponent } from '@views/agritareo/reportes/rep-fitosanidad-grafico/rep-fitosanidad-grafico.component';
import { RepFitosanidadComponent } from '@views/agritareo/reportes/rep-fitosanidad/rep-fitosanidad.component';
import { RepManoDeObraComponent } from '@views/agritareo/reportes/rep-mano-de-obra/rep-mano-de-obra.component';
import { RepMapasComponent } from '@views/agritareo/reportes/rep-mapas/rep-mapas.component';
import { RepRiegoComponent } from '@views/agritareo/reportes/rep-riego/rep-riego.component';
import { RepRutaComponent } from '@views/agritareo/reportes/rep-ruta/rep-ruta.component';
import { RepSanidadComponent } from '@views/agritareo/reportes/rep-sanidad/rep-sanidad.component';
import { AngularSplitModule } from 'angular-split';
import { NgDragDropModule } from 'ng-drag-drop';
import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CarouselModule } from 'primeng/carousel';
import { ChartModule } from 'primeng/chart';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { OrderListModule } from 'primeng/orderlist';
import { PasswordModule } from 'primeng/password';
import { PickListModule } from 'primeng/picklist';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SliderModule } from 'primeng/slider';
import { SpinnerModule } from 'primeng/spinner';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { TreeModule } from 'primeng/tree';
import { TreeTableModule } from 'primeng/treetable';
import {TableModule} from 'primeng/table';
import { SharedModule } from '../shared/shared.module';
import { AgritareoRoutingModule } from './agritareo-routing.module';
import { MultiSelectModule } from 'primeng/multiselect';
import { RepCosechaComponent } from '@views/agritareo/reportes/rep-cosecha/rep-cosecha.component';
import { RepManoDeObraGraficoComponent } from '@views/agritareo/reportes/rep-mano-de-obra-grafico/rep-mano-de-obra-grafico.component';
import { RepMapCosechaComponent } from '@views/agritareo/reportes/rep-map-cosecha/rep-map-cosecha.component';
import { RepRiegoGraficoComponent } from '@views/agritareo/reportes/rep-riego-grafico/rep-riego-grafico.component';
import { RepRiegoConsumoAguaComponent } from '@views/agritareo/reportes/rep-riego-consumo-agua/rep-riego-consumo-agua.component';
import { RepMaquinariaTablaGraficoComponent } from '@views/agritareo/reportes/rep-maquinaria-tabla-grafico/rep-maquinaria-tabla-grafico.component';
import { RepMaquinariaComponent } from '@views/agritareo/reportes/rep-maquinaria/rep-maquinaria.component';
import { ClimaComponent } from '@views/agritareo/administracion/mnt-listar-clima/clima/clima.component';
import { RepClimaGraficoComponent } from '@views/agritareo/reportes/rep-clima/rep-clima-grafico.component';
import { DialogModule } from 'primeng/dialog';
import { MntListarBitacoraService } from '@views/agritareo/administracion/mnt-listar-bitacora/mnt-listar-bitacora.service';

@NgModule({
  declarations: [
    MntListarUsuariosComponent,
    MntListarPlagasComponent,
    MntListarCultivosComponent,
    MntListarLotesDeSiembraComponent,
    MntListarTrampasComponent,
    MntListarZonasGeograficasComponent,
    MntListarTipoConceptosComponent,
    MntListarConceptosAgricolasComponent,
    MntListarMetodosEvaluacionComponent,
    MntListarBitacoraComponent,
    MntListarEstadosFenologicosComponent,
    MntListarControladoresDeRiegoComponent,
    MntListarCampaniasAgricolasComponent,
    ClimaComponent,

    LoteDeSiembraComponent,
    UsuarioComponent,
    ZonaGeograficaComponent,
    CultivoComponent,
    TipoConceptoComponent,
    ConceptoAgricolaComponent,
    MetodoEvaluacionComponent,
    BitacoraComponent,
    EstadoFenologicoComponent,
    ControladorRiegoComponent,
    CampaniaAgricolaComponent,


    RepRiegoComponent,
    RepMaquinariaComponent,
    RepFitosanidadComponent,
    RepSanidadComponent,
    RepFertilizacionComponent,
    RepManoDeObraComponent,
    RepMapasComponent,
    NsSiembraCardComponent,
    NsWeatherComponent,
    RepFitosanidadGraficoComponent,
    RepFitosanidadGraficoCruzadoComponent,
    RepRutaComponent,
    RepCosechaComponent,
    RepRiegoGraficoComponent,
    RepManoDeObraGraficoComponent,
    RepMapCosechaComponent,
    RepRiegoConsumoAguaComponent,
    RepMaquinariaTablaGraficoComponent,
    RepClimaGraficoComponent,






    AgritareoComponent,
  ],
  entryComponents: [],
  imports: [
    GoogleMapsModule,
    TabMenuModule,
    RadioButtonModule,
    SliderModule,
    SpinnerModule,
    DragDropModule,
    InputTextModule,
    CalendarModule,
    AutoCompleteModule,
    TabViewModule,
    TreeModule,
    CarouselModule,
    ChartModule,
    TreeTableModule,
    SelectButtonModule,
    MenuModule,
    DialogModule,
    ReactiveFormsModule,
    TableModule,
    // TreeNode,
    DragDropModule,
    CommonModule,
    SharedModule,
    ModalDialogModule,
    NavigationModule,
    AngularSplitModule.forRoot(),
    NgDragDropModule.forRoot(),
    FormsModule,
    MatCheckboxModule,
    OrderListModule,
    PickListModule,
    AgritareoRoutingModule,
    AccordionModule,
    ButtonModule,
    PasswordModule,
    SharedModule,
    ChartModule,
    MultiSelectModule
  ],
  providers: [
    MntListarBitacoraService,
  ],
  bootstrap: []
})
export class AgritareoModule { }
