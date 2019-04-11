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

import React, { useCallback, ChangeEvent } from 'react';
import { Container, Hero, HeroHeader, HeroFooter, Title } from 'quinoa-design-library/components/';
import FileDrop from 'react-file-drop';
import { propSatisfies, pipe, when, __ } from 'ramda';
import { RouterProps } from 'react-router';
import { decorator } from '../Editor';
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
      console.log(arg);
      return arg;
    }, func),
  ),
);

const HomePage = (props: HomePageProps & RouterProps) => {
  const onDrop = useCallback(
    ifFileIsImage((...args) => {
      props.createSlideshow(...args);
      console.log('go to create slidehsow');
    }),
    [],
  );
  const onUpload = useCallback((event: ChangeEvent<any>) => {
    console.log('on input chang');
    onDrop(event.target.files, event);
  }, []);
  return (
    <section>
      <FileDrop onDrop={onDrop}>
        <Hero
          isColor="success"
          isSize="large">
          <HeroHeader>
            <Title>Bienvenue sur Glisse-montre!</Title>
          </HeroHeader>
          <HeroFooter>
            <h2>Start a new project by droping an image in this green area or by using the file input.</h2>
          </HeroFooter>
        </Hero>
      </FileDrop>
      <Container>
        <input type="file" onChange={onUpload} />
      </Container>
    </section>
  );
};

export default decorator(HomePage);
