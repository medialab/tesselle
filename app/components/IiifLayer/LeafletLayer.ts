// tslint:disable: variable-name
import L, { DomEvent, Util, LeafletEvent, TileLayerOptions, DoneCallback } from 'leaflet';
import db from 'utils/db';

// https://github.com/mejackreed/Leaflet-IIIF/blob/master/leaflet-iiif.js

function ceilLog2(x: number) {
  return Math.ceil(Math.log(x) / Math.LN2);
}

const urls = new Map();

type IiifInfo = any;

interface IiifLayerOptions extends TileLayerOptions {
  readonly continuousWorld: boolean;
  readonly updateWhenIdle: boolean;
  readonly tileFormat: string;
  readonly fitBounds: boolean;
  readonly setMaxBounds: boolean;
  tileSize: number;
  quality: string;
  id?: string;
}

// tslint:disable-next-line: max-classes-per-file
class IIif extends L.TileLayer {
  public options: IiifLayerOptions = {
    continuousWorld: true,
    tileSize: 512,
    updateWhenIdle: true,
    tileFormat: 'jpg',
    fitBounds: true,
    setMaxBounds: false,
    quality: 'native',
    maxNativeZoom: 20,
  };
  public _customMaxZoom: boolean = false;
  public _explicitTileSize: boolean = false;
  public _explicitQuality: boolean = false;
  public _infoDeferred: Promise<IiifInfo>;
  public _baseUrl: any;
  public y: number = 0;
  public x: number = 0;
  public profile: IiifInfo;
  public maxZoom: number = 20;
  public maxNativeZoom: number = 20;
  public _tierSizes: any[] = [];
  public _imageSizes: any[] = [];
  public _mapToAdd?: L.Map;
  public quality?: string;
  public _imageSizesOriginal?: any[];

  constructor(options?: IiifLayerOptions) {
    super(`${options && options.id}`, options as TileLayerOptions);
    if (options) {
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
    }
    this.options = {...this.options, ...options};
    this._infoDeferred = this._getInfo();
    this._baseUrl = this._templateUrl();
  }

  public initialize(...args) {
    console.log(args);
  }

  private _setQuality() {
    let profileToCheck = this.profile;

    if (this._explicitQuality) {
      return;
    }

    // If profile is an object
    if (typeof(profileToCheck) === 'object') {
      profileToCheck = profileToCheck['@id'];
    }
    this.options.quality = 'native';
  }

  public async _getInfo(): Promise<IiifInfo> {
    try {
      const data: IiifInfo = await db.getItem('/' + this.options.id + '/info.json');
      // console.log(this.options.id);
      if (data === null) {
        throw new Error('info.json is null');
      }

      this.y = data.height;
      this.x = data.width;

      const tierSizes: any[] = [];
      const imageSizes: any[] = [];
      let scale: number;
      let width: number;
      let height: number;
      let tilesX: number;
      let tilesY: number;

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
      this.maxZoom = this._customMaxZoom && this.options.maxZoom && this.options.maxZoom > this.maxNativeZoom
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
      // console.log(this.maxNativeZoom, data.scale_factors);
      if (map) {
        map.setMaxZoom(data.scale_factors.length + 1);
      } else {
        console.log('je sias pas l autre pe');
      }
    } catch (error) {
      console.error(error);
    }
  }

  public createTile(coords: any, done: DoneCallback): HTMLElement {
    const tile = document.createElement('img');
    DomEvent.on(tile, 'load', Util.bind(this._tileOnLoad as () => void, this, done, tile));
    DomEvent.on(tile, 'error', Util.bind(this._tileOnError as () => void, this, done, tile));

    if (this.options.crossOrigin || this.options.crossOrigin === '') {
      tile.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
    }
    tile.alt = '';
    tile.setAttribute('role', 'presentation');
    const inMemory = this.getTileUrl(coords);
    db.getItem(inMemory).then((file: File) => {
      if (file) {
        if (!urls.has(inMemory)) {
          urls.set(inMemory, window.URL.createObjectURL(file));
        }
        tile.src = urls.get(inMemory);
        tile.onload = () => {
          done(undefined, tile);
        };
      } else {
        console.log('🔥', inMemory, '🔥');
        done(new Error('not in memory: ' + inMemory));
      }
    });
    return tile;
  }
  public _tileOnLoad(done: L.DoneCallback, tile: HTMLImageElement): void {
    // throw new Error("Method not implemented.");
    console.log('tile loaded');
  }
  public _tileOnError(done: L.DoneCallback, tile: HTMLImageElement): void {
    // throw new Error("Method not implemented.");
    console.log('tile error');
  }

