

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




