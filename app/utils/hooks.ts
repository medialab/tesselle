import { ReactReduxContext } from 'react-redux';
import React, { useContext, useRef, useEffect, useState, useMemo, useLayoutEffect } from 'react';

import useMousetrap from 'react-hook-mousetrap';
import { SupportedShapes } from 'types';
import { LatLngBounds } from 'leaflet';
import Cover from 'types/Cover';

export function useDispatch() {
  return useContext(ReactReduxContext).store.dispatch;
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
  const [keyboardMemory, setkeyboardMemory] = useState<SupportedShapes | null>(null);
  function useToggleTool(toolToToggle: SupportedShapes, key: string) {
    useMousetrap(key, () => {
      if (!keyboardMemory) {
        setkeyboardMemory(tool);
        setTool(toolToToggle);
      }
    }, 'keydown');
    useMousetrap(key, () => {
      if (tool === toolToToggle) {
        setTool(keyboardMemory || SupportedShapes.selector);
        setkeyboardMemory(null);
      }
    }, 'keyup');
  }
  return [
    tool,
    (newState) => {
      setTool(newState);
      setkeyboardMemory(null);
    },
    useToggleTool,
  ];
};

export const useFlyTo = (map: L.Map, bounds: LatLngBounds): void =>
  useEffect(() => {
    if (map && bounds) {
      map.fitBounds(bounds);
    }
  }, [map, bounds]);

export const useUrl = (file: File): string => {
  const url = useMemo(() => window.URL.createObjectURL(file), [file]);
  useEffect(() => () => window.URL.revokeObjectURL(url), [url]);
  return url;
};

export function useMapLock(map: L.Map, image: Cover): LatLngBounds {
  const [maxBounds, setMaxBounds] = useState();
  useLayoutEffect(() => {
    if (map !== null) {
      setMaxBounds(
        new LatLngBounds(
          map.unproject([0, image.height], map.getMaxZoom()),
          map.unproject([image.width, 0], map.getMaxZoom()),
        ),
      );
    }
  }, [map, image]);
  return maxBounds;
}
