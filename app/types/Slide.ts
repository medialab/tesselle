import L from 'leaflet';
import uuid from 'uuid';

class Slide {
  public id: string;
  public annotations: GeoJSON.GeoJSON[] = [];
  constructor(public bounds: L.Bounds) {
    this.id = uuid();
  }
}

export default Slide;
