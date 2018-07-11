(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null),
    Util = require('../util');

module.exports = {
    "class": L.Class.extend({
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../util":3}],2:[function(require,module,exports){
(function (global){
var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null),
 Jawg = require('./geocoders/jawg');
// var L = {Control : {require('leaflet-control-geocoder');

module.exports = Jawg["class"];

L.Util.extend(L.Control.Geocoder, {
    JAWG: module.exports,
	jawg: Jawg.factory
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./geocoders/jawg":1}],3:[function(require,module,exports){
(function (global){
var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null),
	lastCallbackId = 0,
	htmlEscape = (function() {
		// Adapted from handlebars.js
		// https://github.com/wycats/handlebars.js/
		var badChars = /[&<>"'`]/g;
		var possible = /[&<>"'`]/;
		var escape = {
		  '&': '&amp;',
		  '<': '&lt;',
		  '>': '&gt;',
		  '"': '&quot;',
		  '\'': '&#x27;',
		  '`': '&#x60;'
		};

		function escapeChar(chr) {
		  return escape[chr];
		}

		return function(string) {
			if (string == null) {
				return '';
			} else if (!string) {
				return string + '';
			}

			// Force a string conversion as this will be done by the append regardless and
			// the regex test will do this transparently behind the scenes, causing issues if
			// an object's to string has escaped characters in it.
			string = '' + string;

			if (!possible.test(string)) {
				return string;
			}
			return string.replace(badChars, escapeChar);
		};
	})();

module.exports = {
	jsonp: function(url, params, callback, context, jsonpParam) {
		var callbackId = '_l_geocoder_' + (lastCallbackId++);
		params[jsonpParam || 'callback'] = callbackId;
		window[callbackId] = L.Util.bind(callback, context);
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url + L.Util.getParamString(params);
		script.id = callbackId;
		document.getElementsByTagName('head')[0].appendChild(script);
	},

	getJSON: function(url, params, callback) {
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange = function () {
			if (xmlHttp.readyState !== 4){
				return;
			}
			if (xmlHttp.status !== 200 && xmlHttp.status !== 304){
				callback('');
				return;
			}
			callback(JSON.parse(xmlHttp.response));
		};
		xmlHttp.open('GET', url + L.Util.getParamString(params), true);
		xmlHttp.setRequestHeader('Accept', 'application/json');
		xmlHttp.send(null);
	},

	template: function (str, data) {
		return str.replace(/\{ *([\w_]+) *\}/g, function (str, key) {
			var value = data[key];
			if (value === undefined) {
				value = '';
			} else if (typeof value === 'function') {
				value = value(data);
			}
			return htmlEscape(value);
		});
	},

	htmlEscape: htmlEscape
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[2]);
