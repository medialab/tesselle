import { Reducer, Store } from 'redux';
import { RouterState } from 'connected-react-router';
import { ILanguageProviderProps } from 'containers/LanguageProvider';
import { ContainerState as EditorState } from '../containers/Editor/types';
import { ContainerState as PlayerState } from '../containers/Player/types';
import { ContainerState as HomePageState } from '../containers/HomePage/types';
import { ContainerState as SlicerState } from '../containers/Slicer/types';
import { ContainerState as ViewerState } from '../containers/Viewer/types';
import Annotation from './Annotation';
import { LeafletContext, ContextProps } from 'react-leaflet';
import { List } from 'immutable';

export interface LifeStore extends Store<{}> {
  injectedReducers?: any;
  injectedSagas?: any;
  runSaga(saga: (props?: any) => IterableIterator<any>, args: any): any;
}

export declare const enum SupportedShapes {
  rectangle = 'rectangle',
  circle = 'circle',
  point = 'point',
  polygon = 'polygon',
  polyline = 'polyline',
  selector = 'selector',
  invisible = 'invisible',
}

export interface InjectReducerParams {
  key: keyof ApplicationRootState;
  reducer: Reducer<any, any>;
}

export interface InjectSagaParams {
  key: keyof ApplicationRootState;
  saga: (props?: any) => IterableIterator<any>;
  mode?: string | undefined;
}

// Your root reducer type, which is your redux state types also
export interface ApplicationRootState {
  readonly router: RouterState;
  readonly language: ILanguageProviderProps;
  readonly editor: EditorState;
  readonly player: PlayerState;
  readonly homePage: HomePageState;
  readonly slicer: SlicerState;
  readonly viewer: ViewerState;
  // for testing purposes
  readonly test: any;
}

export type changeSelection = (annotation?: Annotation | List<Annotation>) => void;

export interface SureLeafletContext extends LeafletContext {
  map: L.Map;
}

export interface SureContextProps extends ContextProps {
  leaflet: SureLeafletContext;
}

export type Annotations = List<Annotation>;
