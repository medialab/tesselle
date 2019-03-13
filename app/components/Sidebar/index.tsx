/**
 *
 * Sidebar
 *
 */

import * as React from 'react';
import { List } from 'immutable';
import { Store, Dispatch } from 'redux';
import { Button } from 'quinoa-design-library';
import { ReactReduxContext } from 'react-redux';

import { removeAnnotationAction, editAnnotationAction } from 'containers/Editor/actions';
import Annotation from 'types/Annotation';

import './styles.css';

const useDispatchAction = (callback: (dispatch: Dispatch, ...args: any) => any, deps: ReadonlyArray<any>) => {
  const {
    store: {
      dispatch,
    },
  }: {store: Store} = React.useContext(ReactReduxContext);
  return React.useCallback(
    (...args) => callback(dispatch, ...args),
    deps,
  );
};

interface MenuItemProps {
  data: Annotation;
}

function MenuItem(props: MenuItemProps) {
  const [edit, setEdit] = React.useState(false);
  const [content, setContent] = React.useState(props.data.properties.content);
  const onRemove: (event: React.SyntheticEvent) => void = useDispatchAction(
    (dispatch) => dispatch(removeAnnotationAction(props.data)),
    [props.data],
  );
  const saveOnEnter = useDispatchAction(
    (dispatch, event: React.KeyboardEvent<HTMLInputElement>): void => {
      console.log(event.keyCode);
      if (event.key === 'Enter') {
        dispatch(editAnnotationAction(props.data, content));
        setEdit(false);
      }
    },
    [props.data, content],
  );
  const onTextClick = React.useCallback(() => {
    setEdit(state => !state);
  }, []);
  const onInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) =>
      setContent((event.target as HTMLInputElement).value),
    [],
  );
  return (
    <div>
      {edit ? (
        <input
          type="text"
          defaultValue={props.data.properties.content}
          onBlur={onTextClick}
          autoFocus
          onKeyPress={saveOnEnter}
          onChange={onInputChange} />
        ) : (
          <h1 onClick={onTextClick}>{props.data.properties.content}</h1>
        )
      }
      <Button onClick={onRemove}>X</Button>
    </div>
  );
}

interface OwnProps {
  annotations: List<Annotation>;
}

const Sidebar: React.SFC<OwnProps> = (props: OwnProps) => {
  if (!props.annotations) {
    return (
      <div className="sidebar">
        <h1>Select a slide</h1>
      </div>
    );
  }
  if (props.annotations.size === 0) {
    return (
      <div className="sidebar">
        <h1>Edit your annotations here.</h1>
      </div>
    );
  }
  return (
    <div className="sidebar">
      {props.annotations.map((feature) => <MenuItem key={feature.id} data={feature} />)}
    </div>
  );
};

export default Sidebar;
