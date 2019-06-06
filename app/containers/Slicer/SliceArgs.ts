import { Record } from 'immutable';

interface InfoArgs {
  '@context'?: string;
  '@id'?: string;
  'formats'?: string[];
  'height'?: number;
  'width'?: number;
  'profile'?: string;
  'qualities'?: string[];
  'scale_factors'?: number[];
  'tile_height'?: number;
  'tile_width'?: number;
}

class Info extends Record<InfoArgs>({
  '@context': 'http://library.stanford.edu/iiif/image-api/1.1/context.json',
  '@id': 'null',
  'formats': ['jpg'],
  'height': 0,
  'width': 0,
  'profile': 'http://library.stanford.edu/iiif/image-api/1.1/compliance.html#level0',
  'qualities': ['default'],
  'scale_factors': [1],
  'tile_height': 0,
  'tile_width': 0,
}) {}

interface SliceArgs {
  total?: number;
  present?: number;
  level?: number;
}

// tslint:disable-next-line: max-classes-per-file
export default class SliceState extends Record<SliceArgs>({
  total: 0,
  present: 0,
  level: 1,
}) {
  public readonly total!: number;
  public readonly present!: number;
  public readonly info: Info = new Info();
  public readonly level!: number;
}
