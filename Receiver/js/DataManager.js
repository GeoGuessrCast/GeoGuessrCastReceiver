(function(castReceiver){
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
    castReceiver.GeoObject = function(name, lat, long, countryCode, population, elevation, marker){

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
     * @constructor
     */
    castReceiver.QueryResults = function (ftLayer, geoObjects) {
        this.ftLayer = ftLayer;
        /** @type Array.<GeoObject> */
        this.geoObjects = geoObjects;
    };

    var queryUrlHead = 'https://www.googleapis.com/fusiontables/v1/query?sql=';
    //Google API Key
    var queryUrlTail = '&key=AIzaSyBDXF2p6in0gxcCMZVepVyvVHy_ASfmiXo';
    var randomCountryCode = ["DE","EN","US","ES"]; // and many more.... TODO: get dynamically

/*    *//** @type Array.<GeoObject> *//*
    geoObjects = [];*/

    castReceiver.getGeoObjects = function(geoObjType, countryCode, count) {
        //TODO make a query and return 'count' geoObjects, if countryCode get a random countryCode
        //Fusion Table ID:
        //"13Ajs8twEaALtd19pa6LxRpYHLRxFwzdDGKQ2iu-2";
        var ftTableId = "1yVMRD6LP8FwWGRLa1p5RIVBN0p6B2mNGaesxX0os";
        var locationColumn = "col4";
        var where = "col12 \x3e\x3d 100000 and col8 contains ignoring case \x27DE\x27";
        var min = 1;
        var max = 98; //TODO: Get maximum Table Rows from Table dynamic
        var x = Math.floor(Math.random() * (max - min)) + min;

        //TODO use COUNT query in dataManager
        //var ftLayer = _createFusionTableLayer(ftTableId,locationColumn, where, x, 1);

        var geoObjects = _createFusionTableQuery(ftTableId, where, x, 1);
        //TODO: check asynchron call, maybe do it synchonous?
        var queryResults = new dataManager.QueryResults(null,geoObjects);

        //return query results object
        return queryResults;
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
     * @returns {boolean}
     * @private
     */
    function _createFusionTableQuery(ftTableId, where, offset, limit) {
        // Builds a Fusion Tables SQL query and hands the result to  dataHandler
        // write your SQL as normal, then encode it
        var query = "SELECT * FROM " + ftTableId + " WHERE " + where + " OFFSET " + offset + " LIMIT "+ limit;
        //console.log(query);
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
        var resultLength = response.rows.length;
        for(var i = 0; i < resultLength; i++){
            var name = response.rows[i][1];
            var lat = response.rows[i][2];
            var long = response.rows[i][3];
            var countryCode = response.rows[i][4];
            var population = response.rows[i][5];
            var elevation = response.rows[i][6];
            var geoObject = null;
            if (typeof name == "string" && typeof lat == "number" && typeof long == "number" && typeof countryCode == "string" && typeof population == "string" && typeof elevation == "string"){ //&&
                geoObject = new dataManager.GeoObject(name,lat,long,countryCode,population,elevation,null);
            }
            console.log("[DM] geoObject: " + geoObject.toString());
            geo[i] = geoObject;
        }
        return geo;
    }



}(this.dataManager = this.dataManager || {}));
