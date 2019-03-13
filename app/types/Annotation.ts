import uuid from 'uuid';
// import { FeatureCollection } from 'geojson';
import { Feature } from 'geojson';
import { Record } from 'immutable';

interface AnnotationPropertiesArgs {
  id?: string;
  content?: string;
}

export class AnnotationProperties extends Record({
    id: 'emptyId',
    content: 'Empty annotation',
}) {
  public id!: string;
  public content!: string;
  constructor(params?: AnnotationPropertiesArgs) {
    if (params) {
      if (!params.id || params.id === 'emptyId') {
        params.id = uuid();
      }
      super(params);
    } else {
      super({id: uuid()});
    }
  }
  public with(values: AnnotationPropertiesArgs) {
    return this.merge(values) as this;
  }
}

export default interface Annotation extends Feature, Record<Annotation> {
  properties: AnnotationProperties;
}
