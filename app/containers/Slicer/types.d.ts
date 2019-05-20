import { ActionType } from 'typesafe-actions';
import * as actions from './actions';
import { ApplicationRootState } from 'types';
import SlicerState from './SliceArgs';

/* --- ACTIONS --- */
type SlicerActions = ActionType<typeof actions>;

/* --- EXPORTS --- */

type RootState = ApplicationRootState;
type ContainerState = SlicerState;
type ContainerActions = SlicerActions;

export { RootState, ContainerState, ContainerActions };
