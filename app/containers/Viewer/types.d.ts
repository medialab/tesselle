import { ActionType } from 'typesafe-actions';
import * as actions from './actions';
import { ApplicationRootState } from 'types';

/* --- STATE --- */
interface ViewerState {
  readonly default: any;
}

/* --- ACTIONS --- */
type ViewerActions = ActionType<typeof actions>;

/* --- EXPORTS --- */

type RootState = ApplicationRootState;
type ContainerState = ViewerState;
type ContainerActions = ViewerActions;

export { RootState, ContainerState, ContainerActions };
