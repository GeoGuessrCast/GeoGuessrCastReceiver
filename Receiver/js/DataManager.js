(function(castReceiver){

    //Fusion Table ID:
    var ftTableIdCity = "1yVMRD6LP8FwWGRLa1p5RIVBN0p6B2mNGaesxX0os";
    var userHighscoreTable = "1eUC797_4AgjDAn0IRdGcNVdll245lnJaSCXe0YPz"
    var locationColumn = "col4";
    var queryUrlHead = 'https://www.googleapis.com/fusiontables/v1/query?sql=';
    //Google API Key
    var queryUrlTail = '&key=AIzaSyBDXF2p6in0gxcCMZVepVyvVHy_ASfmiXo';
    var randomCountryCode = ["DE","GB","FR","US","ES","RU","IT"]; // and many more.... TODO
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
        this.marker = marker; //TODO: create new marker here already ?
        /**
         *
         * @type {google.maps.LatLng}
         */
        this.position = new google.maps.LatLng(lat, long);

        this.toString = function() {
            return name + '(' + countryCode + '|' + long + '|' + lat + '|pop:' + population + ')';
        }
    };
    /**
     *
     * @param ftLayer
     * @param geoObjects
     * @param choiceGeoObjects
     * @constructor
     */
    castReceiver.QueryResults = function (ftLayer, choices, choicesNearby) {
        this.ftLayer = ftLayer;
        /** @type Array.<GeoObject> */
        this.choices = choices;
        /** @type Array.<GeoObject> */
        this.choicesNearby = choicesNearby;

    };



    castReceiver.getGeoObjects = function(geoObjType, countryCode, count, population) {
        if (countryCode == null){

            countryCode = getRandomSubsetOfArray(randomCountryCode,1);

            console.debug("[DM] - Country Code not set, random Country is selected: "+countryCode);
        }
        var where = "col12 \x3e\x3d "+population+" and col8 contains ignoring case \x27"+countryCode+"\x27";

        //var ftLayer = _createFusionTableLayer(ftTableId,locationColumn, where, x, 1);

        var queryGeoObjects = _createFusionTableQuery(ftTableIdCity, where, 0, 0, null);

        var geoObjects = getRandomSubsetOfArray(queryGeoObjects, count);


        //var queryResults = new dataManager.QueryResults(null,geoObjects,choiceGeoObjects);

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

    castReceiver.getRandomCountryCode = function(){
        return getRandomSubsetOfArray(randomCountryCode,1);
    }

    castReceiver.getNearestGeoObjects = function(goalGeoObject, minPoolSize, minPopulation,maxRadius) {
        //TODO make a query and return 'count' geoObjects, if countryCode null get a random countryCode
        console.log("[DM] Goal for nearest Search: "+goalGeoObject);

        var lat = goalGeoObject.latitude;
        var long = goalGeoObject.longitude;
        var where = "col12 \x3e\x3d "+minPopulation+" and col8 contains ignoring case \x27"+goalGeoObject.countryCode+"\x27";

        //where = where + " AND ST_INTERSECTS(col12, CIRCLE(LATLNG("+lat+","+long+"),"+maxRadius+"))"


        var orderBy = " ORDER BY ST_DISTANCE(col4,  LATLNG("+ lat+","+long+"))";

        var geoObjects = _createFusionTableQuery(ftTableIdCity, where, 0, minPoolSize, orderBy);

        if (geoObjects.length < minPoolSize) {
            var tries = 0;
            while (geoObjects.length < minPoolSize && tries <= 6) {
                minPopulation = minPopulation - (minPopulation * 0.10);
                where = "col12 \x3e\x3d "+minPopulation+" and col8 contains ignoring case \x27"+goalGeoObject.countryCode+"\x27";
                geoObjects = _createFusionTableQuery(ftTableIdCity, where, 0, minPoolSize, orderBy);
                console.debug("[DM] citiesNearby: had to reduce population to satisify minPopulation to"+ minPopulation+ " , it returned now "+ (geoObjects.length == minPoolSize)+ " objects, try: "+tries);
                tries++; // try maximum prevents flooding of gmaps api and therefor rate limit timeout
            }

        }
        geoObjects = getRandomSubsetOfArray(geoObjects, minPoolSize);
        console.debug("[DM] citiesNearby: "+geoObjects);

        _auth(true);

        //----TEST
        var userscores = {};
        userscores["1234124"] = 12;
        //this.insertFusionTableQuery(userHighscoreTable,userscores);

        //----

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


    castReceiver.persistHighScoreList = function(userList) {
        if (!window.localStorage) {
            console.error("ChromeCast does not support local stoarge.")
            return false;
        }
        var userLength = userList.length;

        for(var i = 0; i < userLength; i++){
            var user = userList[i];
            if (localStorage.getItem(user.mac) === null)
            {
                localStorage.setItem(user.mac,user.pointsInCurrentGame);
                console.debug("Saved new user highscore: "+user.mac+ ": "+ user.pointsInCurrentGame);
            } else {
                var oldScore = parseInt(localStorage.getItem(user.mac))
                var newScore = oldScore + user.pointsInCurrentGame

                localStorage.setItem(user.mac, newScore);
                console.debug("updated user highscore: "+user.mac+ ": "+ newScore);
            }
        }
        return true;
        };

    castReceiver.getHighScoreList = function(userList) {
        if (!window.localStorage) {
            console.error("ChromeCast does not support local stoarge.")
            return false;
        }
        var scores = {};
        var userLength = userList.length;

        for(var i = 0; i < userLength; i++){
            var user = userList[i];
            if (localStorage.getItem(user.mac) === null)
            {
                console.debug("No Entry for: "+user);
            } else {

                var entry = localStorage.getItem(user.mac);
                var oldScore = parseInt(entry);
                scores[user] = oldScore;

                console.debug("found user highscore: "+user.mac+ ": "+ oldScore);
            }
        }
        return scores;

    };
    /**
     *
     * @param locationColumn
     * @param ftTableId
     * @param where
     * @param offset
     * @param limit
     * @returns {google.maps.FusionTablesLayer}
     * @private
     */
    function _createFusionTableLayer(locationColumn,ftTableId,where,offset,limit) {

        var layer = new google.maps.FusionTablesLayer({
            query: {
                select: locationColumn,
                from: ftTableId,
                where: where,
                offset: offset,
                limit: limit
            },
            options: {
                styleId: 1,
                templateId: 1
            }

        });

        return layer;
    }

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
    function _createFusionTableQuery(ftTableId, where, offset, limit, orderBy) {
        // Builds a Fusion Tables SQL query and hands the result to  dataHandler
        // write your SQL as normal, then encode it
        var query = "SELECT * FROM " + ftTableId + " WHERE " + where;

        if (orderBy != null){
            query = query + " "+ orderBy;
        }

        if (offset != 0){
            query = query + " OFFSET " + offset;
        }
        if (limit != 0){
            query = query + " LIMIT "+ limit;
        }
        console.debug("[DM] SQL SELECT Query: "+query);
        var queryurl = encodeURI(queryUrlHead + query + queryUrlTail);

        var geoObjects = null;
        jQuery.ajax({
            url: queryurl,
            success: function(data) {
               geoObjects = _createGeoObjects(data);
            },
            async:false
        });

        return geoObjects;
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
                    && typeof(lat) === "number" //TODO sh use regexp to check for long/lat
                    && typeof(long) === "number"
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
