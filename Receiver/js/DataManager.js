(function(castReceiver){

    var countrySizes = null;

    //Fusion Table ID:
    var ftTableIdCity = "1yVMRD6LP8FwWGRLa1p5RIVBN0p6B2mNGaesxX0os";
    var locationColumn = "col4"; // TODO Column Names
    var userHighscoreTable = "1eUC797_4AgjDAn0IRdGcNVdll245lnJaSCXe0YPz"
    var queryUrlHead = 'https://www.googleapis.com/fusiontables/v1/query?sql=';
    //Google API Key
    var queryUrlTail = '&key=AIzaSyBDXF2p6in0gxcCMZVepVyvVHy_ASfmiXo';
    var randomCountryCode = [];
    var clientID = '309924748076-rjhri6p3mqng1iej0agdllo4ijvrcgje.apps.googleusercontent.com';
    var scopes = 'https://www.googleapis.com/auth/fusiontables';
    var accessToken = '?access_token=nGh0RYqr85xlpQacEnGVVMYr';
    /**
     *
     * @param name
     * @param lat
     * @param long
     * @param countryCode
     * @param population
     * @param elevation
     * @param marker
     * @constructor
     */
    castReceiver.GeoObject = function(id, name, lat, long, countryCode, population, elevation, marker){
        /** @type {number} */
        this.id = id;
        /** @type {string} */
        this.name = name;
        /** @type {string} */
        this.countryCode = countryCode;
        /** @type {number} */
        this.latitude = lat;
        /** @type {number} */
        this.longitude = long;
        /** @type {number} */
        this.population = population;
        /** @type {number} */
        this.elevation  = elevation;
        /** @type {marker} */
        this.marker = marker;
        /**
         *
         * @type {google.maps.LatLng}
         */
        this.position = new google.maps.LatLng(lat, long);

        this.toString = function() {
            return name + '(' + countryCode + '|' + long + '|' + lat + '|pop:' + population + ')';
        }
    };
    castReceiver.Highscore = function(userMac,points,totalPoints){
        this.userMac = userMac;
        this.points = points;
        this.totalPoints = totalPoints;

        this.toString = function() {
            return '[ '+userMac+' ('+ points +'/'+totalPoints+ ')]';
        }
    };
    var minPopWeigthsPerCountry = {
        'DE': 0.5,
        'IT': 1.0,
        'RU': 1.8
                        //TODO more factors...
    }

    castReceiver.applyPopulationFact = function(countryCode, minPopProfile) {
        if (!minPopWeigthsPerCountry.hasOwnProperty(countryCode)) {
            return minPopProfile;
        } else {
            return minPopWeigthsPerCountry[countryCode] * minPopProfile;
        }
    }

    // Run OAuth 2.0 authorization.
    function _auth(immediate) {
        gapi.auth.authorize({
            client_id: "nGh0RYqr85xlpQacEnGVVMYr",
            scope: "https://www.googleapis.com/auth/fusiontables",
            embedded: true,
            immediate: immediate
        }, handleAuthResult);
    }
    // Handle the results of the OAuth 2.0 flow.
    function handleAuthResult(authResult) {
        console.debug("Auth: "+authResult);
    }

    castReceiver.getGeoObjects = function(geoObjType, countryCode, count, minPopulation, minPoolSize) {
        if (count > minPoolSize){
            minPoolSize = count;
        }
        if (countryCode == null){
            countryCode = this.getRandomCountryCode();

            console.debug("[DM] - Country Code not set, random Country is selected: "+countryCode);
        }
        var where = "population >= '"+minPopulation+"' and countryCode='"+countryCode+"'";

        // Get all Objects for the requested query, not limited for more diversity
        var result = _createFusionTableQuery(ftTableIdCity,"*", where, 0, 0, null,null);
        var queryGeoObjects  = _createGeoObjects(result);
        if (queryGeoObjects.length < minPoolSize) {
                where = "countryCode='"+countryCode+"'";
                var orderBy = "population DESC";
                var result = _createFusionTableQuery(ftTableIdCity,"*", where, 0, minPoolSize, orderBy,null);
                queryGeoObjects  = _createGeoObjects(result);

                console.debug("[DM] getGeoObjects: had to reduce population to satisify minPopulation to"+ minPopulation+ " , it returned now "+ (queryGeoObjects.length >= minPoolSize)+ " objects");


        }

        var geoObjects = getRandomSubsetOfArray(queryGeoObjects, count);

        //_auth(true);


        //return query results object
        return geoObjects;
    };
    /**
     * Returns a random subsample of the Array
     * @param startArray
     * @param count
     * @returns {Array}
     */
    function getRandomSubsetOfArray(startArray, count) {
        if (startArray.length < count){
            console.debug("[DM] Random Subset was called with wrong parameters, setting subset size to Array size: "+startArray+" count: "+count);
            count = startArray.length;
        }
        var randomObjects = [];
        var min = 0;
        var max = startArray.length;
        var i = 0;
        while (i < count) {
            var x = Math.floor(Math.random() * (max - min)) + min;
            var randomObject = startArray[x];
            if (randomObjects.indexOf(randomObject) == -1) {
                randomObjects[i] = startArray[x];
                i++;
            }

        }
        return randomObjects;
    }

    castReceiver.getRandomCountryCode = function(){
        if (randomCountryCode.length == 0) {
            console.debug("[DM] Fetching Country Codes");
            randomCountryCode = this.getAllCountryCodes();
        }
        return getRandomSubsetOfArray(randomCountryCode,1);
    }

    castReceiver.getNearestGeoObjects = function(goalGeoObject, minPoolSize, minPopulation,maxRadius) {
        //TODO make a query and return 'count' geoObjects, if countryCode null get a random countryCode
        console.log("[DM] Goal for nearest Search: "+goalGeoObject);

        var lat = goalGeoObject.latitude;
        var long = goalGeoObject.longitude;
        var where = "population='"+minPopulation+"' and countryCode='"+goalGeoObject.countryCode+"'";

        //where = where + " AND ST_INTERSECTS(col12, CIRCLE(LATLNG("+lat+","+long+"),"+maxRadius+"))"


        var orderBy = "ST_DISTANCE(col4,  LATLNG("+ lat+","+long+"))";

        var result = _createFusionTableQuery(ftTableIdCity,"*", where, 0, minPoolSize, orderBy, null);
        var geoObjects  = _createGeoObjects(result);
        if (geoObjects.length < minPoolSize) {
            var tries = 0;
            while (geoObjects.length < minPoolSize && tries <= 6) {
                minPopulation = minPopulation - (minPopulation * 0.10);
                where = "population >= '"+minPopulation+"' and countryCode='"+goalGeoObject.countryCode+"'";

                result = _createFusionTableQuery(ftTableIdCity,"*", where, 0, minPoolSize, orderBy, null);
                geoObjects  = _createGeoObjects(result);
                console.debug("[DM] citiesNearby: had to reduce population to satisify minPopulation to"+ minPopulation+ " , it returned now "+ (geoObjects.length == minPoolSize)+ " objects, try: "+tries);
                tries++; // try maximum prevents flooding of gmaps api and therefor rate limit timeout
            }

        }
        geoObjects = getRandomSubsetOfArray(geoObjects, minPoolSize);
        console.debug("[DM] citiesNearby: "+geoObjects);

        return geoObjects;
    };

    /**
     * Returns a Array with all names of geoObjects
     * @param {Array} geoObjects
     * @return {Array}{String}
     */
    castReceiver.getCityNameArray = function (geoObjects) {
        var cityNames = new Array();
        geoObjects.map(function (geoObject) {
            cityNames.push(geoObject.name);
        })
        return cityNames;
    };

    castReceiver.getAllCountryCodes = function(){
        var codes = [];
        // Get all Objects for the requested query, not limited for more diversity
        var select = "countryCode , COUNT() as numberOfCities, SUM(population) AS populationSum , MINIMUM(longitude) AS countryMinLong, MAXIMUM(longitude) AS countryMaxLong ";
        var countryCodes = _createFusionTableQuery(ftTableIdCity,select, null, 0, 0, null,"countryCode");

        if (typeof(countryCodes.rows) != 'undefined') {
            var resultLength = countryCodes.rows.length;
            for (var i = 0; i < resultLength; i++) {
                var code = countryCodes.rows[i][0];
                var nrOfCities = parseInt(countryCodes.rows[i][1]);
                var population = parseInt(countryCodes.rows[i][2]);
                if (nrOfCities >= 10 && population >= 2000000){ //TODO tweak this!
                    codes.push(code);
                } else {
                    //console.debug("Country not qualified: "+code);
                }
            }
        }

        console.log("[DM] Got "+ codes.length +" country codes.");
        return codes;
    };
    function _groupBy( array , f )
    {
        var groups = {};
        array.forEach( function( o )
        {
            var group = JSON.stringify( f(o) );
            groups[group] = groups[group] || [];
            groups[group].push( o );
        });
        return Object.keys(groups).map( function( group )
        {
            return groups[group];
        })
    }


    castReceiver.getAllCountrySizes = function(){

        if (countrySizes === null) {
            countrySizes = {};
            // Get all Objects for the requested query, not limited for more diversity
            var select = "countryCode , COUNT() as numberOfCities, SUM(population) AS populationSum , MINIMUM(longitude) AS countryMinLong, MAXIMUM(longitude) AS countryMaxLong ";
            var countryCodes = _createFusionTableQuery(ftTableIdCity, "*", null, 0, 0, null, null);

            var geoObjects = _createGeoObjects(countryCodes);
            console.debug("Size: " + geoObjects.length);


            var result = _groupBy(geoObjects, function (item) {
                return [item.countryCode];
            });

            for (var i = 0; i < result.length; i++) {
                var country = result[i];
                country.sort(function (a, b) {
                    return a.longitude - b.longitude
                });
                var minLongitude = country[0].longitude;
                var maxLongitude = country[country.length - 1].longitude;
                console.debug(country[0].countryCode + " Long: Min: " + minLongitude + " Max: " + maxLongitude);

                country.sort(function (a, b) {
                    return a.latitude - b.latitude;
                });
                var minLatitude = country[0].latitude;
                var maxLatitude = country[country.length - 1].latitude;
                console.debug(country[0].countryCode + " Lat: Min: " + minLatitude + " Max: " + maxLatitude);
                var ne = new google.maps.LatLng(maxLatitude,maxLongitude);
                var sw = new google.maps.LatLng(minLatitude,minLongitude);
                var bounds = new google.maps.LatLngBounds(sw,ne);

                countrySizes[country[0].countryCode] = {
                    minLat: minLatitude,
                    maxLat: maxLatitude,
                    minLong: minLongitude,
                    maxLong: maxLongitude,
                    bounds: bounds
                };

                //console.debug(country[0].countryCode+" Dist: Width"+ );
            }
        }
        return countrySizes;
    };

    function getBoundsZoomLevel(bounds, mapDim) {
        // http://stackoverflow.com/questions/6048975/google-maps-v3-how-to-calculate-the-zoom-level-for-a-given-bounds
        var WORLD_DIM = { height: 256, width: 256 };
        var ZOOM_MAX = 21;

        function latRad(lat) {
            var sin = Math.sin(lat * Math.PI / 180);
            var radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
            return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
        }

        function zoom(mapPx, worldPx, fraction) {
            return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
        }

        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();

        var latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI;

        var lngDiff = ne.lng() - sw.lng();
        var lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

        var latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
        var lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);

        return Math.min(latZoom, lngZoom, ZOOM_MAX);
    }

    castReceiver.getZoomLevelForCountry = function(countryCode){
        var $mapDiv = $('#map-canvas');
        var mapDim = { height: $mapDiv.height(), width: $mapDiv.width() };
        var countríes = this.getAllCountrySizes();
        var country = countríes[countryCode];
        console.debug("Bounds: "+ country.bounds+ " MapDIM: H:"+mapDim.height + " W:" +mapDim.width);
        var zoom = getBoundsZoomLevel(country.bounds,mapDim);

        return zoom;
    }



    castReceiver.persistHighScoreList = function(userMac, userPoints, maxPoints) {
        if (!window.localStorage) {
            console.error("ChromeCast does not support local stoarge.")
            return false;
        }
        var highscores = [];

        if (localStorage.getItem("highscores") === null)
        {

            highscores.push(new this.Highscore(userMac,userPoints, maxPoints));

            localStorage.setItem("highscores",JSON.stringify(highscores));
            console.debug("[DM] Saved new user highscore: "+highscores);
        } else {
            highscores = JSON.parse(localStorage.getItem("highscores"));
            console.debug("user highscores: "+highscores.length);

            for (var i = 0; i < highscores.length; i++){
                var oldScore = highscores[i];

                if(oldScore.userMac === userMac){
                    var newScore = new this.Highscore(userMac,oldScore.points + userPoints, oldScore.totalPoints + maxPoints);
                    highscores[i] = newScore;
                    console.debug("[DM] updated user highscore: "+oldScore+"->"+ newScore);

                    break;
                }

            }
            localStorage.setItem("highscores", JSON.stringify(highscores));
        }

        return true;
    };

    castReceiver.getHighScoreList = function() {
        if (!window.localStorage) {
            console.error("ChromeCast does not support local stoarge.")
            return false;
        }
        var scores = {};

            if (localStorage.getItem("highscores") === null)
            {
                console.debug("No Highscores available, returning empty map");
            } else {

                var highscores = JSON.parse(localStorage.getItem("highscores"));
                console.debug("user highscores: "+highscores.length);

                for (var i = 0; i < highscores.length; i++){
                    var oldScore = highscores[i];
                    var percentage = (oldScore.points / oldScore.totalPoints) * 100;
                    scores[oldScore.userMac] = percentage;
                    console.debug("[DM] found user highscore: "+ oldScore+ " : "+ percentage +"%");

                }



            }

        return scores;
    };


    /**
     *
     * @param ftTableId
     * @param where
     * @param offset
     * @param limit
     * @param orderBy
     * @returns {*}
     * @private
     */
    function _createFusionTableQuery(ftTableId,select, where, offset, limit, orderBy, groupBy) {
        // Builds a Fusion Tables SQL query and hands the result to  dataHandler
        // write your SQL as normal, then encode it
        var query = "SELECT "+select+" FROM " + ftTableId ;
        if (where != null){
            query = query + " WHERE " + where;
        }
        if (orderBy != null){
            query = query + " ORDER BY "+ orderBy;
        }
        if (groupBy != null){
            query = query + " GROUP BY "+ groupBy;
        }
        if (offset != 0){
            query = query + " OFFSET " + offset;
        }
        if (limit != 0){
            query = query + " LIMIT "+ limit;
        }
        console.debug("[DM] SQL Query: "+query);
        var queryurl = encodeURI(queryUrlHead + query + queryUrlTail);

        var result = null;
        jQuery.ajax({
            url: queryurl,
            success: function(data) {
              result = data;
            },
            async:false
        });

        return result;
    }
    castReceiver.insertFusionTableQuery = function(ftTableId, userData) {
        // Builds a Fusion Tables SQL query and hands the result to  dataHandler
        // write your SQL as normal, then encode it
        var query = "INSERT INTO " + ftTableId + " (UserID, Scores) VALUES (";
        var values = "";
        var valueEnd = ")";
        for (var userid in userData){
            values = values + " " + userid + "," + userData[userid];
        }
        query = query + values + valueEnd;
        console.debug("[DM] SQL INSERT Query: "+query);
        var queryurl = encodeURI(queryUrlHead + query + queryUrlTail);

        jQuery.ajax({
            url: queryurl,
            method:"POST",
            success: function(data) {
                console.log("Insert successfull");
            },
            async:false
        });

        return true;
    }
    /**
     * gets the data from the sql query with the address
     * @param response
     */
    function _createGeoObjects(response) {
        //do something with the data using response.rows
        var geo = [];
        if (typeof(response.rows) != 'undefined') {
            var resultLength = response.rows.length;
            for (var i = 0; i < resultLength; i++) {
                var id = response.rows[i][0];
                var name = response.rows[i][1];
                var lat = response.rows[i][2];
                var long = response.rows[i][3];
                var countryCode = response.rows[i][4];
                var population = response.rows[i][5];
                var elevation = response.rows[i][6];
                var geoObject = null;
                var onlyDigitsPattern = new RegExp("^[0-9]*$");
                //var latLongPatternCheck = new RegExp("^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$");
                if (onlyDigitsPattern.test(id)
                    && typeof(name) === "string"
                    && typeof(parseFloat(lat)) === "number"
                    && typeof(parseFloat(long)) === "number"
                    && typeof(countryCode) === "string"
                    && onlyDigitsPattern.test(population)
                    && onlyDigitsPattern.test(elevation)) {
                    geoObject = new dataManager.GeoObject(id, name, lat, long, countryCode, population, elevation, null);
                    //console.debug("[DM] geoObject: " + geoObject.toString());
                    geo.push(geoObject);
                } else {

                    console.debug("[DM] error validating geoObjRow for: " + name);
                }

            }
        } else {
            console.error("[DM] Query returned no results.")
        }
        console.debug("[DM] Query returned "+ geo.length+ " results.");
        return geo;
    }



}(this.dataManager = this.dataManager || {}));
