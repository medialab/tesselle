import React, { useState } from 'react';
import * as L from 'leaflet';
import {
  withLeaflet,
  Marker,
  Polygon,
  Circle,
  Polyline,
} from 'react-leaflet';
import { assocPath, when } from 'ramda';

import {
  IFigurePolygon,
  ICircle,
  // IPoint,
  FigureList,
  ActiveFigureID,
} from './types';
import { iconMarker, iconMarkerNotActive } from './icons';

import './styles.css';
import Annotation from 'types/Annotation';
import { SupportedShapes } from 'types';

const FigureEditorr: React.SFC<any> = props => {
  const [figureList, setfigureList] = useState<FigureList>(props.data.toJS());
  const [activeFigureID] = useState<ActiveFigureID>(null);

  const getActiveFigure = (
    figureList: FigureList,
    activeFigureID: ActiveFigureID,
  ): IFigurePolygon | ICircle | undefined => {
    return figureList.find(
      (figure: IFigurePolygon | ICircle) => figure.properties.id === activeFigureID,
    );
  };

  // const select = useCallback((id: string) => setactiveFigureID(id), []);

  // const addFigure = (figure: IFigurePolygon | ICircle): void => {
  //   setfigureList([...figureList, figure]);
  //   select(figure.properties.id);
  // };

  // const changeActiveFigure = (id: string): void => select(id);

  // const addPoint = (e: IPoint): void => {
  //   const activeFigure: any = getActiveFigure(figureList, activeFigureID);
  //   if (activeFigure) {
  //     if (activeFigure.geometry.type === 'Polygon') {
  //       activeFigure.geometry.coordinates[0].push([e.lat, e.lng]);
  //     } else if (activeFigure.geometry.type === 'Circle') {
  //       if (activeFigure.geometry.coordinates.length) {
  //         const radius = countRadius(activeFigure.geometry.coordinates, [
  //           e.lat,
  //           e.lng,
  //         ]);
  //         activeFigure.pointRadius = [e.lat, e.lng];
  //         activeFigure.radius = radius;
  //       } else {
  //         activeFigure.geometry.coordinates = [e.lat, e.lng];
  //       }
  //     } else if (activeFigure.geometry.type === 'LineString') {
  //       if (activeFigure.geometry.coordinates[0] && !activeFigure.geometry.coordinates[1]) {
  //         activeFigure.geometry.coordinates[1] = [e.lat, e.lng];
  //       } else if (!activeFigure.geometry.coordinates[0]) {
  //         activeFigure.geometry.coordinates[0] = [e.lat, e.lng];
  //       }
  //     } else if (activeFigure.geometry.type === 'Point') {
  //       activeFigure.geometry.coordinates = [e.lat, e.lng];
  //     }
  //   }
  //   return setfigureList(figureList); // Ptet voir ici si ca merde.
  // };

  const countRadius = (center: number[], point: number[]): number => {
    return L.latLng({ lat: center[0], lng: center[1] }).distanceTo(
      L.latLng({ lat: point[0], lng: point[1] }),
    );
  };

  // const deleteFigure = (id: string) =>
  //   setfigureList(figureList.filter(item => item.properties.id !== id));

  // const deletePolygonPoint = (index: number | null) => {
  //   const activeFigure: any = getActiveFigure(figureList, activeFigureID);
  //   if (activeFigure && index !== null) {
  //     activeFigure.geometry.coordinates[0] = activeFigure.geometry.coordinates[0].filter(
  //       (item, indexPoint) => indexPoint !== index,
  //     );
  //   }
  //   setfigureList(figureList);
  // };

  const dragPolygonPoint = (id: string, index: number) => (e: any) =>
    // const activeFigure: any = getActiveFigure(figureList, activeFigureID);
    setfigureList(figureList.map(when(
      figure => figure.properties.id === id,
      assocPath(['geometry', 'coordinates', 0, index], [e.latlng.lat, e.latlng.lng]),
    )));

  const dragCircleCenter = (id: string) => (e: any) => {
    const activeFigure: any = getActiveFigure(figureList, activeFigureID);
    if (activeFigure) {
      activeFigure.pointRadius = [
        activeFigure.pointRadius[0] -
          (activeFigure.geometry.coordinates[0] - e.latlng.lat),
        activeFigure.pointRadius[1] -
          (activeFigure.geometry.coordinates[1] - e.latlng.lng),
      ];
      activeFigure.geometry.coordinates = [e.latlng.lat, e.latlng.lng];
    }
    setfigureList(figureList);
  };

  const dragCircleRadius = (id: string) => (e: any) => {
    const activeFigure: any = getActiveFigure(figureList, activeFigureID);
    if (activeFigure) {
      const radius = countRadius(activeFigure.geometry.coordinates, [
        e.latlng.lat,
        e.latlng.lng,
      ]);
      activeFigure.pointRadius = [e.latlng.lat, e.latlng.lng];
      activeFigure.radius = radius;
    }
    setfigureList(figureList);
  };

  const dragLineStringPoint = (index: number) => (e: any) => {
    const activeFigure: any = getActiveFigure(figureList, activeFigureID);
    if (activeFigure) {
      activeFigure.geometry.coordinates =
        index === 0
          ? [[e.latlng.lat, e.latlng.lng], activeFigure.geometry.coordinates[1]]
          : [activeFigure.geometry.coordinates[0], [e.latlng.lat, e.latlng.lng]];
    }
    setfigureList(figureList);
  };

  const dragPoint = () => (e: any) => {
    const activeFigure: any = getActiveFigure(figureList, activeFigureID);
    if (activeFigure) {
      activeFigure.geometry.coordinates = [e.latlng.lat, e.latlng.lng];
    }
    setfigureList(figureList);
  };

  const renderPolygonPoints = (id: string, coordinates: number[][]) =>
    coordinates.map((point: number[], index: number) => (
      <Marker
        key={id + index}
        position={{ lat: point[0], lng: point[1] }}
        icon={
          id === props.selectedId ? iconMarker : iconMarkerNotActive
        }
        draggable={props.selectedId === id}
        onDrag={dragPolygonPoint(id, index)}
      />
    ));

  const renderCirclePoints = (id: string, figure: any) => {
    return [
      figure.geometry.coordinates.length ? (
        <Marker
          key={id + 'center'}
          position={{ lat: figure.geometry.coordinates[0], lng: figure.geometry.coordinates[1] }}
          icon={
            id === props.selectedId ? iconMarker : iconMarkerNotActive
          }
          draggable={props.selectedId === id}
          onDrag={dragCircleCenter(id)}
        />
      ) : null,
      figure.pointRadius.length ? (
        <Marker
          key={id + 'radius'}
          position={{ lat: figure.pointRadius[0], lng: figure.pointRadius[1] }}
          icon={
            id === props.selectedId ? iconMarker : iconMarkerNotActive
          }
          draggable={props.selectedId === id}
          onDrag={dragCircleRadius(id)}
        />
      ) : null,
    ];
  };

  const renderLineStringPoints = (id: string, coordinates: number[][]) => {
    return [
      coordinates[0] && coordinates[0][0] && coordinates[0][1] ? (
        <Marker
          key={id + 'first'}
          position={{ lat: coordinates[0][0], lng: coordinates[0][1] }}
          icon={
            id === props.selectedId ? iconMarker : iconMarkerNotActive
          }
          draggable={props.selectedId === id}
          onDrag={dragLineStringPoint(0)}
        />
      ) : null,
      coordinates[1] && coordinates[1][0] && coordinates[1][1] ? (
        <Marker
          key={id + 'second'}
          position={{ lat: coordinates[1][0], lng: coordinates[1][1] }}
          icon={
            id === props.selectedId ? iconMarker : iconMarkerNotActive
          }
          draggable={props.selectedId === id}
          onDrag={dragLineStringPoint(1)}
        />
      ) : null,
    ];
  };
  return (
    <div>
      {figureList.map((figure: Annotation & any) => {
        console.log(figure);
        if (figure.properties.type === SupportedShapes.polygon) {
          return [
            figure.geometry.coordinates[0].length >= 2 ? (
              <Polygon
                key={figure.properties.id}
                positions={figure.geometry.coordinates[0]}
                refs={figure.properties.id}
                color={
                  figure.properties.id === props.selectedId ? 'red' : 'blue'
                }
              />
            ) : null,
            props.selectedId === figure.properties.id
              && renderPolygonPoints(figure.properties.id, figure.geometry.coordinates[0]),
          ];
        } else if (figure.properties.type === SupportedShapes.circle) {
          return [
            figure.geometry.coordinates.length && figure.radius ? (
              <Circle
                key={figure.properties.id}
                center={figure.geometry.coordinates}
                radius={figure.radius}
                color={
                  figure.properties.id === props.selectedId ? 'red' : 'blue'
                }
              />
            ) : null,
            renderCirclePoints(figure.properties.id, figure),
          ];
        } else if (figure.properties.type === SupportedShapes.polyline) {
          return [
            figure.geometry.coordinates.length === 2 ? (
              <Polyline
                key={figure.properties.id}
                positions={figure.geometry.coordinates}
                color={
                  figure.properties.id === props.selectedId ? 'red' : 'blue'
                }
              />
            ) : null,
            renderLineStringPoints(figure.properties.id, figure.geometry.coordinates),
          ];
        } else if (figure.geometry.type === 'Point' && figure.geometry.coordinates.length) {
          return (
            <Marker
              key={figure.properties.id}
              position={{
                lat: figure.geometry.coordinates[0],
                lng: figure.geometry.coordinates[1],
              }}
              icon={
                figure.properties.id === props.selectedId
                  ? iconMarker
                  : iconMarkerNotActive
              }
              draggable={props.selectedId === figure.properties.id}
              onDrag={dragPoint()}
            />
          );
        } else {
          return null;
        }
      })}
    </div>
  );
};

export default withLeaflet(FigureEditorr);
