import { ActionType } from 'typesafe-actions';
import * as actions from './actions';
import { ApplicationRootState } from 'types';

/* --- STATE --- */
interface PlayerState {
  readonly default: any;
  readonly map: any;
}

/* --- ACTIONS --- */
type PlayerActions = ActionType<typeof actions>;

/* --- EXPORTS --- */

type RootState = ApplicationRootState;
type ContainerState = PlayerState;
type ContainerActions = PlayerActions;

export { RootState, ContainerState, ContainerActions };
