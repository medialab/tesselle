import L from 'leaflet';
import uuid from 'uuid';

class Slide {
  public readonly id: string;
  public readonly bounds: L.LatLngBoundsExpression;
  public readonly annotations: GeoJSON.GeoJSON[] = [];
  public readonly file: File;
  constructor(bounds: L.LatLngBoundsExpression, file: File) {
    this.id = uuid();
    this.bounds = bounds;
    this.file = file;
  }
}

export default Slide;
