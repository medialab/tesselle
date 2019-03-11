/**
 *
 * Sidebar
 *
 */

import * as React from 'react';
import { FeatureCollection } from 'geojson';
import './styles.css';

function MenuItem(props) {
  return (
    <h1>Menu Item</h1>
  );
}

interface OwnProps {
  annotations: FeatureCollection | null;
}

const Sidebar: React.SFC<OwnProps> = (props: OwnProps) => {
  if (!props.annotations) {
    return (
      <div className="sidebar">
        <h1>Select a slide</h1>
      </div>
    );
  }
  if (props.annotations.features.length === 0) {
    return (
      <div className="sidebar">
        <h1>Edit your annotations here.</h1>
      </div>
    );
  }
  return (
    <div className="sidebar">
      {props.annotations.features.map((feature, index) => <MenuItem key={index} data={feature} />)}
    </div>
  );
};

export default Sidebar;
