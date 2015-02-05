(function(dm){

    var countrySizes = null;
    var asyncCountrySizeFetchIsRunning = false;

    //Fusion Table ID:
    var ftTableIdCity = "1yVMRD6LP8FwWGRLa1p5RIVBN0p6B2mNGaesxX0os";
    var locationColumn = "col4"; // TODO Column Names
    var userHighscoreTable = "1eUC797_4AgjDAn0IRdGcNVdll245lnJaSCXe0YPz"
    var queryUrlHead = 'https://www.googleapis.com/fusiontables/v1/query?sql=';
    //Google API Key
    var queryUrlTail = '&key=AIzaSyBDXF2p6in0gxcCMZVepVyvVHy_ASfmiXo';
    var countryCodes = {};
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
    dm.GeoObject = function(id, name, lat, long, countryCode, population, elevation, marker){
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
    dm.Highscore = function(userMac,points,totalPoints){
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

    dm.applyPopulationFact = function(countryCode, minPopProfile) {
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

    dm.getGeoObjects = function(geoObjType, countryCode, count, minPopulation, minPoolSize) {
        if (count > minPoolSize){
            minPoolSize = count;
        }
        if (countryCode == null){
            countryCode = this.getRandomCountryCode(0,0);

            console.debug("[DM] - Country Code not set, random Country is selected: "+countryCode);
        }

        var queryGeoObjects = [];
        if (geoObjType === data.geoObjType.city) {
            queryGeoObjects = _getGeoObjectsForCityObjects(minPopulation, countryCode, ftTableIdCity, minPoolSize);

        } else if (geoObjType == data.geoObjType.country) {
            queryGeoObjects = _getGeoObjectsForCountryObjects(minPopulation,ftTableIdCity,minPoolSize);
        } else {
            console.log("[DM] GeoObject request not implemented.")
        }




        var geoObjects = getRandomSubsetOfArray(queryGeoObjects, count);

        //_auth(true);


        //return query results object
        return geoObjects;
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

    function _createGeoObjectsForCountries(targetCountries, minPopulation) {
        var countryGeoObjects = [];

        if (typeof(targetCountries.rows) != 'undefined') {
            var resultLength = targetCountries.rows.length;
            for (var i = 0; i < resultLength; i++) {
                var code = targetCountries.rows[i][0];
                var population = parseInt(targetCountries.rows[i][1]);
                if (typeof(code) === "string"
                    && population >= minPopulation) {
                    var geoObject = new dataManager.GeoObject(i, code, 0, 0, code, population, 0, null);
                    console.debug("[DM] geoObject: " + geoObject.toString());
                    countryGeoObjects.push(geoObject);
                } else {
                    console.debug("Country not qualified: " + code);
                }
            }
        }
        return countryGeoObjects;
    }

    function _getGeoObjectsForCountryObjects(minPopulation, ftTableIdCity, minPoolSize) {
        var countryGeoObjects = [];

        // Get all Objects for the requested query, not limited for more diversity
        var select = "countryCode, SUM(population) AS populationSum";
        var targetCountries = _createFusionTableQuery(ftTableIdCity, select, null, 0, 0, null, "countryCode",null);

        countryGeoObjects = _createGeoObjectsForCountries(targetCountries, minPopulation);
        console.log("[DM] Got "+ countryGeoObjects.length +" the query matching criterias.");
        if (countryGeoObjects.length < minPoolSize) {
         var orderBy = "populationSum DESC";
         var result = _createFusionTableQuery(ftTableIdCity, select, null, 0, minPoolSize, orderBy, "countryCode",null);
         countryGeoObjects = _createGeoObjectsForCountries(result, 0);

            console.debug("[DM] getCityGeoObjects: had to ignore population to satisify minPopulation to , it returned now " + (countryGeoObjects.length >= minPoolSize) + " objects");
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

    dm.getRandomCountryCode = function(nrOfCities, population){
        var returnCountryCodes = [];


        if (countryCodes.size == undefined) {
            console.debug("[DM] Fetching Country Codes");
            countryCodes = this.getAllCountryCodes();
        }
        for (var code in countryCodes){
            if (countryCodes[code].population >= population && countryCodes[code].nrOfCities >= nrOfCities){
                returnCountryCodes.push(code);
            }
        }
        if (returnCountryCodes.length == 0) {
            console.log("[DM] - Get Random Country Code returned no results for given query: Cities:" + nrOfCities+ " Pop: "+population);
            //return this.getRandomCountryCode(10,1000000); //Fallback
        }
        return getRandomSubsetOfArray(returnCountryCodes,1);
    }

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

    dm.getAllCountryCodes = function(){
        var codes = {};
        // Get all Objects for the requested query, not limited for more diversity
        if (localStorage.getItem("countryCodes") === null) {
            var select = "countryCode , COUNT() as numberOfCities, SUM(population) AS populationSum";
            var countryCodes = _createFusionTableQuery(ftTableIdCity, select, null, 0, 0, null, "countryCode",null);

            if (typeof(countryCodes.rows) != 'undefined') {
                var resultLength = countryCodes.rows.length;
                for (var i = 0; i < resultLength; i++) {
                    var code = countryCodes.rows[i][0];
                    var nrOfCities = parseInt(countryCodes.rows[i][1]);
                    var population = parseInt(countryCodes.rows[i][2]);
                    codes[code] = {
                            nrOfCities: nrOfCities,
                            population: population
                        };

                        //console.debug("Country not qualified: "+code);

                }
            }
            localStorage.setItem("countryCodes", JSON.stringify(codes));
        } else {
            codes = JSON.parse(localStorage.getItem("countryCodes"));
        }
        console.log("[DM] Got country codes.");
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

    dm.calcCountrySizes = function(countryCodes){

        var geoObjects = _createGeoObjects(countryCodes);

        var result = _groupBy(geoObjects, function (item) {
            return [item.countryCode];
        });

        countrySizes = {};
        for (var i = 0; i < result.length; i++) {
            var country = result[i];
            country.sort(function (a, b) {
                return a.longitude - b.longitude
            });
            var minLongitude = country[0].longitude;
            var maxLongitude = country[country.length - 1].longitude;
            //console.debug(country[0].countryCode + " Long: Min: " + minLongitude + " Max: " + maxLongitude);

            country.sort(function (a, b) {
                return a.latitude - b.latitude;
            });
            var minLatitude = country[0].latitude;
            var maxLatitude = country[country.length - 1].latitude;
            //console.debug(country[0].countryCode + " Lat: Min: " + minLatitude + " Max: " + maxLatitude);


            countrySizes[country[0].countryCode] = {
                minLat: minLatitude,
                maxLat: maxLatitude,
                minLong: minLongitude,
                maxLong: maxLongitude
            };
            //console.debug(country[0].countryCode+" Dist: Width"+ );
        }
        localStorage.setItem("countryMeasures", JSON.stringify(countrySizes));
        print("[DM] done with async fetching...");
        asyncCountrySizeFetchIsRunning = false;
    }

    dm.countrySizesAvailable = function(){
        return countrySizes != null;
    }

    dm.getAllCountrySizes = function(){

        if (asyncCountrySizeFetchIsRunning) {
            return null;
        }

        if (countrySizes === null) {
            if (localStorage.getItem("countryMeasures") === null) {
                // Get all Objects for the requested query, not limited for more diversity
                asyncCountrySizeFetchIsRunning = true;
                print("[DM] fetching country sizes async...");
                _createFusionTableQuery(ftTableIdCity, "*", null, 0, 0, null, null, dataManager.calcCountrySizes);

                localStorage.setItem("countryMeasures", JSON.stringify(countrySizes));
            } else {
                countrySizes = JSON.parse(localStorage.getItem("countryMeasures"));
            }
        }
        console.debug("[DM] -- done");

        return countrySizes;
    };

    function _getBoundsZoomLevel(bounds, mapDim) {
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
    };
    dm.getBoundsForCountry = function(countryCode){
        var countries = this.getAllCountrySizes();
        if (countries == null) {
            return null;
        }
        var country = countries[countryCode];
        var ne = new google.maps.LatLng(country.maxLat, country.maxLong);
        var sw = new google.maps.LatLng(country.minLat, country.minLong);
        var bounds = new google.maps.LatLngBounds(sw, ne);
        return bounds;
    };

    dm.getZoomLevelForCountry = function(countryCode){
        var $mapDiv = $('#map-canvas');
        var mapDim = { height: $mapDiv.height() - ($mapDiv.height() * 0.2), width: $mapDiv.width() };
        var countries = this.getAllCountrySizes();
        if (countries == null) {
            return null;
        }
        var country = countries[countryCode];
        var ne = new google.maps.LatLng(country.maxLat, country.maxLong);
        var sw = new google.maps.LatLng(country.minLat, country.minLong);
        var bounds = new google.maps.LatLngBounds(sw, ne);
        console.debug("[DM] " + countryCode+ " Bounds: "+ bounds+ " MapDIM: H:"+mapDim.height + " W:" +mapDim.width);
        var zoom = _getBoundsZoomLevel(bounds,mapDim);

        return zoom;
    };
    dm.persistHighScoreList = function(userMac, userPoints, maxPoints) {
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
            var isNewUser = true;

            for (var i = 0; i < highscores.length; i++){
                var oldScore = highscores[i];
                if(oldScore.userMac === userMac){
                    var newScore = new this.Highscore(userMac,oldScore.points + userPoints, oldScore.totalPoints + maxPoints);
                    highscores[i] = newScore;
                    console.debug("[DM] updated user highscore: "+oldScore+"->"+ newScore);
                    isNewUser = false;
                    break;
                }
            }
            if (isNewUser){
                var newScore = new this.Highscore(userMac,userPoints, maxPoints);
                highscores[i] = newScore;
                console.debug("[DM] Saved new user highscore: "+oldScore+"->"+ newScore);

            }
            localStorage.setItem("highscores", JSON.stringify(highscores));
        }

        return true;
    };

    dm.getHighScoreList = function() {
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
                async:true
            });

        } else {
            jQuery.ajax({
                url: queryurl,
                success: function(data) {
                    result = data;
                },
                async:false
            });
        }



        return result;
    }
    dm.insertFusionTableQuery = function(ftTableId, userData) {
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

                    //console.debug("[DM] error validating geoObjRow for: " + name);
                }

            }
        } else {
            console.error("[DM] Query returned no results.")
        }
        console.debug("[DM] Query returned "+ geo.length+ " results.");
        return geo;
    }



}(this.dataManager = this.dataManager || {}));
