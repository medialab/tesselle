/*
 *
 * Editor reducer
 *
 */

// import { combineReducers } from 'redux';

import ActionTypes from './constants';
import { ContainerState, ContainerActions } from './types';
import Slideshow from 'types/Slideshow';
import Annotation, { AnnotationProperties } from 'types/Annotation';
import { LatLngBounds, LatLng } from 'leaflet';
import ImmutableGeoJSON from 'immutable-geojson';
import { when, equals } from 'ramda';

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

function propertiesReviver(key, value) {
  return new AnnotationProperties(value);
}

const fromJS = (value) => {
  return ImmutableGeoJSON.fromJS(value, propertiesReviver);
};

function editorReducer(state: ContainerState = initialState, action: ContainerActions) {
  if (state.slideshow) {
    switch (action.type) {
      case ActionTypes.CREATE_ANNOTATION:
        return {
          ...state,
          slideshow: state.slideshow.with({
            annotations: state.slideshow.annotations.add(
              fromJS({
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: boundsToLatLngs(action.payload),
                },
                properties: {
                  name: 'area1',
                },
              }),
            ),
          }),
        };
      case ActionTypes.EDIT_ANNOTATION:
        return {
          ...state,
          slideshow: state.slideshow.with({
            annotations: state.slideshow.annotations.map(
              when(
                equals(action.payload.annotation),
                (annotation: Annotation) => annotation.set(
                  'properties',
                  annotation.properties.set('content', action.payload.content),
                ),
              ),
            ),
          }),
        };
      case ActionTypes.REMOVE_ANNOTATION:
        return {
          ...state,
          slideshow: state.slideshow.with({
            annotations: state.slideshow.annotations.remove(action.payload),
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
          annotations: action.payload.annotations.map(fromJS),
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
