/**
 *
 * HomePage
 *
 */

import React, { useCallback, useState } from 'react';
import { Columns, Column, Content, Container, DropZone } from 'quinoa-design-library';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { propSatisfies, pipe, when, __, includes, head } from 'ramda';
import { ContainerState } from './types';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectSlideshows, { makeSelectSlicing } from './selectors';
import reducer from './reducer';
import saga from './saga';
import messages from './messages';
import './styles.css';
import { createSlideshowAction, removeSlideshowAction } from './actions';

import SlideshowCartouche from 'components/SlideshowCartouche';

import { useAction } from 'utils/hooks';
import LoadingModal from 'components/LoadingModal';

const validMimeTypes = ['image/jpeg', 'image/svg+xml'];
const isImage = includes(__, validMimeTypes);

interface HomePageProps {
  createSlideshow: () => void;
}

const ifFileIsImage = (func: () => any) => pipe(
  head,
  when(
    propSatisfies(isImage, 'type'),
    func,
  ),
);

function HomePage(props: HomePageProps & ContainerState) {
  const [loading, setLoading] = useState<boolean>(false);
  const onDrop = useCallback(
    ifFileIsImage((...args) => {
      props.createSlideshow(...args);
      setLoading(true);
    }),
    [],
  );
  const onDelete = useAction(removeSlideshowAction);
  return (
    <Container className="home-container">
      {loading &&
        <LoadingModal
          isActive
          headerContent="Nice content"
          footerContent={[<button key="coucou">Coucou</button>]}>
            <progress
              className="progress is-primary"
              value={`${(props.slicing.present / props.slicing.total) * 100}`}
              max="100">{Math.floor(props.slicing.present / props.slicing.total) * 100}</progress>
        </LoadingModal>
      }
      <Helmet>
        <title>Welcome to le paradis de la glisse</title>
        <meta name="description" content="Description of HomePage" />
      </Helmet>
      <Columns>
        <Column isSize={'1/3'}>
          <Content>
            <h1 className="title is-2">Glissemontre</h1>
            <p><FormattedMessage {...messages.chapo} /></p>
          </Content>
          <DropZone
            accept={'image/jpeg'}
            onDrop={onDrop}
          >
            {loading ? 'LoadingModal...' : 'Drop a file'}
          </DropZone>
        </Column>
        <Column isSize={'2/3'}>
          <div className="list-projects__container">
            <h4 className="list-projects__title title is-3">
              Slideshows on device:
            </h4>
            <ul>
              {props.slideshows.map(slideshow => (
                <li key={slideshow.id}>
                  <SlideshowCartouche onDelete={onDelete} slideshow={slideshow} />
                </li>
              ))}
            </ul>
          </div>
        </Column>
      </Columns>
    </Container>
  );
}

const mapStateToProps = createStructuredSelector({
  slideshows: makeSelectSlideshows(),
  slicing: makeSelectSlicing(),
});

const withConnect = connect(
  mapStateToProps,
  {createSlideshow: createSlideshowAction.request},
);

const withReducer = injectReducer({ key: 'homePage', reducer: reducer });
const withSaga = injectSaga({ key: 'homePage', saga: saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(HomePage);
