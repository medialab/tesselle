import { SupportedShapes } from 'types';

export interface IFigurePolygon {
  type: string;
  geometry: {
    coordinates: number[][][];
  };
  properties: {
    type: SupportedShapes;
    id: string;
  };
}

export interface ICircle {
  type: string;
  geometry: {
    coordinates: number[];
  };
  properties: {
    type: SupportedShapes;
    id: string;
    radius_units: string;
    radius: number;
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
  geometry: {
    coordinates: number[];
  };
  properties: {
    type: SupportedShapes;
    id: string;
  };
}

export interface ILineString {
  type: string;
  geometry: {
    coordinates: number[][];
  };
  properties: {
    type: SupportedShapes;
    id: string;
  };
}
