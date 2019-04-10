import React, { useState, useEffect } from 'react';
import * as L from 'leaflet';
import {
  withLeaflet,
  Marker,
  Polygon,
  Circle,
  Polyline,
  Rectangle,
  LayerGroup,
} from 'react-leaflet';
import { assocPath, when, init, path } from 'ramda';
import * as turf from '@turf/turf';

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
import { useDispatch } from 'utils/hooks';
import { editAnnotationAction } from 'containers/Editor/actions';
import { fromJS } from 'immutable';

const getCoords = path(['geometry', 'coordinates', 0]);
function radToDeg(radians) {
  return radians * (180 / Math.PI);
}

const oposite = (index: number, max) =>
  index < max / 2 ? index + max / 2 : index - max / 2;

const FigureEditorr: React.SFC<any> = props => {
  const [figureList, setFigureList] = useState<FigureList>(props.data.toJS());
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
  //   setFigureList([...figureList, figure]);
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
  //   return setFigureList(figureList); // Ptet voir ici si ca merde.
  // };

  const countRadius = (center: number[], point: number[]): number => {
    return L.latLng({ lat: center[0], lng: center[1] }).distanceTo(
      L.latLng({ lat: point[0], lng: point[1] }),
    );
  };

  // const deleteFigure = (id: string) =>
  //   setFigureList(figureList.filter(item => item.properties.id !== id));

  // const deletePolygonPoint = (index: number | null) => {
  //   const activeFigure: any = getActiveFigure(figureList, activeFigureID);
  //   if (activeFigure && index !== null) {
  //     activeFigure.geometry.coordinates[0] = activeFigure.geometry.coordinates[0].filter(
  //       (item, indexPoint) => indexPoint !== index,
  //     );
  //   }
  //   setFigureList(figureList);
  // };

  const dragCircleCenter = (id: string) => (e: any) => {
    const activeFigure: any = getActiveFigure(figureList, activeFigureID);
    if (activeFigure) {
      activeFigure.pointRadius = [
        activeFigure.pointRadius[0] -
          (getCoords(activeFigure) - e.latlng.lat),
        activeFigure.pointRadius[1] -
          (activeFigure.geometry.coordinates[1] - e.latlng.lng),
      ];
      activeFigure.geometry.coordinates = [e.latlng.lat, e.latlng.lng];
    }
    setFigureList(figureList);
  };

  const dragCircleRadius = (id: string) => (e: any) => {
    const activeFigure: any = getActiveFigure(figureList, activeFigureID);
    if (activeFigure) {
      const radius = countRadius(activeFigure.geometry.coordinates, [
        e.latlng.lat,
        e.latlng.lng,
      ]);
      // activeFigure.pointRadius = props.map.distance(
      //   e.latlng,
      //   startLatLng,
      // );
      activeFigure.pointRadius = [e.latlng.lat, e.latlng.lng];
      activeFigure.radius = radius;
    }
    setFigureList(figureList);
  };

  const dragLineStringPoint = (index: number) => (e: any) => {
    const activeFigure: any = getActiveFigure(figureList, activeFigureID);
    if (activeFigure) {
      activeFigure.geometry.coordinates =
        index === 0
          ? [[e.latlng.lat, e.latlng.lng], activeFigure.geometry.coordinates[1]]
          : [activeFigure.geometry.coordinates[0], [e.latlng.lat, e.latlng.lng]];
    }
    setFigureList(figureList);
  };

  const dragPoint = () => (e: any) => {
    const activeFigure: any = getActiveFigure(figureList, activeFigureID);
    if (activeFigure) {
      activeFigure.geometry.coordinates = [e.latlng.lat, e.latlng.lng];
    }
    setFigureList(figureList);
  };
  const dragPolygonPoint = (id: string, index: number) => (e: any) =>
    setFigureList(figureList.map(when(
      figure => figure.properties.id === id,
      assocPath(
        ['geometry', 'coordinates', 0, index],
        [e.latlng.lat, e.latlng.lng]),
      ),
    ));
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

  const addPoint = (e) => {
    if (props.tool !== SupportedShapes.selector) {
      let figure: any = getActiveFigure(figureList, activeFigureID);
      if (!figure) {
        figure = {
          type: 'Polygon',
          properties: {
            type: props.tool,
            radius: 0,
          },
          geometry: {
            coordinates: [[]],
          },
        };
      }
      console.log(figure, e);
    }
  };

  const dispatch = useDispatch();
  const onEdit =  (id: string, index: number) => (e: any) => {
    const annotation: Annotation = props.data.find(annotation => annotation.properties.id === id);
    const activeFigure: any = figureList.find(figure => figure.properties.id === id);
    dispatch(
      editAnnotationAction(
        annotation,
        annotation.setIn(
          ['geometry', 'coordinates', 0],
          fromJS(activeFigure.geometry.coordinates[0]),
        ),
      ),
    );
  };

  const dragRectanglePoints = (id: string, index: number) => (e: any) => {
    setFigureList(figureList.map(when(
      figure => figure.properties.id === id,
      figure => assocPath(
        ['geometry', 'coordinates', 0],
        (turf.envelope(
          turf.featureCollection([
            turf.point([e.latlng.lat, e.latlng.lng]),
            turf.point(figure.geometry.coordinates[0][oposite(index, 4)]),
          ]),
        ) as any).geometry.coordinates[0],
        figure,
      ),
    )));
  };
  const onRectangleDrag = (id: string) => (e) => {
    const distanceSq = e.movementX * e.movementX + e.movementY * e.movementY;
    const deg = Math.atan(e.movementY / e.movementX);
    if (isNaN(deg) || distanceSq === 0) {
      return;
    }
    const figs = figureList.map(
      when(
        figure => figure.properties.id === id,
        figure => {
          console.log(radToDeg(deg));
          return {
            ...figure,
            geometry: turf.transformTranslate(
              figure.geometry,
              Math.sqrt(distanceSq),
              Math.abs(radToDeg(deg) - 180),
            ),
          };
        },
      ),
    );
    setFigureList(figs as any);
  };
  const renderRectanglePoints = (id: string, coordinates: number[][]) => {
    return coordinates.map((point: number[], index: number) => (
      <Marker
        key={id + index}
        position={{ lat: point[0], lng: point[1] }}
        icon={iconMarker}
        draggable
        onDragEnd={onEdit(id, index)}
        onDrag={dragRectanglePoints(id, index)}
      />
    ));
  };

  useEffect(() => {
    props.leaflet.map.on('click', addPoint);
    return () => {
      props.leaflet.map.off('click', addPoint);
    };
  }, [props.tool]);
  return (
    <React.Fragment>
      {figureList.map((figure: Annotation & any) => {
        const isSelected = figure.properties.id === props.selectedId;
        if (figure.properties.type === SupportedShapes.polygon) {
          return [
            figure.geometry.coordinates[0].length >= 2 ? (
              <Polygon
                key={figure.properties.id}
                positions={figure.geometry.coordinates[0]}
                color={isSelected ? 'red' : 'blue'}
              />
            ) : null,
            isSelected && renderPolygonPoints(figure.properties.id, figure.geometry.coordinates[0]),
          ];
        } else if (figure.properties.type === SupportedShapes.rectangle) {
          return figure.geometry.coordinates[0].length >= 2 ? (
            <LayerGroup key={figure.properties.id}>
              <Rectangle
                draggable
                onDrag={onRectangleDrag(figure.properties.id)}
                bounds={init(figure.geometry.coordinates[0])}
                color={isSelected ? 'red' : 'blue'}
              />
              {isSelected && renderRectanglePoints(figure.properties.id, init(figure.geometry.coordinates[0]))}
            </LayerGroup>
          ) : null;
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
    </React.Fragment>
  );
};

export default withLeaflet(FigureEditorr);
