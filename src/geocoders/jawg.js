var L = require('leaflet'),
    Util = require('../util');

module.exports = {
    class: L.Class.extend({
        options: {
            serviceUrl: 'https://places.jawg.io/v1/',
            accessToken: false
        },
        initialize: function (options) {
            L.Util.setOptions(this, options);
        },
        geocode: function (query, cb, context) {
            Util.jsonp(this.options.serviceUrl + 'search', L.extend({
                    text: query,
                    'access-token': this.options.accessToken
                }, this.options.geocodingQueryParams),
                function (data) {
                    var results = [], latLng;
                    if (data && data.features) {
                        for (var i = 0; i < data.features.length; i++) {
                            var feature = data.features[i];
                            latLng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
                            results.push({
                                name: feature.properties.label,
                                // there is no bounding box in the results
                                bbox: L.latLngBounds(latLng, latLng),
                                center: latLng
                            });
                        }
                    }
                    cb.call(context, results);
                }, this, 'callback');
        },
        suggest: function (query, cb, context) {
            // JAWG has a autocomplete API endpoint, but it does not include location data
            return this.geocode(query, cb, context);
        },

        reverse: function (location, scale, cb, context) {
            Util.jsonp(this.options.serviceUrl + 'reverse', L.extend({
                    'point.lat': location.lat,
                    'point.lon': location.lng,
                    'access-token': this.options.accessToken
                },
                this.options.reverseQueryParams), function (data) {
                var result = [], latLng;
                if (data && data.features) {
                    var feature = data.features[0];
                    latLng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
                    result.push({
                        name: feature.properties.label,
                        center: latLng,
                        bounds: L.latLngBounds(latLng, latLng)
                    });
                }
                cb.call(context, result);
            }, this, 'callback');
        }
    }),

    factory: function (options) {
        return new L.Control.Geocoder.JAWG(options);
    }
};
