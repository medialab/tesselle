/**
 *
 * Editor
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import { makeSelectSlideshow } from './selectors';
import reducer from './reducer';
import saga from './saga';
import { createSlideshowAction } from './actions';
import Slideshow from '../../types/Slideshow';
import { RouterProps } from 'react-router';

// const useRedirectIfNoSlideshow = (slideshow: Slideshow | null, toRoute: () => void) => {
//   useEffect(() => {
//     if (slideshow === null) {
//       toRoute();
//     }
//   }, [slideshow]);
// };

interface EditorProps {
  slideshow: Slideshow;
}

function Editor(props: EditorProps & RouterProps) {
  const slideshow = props.slideshow;
  // useRedirectIfNoSlideshow(
  //   slideshow,
  //   () => props.history.push('/'),
  // );
  console.log(slideshow, 'ez');
  return (
    <div>
      <Helmet>
        <title>Editor</title>
        <meta name="description" content="Description of Editor" />
      </Helmet>
      <div>
        COUCOU
      </div>
    </div>
  );
}

Editor.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  slideshow: makeSelectSlideshow(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch: dispatch,
    createSlideshow: (file: File) =>
      dispatch(createSlideshowAction.request(file)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withReducer = injectReducer({ key: 'editor', reducer: reducer });
const withSaga = injectSaga({ key: 'editor', saga: saga });

export const decorator = compose(
  withReducer,
  withSaga,
  withConnect,
);

export default decorator(Editor);
