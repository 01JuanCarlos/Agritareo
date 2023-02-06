import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/guards/auth.guard';
import { TabsRouteGuard } from '@app/guards/tabs-route.guard';
import { BasicLayoutComponent } from '@app/layouts/basic-layout/basic-layout.component';
import { NsReporteLayoutComponent } from '@app/layouts/ns-reporte-layout/ns-reporte-layout.component';
import { BitacoraComponent } from '@views/agritareo/administracion/mnt-listar-bitacora/bitacora/bitacora.component';
import { MntListarBitacoraComponent } from '@views/agritareo/administracion/mnt-listar-bitacora/mnt-listar-bitacora.component';
import { CampaniaAgricolaComponent } from '@views/agritareo/administracion/mnt-listar-campañas-agricolas/campania-agricola/campania-agricola.component';
import { MntListarCampaniasAgricolasComponent } from '@views/agritareo/administracion/mnt-listar-campañas-agricolas/mnt-listar-campanias-agricolas.component';
import { ClimaComponent } from '@views/agritareo/administracion/mnt-listar-clima/clima/clima.component';
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
import { RepCosechaComponent } from '@views/agritareo/reportes/rep-cosecha/rep-cosecha.component';
import { RepFertilizacionComponent } from '@views/agritareo/reportes/rep-fertilizacion/rep-fertilizacion.component';
import { RepFitosanidadGraficoCruzadoComponent } from '@views/agritareo/reportes/rep-fitosanidad-grafico-cruzado/rep-fitosanidad-grafico-cruzado.component';
import { RepFitosanidadGraficoComponent } from '@views/agritareo/reportes/rep-fitosanidad-grafico/rep-fitosanidad-grafico.component';
import { RepFitosanidadComponent } from '@views/agritareo/reportes/rep-fitosanidad/rep-fitosanidad.component';
import { RepManoDeObraGraficoComponent } from '@views/agritareo/reportes/rep-mano-de-obra-grafico/rep-mano-de-obra-grafico.component';
import { RepManoDeObraComponent } from '@views/agritareo/reportes/rep-mano-de-obra/rep-mano-de-obra.component';
import { RepMapCosechaComponent } from '@views/agritareo/reportes/rep-map-cosecha/rep-map-cosecha.component';
import { RepMaquinariaTablaGraficoComponent } from '@views/agritareo/reportes/rep-maquinaria-tabla-grafico/rep-maquinaria-tabla-grafico.component';
import { RepRiegoConsumoAguaComponent } from '@views/agritareo/reportes/rep-riego-consumo-agua/rep-riego-consumo-agua.component';
import { RepRiegoGraficoComponent } from '@views/agritareo/reportes/rep-riego-grafico/rep-riego-grafico.component';
import { RepRiegoComponent } from '@views/agritareo/reportes/rep-riego/rep-riego.component';
import { RepRutaComponent } from '@views/agritareo/reportes/rep-ruta/rep-ruta.component';


