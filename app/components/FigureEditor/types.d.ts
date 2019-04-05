export interface IFigurePolygon {
  id: string;
  type: string;
  coordinates: number[][][];
  properties: {
    id: string;
  };
}

export interface ICircle {
  type: string;
  coordinates: number[];
  pointRadius: number[];
  radius: number;
  properties: {
    id: string;
    radius_units: string;
  };
}

export type FigureList = Array<(IFigurePolygon | ICircle)>;
export type ActiveFigureID = string | null;

export interface IfigureEditorState {
  figureList: FigureList;
  activeFigureID: string | null;
}

export interface IPoint {
  lat: number;
  lng: number;
}

export interface IPointGeo {
  type: string;
  coordinates: number[];
  properties: {
    id: string;
  };
}

export interface ILineString {
  type: string;
  coordinates: number[][];
  properties: {
    id: string;
  };
}
