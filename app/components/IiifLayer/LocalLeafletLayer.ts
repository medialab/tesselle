  // tslint:disable: variable-name
import L, { DomEvent, Util, TileLayerOptions } from 'leaflet';
import db from 'utils/db';
import Base from 'components/IiifLayer/base';

// https://github.com/mejackreed/Leaflet-IIIF/blob/master/leaflet-iiif.js

interface IiifLayerOptions extends TileLayerOptions {
  readonly continuousWorld: boolean;
  readonly updateWhenIdle: boolean;
  readonly tileFormat: string;
  readonly fitBounds: boolean;
  readonly setMaxBounds: boolean;
  readonly tileSize: number;
  readonly quality: string;
  readonly id: string;
}

interface Iiif extends L.TileLayer {
  options: IiifLayerOptions;
  y: number;
  x: number;
  profile: any;
  maxZoom: number;
  maxNativeZoom: number;
  quality?: string;

  new (options?: IiifLayerOptions);

  getTileUrl(coords: { x: number; y: number; }): string;
  onAdd(map: L.Map): this;
  onRemove(map: L.Map): this;
}

const Iiif = Base.extend({
  _baseUrl: '/{id}/{region}/{size}/{rotation}/{quality}.{format}',
  urls: new Map(),

  createTile: function(coords, done) {
    const tile = document.createElement('img');
    DomEvent.on(tile, 'load', Util.bind(this._tileOnLoad, this, done, tile));
    DomEvent.on(tile, 'error', Util.bind(this._tileOnError, this, done, tile));

    if (this.options.crossOrigin || this.options.crossOrigin === '') {
      tile.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
    }
    tile.alt = '';
    tile.setAttribute('role', 'presentation');
    const inMemory = this.getTileUrl(coords);
    db.getItem(inMemory).then((file: File) => {
      if (file) {
        if (!this.urls.has(inMemory)) {
          this.urls.set(inMemory, window.URL.createObjectURL(file));
        }
        tile.src = this.urls.get(inMemory);
        tile.onload = () => {
          done(null, tile);
        };
      } else {
        console.log('🔥', inMemory, '🔥');
        done(new Error('not in memory: ' + inMemory));
      }
    });
    return tile;
  },

  onRemove: function(map) {
    this.urls.forEach(window.URL.revokeObjectURL);
    this.urls.clear();
    // Call remove TileLayer
    Base.prototype.onRemove.call(this, map);
  },
  _getInfo: async function() {
    try {
      const data: any = await db.getItem(`/info/${this.options.id}.json`);
      if (data === null) {
        throw new Error('info.json is null');
      }
      return data;
    } catch (e) {
      console.error(e);
    }
  },
});

export default Iiif;
