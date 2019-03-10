import { ActionType } from 'typesafe-actions';
import * as actions from './actions';
import { ApplicationRootState } from 'types';
import Slideshow from 'types/Slideshow';

/* --- STATE --- */
interface EditorState {
  readonly slideshow: Slideshow | null;
  readonly selectedSlide: number;
  readonly map: L.Map | null;
}

/* --- ACTIONS --- */
type EditorActions = ActionType<typeof actions>;

/* --- EXPORTS --- */

type RootState = ApplicationRootState;
type ContainerState = EditorState;
type ContainerActions = EditorActions;

export { RootState, ContainerState, ContainerActions };
