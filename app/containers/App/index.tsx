
/**
 *
 * App.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import { compose } from 'redux';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';

import HomePage from 'containers/HomePage';
import Editor from 'containers/Editor';
import Player from 'containers/Player';
import Viewer from 'containers/Viewer';

import NotFoundPage from 'containers/NotFoundPage/Loadable';

import reducer from './reducer';
import saga from './saga';

const withReducer = injectReducer({ key: 'slicer', reducer: reducer });
const withSaga = injectSaga({ key: 'slicer', saga: saga });

const slicerContainer = compose(withReducer, withSaga);

export default slicerContainer(function App() {
  return (
    <Switch>
      <Route exact path="/" component={HomePage} />
      <Route exact path="/editor/:id" component={Editor} />
      <Route exact path="/player/:id" component={Player} />
      <Route exact path="/viewer/" component={Viewer} />
      <Route component={NotFoundPage} />
    </Switch>
  );
});
