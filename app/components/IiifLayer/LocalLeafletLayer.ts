  // tslint:disable: variable-name
import L, { DomEvent, TileLayerOptions } from 'leaflet';
import db from 'utils/db';
import Base from 'components/IiifLayer/base';
import LRUCache from 'mnemonist/lru-cache';
import { resizeImage } from 'utils/imageManipulation';

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
  urls: new LRUCache(72),
  createTile: function(coords, done) {
    const tile = document.createElement('img');
    DomEvent.on(tile, 'load', (event) => {
      this._tileOnLoad(done, tile);
      if (event.target && (event.target as HTMLImageElement).width === 0) {
        // This is the worst fix I ever wrote.
        // For IDK wich reason, leaflet sets the top left image's size to 0.
        // So we have to set it back to null.
        (event.target as any).style.width = '';
        (event.target as any).style.height = '';
      }
    });
    DomEvent.on(tile, 'error', (error) => {
      this._tileOnError(done, tile, error);
    });
    if (this.options.crossOrigin || this.options.crossOrigin === '') {
      tile.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
    }
    tile.alt = '';
    tile.setAttribute('role', 'presentation');
    const inMemory = this.getTileUrl(coords);
    if (this.urls.has(inMemory)) {
      tile.src = this.urls.get(inMemory);
    } else {
      db.getItem(inMemory).then((file: File) => {
        if (file) {
          const url = window.URL.createObjectURL(file);
          this.urls.set(inMemory, url);
          tile.src = url;
        } else {
          console.log('🔥', inMemory, '🔥');
          this.bigPicture.then((bigPicture: HTMLImageElement) => {
            const futurCoords = this.getCleanCoords(coords);
            resizeImage(bigPicture, futurCoords.region, [futurCoords.size, futurCoords.size])
            .then((minFile) => {
              const url = window.URL.createObjectURL(minFile);
              this.urls.set(inMemory, url);
              tile.src = url;
            });
          });
          // done(new Error('not in memory: ' + inMemory));
        }
      });
    }
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

  callCa: function() {
    this.bigPicture = db.getItem(`/bigpicture/${this.options.id}`).then(bigPicture => {
      const image = new Image();
      image.src = window.URL.createObjectURL(bigPicture);
      return new Promise((resolve) => {
        image.onload = () => resolve(image);
      });
    });
  },
});

Iiif.addInitHook('callCa');

export default Iiif;
