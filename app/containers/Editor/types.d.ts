import { ActionType } from 'typesafe-actions';
import * as actions from './actions';
import { ApplicationRootState } from 'types';
import Slideshow from 'types/Slideshow';
import Annotation from 'types/Annotation';
import { List } from 'immutable';

/* --- STATE --- */
interface EditorState {
  readonly slideshow: Slideshow | null;
  readonly selectedAnnotations: List<Annotation>;
}

/* --- ACTIONS --- */
type EditorActions = ActionType<typeof actions>;

/* --- EXPORTS --- */

type RootState = ApplicationRootState;
type ContainerState = EditorState;
type ContainerActions = EditorActions;

export { RootState, ContainerState, ContainerActions };
