// tslint:disable: variable-name
import L, { Util, TileLayerOptions } from 'leaflet';

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
    tileSize: 256,
    updateWhenIdle: true,
    tileFormat: 'jpg',
    fitBounds: true,
    setMaxBounds: false,
  },

  initialize: function(url, options) {
    options = typeof options !== 'undefined' ? options : {};

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

    options = Util.setOptions(this, options);
    this._infoUrl = url;
    this._infoDeferred = this._getInfo();
    this._baseUrl = this._templateUrl();
  },
  getTileUrl: function(coords) {
    const x = coords.x;
    const y = (coords.y);
    const zoom = this._getZoomForUrl();
    const scale = Math.pow(2, this.maxNativeZoom - zoom);
    const tileBaseSize = this.options.tileSize * scale;
    const minx = (x * tileBaseSize);
    const miny = (y * tileBaseSize);
    const maxx = Math.min(minx + tileBaseSize, this.x);
    const maxy = Math.min(miny + tileBaseSize, this.y);

    const xDiff = (maxx - minx);
    const yDiff = (maxy - miny);

    return L.Util.template(this._baseUrl, Util.extend({
      format: this.options.tileFormat,
      quality: this.quality,
      region: [minx, miny, xDiff, yDiff].join(','),
      rotation: 0,
      size: Math.ceil(xDiff / scale) + ',',
    }, this.options));
  },
  onAdd: function(map) {
    const _this = this;

    // Wait for deferred to complete
    _this._infoDeferred.then(function() {

      // Store unmutated imageSizes
      _this._imageSizesOriginal = _this._imageSizes.slice(0);

      // Set maxZoom for map
      map._layersMaxZoom = _this.maxZoom;

      // Set minZoom and minNativeZoom based on how the imageSizes match up
      let smallestImage = _this._imageSizes[0];
      const mapSize = _this._map.getSize();
      let newMinZoom = 0;
      // Loop back through 5 times to see if a better fit can be found.
      for (let i = 1; i <= 5; i++) {
        if (smallestImage.x > mapSize.x || smallestImage.y > mapSize.y) {
          smallestImage = smallestImage.divideBy(2);
          _this._imageSizes.unshift(smallestImage);
          newMinZoom = -i;
        } else {
          break;
        }
      }
      _this.options.minZoom = newMinZoom;
      _this.options.minNativeZoom = newMinZoom;
      _this._prev_map_layersMinZoom = _this._map._layersMinZoom;
      _this._map._layersMinZoom = newMinZoom;

      // Call add TileLayer
      L.TileLayer.prototype.onAdd.call(_this, map);

      if (_this.options.fitBounds) {
        _this._fitBounds();
      }

      if (_this.options.setMaxBounds) {
        _this._setMaxBounds();
      }

      // Reset tile sizes to handle non 256x256 IIIF tiles
      _this.on('tileload', function(tile, url) {

        const height = tile.tile.naturalHeight,
          width = tile.tile.naturalWidth;

        // No need to resize if tile is 256 x 256
        if (height === 256 && width === 256) { return; }

        tile.tile.style.width = width + 'px';
        tile.tile.style.height = height + 'px';

      });
    });
  },
  onRemove: function(map) {
    const _this = this;

    map._layersMinZoom = _this._prev_map_layersMinZoom;
    _this._imageSizes = _this._imageSizesOriginal;

    // Remove maxBounds set for this image
    if (_this.options.setMaxBounds) {
      map.setMaxBounds(null);
    }

    // Call remove TileLayer
    L.TileLayer.prototype.onRemove.call(_this, map);

  },
  _fitBounds: function() {
    const _this = this;

    // Find best zoom level and center map
    const initialZoom = _this._getInitialZoom(_this._map.getSize());
    const offset = _this._imageSizes.length - 1 - _this.options.maxNativeZoom;
    const imageSize = _this._imageSizes[initialZoom + offset];
    const sw = _this._map.options.crs.pointToLatLng(L.point(0, imageSize.y), initialZoom);
    const ne = _this._map.options.crs.pointToLatLng(L.point(imageSize.x, 0), initialZoom);
    const bounds = L.latLngBounds(sw, ne);

    _this._map.fitBounds(bounds, true);
  },
  _setMaxBounds: function() {
    const _this = this;

    // Find best zoom level, center map, and constrain viewer
    const initialZoom = _this._getInitialZoom(_this._map.getSize());
    const imageSize = _this._imageSizes[initialZoom];
    const sw = _this._map.options.crs.pointToLatLng(L.point(0, imageSize.y), initialZoom);
    const ne = _this._map.options.crs.pointToLatLng(L.point(imageSize.x, 0), initialZoom);
    const bounds = L.latLngBounds(sw, ne);

    _this._map.setMaxBounds(bounds, true);
  },
  _getInfo: async function() {
    const data = await fetch(`${this._infoUrl}`).then(response => response.json());
    this.y = data.height;
    this.x = data.width;

    let tierSizes: any[] = [],
      imageSizes: any[] = [],
      scale,
      width_,
      height_,
      tilesX_,
      tilesY_;

    // Set quality based off of IIIF version
    if (data.profile instanceof Array) {
      this.profile = data.profile[0];
    } else {
      this.profile = data.profile;
    }

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
    if (this._customMaxZoom && this.options.maxZoom > this.maxNativeZoom) {
      this.maxZoom = this.options.maxZoom;
    } else {
      this.maxZoom = this.maxNativeZoom;
    }

    for (let i = 0; i <= this.maxZoom; i++) {
      scale = Math.pow(2, this.maxNativeZoom - i);
      width_ = Math.ceil(this.x / scale);
      height_ = Math.ceil(this.y / scale);
      tilesX_ = Math.ceil(width_ / this.options.tileSize);
      tilesY_ = Math.ceil(height_ / this.options.tileSize);
      tierSizes.push([tilesX_, tilesY_]);
      imageSizes.push(L.point(width_, height_));
    }

    this._tierSizes = tierSizes;
    this._imageSizes = imageSizes;
  },

  _setQuality: function() {
    const _this = this;
    let profileToCheck = _this.profile;

    if (_this._explicitQuality) {
      return;
    }

    // If profile is an object
    if (typeof(profileToCheck) === 'object') {
      profileToCheck = profileToCheck['@id'];
    }

    // Set the quality based on the IIIF compliance level
    switch (true) {
      case /^http:\/\/library.stanford.edu\/iiif\/image-api\/1.1\/compliance.html.*$/.test(profileToCheck):
        _this.options.quality = 'native';
        break;
      // Assume later profiles and set to default
      default:
        _this.options.quality = 'default';
        break;
    }
  },

  _infoToBaseUrl: function() {
    return this._infoUrl.replace('info.json', '');
  },
  _templateUrl: function() {
    return this._infoToBaseUrl() + 'images/{region}/{size}/{rotation}/{quality}.{format}';
  },
  _isValidTile: function(coords) {
    // let tileBounds = this._tileCoordsToBounds(coords);
    const _this = this;
    const zoom = _this._getZoomForUrl();
    const sizes = _this._tierSizes[zoom];
    const x = coords.x;
    const y = coords.y;
    if (zoom < 0 && x >= 0 && y >= 0) {
      return true;
    }

    if (!sizes) { return false; }
    if (x < 0 || sizes[0] <= x || y < 0 || sizes[1] <= y) {
      return false;
    } else {
      return true;
    }
  },
  _getInitialZoom: function(mapSize) {
    const _this = this;
    const tolerance = 0.8;
    let imageSize;
    // Calculate an offset between the zoom levels and the array accessors
    const offset = _this._imageSizes.length - 1 - _this.options.maxNativeZoom;
    for (let i = _this._imageSizes.length - 1; i >= 0; i--) {
      imageSize = _this._imageSizes[i];
      if (imageSize.x * tolerance < mapSize.x && imageSize.y * tolerance < mapSize.y) {
        return i - offset;
      }
    }
    // return a default zoom
    return 2;
  },
});

export default Iiif;
