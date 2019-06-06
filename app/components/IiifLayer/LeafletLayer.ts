// tslint:disable: variable-name
import L, { DomEvent, Util, TileLayerOptions } from 'leaflet';
import db from 'utils/db';

// https://github.com/mejackreed/Leaflet-IIIF/blob/master/leaflet-iiif.js

function ceilLog2(x: number) {
  return Math.ceil(Math.log(x) / Math.LN2);
}

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

const Iiif = L.TileLayer.extend({
  options: {
    continuousWorld: true,
    tileSize: 512,
    updateWhenIdle: true,
    tileFormat: 'jpg',
    fitBounds: true,
    setMaxBounds: false,
  },

  initialize: function(options: any = {}) {
    this._levels = {};
    this._tiles = {};
    this.urls = new Map();
    if (options.maxZoom) {
      this._customMaxZoom = true;
    }

    // Check for explicit tileSize set
    if (options.tileSize) {
      this._explicitTileSize = true;
    }

    // Check for an explicit quality
    if (options.quality) {
      this._explicitQuality = true;
    }

    options = (L as any).setOptions(this, options);
    this._infoDeferred = this._getInfo();
  },

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

  getTileUrl: function(coords) {
    const x = coords.x;
    const y = coords.y;
    const zoom = this._getZoomForUrl();
    const scale = Math.pow(2, this.maxNativeZoom - zoom);
    const tileBaseSize = this.options.tileSize * scale;
    const minx = (x * tileBaseSize);
    const miny = (y * tileBaseSize);
    const maxx = Math.min(minx + tileBaseSize, this.x);
    const maxy = Math.min(miny + tileBaseSize, this.y);

    const xDiff = (maxx - minx);
    const yDiff = (maxy - miny);

    const size = Math.ceil(xDiff / scale);
    const options = {
      format: this.options.tileFormat,
      quality: this.quality,
      region: [minx, miny, xDiff, yDiff].join(','),
      rotation: 0,
      size: size + ',',
    };

    const path = L.Util.template(
      '/{id}/{region}/{size}/{rotation}/{quality}.{format}',
      {...options, ...this.options},
    );
    // debugger;
    return path;
  },
  onAdd: function(map) {
    // Wait for deferred to complete
    this._infoDeferred.then(() => {

      // Store unmutated imageSizes
      this._imageSizesOriginal = this._imageSizes.slice(0);

      // Set maxZoom for map
      map._layersMaxZoom = this.maxZoom;

      // Set minZoom and minNativeZoom based on how the imageSizes match up
      let smallestImage = this._imageSizes[0];
      let newMinZoom = 0;
      const mapSize = this._map.getSize();
      // Loop back through 5 times to see if a better fit can be found.
      for (let i = 1; i <= 5; i++) {
        if (smallestImage.x > mapSize.x || smallestImage.y > mapSize.y) {
          smallestImage = smallestImage.divideBy(2);
          this._imageSizes.unshift(smallestImage);
          newMinZoom = -i;
        } else {
          break;
        }
      }
      this.options.minZoom = newMinZoom;
      this.options.minNativeZoom = newMinZoom;
      this._prev_map_layersMinZoom = this._map._layersMinZoom;
      this._map._layersMinZoom = newMinZoom;

      // Call add TileLayer
      L.TileLayer.prototype.onAdd.call(this, map);

      if (this.options.fitBounds) {
        this._fitBounds();
      }

      if (this.options.setMaxBounds) {
        this._setMaxBounds();
      }

      // Reset tile sizes to handle non 256x256 IIIF tiles
      this.on('tileload', (tile, url) => {

        const height = tile.tile.naturalHeight;
        const width = tile.tile.naturalWidth;

        // No need to resize if tile is 256 x 256
        if (height === 512 && width === 512) {
          return;
        }
        tile.tile.style.width = width + 'px';
        tile.tile.style.height = height + 'px';

      });
    });
  },
  onRemove: function(map) {
    this.urls.forEach(window.URL.revokeObjectURL);
    this.urls.clear();
    map._layersMinZoom = this._prev_map_layersMinZoom;
    this._imageSizes = this._imageSizesOriginal;

    // Remove maxBounds set for this image
    if (this.options.setMaxBounds) {
      map.setMaxBounds(null);
    }

    // Call remove TileLayer
    L.TileLayer.prototype.onRemove.call(this, map);

  },
  _fitBounds: function() {
    // Find best zoom level and center map
    const initialZoom = this._getInitialZoom(this._map.getSize());
    const offset = this._imageSizes.length - 1 - this.options.maxNativeZoom;
    const imageSize = this._imageSizes[initialZoom + offset];
    const sw = this._map.options.crs.pointToLatLng(L.point(0, imageSize.y), initialZoom);
    const ne = this._map.options.crs.pointToLatLng(L.point(imageSize.x, 0), initialZoom);
    const bounds = L.latLngBounds(sw, ne);

    this._map.fitBounds(bounds, true);
  },
  _setMaxBounds: function() {
    // Find best zoom level, center map, and constrain viewer
    const initialZoom = this._getInitialZoom(this._map.getSize());
    const imageSize = this._imageSizes[initialZoom];
    const sw = this._map.options.crs.pointToLatLng(L.point(0, imageSize.y), initialZoom);
    const ne = this._map.options.crs.pointToLatLng(L.point(imageSize.x, 0), initialZoom);
    const bounds = L.latLngBounds(sw, ne);

    this._map.setMaxBounds(bounds, true);
  },
  _getInfo: async function() {
    try {
      const data: any = await db.getItem('/' + this.options.id + '/info.json');
      if (data === null) {
        throw new Error('info.json is null');
      }

      this.y = data.height;
      this.x = data.width;

      const tierSizes: any[] = [];
      const imageSizes: any[] = [];
      let scale;
      let width;
      let height;
      let tilesX;
      let tilesY;

      // Set quality based off of IIIF version
      this.profile = data.profile instanceof Array ? this.profile = data.profile[0] : this.profile = data.profile ;

      this._setQuality();

      // Unless an explicit tileSize is set, use a preferred tileSize
      if (!this._explicitTileSize) {
        // Set the default first
        this.options.tileSize = 256;
        if (data.tiles) {
          // Image API 2.0 Case
          this.options.tileSize = data.tiles[0].width;
        } else if (data.tile_width) {
          // Image API 1.1 Case
          this.options.tileSize = data.tile_width;
        }
      }

      // Calculates maximum native zoom for the layer
      this.maxNativeZoom = Math.max(ceilLog2(this.x / this.options.tileSize),
        ceilLog2(this.y / this.options.tileSize));
      this.options.maxNativeZoom = this.maxNativeZoom;

      // Enable zooming further than native if maxZoom option supplied
      this.maxZoom = this._customMaxZoom && this.options.maxZoom > this.maxNativeZoom
        ? this.options.maxZoom
        : this.maxNativeZoom;

      for (let i = 0; i <= this.maxZoom; i++) {
        scale = Math.pow(2, this.maxNativeZoom - i);
        width = Math.ceil(this.x / scale);
        height = Math.ceil(this.y / scale);
        tilesX = Math.ceil(width / this.options.tileSize);
        tilesY = Math.ceil(height / this.options.tileSize);
        tierSizes.push([tilesX, tilesY]);
        imageSizes.push(L.point(width, height));
      }

      this._tierSizes = tierSizes;
      this._imageSizes = imageSizes;
      const map = this._map || this._mapToAdd;
      if (map) {
        // This shall not be there.
        // A child component should not change it's parents properties.
        map.setMaxZoom(data.scale_factors.length + 1);
      } else {
        console.log('je sias pas l autre pe');
      }
    } catch (error) {
      console.error(error);
    }
  },

  _setQuality: function() {
    let profileToCheck = this.profile;

    if (this._explicitQuality) {
      return;
    }

    // If profile is an object
    if (typeof(profileToCheck) === 'object') {
      profileToCheck = profileToCheck['@id'];
    }
    this.options.quality = 'native';
  },
  _isValidTile: function(coords) {
    const zoom = this._getZoomForUrl();
    const sizes = this._tierSizes[zoom];
    const x = coords.x;
    const y = coords.y;
    if (zoom < 0 && x >= 0 && y >= 0) {
      return true;
    }

    if (!sizes) {
      return false;
    }
    if (x < 0 || sizes[0] <= x || y < 0 || sizes[1] <= y) {
      return false;
    } else {
      return true;
    }
  },
  _getInitialZoom: function(mapSize) {
    const tolerance = 0.8;
    let imageSize;
    // Calculate an offset between the zoom levels and the array accessors
    const offset = this._imageSizes.length - 1 - this.options.maxNativeZoom;
    for (let i = this._imageSizes.length - 1; i >= 0; i--) {
      imageSize = this._imageSizes[i];
      if (imageSize.x * tolerance < mapSize.x && imageSize.y * tolerance < mapSize.y) {
        return i - offset;
      }
    }
    // return a default zoom
    return 2;
  },
});

export default Iiif;
