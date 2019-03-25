import Annotation from 'types/Annotation';
import { Layer } from 'leaflet';

interface AnnotationShapes {
  annotation: Annotation;
  onEdit: (annotation: Annotation, newAnnotation: Annotation) => any;
  selected: boolean;
  map: L.Map;
  onClick?: (annotation: Annotation) => any;
}
