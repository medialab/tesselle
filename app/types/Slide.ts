import L from 'leaflet';
import uuid from 'uuid';

class Slide {
  public readonly id: string;
  public readonly annotations: GeoJSON.GeoJSON[] = [];
  constructor(public bounds: L.LatLngBoundsExpression) {
    this.id = uuid();
  }
}

export default Slide;
