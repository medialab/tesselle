import L from 'leaflet';
import uuid from 'uuid';
import { FeatureCollection } from 'geojson';
import { Record } from 'immutable';

interface SlideArgs {
  id?: string;
  bounds?: L.LatLngBounds;
  annotations?: FeatureCollection;
  file?: File;
}

class Slide extends Record({
  id: '',
  bounds: new L.LatLngBounds([]),
  annotations: {
    type: 'FeatureCollection',
    features: [],
  },
  file: {},
}) {
  public readonly id!: string;
  public readonly bounds!: L.LatLngBounds;
  public readonly annotations!: FeatureCollection;
  public readonly file!: File;
  constructor(params?: SlideArgs) {
    // id: string = uuid(), bounds: L.LatLngBounds, file: File, annotations: GeoJSON
    if (params) {
      if (!params.id) {
        params.id = uuid();
      }
      super(params);
    } else {
      super();
    }
  }
  public with(values: SlideArgs) {
    return this.merge(values) as this;
  }
}

export default Slide;
