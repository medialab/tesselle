import uuid from 'uuid';
import { Record } from 'immutable';

interface CoverArgs {
  id?: string;
  file?: boolean;
  width?: number;
  height?: number;
}

export default class Cover extends Record({
  id: '',
  file: false,
  width: 0,
  height: 0,
}) {
  public id!: string;
  public file!: false;
  public width!: number;
  public height!: number;
  constructor(params?: CoverArgs) {
    if (params) {
      if (!params.id) {
        params.id = uuid();
      }
      super(params);
    } else {
      super();
    }
  }
  public with(values: CoverArgs) {
    return this.merge(values) as this;
  }
}
