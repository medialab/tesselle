/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */

import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { Container, Hero, HeroHeader, HeroFooter, Title } from 'quinoa-design-library/components/';
import FileDrop from 'react-file-drop';
import { head, propEq, pipe, when, __ } from 'ramda';
import { decorator } from '../Editor';
import messages from './messages';
import { RouterProps } from 'react-router';
// import Slideshow from './../../types/slideshow';

// import Slide from 'types/Slide';

interface HomePageProps {
  createSlideshow: () => void;
}

const stopPropagation = (files: FileList, event: DragEvent) => {
  event.preventDefault();
  return files;
};

const ifFileIsJpg = (func: () => any) => pipe(
  stopPropagation,
  head,
  when(
    propEq('type', 'image/jpeg'),
    func,
  ),
);

const HomePage = (props: HomePageProps & RouterProps) => {
  return (
    <section>
      <FileDrop onDrop={
        useCallback(
          ifFileIsJpg(props.createSlideshow),
          [],
        )
      }>
        <Hero
          isColor="success"
          isSize="large">
          <HeroHeader>
            <Title>Bienvenue sur Glisse-montre!</Title>
          </HeroHeader>
          <HeroFooter>
            <h2>You can either start a project by droping a new image or drop a file to edit it.</h2>
          </HeroFooter>
        </Hero>
        <Container>
          <FormattedMessage {...messages.header} />
        </Container>
      </FileDrop>
    </section>
  );
};

export default decorator(HomePage);
