import uuid from 'uuid';
import { FeatureCollection } from 'geojson';
import ImmutableGeoJSON from 'immutable-geojson';
import { Record } from 'immutable';

interface AnnotationPropertiesArgs {
  id?: string;
  content?: string;
}

export class AnnotationProperties extends Record({
    content: 'Empty annotation',
}) {
  public content!: string;
  constructor(params?: AnnotationPropertiesArgs) {
    if (params) {
      if (!params.id) {
        params.id = uuid();
      }
      super(params);
    } else {
      super();
    }
  }
  public with(values: AnnotationPropertiesArgs) {
    return this.merge(values) as this;
  }
}

export default interface Annotation extends ImmutableGeoJSON, FeatureCollection {
  id: string;
}
