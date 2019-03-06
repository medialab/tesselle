/*
 *
 * Editor actions
 *
 */

import { action, createAsyncAction, createAction } from 'typesafe-actions';
import {} from './types';

import ActionTypes from './constants';
import Slideshow from 'types/slideshow';
import { LatLngBoundsExpression } from 'leaflet';

export const defaultAction = () => action(ActionTypes.DEFAULT_ACTION);
export const createSlideshowAction = createAsyncAction(
    ActionTypes.CREATE_SLIDESHOW,
    ActionTypes.CREATE_SLIDESHOW_SUCCESS,
    ActionTypes.CREATE_SLIDESHOW_FAILURE,
  )<File, Slideshow, Error>();

export const createSlideAction = createAction(ActionTypes.CREATE_SLIDE, action => {
  return (bounds: LatLngBoundsExpression) => action(bounds);
});