const routes: Routes = [
  {
    path: '',
    component: BasicLayoutComponent,
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'administracion',
        canActivateChild: [TabsRouteGuard],
        children: [
          {
            path: 'metodos-evaluacion',
            children: [
              {
                path: '',
                component: MntListarMetodosEvaluacionComponent,
              },
              {
                path: 'nuevo',
                component: MetodoEvaluacionComponent,
              },
              {
                path: ':id',
                component: MetodoEvaluacionComponent,
              },
            ]
          },
          {
            path: 'tipo-conceptos',
            children: [
              {
                path: '',
                component: MntListarTipoConceptosComponent,
              },
              {
                path: 'nuevo',
                component: TipoConceptoComponent,
              },
              {
                path: ':id',
                component: TipoConceptoComponent,
              },
            ]
          },
          {
            path: 'conceptos-agricolas',
            children: [
              {
                path: '',
                component: MntListarConceptosAgricolasComponent,
              },
              {
                path: 'nuevo',
                component: ConceptoAgricolaComponent,
              },
              {
                path: ':id',
                component: ConceptoAgricolaComponent,
              },
            ]
          },
          {
            path: 'cultivos',
            children: [
              {
                path: '',
                component: MntListarCultivosComponent,
              },
              {
                path: 'nuevo',
                component: CultivoComponent,
              },
              {
                path: ':id',
                component: CultivoComponent,
              },
            ]
          },
          {
            path: 'clima',
            children: [
              {
                path: '',
                component: ClimaComponent,
              },
            ]
          },
          {
            path: 'usuarios',
            children: [
              {
                path: '',
                component: MntListarUsuariosComponent,
              },
              {
                path: 'nuevo',
                component: UsuarioComponent,
              },
              {
                path: ':id',
                component: UsuarioComponent,
              },
            ]
          },
          {
            path: 'zonas-geograficas',
            children: [
              {
                path: '',
                component: MntListarZonasGeograficasComponent,
              },
              {
                path: 'nuevo',
                component: ZonaGeograficaComponent,
              },
              {
                path: ':id',
                component: ZonaGeograficaComponent,
              },
            ]
          },
          {
            path: 'trampas',
            component: MntListarTrampasComponent,
          },
          {
            path: 'fitosanidad',
            component: MntListarPlagasComponent,
          },
          {
            path: 'lotes-de-siembra',
            children: [
              {
                path: '',
                component: MntListarLotesDeSiembraComponent,
              },
              {
                path: 'nuevo',
                component: LoteDeSiembraComponent,
              },
              {
                path: ':id',
                component: LoteDeSiembraComponent,
              },
            ]
          },
          {
            path: 'estados-fenologicos',
            children: [
              {
                path: '',
                component: MntListarEstadosFenologicosComponent,
              },
              {
                path: 'nuevo',
                component: EstadoFenologicoComponent,
              },
              {
                path: ':id',
                component: EstadoFenologicoComponent,
              },
            ]
          },
          {
            path: 'controlador-riego',
            children: [
              {
                path: '',
                component: MntListarControladoresDeRiegoComponent,
              },
              {
                path: 'nuevo',
                component: ControladorRiegoComponent,
              },
              {
                path: ':id',
                component: ControladorRiegoComponent,
              },
            ]
          },
          {
            path: 'campania-agricola',
            children: [
              {
                path: '',
                component: MntListarCampaniasAgricolasComponent,
              },
              {
                path: 'nuevo',
                component: CampaniaAgricolaComponent,
              },
              {
                path: ':id',
                component: CampaniaAgricolaComponent,
              },
            ]
          },
        ]
      },
      {
        path: 'reportes',
        component: NsReporteLayoutComponent,
        canActivateChild: [TabsRouteGuard],
        children: [
          {
            path: 'fitosanidad',
            children: [
              {
                path: '',
                component: RepFitosanidadComponent,
              },
              {
                path: 'fitosanidad-graficocruzado',
                component: RepFitosanidadGraficoCruzadoComponent,
              },
              {
                path: 'fitosanidad-graficocruzado',
                component: RepFitosanidadGraficoComponent,
              },
            ]
          },
          {
            path: 'mano-de-obra',
            component: RepManoDeObraComponent,
          },
          {
            path: 'fitosanidad-graficocruzado',
            component: RepFitosanidadGraficoCruzadoComponent,
          },
          {
            path: 'mano-obra-grafico',
            component: RepManoDeObraGraficoComponent,
          },
        ]
      },
      {
        path: 'reporte-fitosanidad-cabecera',
        component: NsReporteLayoutComponent,
        canActivateChild: [TabsRouteGuard],
        children: [
          {
            path: 'fitosanidad-grafico',
            component: RepFitosanidadGraficoComponent,
          },
          {
            path: 'fitosanidad-maparuta',
            component: RepRutaComponent,
          },
          {
            path: 'fitosanidad',
            component: RepFitosanidadComponent,
          },
        ]
      },
      {
        path: 'maquinaria-cabecera',
        component: NsReporteLayoutComponent,
        canActivateChild: [TabsRouteGuard],
        children: [
          {
            path: 'maquinaria-tabla-grafico',
            component: RepMaquinariaTablaGraficoComponent,
          },
        ]
      },
      {
        path: 'reporte-riego-cabecera',
        component: NsReporteLayoutComponent,
        canActivateChild: [TabsRouteGuard],
        children: [
          {
            path: 'riego',
            component: RepRiegoComponent,
          },
          {
            path: 'riego-tabla-grafico',
            component: RepRiegoGraficoComponent,
          },
          {
            path: 'consumo-agua',
            component: RepRiegoConsumoAguaComponent,
          },
        ]
      },
      {
        path: 'reporte-fertilizacion-cabecera',
        component: NsReporteLayoutComponent,
        canActivateChild: [TabsRouteGuard],
        children: [
          {
            path: 'fertilizacion',
            component: RepFertilizacionComponent,
          },
        ]
      },
      {
        path: 'reporte-cosecha-cabecera',
        component: NsReporteLayoutComponent,
        canActivateChild: [TabsRouteGuard],
        children: [
          {
            path: 'cosecha-mapa',
            component: RepMapCosechaComponent,
          },
          {
            path: 'cosecha-tabla-grafico',
            component: RepCosechaComponent,
          },
        ]
      },
      {
        path: 'movimiento',
        canActivateChild: [TabsRouteGuard],
        children: [
          {
            path: 'bitacora',
            children: [
              {
                path: '',
                component: MntListarBitacoraComponent,
              },
              {
                path: 'nuevo',
                component: BitacoraComponent,
              },
              {
                path: ':id',
                component: BitacoraComponent,
              },
            ]
          },
        ]
      },
      { path: '', component: AgritareoComponent },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgritareoRoutingModule { }
