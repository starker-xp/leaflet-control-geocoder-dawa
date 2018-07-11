var L = require('leaflet'),
 Jawg = require('./geocoders/jawg');
// var L = {Control : {require('leaflet-control-geocoder');

module.exports = Jawg.class;

L.Util.extend(L.Control.Geocoder, {
    JAWG: module.exports,
	jawg: Jawg.factory
});
