import uuid from 'uuid';
import { Feature, Polygon, Point, MultiPolygon } from 'geojson';
import { Record, Map } from 'immutable';
import { pipe } from 'ramda';
import { SupportedShapes } from 'types';

interface IAnnotationProperties {
  id: string;
  content: string;
  type: SupportedShapes;
}

interface IAnnotationCircleProperties extends IAnnotationProperties {
  radius: number;
  type: SupportedShapes.circle;
}

interface AnnotationProperties extends Record<IAnnotationProperties>, IAnnotationProperties {}

export interface AnnotationCircleProperties extends Record<IAnnotationCircleProperties>, IAnnotationCircleProperties {}

const makeAnnotationProperties = Record<IAnnotationProperties>({
  id: 'emptyId',
  content: 'Empty annotation',
  type: SupportedShapes.rectangle,
}, 'AnnotationProperties');

const makeAnnotationCircleProperties = Record({
  id: 'emptyId',
  content: 'Empty annotation',
  radius: 0,
  type: SupportedShapes.circle,
}, 'AnnotationCircleProperties');

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

export type AcceptedGeojsonGeometries = Point | Polygon | MultiPolygon;
export type AcceptedGeojsonProperties = AnnotationProperties | AnnotationCircleProperties;

export default interface Annotation<
    G extends AcceptedGeojsonGeometries | null = Polygon,
    P extends AcceptedGeojsonProperties | null = AnnotationProperties
  > extends Feature<G, P>, Record<Annotation> {

}
