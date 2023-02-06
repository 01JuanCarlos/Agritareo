export interface AllowedEvents {
  eventKey: string;

  eventFunction(event?: any): any;
}

export const NO_POI: google.maps.MapTypeStyle[] = [
  {
    featureType: 'poi',
    elementType: 'labels.text',
    stylers: [
      {
        visibility: 'off'
      }
    ]
  },
  {
    featureType: 'poi.business',
    stylers: [
      {
        visibility: 'off'
      }
    ]
  },
  {
    featureType: 'road',
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'off'
      }
    ]
  },
  {
    featureType: 'transit',
    stylers: [
      {
        visibility: 'off'
      }
    ]
  }
];

export const DEFAULT_POLYGON_COLOR = '#000000';

export const DEFAULT_MAP_OPTIONS = {
  disableDefaultUI: true,
  panControl: false,
  zoomControl: false,
  mapTypeControl: false,
  mapTypeId: 'hybrid', // google?.maps?.MapTypeId.HYBRID,
  scaleControl: false,
  streetViewControl: false,
  overviewMapControl: false,
  rotateControl: false,
  mapType: 'roadmap',
};

export const DEFAULT_DRAWINGMANAGER_OPTIONS = {
  // drawingMode: google.maps.drawing.OverlayType,
  drawingControl: true,
  drawingControlOptions: {
    position: 2, // google?.maps?.ControlPosition.TOP_CENTER,
    drawingModes: ['polygon']
  },
  markerOptions: {},
  circleOptions: {},
  polygonOptions: {
    clickable: true,
    draggable: true,
    editable: true,
    zIndex: 2
  },
  rectangleOptions: {
    clickable: true,
    draggable: true,
    editable: true,
    zIndex: 2
  },
  editable: true,
};

export const INITIAL_LAT = -8.1384397;
export const INITIAL_LNG = -79.0340984;
