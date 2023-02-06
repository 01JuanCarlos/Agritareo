import { ChangeDetectionStrategy, Component, DoCheck, ElementRef, EventEmitter, Injector, Input, NgZone, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Bool } from '@app/common/decorators';
import { UniqueID } from '@app/common/utils';
import { debounce, map } from 'lodash-es';
import { AllowedEvents, DEFAULT_DRAWINGMANAGER_OPTIONS, DEFAULT_MAP_OPTIONS, DEFAULT_POLYGON_COLOR, INITIAL_LAT, INITIAL_LNG, NO_POI } from './ns-map.config';
import * as MarkerWithLabel from '@google/markerwithlabel';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';
import { data } from 'jquery';
import * as moment from 'moment';
import 'moment/locale/es';
@Component({
  selector: 'ns-map',
  templateUrl: './ns-map.component.html',
  styleUrls: ['./ns-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class NsMapComponent implements OnInit, OnChanges {
  @ViewChild('map', { static: true }) mapRef: ElementRef | any;
  mapEl: any;

  drawingManagerEl: any;
  defaultColor = DEFAULT_POLYGON_COLOR;
  getInit: any;
  idbitacora_agricola;
  newContent;
  data;
  contentTest;
  fecha = '';
  test;

  @Input() lat: number;
  @Input() lng: number;
  @Input() zoom = 16;
  @Input() mapOptions = DEFAULT_MAP_OPTIONS;
  // @Input() origin: any;
  // @Input() destination: any;


  @Input() mapData = [];
  @Input() mapRoute = [];
  @Input() mapMarker = [];
  @Input() coordinatesKey = 'coordenadas';
  @Input() verticesKey = 'vertices_lineas';
  @Input() markersKey = 'markers';
  @Input() latitudeKey = 'latitud';
  @Input() longitudeKey = 'longitud';
  @Input() idevaluador = 'idevaluador';

  @Input() @Bool multiselect: boolean;
  @Input() @Bool nolimit: boolean;
  @Input() limit: number;

  @Input() @Bool editable: boolean;
  @Input() @Bool drawingManager: boolean;
  @Input() drawingManagerOptions: any;

  @Output() drawed = new EventEmitter();
  @Output() updated = new EventEmitter();
  @Output() selected = new EventEmitter();

  @Output() drawedMarker = new EventEmitter();
  @Output() updatedMarker = new EventEmitter();
  @Output() selectedMarker = new EventEmitter();

  showRoute: any;
  polygonList = {};
  mapPolygonList = {};
  polylineList = {};
  mapPolylineList = {};
  markerList = {};
  mapMarkerList = {};
  mapPolylineLabel = {};
  mapPolygonLabel = {};
  mapPolygonMarker = {};
  mapMarkerLabel = {};
 //FECHAS
 lastDateInicio = '';
 lastDateFin = '';
  nsMapValue: any;
  nsMapValueId: string;
  evaluadorColor: any;

  constructor(
    injector: Injector,
    private zone: NgZone,
    public https: AppHttpClientService,
  ) {
    this.updatedFormControlPolygon = debounce(this.updatedFormControlPolygon, 100);
  }



  ngOnChanges(changes: SimpleChanges) {
    if (changes.mapData) {
      this.zone.runOutsideAngular(() => {
        this.clearPolygons();
        this.drawPolygonData(changes.mapData?.currentValue, { clickable: true }, [
          {
            eventKey: 'click',
            eventFunction: (polygon) => {
              this.selected.emit(polygon)
            }
          },
        ]);
      });
    }

    if (changes.mapRoute) {
      this.zone.runOutsideAngular(() => {
        this.clearMarkers();
        this.drawRouteData(changes.mapRoute?.currentValue, [
          {
            eventKey: 'click',
            eventFunction: (polyline) => {
              this.selected.emit(polyline)
            }
          },
        ]);
      });
    }

    // if (changes.mapMarker) {
    //   this.zone.runOutsideAngular(() => {
    //     // this.clearPolygons();
    //     this.drawMarkerData(changes.mapMarker?.currentValue, [
    //       {
    //         eventKey: 'click',
    //         eventFunction: (marker) => {
    //           this.selectedMarker.emit(marker)
    //         }
    //       },
    //     ]);
    //   });
    // }

    if (changes.editable) {
      this.zone.runOutsideAngular(() => {
        this.enableDrawingManager(!this.nsMapValue && changes.editable.currentValue);
        const editable = changes.editable?.currentValue;
        this.zone.runOutsideAngular(() => {
          Object.keys(this.mapPolygonList).forEach(polygonId => {
            const polygon = this.mapPolygonList[polygonId];
            polygon.setOptions({ editable, draggable: editable, clickable: editable });
            google.maps.event.addListener(polygon, 'dragend', () => this.updatedFormControlPolygon(polygonId));
            google.maps.event.addListener(polygon, 'set_at', () => this.updatedFormControlPolygon(polygonId));
            google.maps.event.addListener(polygon, 'insert_at', () => this.updatedFormControlPolygon(polygonId));
          });
        });
      });

    }

    if (changes.drawingManager) {
      const drawingManagerEnabled = changes.drawingManager?.currentValue;
      this.enableDrawingManager(drawingManagerEnabled);
    }

    if (changes.markers) {
      this.zone.runOutsideAngular(() => {
        this.clearMarkers();
        this.drawMarkers(changes.markers?.currentValue);
      });

    }
  }

  updatedFormControlPolygon(id: string | number) {
    this.zone.runOutsideAngular(() => {
      const polygon = this.mapPolygonList[id];
      this.nsMapValue = polygon.getPath().getArray().map(it => ({ [this.latitudeKey]: it.lat(), [this.longitudeKey]: it.lng() }));
      this.onChangeValue(this.nsMapValue);
    });
  }

  // ControlValueAccessor
  onChangeValue(coordinates: any[]) {
    this.zone.run(() => {
      this.drawed.emit(coordinates);
    });
  }

  ngOnInit() {
    this.zone.runOutsideAngular(() => {
      const mapRef = this.mapRef.nativeElement;
      const center = { lat: +this.lat || INITIAL_LAT, lng: +this.lng || INITIAL_LNG };

      this.mapEl = new google.maps.Map(mapRef, {
        ...this.mapOptions,
        styles: NO_POI,
        zoom: this.zoom,
        center,
      });
    });

    this.zone.runOutsideAngular(() => {
      this.initMap();
      this.initDrawingManager();
    });
  }

  enableDrawingManager(enabled = false) {
    if (!this.drawingManagerEl) {
      return;
    }
    if (!!this.drawingManagerEl.map && enabled) {
      return;
    }
    this.drawingManagerEl.setMap(enabled ? this.mapEl : null);
  }

  centerMap(lat: number, lng: number) {
    this.mapEl.panTo({ lat: lat || INITIAL_LAT, lng: lng || INITIAL_LNG });
  }

  getCoordinatesCenter(polygonCoordinates: any[]) {
    const bounds = new google.maps.LatLngBounds();

    polygonCoordinates.forEach(c => {
      bounds.extend(new google.maps.LatLng(c[this.latitudeKey], c[this.longitudeKey]));
    });

    return bounds.getCenter();
  }

  clearPolygons() {
    this.polygonList = {};
    Object.keys(this.mapPolygonList).forEach(polygonId => {
      this.mapPolygonList[polygonId].setMap(null);
      delete this.mapPolygonList[polygonId];
    });
  }

  clearMarkers() {
    Object.keys(this.mapPolylineList).forEach(markerId => {
      this.mapPolylineList[markerId].setMap(null);
      delete this.mapPolygonMarker[markerId];
    });
  }

  drawMarkers(markers: any[]) {
    this.zone.runOutsideAngular(() => {
      (markers || []).forEach((marker: any) => {
        const id = marker?.id || UniqueID();
        const newMarker = new MarkerWithLabel({
          position: new google.maps.LatLng(marker[this.latitudeKey], marker[this.longitudeKey]),
          clickable: !!this.selected.observers.length,
          draggable: !!this.updatedMarker.observers.length,
          map: this.mapEl,
          ...marker
        });

        this.mapPolygonMarker[id] = newMarker;
      });
    });

  }

  drawLineData(lines: any, lineEvents?: AllowedEvents[], pathEvents?: AllowedEvents[]) {
    this.zone.runOutsideAngular(() => {
      lines.forEach((line: any) => {
        const lineCoordinates = line[this.coordinatesKey];
        const id = line?.id || UniqueID();
        const paths = lineCoordinates.map(it => ({ lat: it[this.latitudeKey], lng: it[this.longitudeKey] }));

        const mapPolygon: any = new google.maps.Polygon({
          paths,
          ...line,
        });
      })
    });
  }

  drawPolygonData(polygons: any[], { clickable = false, editable = false, draggable = false }, polygonEvents?: AllowedEvents[], pathEvents?: AllowedEvents[]) {
    this.zone.runOutsideAngular(() => {
      polygons.forEach((polygon: any) => {
        const polygonCoordinates = polygon[this.coordinatesKey];
        // console.log(polygonCoordinates)

        if (polygonCoordinates) {
          const id = polygon?.id || UniqueID();

          const paths = polygonCoordinates.map(it => ({ lat: it[this.latitudeKey], lng: it[this.longitudeKey] }));

          const mapPolygon: any = new google.maps.Polygon({
            paths,
            ...polygon,
            ...{ clickable, editable, draggable }
          });


          (polygonEvents || []).forEach(event => {
            google.maps.event.addListener(mapPolygon, event.eventKey, () => event.eventFunction.call(this, mapPolygon));
          });

          mapPolygon.getPaths().forEach((path) => {
            (pathEvents || []).forEach(event => {
              google.maps.event.addListener(path, event.eventKey, event.eventFunction);
            });
          });


          if (polygon.polygonLabel) {
            const { lat, lng } = this.getCoordinatesCenter(polygonCoordinates);

            const marker = new MarkerWithLabel({
              position: new google.maps.LatLng(lat(), lng()),
              clickable: false,
              draggable: false,
              map: this.mapEl,
              icon: " ",
              labelContent: polygon.polygonLabel,
              labelClass: polygon.labelClass,
            });
            this.mapPolygonLabel[id] = marker;
          }


          if (polygon.polygonInfo) {

            const content = polygon.polygonInfo;

            const { lat, lng } = this.getCoordinatesCenter(polygonCoordinates);

            const marker = new MarkerWithLabel({
              position: new google.maps.LatLng(lat(), lng()),
              clickable: true,
              draggable: false,
              map: this.mapEl,
              icon: " ",
              labelContent: polygon.polygonLabel,
              labelClass: polygon.labelClass,
            });
            this.mapPolygonLabel[id] = marker;

            var infoWindow = new google.maps.InfoWindow()

            google.maps.event.addListener(marker, "click", (function (marker, content, infoWindow) {
              return function () {
                infoWindow.setContent(content);
                infoWindow.open(this.mapEl, marker);
              };
            })(marker, content, infoWindow));

            // google.maps.event.addListener(marker, 'mouseover', (function (marker, content, infoWindow) {
            //   return function () {
            //     infoWindow.setContent(content);
            //     infoWindow.open(this.mapEl, marker);
            //   };
            // })(marker, content, infoWindow));

            // google.maps.event.addListener(marker, 'mouseout', function () {
            //   infoWindow.close();
            // });
          }
          mapPolygon.setMap(this.mapEl);
          this.polygonList[id] = paths;
          this.mapPolygonList[id] = mapPolygon;

        }
      });
    });
  }

  drawRouteData(routes: any[], routeEvents?: AllowedEvents[], pathEvents?: AllowedEvents[]) {
    this.zone.runOutsideAngular(() => {
      routes.forEach((route: any) => {
        const routeCoordinates = route[this.verticesKey];
        const markersCoordinates = route[this.markersKey];
        if (routeCoordinates && routeCoordinates.length) {
          const id = route?.id || UniqueID();

          const lineSymbol = {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            // strokeColor: "#393"
          };

          // console.log(routeCoordinates)


          this.evaluadorColor = routeCoordinates.map(x => {
           return x.color.slice(0)
          })

          // console.log(this.evaluadorColor[0])

          const mapPolyline: any = new google.maps.Polyline({
            path: routeCoordinates,
            icons: [
              {
                icon: lineSymbol,
                offset: "100%",
              },
            ],
            strokeColor: this.evaluadorColor[0],
            strokeWeight: 6,
            zIndex: 6,
            geodesic: true,
            ...route
          });


          (routeEvents || []).forEach(event => {
            google.maps.event.addListener(mapPolyline, event.eventKey, () => event.eventFunction.call(this, mapPolyline));
          });

          mapPolyline.getPath().forEach((path) => {
            (pathEvents || []).forEach(event => {
              google.maps.event.addListener(path, event.eventKey, event.eventFunction);
            });
          });

          if (route.routeInfo) {
            const infoWindow = new google.maps.InfoWindow();
            const content = route.routeInfo
            const newArrMarkersCoordinates = markersCoordinates.map(e => {
              this.idbitacora_agricola = e.idbitacora_agricola
              return [{ lat: e.lat, lng: e.lng }, e.idbitacora_agricola];
            })
            // console.log(newArrMarkersCoordinates)

            newArrMarkersCoordinates.forEach(([position, title], i) => {
              const marker = new google.maps.Marker({
              position,
              map: this.mapEl,
              clickable: true,
              draggable: false,
              title: `${i + 1}. ${title}`,
              label: `${i + 1}`,
              optimized: false,
              });
              this.mapPolygonLabel[id] = marker;



              // Add a click listener for each marker, and set up the info window.
              google.maps.event.addListener(marker, "click", (function (marker, content, infoWindow) {
                return function () {
                  infoWindow.setContent(content);
                  infoWindow.open(this.mapEl, marker);
                };
              })(marker, content, infoWindow));

            });
          }

          mapPolyline.setMap(this.mapEl);
          this.polylineList[id] = routeCoordinates;
          this.mapPolylineList[id] = mapPolyline;

        }
      });
    });
  }

  formatDateSeconds(date: string) {
    moment.locale('es');
    return moment(new Date(date)).format('D [de] MMMM , h:mm a');
  }

  // drawMarkerData(markers: any[], routeEvents?: AllowedEvents[], pathEvents?: AllowedEvents[]) {
  //   this.zone.runOutsideAngular(() => {
  //     markers.forEach((marker: any) => {
  //       const markersCoordinates = marker[this.markersKey];
  //       if (markersCoordinates && markersCoordinates.length) {
  //         const newArrMarkersCoordinates = markersCoordinates.map(e => {
  //           this.idbitacora_agricola = e.idbitacora_agricola
  //           return [{ lat: e.lat, lng: e.lng }, e.idbitacora_agricola];
  //         })
  //         const id = marker?.id || UniqueID();

  //         newArrMarkersCoordinates.forEach(([position, title], i) => {
  //           const content = marker.markerInfo ?? 'No hay data';
  //           const ids = title
  //           const mapMarker = new google.maps.Marker({
  //             position,
  //             map: this.mapEl,
  //             clickable: true,
  //             draggable: false,
  //             title: `${i + 1}. ${title}`,
  //             label: `${i + 1}`,
  //             optimized: false,
  //           });

  //           this.mapMarkerLabel[id] = mapMarker;

  //           const infoWindowOptions = {
  //             // content: this.contentTest,
  //             position: newArrMarkersCoordinates,
  //             maxWidth: 600,
  //             shouldFocus: false
  //           }
  //           const infoWindow = new google.maps.InfoWindow(infoWindowOptions)


  //           this.https.get(`phytosanitary-route-report/${ids}`, {i: "2022-08-02"}).subscribe(response => {
  //             this.data = response;
  //              (response || []).map(it => {
  //               // it.cultivo = it.cultivo
  //               // it.id = it.idbitacora_agricola
  //               // it.evaluador = response.evaluador
  //               // it.valor_encontrado = it.valor_encontrado
  //               // it.concepto = it.concepto
  //               // it.fecha = it.fecha
  //               // it.nombrenivel = it.nombrenivel
  //               // console.log(it)

  //               (it.evaluaciones_sanitarias || []).forEach(x =>{
  //                 for (let i = 0; i < it.valores_encontrados.length; i++) {
  //                   console.log(it.valores_encontrados[i].valor_encontrado);
  //                   this.contentTest = infoWindow.setContent(
  //                     `
  //                   <h1 style="font-size:35px; font-weight: bold;"><i class="fas fa-user"  style="font-size:35px"></i> ${it.evaluador} </h1>
  //                   <span style="font-size:25px; border-right: 1px solid; padding-right: 7px; font-weight: 500;"><i class="fas fa-map-marker-alt"  style="font-size:25px; padding-right: 5px;"></i>${it.nombrenivel}</span>
  //                   <span style="font-size:25px; margin-left: 10px; font-weight: 500;"><i class="fas fa-seedling"  style="font-size:25px; padding-right: 5px;"></i>${it.cultivo_variedad}</span> <br> <br> <br>
  //                   <table>
  //                   <tr style="font-size:25px;">
  //                     <th><i class="fas fa-bug" style="padding-left: 110px;"></i></th>
  //                     <th><i class="fas fa-user-clock"></i> ${this.formatDateSeconds(x?.fecha)}  </th>
  //                   </tr>'
  //                   <tr style="font-size:25px; border-top: 2px outset; font-weight: 400;">
  //                     <td style="border-right: 2px outset; padding-right: 20px">${it.valores_encontrados[i].concepto}</td>
  //                     <td style="padding-left: 110px; background: #317f43;" ${it.valores_encontrados[i].valor_encontrado}></td>
  //                   </tr>
  //                   </table>
  //                   `
  //                   )
  //                 }
  //                 return x
  //               })


  //                 // console.log(x.valor_encontrado)

  //                 // '<h1 style="font-size:35px">'+ '<i class="fas fa-user"  style="font-size:35px; padding-right: 10px;"></i>' + it.evaluador + '</h1>' +
  //                 // '<span style="font-size:25px; border-right: 1px solid; padding-right: 7px">' + 'Lote: '+ it.nombrenivel +'</span>' +
  //                 // '<span style="font-size:25px; margin-left: 10px">' + 'Cultivo: '+ it.cultivo +'</span> <br> <br> <br>' +
  //                 // '<table>' +
  //                 // '<tr style="font-size:25px;">' +
  //                 //     '<th style="padding-right: 126px;">' + 'Plaga' + '</th>' +
  //                 //     '<th>' + this.formatDateSeconds(it?.fecha) + '</th>' +
  //                 //   '</tr>' +
  //                 //   '<tr style="font-size:25px; border-top: 2px outset;">' +
  //                 //     '<td style="border-right: 2px outset; padding-right: 20px">' + it.concepto + '</td>' +
  //                 //     '<td style="padding-left: 110px;">' + it.valor_encontrado + '</td>' +
  //                 //   '</tr>' +
  //                 // '</table>'
  //               return it
  //             })
  //           });
  //           // console.log(this.data)
            // google.maps.event.addListener(mapMarker, "click", function () {
            //   this.contentTest;
            //   infoWindow.getContent();
            //   infoWindow.open(this.mapEl, mapMarker);
            // })
  //         });
  //       }
  //     });
  //   });
  // }


  initMap() {
    this.zone.runOutsideAngular(() => {
      const mapRef = this.mapRef.nativeElement;
      const center = { lat: +this.lat || INITIAL_LAT, lng: +this.lng || INITIAL_LNG };
      this.mapEl = new google.maps.Map(mapRef, {
        ...this.mapOptions,
        styles: NO_POI,
        zoom: this.zoom,
        center,
      });
    });
  }

  updateAllColors(fillColor = this.defaultColor) {
    // Colorcar un key por defecto
    this.zone.runOutsideAngular(() => {
      Object.keys(this.mapPolygonList).forEach((it: any) => {
        this.mapPolygonList[it].setOptions({ fillColor: this.mapPolygonList[it].color || fillColor });
      });
    });
  }

  initDrawingManager() {
    this.zone.runOutsideAngular(() => {
      this.drawingManagerEl = new google.maps.drawing.DrawingManager(this.drawingManagerOptions || DEFAULT_DRAWINGMANAGER_OPTIONS);
      this.enableDrawingManager(this.drawingManager);
      google.maps.event.addListener(this.drawingManagerEl, 'overlaycomplete', (obj: any) => {
        const drawedPolygon = obj.overlay
          .getPath()
          .getArray()
          .map(it => ({ [this.latitudeKey]: it.lat(), [this.longitudeKey]: it.lng() }));

        const id = drawedPolygon?.id || UniqueID();
        this.polygonList[id] = drawedPolygon;
        this.mapPolygonList[id] = obj.overlay;
        this.drawed.emit(drawedPolygon);

        if (this.limit) {
          this.drawingManagerEl.setMap(null);
        }
        // TODO: Eliminar cantidad máxima
        if (this.nolimit) {
          this.drawingManagerEl.setMap(null);
        }
      });
    });
  }

}


