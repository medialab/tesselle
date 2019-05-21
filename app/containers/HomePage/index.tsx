/**
 *
 * HomePage
 *
 */

import React, { useCallback } from 'react';
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
import makeSelectSlideshows from './selectors';
import reducer from './reducer';
import saga from './saga';
import messages from './messages';
import './styles.css';
import { createSlideshowAction, removeSlideshowAction } from './actions';

import SlideshowCartouche from 'components/SlideshowCartouche';

import { useAction } from 'utils/hooks';
import { slicerContainer, Loader, LoaderProps } from 'containers/Slicer';

interface HomePageProps {
  createSlideshow: () => void;
}

const ifFileIsImage = (func: () => any) => pipe(
  head,
  when(
    propSatisfies(includes(__, ['image/jpeg', 'image/svg+xml']), 'type'),
    func,
  ),
);

function HomePage(props: HomePageProps & ContainerState & LoaderProps) {
  const onDrop = useCallback(ifFileIsImage(props.createSlideshow), [props.createSlideshow]);
  const onDelete = useAction(removeSlideshowAction.request);
  return (
    <Container className="home-container">
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
          {props.slicer.total === 0
            ? <DropZone
                accept={'image/jpeg'}
                onDrop={onDrop}
              >
                {(props as any).loading ? 'LoadingModal...' : 'Drop a file'}
              </DropZone>
            : <Loader {...props} />
            }
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
});

const withConnect = connect(
  mapStateToProps,
  {createSlideshow: createSlideshowAction.request},
);

const withReducer = injectReducer({ key: 'homePage', reducer: reducer });
const withSaga = injectSaga({ key: 'homePage', saga: saga });

export const enhancer = compose(
  slicerContainer,
  withReducer,
  withSaga,
  withConnect,
);

export default enhancer(HomePage);
