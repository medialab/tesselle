/*
 *
 * Editor reducer
 *
 */

// import { combineReducers } from 'redux';

import ActionTypes from './constants';
import { ContainerState, ContainerActions } from './types';
import Slideshow from 'types/Slideshow';
import { AnnotationProperties } from 'types/Annotation';
import { LatLngBounds, LatLng } from 'leaflet';
import ImmutableGeoJSON from 'immutable-geojson';

const pointToArray = (point: LatLng): number[] => [
  point.lng,
  point.lat,
];

const boundsToLatLngs = (latLngBounds: LatLngBounds): any => [
  [
    latLngBounds.getSouthWest(),
    latLngBounds.getNorthWest(),
    latLngBounds.getNorthEast(),
    latLngBounds.getSouthEast(),
    latLngBounds.getSouthWest(),
  ].map(pointToArray),
];

export const initialState: ContainerState = {
  slideshow: null,
  selectedAnnotation: 1,
  map: null,
};

function propertiesReviver(arg) {
  return new AnnotationProperties(arg);
}

function editorReducer(state: ContainerState = initialState, action: ContainerActions) {
  if (state.slideshow) {
    switch (action.type) {
      case ActionTypes.CREATE_ANNOTATION:
      const a = ImmutableGeoJSON.fromJS({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: boundsToLatLngs(action.payload),
        },
        properties: {
          name: 'area1',
        },
      }, propertiesReviver);
      return {
        ...state,
        slideshow: state.slideshow.with({
          annotations: state.slideshow.annotations.add(a),
        }),
      };
    }
  }
  switch (action.type) {
    case ActionTypes.CREATE_SLIDESHOW_SUCCESS:
      return {
        ...state,
        slideshow: new Slideshow({
          id: action.payload.id,
          image: action.payload.image,
          annotations: action.payload.annotations,
        }),
      };
    case ActionTypes.SET_MAP:
      if (state.map !== action.payload) {
        return {
          ...state,
          map: action.payload,
        };
      }
      return state;
    default:
      return state;
  }
}

export default editorReducer;
