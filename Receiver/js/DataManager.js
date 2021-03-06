(function(dm){

    var countrySizes = [];
    //Fusion Table ID:
    var ftTableIdCity = "1yVMRD6LP8FwWGRLa1p5RIVBN0p6B2mNGaesxX0os";
    var ftTableIdCountry = "1Gf74ezjOHKaVxS_vF9PtbJc5yTfm8a6JsuxHGjzD"; https://www.google.com/fusiontables/DataSource?docid=1BuyI_S9TNtXhs_iOg4wwvaL1COJK_tM6UYN5drbF
    var ftTableIdCountryCodes  = "12hNfYsKsCii925gL_5WNh-TdmDu2sjUv_AVPtMeK";
    var ftTableIdCompleteCountryCodes = "1BuyI_S9TNtXhs_iOg4wwvaL1COJK_tM6UYN5drbF";

    var queryUrlHead = 'https://www.googleapis.com/fusiontables/v2/query?sql=';
    //Google API Key
    var queryUrlTail = '&key=AIzaSyCtj5FXdE2WNZJBRVfyd2294YM0z1CDnq0'; //RN acc Api Key
    dm.lastUsedGeoObjects = [];

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
    dm.GeoObject = function (id, name, lat, long, countryCode, population, elevation, marker, viewport, bounds, objectType){
        objectType = objectType || null;
        viewport = viewport || null;
        bounds = bounds || null;
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
        };
    };
    dm.Highscore = function(userMac,name,points,totalPoints){
        this.userMac = userMac;
        this.name = name;
        this.points = points;
        this.totalPoints = totalPoints;
        this.pointsPercent = Math.round(points/totalPoints*100);

        this.toString = function() {
            return '[DM] Name: '+name+' ('+ points +'/'+totalPoints+ ')]';
        }
    };
    var countryHardnessFactors = {
        'DE': 0.5,
        'IT': 0.7,
        'US': 0.8,
        'FR': 0.8
                        //TODO more factors...
    };

    dm.applyHardnessFact = function(countryCode, valueToJustify) {
        if (!countryHardnessFactors.hasOwnProperty(countryCode)) {
            return valueToJustify;
        } else {
            return countryHardnessFactors[countryCode] * valueToJustify;
        }
    };


    dm.getGeoObjects = function(geoObjType, countryCode, count, minPopulation, minPoolSize) {
        if (count > minPoolSize){
            minPoolSize = count;
        }
        if (countryCode == null){
            countryCode = this.getRandomCountryCode(0,0);

            console.debug("[DM] - Country Code not set, random Country is selected: "+countryCode);
        }
        if (countryCode != null) {

            var queryGeoObjects = [];
            if (geoObjType === data.geoObjType.city) {
                queryGeoObjects = _getGeoObjectsForCityObjects(minPopulation, countryCode, ftTableIdCity, minPoolSize);

            } else if (geoObjType == data.geoObjType.country) {
                queryGeoObjects = _getGeoObjectsForCountryObjects(minPopulation, ftTableIdCompleteCountryCodes, minPoolSize);
            } else {
                console.log("[DM] GeoObject request not implemented.")
            }
            //filter old answers:
            var filteredqueryGeoObjects = [];
            if ((queryGeoObjects.length > dataManager.lastUsedGeoObjects.length) && (queryGeoObjects.length >=  minPoolSize)){
                for (var i = 0; i < queryGeoObjects.length; i++) {
                    var name = queryGeoObjects[i].name;
                    var isUsed = false;
                    for (var y = 0; y < dataManager.lastUsedGeoObjects.length; y++) {
                        var nameLastUsed = dataManager.lastUsedGeoObjects[y].name;
                        if (name == nameLastUsed){
                            isUsed = true;
                        }
                    }
                    if (!isUsed) {
                        filteredqueryGeoObjects.push(queryGeoObjects[i]);
                    }
                }
            } else {
                console.log("[DM] - Can not filter results, to few.")
                filteredqueryGeoObjects = queryGeoObjects;
            }

            var geoObjects = getRandomSubsetOfArray(filteredqueryGeoObjects, count);



            //return query results object
            return geoObjects;
        }
    };

    function _getGeoObjectsForCityObjects(minPopulation, countryCode, ftTableIdCity, minPoolSize) {
        var where = "population >= '" + minPopulation + "' and countryCode='" + countryCode + "'";

        // Get all Objects for the requested query, not limited for more diversity
        var result = _createFusionTableQuery(ftTableIdCity, "*", where, 0, 0, null, null,null);
        var queryGeoObjects = _createGeoObjects(result);
        if (queryGeoObjects.length < minPoolSize) {
            where = "countryCode='" + countryCode + "'";
            var orderBy = "population DESC";
            var result = _createFusionTableQuery(ftTableIdCity, "*", where, 0, minPoolSize, orderBy, null,null);
            queryGeoObjects = _createGeoObjects(result);
            console.debug("[DM] getGeoObjects: had to ignore population to satisify minPopulation to , it returned now " + (queryGeoObjects.length >= minPoolSize) + " objects");
        }
        return queryGeoObjects;
    }

    function _createGeoObjectsForCountries(targetCountries) {
        var countryGeoObjects = [];
        if (targetCountries != null) {
            if (typeof(targetCountries.rows) != 'undefined') {
                var resultLength = targetCountries.rows.length;

                for (var i = 0; i < resultLength; i++) {
                    var name = targetCountries.rows[i][5];
                    var code = targetCountries.rows[i][0];
                    var population = parseInt(targetCountries.rows[i][10]);
                    var lat = parseFloat(targetCountries.rows[i][11].split(",")[0]);
                    var long = parseFloat(targetCountries.rows[i][11].split(",")[1]);
                    if (typeof(code) === "string"
                    ) {
                        var geoObject = new dataManager.GeoObject(i, name, lat, long, code, population, 0, null, null, null, null);
                        //console.debug("[DM] geoObject: " + geoObject.toString());
                        countryGeoObjects.push(geoObject);
                    } else {
                        //console.debug("Country not qualified: " + code);
                    }
                }

            }
            return countryGeoObjects;
        } else {
            return null;
        }
    }

    function _getGeoObjectsForCountryObjects(minPopulation, ftTableId, minPoolSize) {
        var countryGeoObjects = [];

        // Get all Objects for the requested query, not limited for more diversity
        var select = "*";
        var where = "population > " + minPopulation;

        var targetCountries = _createFusionTableQuery(ftTableId, select, where, 0, 0, null, null, null);
        if (targetCountries != null) {

        countryGeoObjects = _createGeoObjectsForCountries(targetCountries, minPopulation);
        console.log("[DM] Got " + countryGeoObjects.length + " the query matching criterias.");
        if (countryGeoObjects.length < minPoolSize) {
            var orderBy = "population DESC";
            var result = _createFusionTableQuery(ftTableId, select, null, 0, minPoolSize, orderBy, null, null);
            countryGeoObjects = _createGeoObjectsForCountries(result, 0);

            console.debug("[DM] getCityGeoObjects: had to ignore population to satisify minPopulation to , it returned now " + (countryGeoObjects.length >= minPoolSize) + " objects");
            if (!(countryGeoObjects.length >= minPoolSize)) {
                return null;
            }
        }
        } else {
            console.error("[DM] Could not access db.");
        }
        return countryGeoObjects;
    }


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
    dm.getCountries = function(){
        var returnCountryCodes = [];

        var select = "name, countryCode, relevance, nrOfCities";
        var where = "nrOfCities > 0"
        var orderBy = "relevance DESC"
        var countryCodes = _createFusionTableQuery(ftTableIdCompleteCountryCodes, select, where, 0, 0, orderBy, null,null);
        if (countryCodes != null) {
            if (typeof(countryCodes.rows) != 'undefined') {
                var resultLength = countryCodes.rows.length;
                for (var i = 0; i < resultLength; i++) {
                    var name = countryCodes.rows[i][0];
                    var code = countryCodes.rows[i][1];
                    var obj = {
                        'name': name,
                        'code': code
                    };
                    returnCountryCodes.push(obj);


                }
            } else {
                console.error("[DM] - Get Random Country Code returned no results for given query: Cities:" + nrOfCities + " Pop: " + population);
            }
            console.debug("[DM] getCountries: "+ returnCountryCodes.length + " Countries qualified");


            return returnCountryCodes;
        } else {
            console.error("[DM] - Get Random Country Code returned no results for given query: Cities:" + nrOfCities + " Pop: " + population);
            return null;
        }

    };

    dm.getRandomCountryCode = function(nrOfCities, population){
        var returnCountryCodes = [];


        var select = "countryCode, nrOfCities, populationInCities";
        var where = "nrOfCities >= "+nrOfCities + " and populationInCities >= "+population+ "";
        var countryCodes = _createFusionTableQuery(ftTableIdCompleteCountryCodes, select, where, 0, 0, null, null,null);
        if (countryCodes != null) {
            if (typeof(countryCodes.rows) != 'undefined') {
                var resultLength = countryCodes.rows.length;
                for (var i = 0; i < resultLength; i++) {
                    var code = countryCodes.rows[i][0];
                    returnCountryCodes.push(code);


                }
            } else {
                console.error("[DM] - Get Random Country Code returned no results for given query: Cities:" + nrOfCities + " Pop: " + population);
            }
            console.debug("[DM] getRandomCountryCode: "+ returnCountryCodes.length + " Countries qualified");


            return getRandomSubsetOfArray(returnCountryCodes, 1);
        } else {
            console.error("[DM] - Get Random Country Code returned no results for given query: Cities:" + nrOfCities + " Pop: " + population);
            return null;
        }

    };

        /**
     * Returns a Array with all names of geoObjects
     * @param {Array} geoObjects
     * @return {Array}{String}
     */
    dm.getCityNameArray = function (geoObjects) {
        var cityNames = new Array();
        geoObjects.map(function (geoObject) {
            cityNames.push(geoObject.name);
        })
        return cityNames;
    };


    function _getBoundsZoomLevel(bounds, mapDim) {
        // http://stackoverflow.com/questions/6048975/google-maps-v3-how-to-calculate-the-zoom-level-for-a-given-bounds
        var WORLD_DIM = { height: 256, width: 256 };
        var ZOOM_MAX = 4;  //normal 21

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
    };

    dm.getBoundsForCountry = function(countryCode){

        var select = "*";
        var where = "countryCode = '"+countryCode+"'";
        var countryCodes = _createFusionTableQuery(ftTableIdCompleteCountryCodes, select, where, 0, 0, null, null,null);
        if (countryCode != null && countryCodes != null) {
            if (typeof(countryCodes.rows) != 'undefined') {
                var resultLength = countryCodes.rows.length;
                for (var i = 0; i < resultLength; i++) {
                    var code = countryCodes.rows[i][0];
                    var minLat = countryCodes.rows[i][1];
                    var maxLat = countryCodes.rows[i][2];
                    var minLong = countryCodes.rows[i][3];
                    var maxLong = countryCodes.rows[i][4];

                    var sw = new google.maps.LatLng(minLat, minLong);
                    var ne = new google.maps.LatLng(maxLat, maxLong);
                    var bounds = new google.maps.LatLngBounds(sw, ne);

                    console.debug("[DM] Country " + code + " bounds: " + bounds);

                }
            } else {
                console.error("[DM] Country " + countryCode + "has no saved bounds.");
            }
            return bounds;
        } else {
            console.error("[DM] Country bounds request failed" );
            return null;
        }
    };

    dm.getWorldBounds = function(){
        //TODO better bounds ??
        var worldBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(-15.0, -150.0),           // southwest corner of map
            new google.maps.LatLng(15.0, 150.0)            // northeast corner
        );
        return worldBounds;
    };

    dm.getZoomLevelForCountry = function(bounds){
        var $mapDiv = $('#map-canvas');
        var mapDim = { height: $mapDiv.height(), width: $mapDiv.width() };

        console.debug("[DM] Bounds: "+ bounds+ " MapDIM: H:"+mapDim.height + " W:" +mapDim.width);
        var zoom = _getBoundsZoomLevel(bounds,mapDim);

        return zoom;
    };


    dm.persistHighScoreList = function(userMac, username, userPoints, maxPoints) {
        if (!window.localStorage) {
            console.error("ChromeCast does not support local stoarge.")
            return false;
        }
        var highscores = [];
        var userMacHash = _hashUserMac(userMac);

        if (localStorage.getItem("highscores") === null)
        {

            highscores.push(new this.Highscore(userMacHash, username,userPoints, maxPoints));

            localStorage.setItem("highscores",JSON.stringify(highscores));
            //console.debug("[DM] Saved new user highscore: "+highscores);
        } else {
            highscores = JSON.parse(localStorage.getItem("highscores"));
            //console.debug("user highscores: "+highscores.length);
            var isNewUser = true;

            for (var i = 0; i < highscores.length; i++){
                var oldScore = highscores[i];
                if(oldScore.userMac === userMacHash){
                    var newScore = new this.Highscore(userMacHash,username,oldScore.points + userPoints, oldScore.totalPoints + maxPoints);
                    highscores[i] = newScore;
                    //console.debug("[DM] updated user highscore: "+oldScore.name+"->"+ newScore);
                    isNewUser = false;
                    break;
                }
            }
            if (isNewUser){
                var newScore = new this.Highscore(userMacHash, username ,userPoints, maxPoints);
                highscores[i] = newScore;
                //console.debug("[DM] Saved new user highscore: "+oldScore.name+"->"+ newScore);

            }
            localStorage.setItem("highscores", JSON.stringify(highscores));
        }

        return true;
    };
    function _hashUserMac (mac){
        var hash = CryptoJS.SHA256(mac);

        return hash.toString();
    };
    dm.getHighScoreList = function(minTotalPoints) {
        if (!window.localStorage) {
            console.error("ChromeCast does not support local stoarge.")
            return false;
        }

        var highScoreFilteredAndSorted = [];

        if (localStorage.getItem("highscores") === null)
        {
            //console.debug("No Highscores available, returning empty array");
        } else {

            var highscores = JSON.parse(localStorage.getItem("highscores"));
            //console.debug("user highscores: "+highscores.length);

            for (var i = 0; i < highscores.length; i++){
                if (highscores[i].totalPoints >= minTotalPoints){
                    highScoreFilteredAndSorted.push(highscores[i]);
                }
            }
        }
        highScoreFilteredAndSorted.sort(function(a, b) {
            return b.pointsPercent - a.pointsPercent;
        });
        return highScoreFilteredAndSorted;
    };

    dm.createHighScoreListFromCurentUsers = function(minTotalPoints) {
        var highScoreFilteredAndSorted = [];
        var userList = userManager.getUserList();
            for (var i = 0; i < userList.length; i++){
                if (userList[i].maxPointsInCurrentGame >= minTotalPoints){
                    highScoreFilteredAndSorted.push(new this.Highscore(userList[i].mac, userList[i].name ,userList[i].pointsInCurrentGame, userList[i].maxPointsInCurrentGame));
                }
            }

        highScoreFilteredAndSorted.sort(function(a, b) {
            return b.pointsPercent - a.pointsPercent;
        });
        return highScoreFilteredAndSorted;
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
    function _createFusionTableQuery(ftTableId,select, where, offset, limit, orderBy, groupBy, optionalAsyncCallback) {
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
        if (optionalAsyncCallback != null) {
            jQuery.ajax({
                url: queryurl,
                success: function(data) {
                    optionalAsyncCallback(data);
                },
                error: function(d) {
                   console.debug("[DM] async db request failed, error handling to do"+data);
                    // Error when access db, fallback to start
                    gameRoundManager.currentGameState = data.gameState.ended;

                },
                statusCode: {
                    400: function() {
                        console.debug("[DM] could not parse query" );
                    }
                },
                async:true
            });

        } else {
            jQuery.ajax({
                url: queryurl,
                success: function(data) {
                    result = data;
                },
                    error: function(d) {
                        console.debug("[DM] sync db request failed, error handling to do"+data);
                        // Error when access db, fallback to start
                        gameRoundManager.currentGameState = data.gameState.ended;
                    },
                    statusCode: {
                        400: function() {
                            console.debug("[DM] could not parse query" );
                        }
                },
                async:false
            });
        }



        return result;
    }

    /**
     * gets the data from the sql query with the address
     * @param response
     */
    function _createGeoObjects(response) {
        //do something with the data using response.rows
        var geo = [];
        if (response != 'null') {
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
                        geoObject = new dataManager.GeoObject(id, name, lat, long, countryCode, population, elevation, null, null, null, null);
                        //console.debug("[DM] geoObject: " + geoObject.toString());
                        geo.push(geoObject);
                    } else {

                        //console.debug("[DM] error validating geoObjRow for: " + name);
                    }

                }
            } else {
                console.error("[DM] Query returned no results.")
            }
        } else {
            console.error("[DM] Query failed.")
            return null;
        }
        console.debug("[DM] Query returned "+ geo.length+ " results.");
        return geo;
    }



}(this.dataManager = this.dataManager || {}));
