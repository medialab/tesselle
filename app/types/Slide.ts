import L from 'leaflet';
import uuid from 'uuid';
import { GeoJSON, Feature } from 'geojson';

class Slide {
  public readonly id: string;
  public readonly bounds: L.LatLngBounds;
  public readonly annotations: GeoJSON;
  public readonly file: File;
  private constructor(id: string = uuid(), bounds: L.LatLngBounds, file: File, annotations: GeoJSON) {
    this.id = id;
    this.bounds = bounds;
    this.file = file;
    this.annotations = annotations;
  }
  public toJSON(): SlideJson {
    return {
      id: this.id,
      bounds: this.bounds,
      annotations: this.annotations,
      file: this.file,
    };
  }
  public static fromJS(json: SlideJson): Slide {
    return new Slide(
      json.id,
      json.bounds,
      json.file,
      json.annotations,
    );
  }
  public static builder(slide?: Slide): SlideBuilder {
    return new SlideBuilder(slide);
  }
}

export default Slide;

interface SlideJson {
  id: string;
  bounds: L.LatLngBounds;
  annotations: GeoJSON;
  file: File;
}

// tslint:disable-next-line: max-classes-per-file
export class SlideBuilder {
  private json: SlideJson & any;
  constructor(slide?: Slide | any) {
    if (slide instanceof Slide) {
      this.json = slide.toJSON();
    } else if (slide instanceof Object) {
      this.json = {
        id: slide.id,
        bounds: slide.bounds,
        annotations: slide.annotations,
        file: slide.file,
      };
    } else {
      this.json = {};
    }
  }
  public id(id: string): SlideBuilder {
    this.json.id = id;
    return this;
  }
  public bounds(bounds: L.LatLngBounds): SlideBuilder {
    this.json.bounds = bounds;
    return this;
  }
  public annotations(annotations?: GeoJSON, toAdd?: Feature): SlideBuilder {
    if (annotations) {
      this.json.annotations = {
        ...annotations,
        features: [...(annotations as any).features, toAdd],
      };
      return this;
    }
    this.json.annotations = {
      type: 'FeatureCollection',
      features: toAdd ? [toAdd] : [],
    };
    return this;
  }
  public file(file: File): SlideBuilder {
    this.json.file = file;
    return this;
  }
  public build(): Slide {
    if (!this.json.annotations) {
      this.annotations();
    }
    return Slide.fromJS(this.json);
  }
}
