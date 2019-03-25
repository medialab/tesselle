import uuid from 'uuid';
import { Feature } from 'geojson';
import { Record } from 'immutable';

interface AnnotationPropertiesArgs {
  id?: string;
  content?: string;
  type?: string;
}

export class AnnotationProperties extends Record({
    id: 'emptyId',
    content: 'Empty annotation',
    type: 'rectangle',
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

interface AnnotationCirclePropertiesArgs extends AnnotationProperties {
  radius: number;
}

// tslint:disable-next-line: max-classes-per-file
export class AnnotationCircleProperties extends Record({
  id: 'emptyId',
  content: 'Empty annotation',
  radius: 0,
}) {
  public id!: string;
  public content!: string;
  public radius!: number;
  constructor(params?: AnnotationCirclePropertiesArgs) {
    if (params) {
      if (!params.id || params.id === 'emptyId') {
        params.id = uuid();
      }
      super(params);
    } else {
      super({id: uuid()});
    }
  }
  public with(values: AnnotationCirclePropertiesArgs) {
    return this.merge(values) as this;
  }
}

export default interface Annotation extends Feature, Record<Annotation> {
  properties: AnnotationCircleProperties & AnnotationProperties;
}
