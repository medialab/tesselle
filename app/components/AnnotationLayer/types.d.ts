import Annotation from 'types/Annotation';
import { Layer } from 'leaflet';
import { SupportedShapes } from 'types';

interface AnnotationShapes {
  annotation: Annotation;
  selected: boolean;
  onClick?: (annotation: Annotation) => any;
}
