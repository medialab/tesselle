/*
 *
 * Editor actions
 *
 */

import { action, createAsyncAction, createAction } from 'typesafe-actions';
import {} from './types';

import ActionTypes from './constants';
import Slideshow from 'types/slideshow';
import { LatLngBoundsExpression, Point } from 'leaflet';
import Slide from 'types/Slide';

export const defaultAction = () => action(ActionTypes.DEFAULT_ACTION);
export const createSlideshowAction = createAsyncAction(
    ActionTypes.CREATE_SLIDESHOW,
    ActionTypes.CREATE_SLIDESHOW_SUCCESS,
    ActionTypes.CREATE_SLIDESHOW_FAILURE,
  )<File, Slideshow, Error>();

export const createSlideAction = createAsyncAction(
  ActionTypes.CREATE_SLIDE,
  ActionTypes.CREATE_SLIDE_SUCCESS,
  ActionTypes.CREATE_SLIDE_FAILURE,
)<{frame: LatLngBoundsExpression, projected: Point[]}, Slide, Error>();

export const removeSlideAction = createAction(ActionTypes.REMOVE_SLIDE, action => {
  return (slide: Slide) => action(slide);
});
