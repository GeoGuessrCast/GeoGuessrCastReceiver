(function(castReceiver){
    /** @type Array.<GeoObject> */
    //var geoObjects = [];
    //Fusion Table ID:
    var ftTableIdCity = "1yVMRD6LP8FwWGRLa1p5RIVBN0p6B2mNGaesxX0os";
    var locationColumn = "col4";
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
        this.lat = lat;
        /** @type {number} */
        this.long = long;
        /** @type {number} */
        this.population = population;
        /** @type {number} */
        this.elevation  = elevation;
        /** @type {marker} */
        this.marker = marker; //TODO: create new marker here already ?

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

    var queryUrlHead = 'https://www.googleapis.com/fusiontables/v1/query?sql=';
    //Google API Key
    var queryUrlTail = '&key=AIzaSyBDXF2p6in0gxcCMZVepVyvVHy_ASfmiXo';
    var randomCountryCode = ["DE","GB","FR","US","ES","RU","IT"]; // and many more....

    castReceiver.getGeoObjects = function(geoObjType, countryCode, count, population) {
        if (countryCode == null){

            countryCode = getRandomSubsetOfArray(randomCountryCode,1);

            console.debug("[DM] - Country Code not set, random Country is selected: "+countryCode);
        }
        var where = "col12 \x3e\x3d "+population+" and col8 contains ignoring case \x27"+countryCode+"\x27";

        //var ftLayer = _createFusionTableLayer(ftTableId,locationColumn, where, x, 1);

        var queryGeoObjects = _createFusionTableQuery(ftTableIdCity, where, 0, 0, false,null);

        var geoObjects = getRandomSubsetOfArray(queryGeoObjects, count);


        var choiceGeoObjects = this.getNearestGeoObjects(geoObjects[0],5,100000);
        console.log("[DM] Goal: "+geoObjects[0]);
        var queryResults = new dataManager.QueryResults(null,geoObjects,choiceGeoObjects);
        console.debug("[DM] citiesNearby:"+choiceGeoObjects);
        //return query results object
        return queryResults;
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

    castReceiver.getNearestGeoObjects = function(goalGeoObjct, count, population) {
        //TODO make a query and return 'count' geoObjects, if countryCode null get a random countryCode

        var where = "col12 \x3e\x3d "+population+" and col8 contains ignoring case \x27"+goalGeoObjct.countryCode+"\x27";

        var queryGeoObjects = _createFusionTableQuery(ftTableIdCity, where, 0, 0, true, goalGeoObjct);

        var geoObjects = getRandomSubsetOfArray(queryGeoObjects, count);

        return geoObjects;
    };



    castReceiver.persistHighScoreList = function(highScoreMap) {
        //TODO persist the map (user->maxScore%)
    };

    castReceiver.getHighScoreList = function() {
        //TODO return map (user->maxScore%)
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
     * @param spatial
     * @param center
     * @returns {*}
     * @private
     */
    function _createFusionTableQuery(ftTableId, where, offset, limit, spatial, center) {
        // Builds a Fusion Tables SQL query and hands the result to  dataHandler
        // write your SQL as normal, then encode it
        var query = "SELECT * FROM " + ftTableId + " WHERE " + where;
        if (offset != 0 && limit != 0){
            query = query + " OFFSET " + offset + " LIMIT "+ limit
        }
        if (spatial === true && center != null){
            var lat = center.lat;
            var long = center.long;
            query = query + " ORDER BY ST_DISTANCE(col4,  LATLNG("+ lat+","+long+")) LIMIT 10";
        }
        console.debug("[DM] SQL Query: "+query);
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
                } else {

                    console.error("[DM] error validating queryData: " + response+ ": "+name);
                }
                geo[i] = geoObject;
            }
        } else {
            console.error("[DM] Query returned no results.")
        }
        return geo;
    }



}(this.dataManager = this.dataManager || {}));
