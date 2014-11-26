function initialize() {
    var myLatlng = new google.maps.LatLng(-25.363882,131.044922);
    var mapOptions = {
        zoom: 4,
        center: myLatlng
    };
    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    var marker = new google.maps.Marker({
        position: myLatlng,
        map: map,
        title: 'Hello World!'
    });
}

/**
 *
 */
function init(){
    var geoEntities = [];
    var geoEntity1 = new GeoEntity(0.0, 0.0, 'E1');
    var geoEntity2 = new GeoEntity(3.0, 4.0, 'E2');
    var geoEntity3 = new GeoEntity(13.0, 51.0, 'E3');

    geoEntities.push(geoEntity1);
    geoEntities.push(geoEntity2);
    geoEntities.push(geoEntity3);

    // modes erstellen
}



/**
 * Type GameMode
 * @param {string} name
 * @param {string} mapType
 * @param {int} pointsMax
 * @param {Array.<GeoEntity>} geoEntities
 * @constructor
 */
function GameMode(name, mapType, pointsMax, geoEntities){
    /** @type {int} */
    this.id = 0;
    /** @type {string} */
    this.name = name;
    /** @type {string} */
    this.mapType = mapType;
    /** @type {int} */
    this.pointsMax = 0;
    /** @type {Array.<GeoEntity>} */
    this.geoEntities = geoEntities;
}

/**
 * Type GeoEntity
 * @param {number} lat
 * @param {number} lon
 * @param {string} name
 * @constructor
 */
function GeoEntity(lat, lon, name){
    /** @type {int} */
    this.id = 0;
    /** @type {number} */
    this.lat = lat;
    /** @type {number} */
    this.lon = lon;
    /** @type {string} */
    this.name = name;
}




