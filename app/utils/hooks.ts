import { ReactReduxContext } from 'react-redux';
import React, { useContext, useRef, useEffect, useState, useMemo, useLayoutEffect, useCallback } from 'react';

import useMousetrap from 'react-hook-mousetrap';
import { SupportedShapes } from 'types';
import { LatLngBounds } from 'leaflet';
import Cover from 'types/Cover';
import { annotationToBounds } from './geo';

export function useDispatch() {
  return useContext(ReactReduxContext).store.dispatch;
}

export function useAction(actionCreator: (...args: any) => any, scu: any[] = []) {
  const dispatch = useDispatch();
  return useCallback((...args) => {
    const action = actionCreator(...args);
    if (action) {
      dispatch(action);
    }
  }, scu);
}

// Hook
export function useWhyDidYouUpdate(name, props) {
  // Get a mutable ref object where we can store props ...
  // ... for comparison next time this hook runs.
  const previousProps: any = useRef<object>();

  useEffect(() => {
    if (previousProps.current) {
      // Get all keys from previous and current props
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      // Use this object to keep track of changed props
      const changesObj = {};
      // Iterate through keys
      allKeys.forEach(key => {
        // If previous is different from current
        if (previousProps.current[key] !== props[key]) {
          // Add to changesObj
          changesObj[key] = {
            from: previousProps.current[key],
            to: props[key],
          };
        }
      });

      // If changesObj not empty then output to console
      if (Object.keys(changesObj).length) {
        console.log('[why-did-you-update]', name, changesObj);
      } else {
        console.log('[why-did-you-update]', 'no changes in props');
      }
    }

    // Finally update previousProps with current props for next hook call
    previousProps.current = props;
  });
}

export const useTools = (defaultTool): [
  any, React.Dispatch<any>,
  (toolToToggle: SupportedShapes, key: string) => void
] => {
  const [tool, setTool] = useState<SupportedShapes>(defaultTool);
  const [isPressing, setIsPressing] = useState<SupportedShapes | null>(null);
  function useToggleTool(toolToToggle: SupportedShapes, key: string) {
    useMousetrap(key, () => {
      if (!isPressing) {
        setIsPressing(tool);
        setTool(toolToToggle);
      }
    }, 'keydown');
    useMousetrap(key, () => {
      if (tool === toolToToggle) {
        setTool(isPressing || SupportedShapes.selector);
        setIsPressing(null);
      }
    }, 'keyup');
  }
  return [
    tool,
    (newState) => {
      setTool(newState);
      setIsPressing(null);
    },
    useToggleTool,
  ];
};

export const useUrl = (file: File): string => {
  const url = useMemo(() => window.URL.createObjectURL(file), [file]);
  useEffect(() => () => window.URL.revokeObjectURL(url), [url]);
  return url;
};

export const useFlyTo = (map?: L.Map, bounds?: LatLngBounds): void =>
  useEffect(() => {
    if (map && bounds) {
      map.fitBounds(bounds, {animate: true});
    }
  }, [map, bounds]);

export function useMapLock(map?: L.Map, image?: Cover): LatLngBounds {
  const [maxBounds, setMaxBounds] = useState();
  useLayoutEffect(() => {
    if (map && image) {
      setMaxBounds(
        new LatLngBounds(
          map.unproject([0, image.height * 2], map.getMaxZoom()),
          map.unproject([image.width * 2, 0], map.getMaxZoom()),
        ),
      );
    }
  }, [map, image]);
  return maxBounds;
}

export const useLockEffect = (map: L.Map, image: any) => {
  useEffect(() => {
    if (image.height) {
      map.fitBounds(
        new LatLngBounds(
          map.unproject([0, image.height * 2], map.getMaxZoom()),
          map.unproject([image.width * 2, 0], map.getMaxZoom()),
        ),
        {animate: true},
      );
    } else {
      map.fitBounds(
        annotationToBounds(image),
        {animate: true},
      );
    }
  }, [map, image]);
};


export const useEdit = (ref, selected) => {
  useEffect(() => {
    if (ref.current) {
      if (selected) {
        ref.current.leafletElement.editing.enable();
      } else {
        ref.current.leafletElement.editing.disable();
      }
    }
  });
};
export function useToggleBoolean(initialState: boolean = true): [boolean, () => void, () => void] {
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(initialState);
  return [
    sidebarVisible,
    useCallback(() => setSidebarVisible(false), []),
    useCallback(() => setSidebarVisible(true), []),
  ];
}
