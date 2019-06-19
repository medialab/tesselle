import { ActionType } from 'typesafe-actions';
import * as actions from './actions';
import { ApplicationRootState } from 'types';
import Annotation from 'types/Annotation';

/* --- STATE --- */
interface PlayerState {
  readonly slideshow: any;
}

/* --- ACTIONS --- */
type PlayerActions = ActionType<typeof actions>;

/* --- EXPORTS --- */

type RootState = ApplicationRootState;
type ContainerState = PlayerState;
type ContainerActions = PlayerActions;

export { RootState, ContainerState, ContainerActions };
