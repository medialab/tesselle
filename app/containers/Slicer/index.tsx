/**
 *
 * Slicer
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectSlicer from './selectors';
import reducer from './reducer';
import saga from './saga';
import './styles.css';
import { ContainerState } from './types';

export interface LoaderProps {
  slicer: ContainerState;
}

export function Loader(props: LoaderProps) {
  if (props.slicer && props.slicer.total === 0) {
    return <React.Fragment />;
  }
  return (
    <div>
      <progress
        className="progress is-primary"
        value={`${(props.slicer.present / props.slicer.total) * 100}`}
        max="100">{Math.floor(props.slicer.present / props.slicer.total) * 100}</progress>
    </div>
  );
}

const mapStateToProps = createStructuredSelector({
  slicer: makeSelectSlicer(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch: dispatch,
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withReducer = injectReducer({ key: 'slicer', reducer: reducer });
const withSaga = injectSaga({ key: 'slicer', saga: saga });

export const slicerContainer = compose(
  withReducer,
  withSaga,
  withConnect,
);

export default slicerContainer(Loader);
