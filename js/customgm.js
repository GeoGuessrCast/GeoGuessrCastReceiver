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
 * Checks support for local storage
 * @returns {boolean}
 * @private
 */
function _checkStorageSupport() {
    return typeof(Storage)!=="undefined";
}

/**
 * returns the value for a given key, null if not found
 * @param {string} key
 * @returns {string|boolean|number}
 * @private
 */
function _getValue(key){
    //if(!localStorage.hasOwnProperty(key)) return null;
    return localStorage.getItem(key);
}

/**
 * sets the value for a given key in local storage
 * @param {string} key
 * @param {boolean|number|string} value
 * @returns {boolean|number|string}
 * @private
 */
function _setValue(key, value){
    localStorage.setItem(key, value);
    return value;
}

