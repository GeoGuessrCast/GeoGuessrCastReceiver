(function(castReceiver){


    castReceiver.getGeoObjects = function(geoObjType, countryCode, count) {
        //TODO make a query and return 'count' geoObjects, if countryCode get a random countryCode
    }

    castReceiver.persistHighScoreList = function(highScoreMap) {
        //TODO persist the map (user->maxScore%)
    }

    castReceiver.getHighScoreList = function() {
        //TODO return map (user->maxScore%)
    }




















    //TODO ----- to be deleted from here -----
    // constants
    castReceiver.gameMode = {
        currentId : 'gameMode_currentId',
        currentRound : 'gameMode_currentRound',
        maxRounds : 'gameMode_maxRounds'
    };

    castReceiver.geoObjType = {
        city : 'city',
        river: 'river',
        country : 'country'
    };

    // init
    // checks
    if(!_checkStorageSupport()) {
        alert('No Local Storage support!');
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
     */
    castReceiver.getValue = function(key){
        //if(!localStorage.hasOwnProperty(key)) return null;
        return localStorage.getItem(key);
    };

    /**
     * sets the value for a given key in local storage
     * @param {string} key
     * @param {boolean|number|string} value
     * @returns {boolean|number|string}
     */
      castReceiver.setValue = function(key, value){
        localStorage.setItem(key, value);
        return value;
    };

}(this.dataManager = this.dataManager || {}));
