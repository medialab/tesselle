/*
 *
 * Slicer actions
 *
 */

import { action } from 'typesafe-actions';
import {} from './types';

import ActionTypes from './constants';
import SliceState from './SliceArgs';

export const setProgress = (sliceState?: SliceState) => action(ActionTypes.SET_PROGRESS, sliceState);
