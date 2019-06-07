/*
 *
 * Slicer actions
 *
 */

import { action, createAsyncAction } from 'typesafe-actions';
import {} from './types';

import ActionTypes from './constants';
import SliceState from './SliceArgs';
import Slideshow from 'types/Slideshow';

export const setProgress = (sliceState?: SliceState) => action(ActionTypes.SET_PROGRESS, sliceState);

export const exportSlideshowActionCreator = createAsyncAction(
  ActionTypes.EXPORT_START,
  ActionTypes.EXPORT_SUCCESS,
  ActionTypes.EXPORT_FAILURE,
)<Slideshow, any, Error>();
