/*
 *
 * Editor reducer
 *
 */

// import { combineReducers } from 'redux';

import ActionTypes from './constants';
import { ContainerState, ContainerActions } from './types';
import Slideshow from 'types/Slideshow';
import { update } from 'ramda';
import { LatLngBounds, LatLng } from 'leaflet';
import Slide from 'types/Slide';
import { Feature } from 'geojson';

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
  selectedSlide: 1,
  map: null,
};

function editorReducer(state: ContainerState = initialState, action: ContainerActions) {
  switch (action.type) {
    case ActionTypes.CREATE_SLIDESHOW_SUCCESS:
      return {
        ...state,
        slideshow: Slideshow.builder()
          .id(action.payload.id)
          .image(action.payload.image)
          .slides(action.payload.slides)
          .build(),
      };
    case ActionTypes.CREATE_SLIDE_SUCCESS:
      if (state.slideshow) {
        return {
          ...state,
          slideshow: Slideshow
            .builder(state.slideshow)
            .slides([
              ...state.slideshow.slides,
              Slide.builder().bounds(action.payload.frame).file(action.payload.file).build(),
            ])
            .build(),
          selectedSlide: state.slideshow.slides.length + 1,
        };
      } else {
        return state;
      }
    case ActionTypes.CREATE_ANNOTATION:
      if (state.slideshow) {
        const slide = state.slideshow.slides[state.selectedSlide - 1];
        const feature: Feature = {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: boundsToLatLngs(action.payload),
          },
          properties: {name: 'area1'},
        };
        return {
          ...state,
          slideshow: Slideshow.builder(state.slideshow)
          .slides(
            update(
              state.selectedSlide - 1,
              Slide.builder(slide).annotations(slide.annotations, feature).build(),
              state.slideshow.slides,
            ),
          )
          .build(),
        };
      }
      return state;
    case ActionTypes.CHANGE_SLIDE:
      if (state.slideshow) {
        return {
          ...state,
          selectedSlide: state.slideshow.slides.indexOf(action.payload) + 1,
        };
      }
      return state;
    case ActionTypes.REMOVE_SLIDE:
      if (state.slideshow) {
        return {
          ...state,
          slideshow: Slideshow
            .builder(state.slideshow)
            .slides(state.slideshow.slides.filter(
              slide => slide.id !== action.payload.id,
            ))
            .build(),
          selectedSlide: 1,
        };
      }
      return state;
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
