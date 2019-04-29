import uuid from 'uuid';
import { Feature } from 'geojson';
import { Record, Map } from 'immutable';
import { pipe } from 'ramda';
import { SupportedShapes } from 'types';

interface IAnnotationProperties {
  id: string;
  content: string;
}

interface IAnnotationCircleProperties extends IAnnotationProperties {
  radius: number;
  type: SupportedShapes.circle;
}

interface IAnnotationRectangleProperties extends IAnnotationProperties {
  type: SupportedShapes.rectangle;
}

interface AnnotationProperties extends Record<IAnnotationProperties>, IAnnotationProperties {}

interface AnnotationCircleProperties extends Record<IAnnotationCircleProperties>, IAnnotationCircleProperties {}
interface AnnotationRectangleProperties extends Record<IAnnotationRectangleProperties>,
  IAnnotationRectangleProperties {}

const makeAnnotationProperties = Record<IAnnotationProperties>({
  id: 'emptyId',
  content: 'Empty annotation',
}, 'AnnotationProperties');

const makeAnnotationCircleProperties = Record({
  id: 'emptyId',
  content: 'Empty annotation',
  radius: 0,
  type: SupportedShapes.circle,
}, 'AnnotationCircleProperties');

const makeAnnotationRectangleProperties = Record<IAnnotationRectangleProperties>({
  id: 'emptyId',
  content: 'Empty annotation',
  type: SupportedShapes.rectangle,
}, 'AnnotationRectangleProperties');

const isIdededed = (properties: Map<string, any>): Map<string, any> => {
  const id = properties.get('id');
  if (id === 'emptyId' || id === undefined) {
    return properties.set('id', uuid());
  }
  return properties;
};

export const annotationPropertiesCreator: Record.Factory<IAnnotationProperties> = pipe(
  isIdededed,
  makeAnnotationProperties,
);
export const annotationCirclePropertiesCreator: Record.Factory<AnnotationCircleProperties> = pipe(
  isIdededed,
  makeAnnotationCircleProperties,
);
export const annotationRectanglePropertiesCreator: Record.Factory<AnnotationRectangleProperties> = pipe(
  isIdededed,
  makeAnnotationRectangleProperties,
);

export default interface Annotation extends Feature, Record<Annotation> {
  properties: AnnotationProperties & AnnotationCircleProperties & AnnotationRectangleProperties;
}