  public getTileUrl(coords: { x: number; y: number; }) {
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
      this._baseUrl,
      {...options, ...this.options},
    );
    // debugger;
    return path;
  }

  public onAdd(map: L.Map): this {

    // Call add TileLayer
    L.TileLayer.prototype.onAdd.call(this, map);
    this._infoDeferred.then(() => {
      // Store unmutated imageSizes
      this._imageSizesOriginal = this._imageSizes.slice(0);

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

      if (this.options.fitBounds) {
        this._fitBounds();
      }

      if (this.options.setMaxBounds) {
        this._setMaxBounds();
      }

      // Reset tile sizes to handle non 256x256 IIIF tiles
      this.on('tileload', (tile: LeafletEvent & any) => {

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
    return this;
  }

  public onRemove(map: (L.Map)) {
    urls.forEach(window.URL.revokeObjectURL);
    urls.clear();
    if (this._imageSizesOriginal) {
      this._imageSizes = this._imageSizesOriginal;
    }

    // Remove maxBounds set for this image
    if (this.options.setMaxBounds) {
      map.setMaxBounds(null as any);
    }

    // Call remove TileLayer
    L.TileLayer.prototype.onRemove.call(this, map);
    return this;
  }
  public _fitBounds() {
    // Find best zoom level and center map
    const initialZoom = this._getInitialZoom(this._map.getSize());
    const offset = this._imageSizes.length - 1 - (this.options.maxNativeZoom as number);
    const imageSize = this._imageSizes[initialZoom + offset];
    const sw = (this._map.options.crs as L.CRS).pointToLatLng(L.point(0, imageSize.y), initialZoom);
    const ne = (this._map.options.crs as L.CRS).pointToLatLng(L.point(imageSize.x, 0), initialZoom);
    const bounds = L.latLngBounds(sw, ne);

    this._map.fitBounds(bounds);
  }
  public _setMaxBounds() {
    // Find best zoom level, center map, and constrain viewer
    const initialZoom = this._getInitialZoom(this._map.getSize());
    const imageSize = this._imageSizes[initialZoom];
    const sw = (this._map.options.crs as L.CRS).pointToLatLng(L.point(0, imageSize.y), initialZoom);
    const ne = (this._map.options.crs as L.CRS).pointToLatLng(L.point(imageSize.x, 0), initialZoom);
    const bounds = L.latLngBounds(sw, ne);

    this._map.setMaxBounds(bounds);
  }
  private _templateUrl() {
    return '/{id}/{region}/{size}/{rotation}/{quality}.{format}';
  }
  public _isValidTile(coords: { x: any; y: any; }) {
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
  }
  public _getInitialZoom(mapSize: { x: number; y: number; }) {
    const tolerance = 0.8;
    let imageSize: { x: number; y: number; };
    // Calculate an offset between the zoom levels and the array accessors
    const offset = this._imageSizes.length - 1 - (this.options.maxNativeZoom as number);
    for (let i = this._imageSizes.length - 1; i >= 0; i--) {
      imageSize = this._imageSizes[i];
      if (imageSize.x * tolerance < mapSize.x && imageSize.y * tolerance < mapSize.y) {
        return i - offset;
      }
    }
    // return a default zoom
    return 2;
  }
}

export const Iiif = L.TileLayer.extend({
  options: {
    continuousWorld: true,
    tileSize: 512,
    updateWhenIdle: true,
    tileFormat: 'jpg',
    fitBounds: true,
    setMaxBounds: false,
  },

  initialize: function(options: any = {}) {
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
    this._baseUrl = this._templateUrl();
  },

  createTile: function(coords: any, done: { (arg0: null, arg1: HTMLImageElement): void; (arg0: Error): void; }) {
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
        if (!urls.has(inMemory)) {
          urls.set(inMemory, window.URL.createObjectURL(file));
        }
        tile.src = urls.get(inMemory);
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

  getTileUrl: function(coords: { x: any; y: any; }) {
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
      this._baseUrl,
      {...options, ...this.options},
    );
    // debugger;
    return path;
  },
  onAdd: function(map: (L.Map & { _layersMaxZoom: any; })) {
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

      // Call add TileLayer
      L.TileLayer.prototype.onAdd.call(this, map);

      if (this.options.fitBounds) {
        this._fitBounds();
      }

      if (this.options.setMaxBounds) {
        this._setMaxBounds();
      }

      // Reset tile sizes to handle non 256x256 IIIF tiles
      this.on('tileload', (tile: LeafletEvent & any) => {

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
  onRemove: function(map: L.Map) {
    urls.forEach(window.URL.revokeObjectURL);
    urls.clear();
    this._imageSizes = this._imageSizesOriginal;

    // Remove maxBounds set for this image
    if (this.options.setMaxBounds) {
      map.setMaxBounds(null as any);
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
      // console.log(this.options.id);
      if (data === null) {
        throw new Error('info.json is null');
      }

      this.y = data.height;
      this.x = data.width;

      const tierSizes: any[] = [];
      const imageSizes: any[] = [];
      let scale: number;
      let width: number;
      let height: number;
      let tilesX: number;
      let tilesY: number;

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
      // console.log(this.maxNativeZoom, data.scale_factors);
      if (map) {
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
  _templateUrl: () => {
    return '/{id}/{region}/{size}/{rotation}/{quality}.{format}';
  },
  _isValidTile: function(coords: { x: any; y: any; }) {
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
  _getInitialZoom: function(mapSize: { x: number; y: number; }) {
    const tolerance = 0.8;
    let imageSize: { x: number; y: number; };
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

export default IIif;
