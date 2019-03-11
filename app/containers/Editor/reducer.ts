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
      const newSlideshow = new Slideshow({
        id: action.payload.id,
        image: action.payload.image,
        slides: action.payload.slides,
      });
      console.log('cocu', newSlideshow.get('id'));
      return {
        ...state,
        slideshow: newSlideshow,
      };
    case ActionTypes.CREATE_SLIDE_SUCCESS:
      if (state.slideshow) {
        const newSlideshow = state.slideshow.with({
          slides: [
            ...state.slideshow.slides,
            new Slide({
              bounds: action.payload.frame,
              file: action.payload.file,
            }),
          ],
        });
        return {
          ...state,
          slideshow: newSlideshow,
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
          properties: {
            name: 'area1',
          },
        };
        return {
          ...state,
          slideshow: state.slideshow.with({
            slides: update(
              state.selectedSlide - 1,
              new Slide({
                ...slide,
                annotations: {
                  type: 'FeatureCollection',
                  features: [...slide.annotations.features, feature],
                },
              }),
              state.slideshow.slides,
            ),
          }),
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
        const newSlideshow = state.slideshow.with({
          slides: state.slideshow.slides.filter(
            slide => slide.id !== action.payload.id,
          ),
        });
        console.log(newSlideshow, newSlideshow.id);
        return {
          ...state,
          slideshow: newSlideshow,
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
