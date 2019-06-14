// tslint:disable: variable-name
import Base from './base';

const Iiif = Base.extend({
  initialize: function(options) {
    this._infoUrl = options.url;
    this._baseUrl = this._templateUrl();
    Base.prototype.initialize.call(this, options);
  },

  _getInfo: function() {
    return fetch(`${this._infoUrl}`).then(res => res.json());
  },

  _setQuality: function() {
    Base.prototype._setQuality.call(this);
    // Set the quality based on the IIIF compliance level
    switch (true) {
      case /^http:\/\/library.stanford.edu\/iiif\/image-api\/1.1\/compliance.html.*$/.test(this.profile):
        this.options.quality = 'native';
        break;
      // Assume later profiles and set to default
      default:
        this.options.quality = 'default';
        break;
    }
  },

  _infoToBaseUrl: function() {
    return this._infoUrl.replace('info.json', '');
  },
  _templateUrl: function() {
    return this._infoToBaseUrl() + 'images/{region}/{size}/{rotation}/{quality}.{format}';
  },
});

export default Iiif;
