(function(castReceiver){


    castReceiver.getGeoObjects = function(geoObjType, countryCode, count) {
        //TODO make a query and return 'count' geoObjects, if countryCode get a random countryCode
    };

    castReceiver.persistHighScoreList = function(highScoreMap) {
        //TODO persist the map (user->maxScore%)
    };

    castReceiver.getHighScoreList = function() {
        //TODO return map (user->maxScore%)
    };

}(this.dataManager = this.dataManager || {}));
