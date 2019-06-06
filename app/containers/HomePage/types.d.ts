import { ActionType } from 'typesafe-actions';
import * as actions from './actions';
import { ApplicationRootState } from 'types';
import Slideshow from 'types/Slideshow';
import { List, Map } from 'immutable';

/* --- STATE --- */
interface HomePageState {
  readonly slideshows: List<Slideshow>;
}

/* --- ACTIONS --- */
type HomePageActions = ActionType<typeof actions>;

/* --- EXPORTS --- */

type RootState = ApplicationRootState;
type ContainerState = HomePageState;
type ContainerActions = HomePageActions;

export { RootState, ContainerState, ContainerActions };
