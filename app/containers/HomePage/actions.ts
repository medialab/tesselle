/*
 *
 * HomePage actions
 *
 */

import { action, createAsyncAction } from 'typesafe-actions';
import {} from './types';

import ActionTypes from './constants';
import Slideshow, { SlideshowArgs } from 'types/Slideshow';

export const loadSlideshowsAction = (slideshows: SlideshowArgs[]) =>
  action(ActionTypes.LOAD_SLIDESHOWS, slideshows);

export const createSlideshowAction = createAsyncAction(
  ActionTypes.CREATE_SLIDESHOW,
  ActionTypes.CREATE_SLIDESHOW_SUCCESS,
  ActionTypes.CREATE_SLIDESHOW_FAILURE,
)<File, Slideshow, Error>();

export const removeSlideshowAction = (slideshow: Slideshow) => action(ActionTypes.REMOVE_SLIDESHOW, slideshow);
