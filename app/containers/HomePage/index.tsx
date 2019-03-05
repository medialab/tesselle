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
import { propSatisfies, pipe, when, __ } from 'ramda';
import { RouterProps } from 'react-router';
import { decorator } from '../Editor';
import messages from './messages';
import includes from 'ramda/es/includes';

const validMimeTypes = ['image/jpeg', 'image/svg+xml'];
const isImage = includes(__, validMimeTypes);

interface HomePageProps {
  createSlideshow: () => void;
}

const stopPropagation = (files: FileList, event: any) => {
  event.preventDefault();
  return files[0];
};

const ifFileIsImage = (func: () => any) => pipe(
  stopPropagation,
  when(
    propSatisfies(isImage, 'type'),
    pipe((arg) => {
      return arg;
    }, func),
  ),
);

const HomePage = (props: HomePageProps & RouterProps) => {
  return (
    <section>
      <FileDrop onDrop={
        useCallback(
          ifFileIsImage(props.createSlideshow),
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
