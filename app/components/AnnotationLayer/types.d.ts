import Annotation from 'types/Annotation';
import { Layer } from 'leaflet';
import { SupportedShapes } from 'types';

interface AnnotationShapes {
  annotation: Annotation;
  selected: boolean;
  map: L.Map;
  onClick?: (annotation: Annotation) => any;
  tool?: SupportedShapes;
}
