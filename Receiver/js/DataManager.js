(function(castReceiver){

    var queryUrlHead = 'https://www.googleapis.com/fusiontables/v1/query?sql=';
    //Google API Key
    var queryUrlTail = '&key=AIzaSyBDXF2p6in0gxcCMZVepVyvVHy_ASfmiXo';
    var randomCountryCode = ["DE","EN","US","ES"]; // and many more.... TODO: get dynamically

    /** @type Array.<GeoObject> */
    geoObjects = [];

    castReceiver.getGeoObjects = function(geoObjType, countryCode, count) {
        //TODO make a query and return 'count' geoObjects, if countryCode get a random countryCode
        //Fusion Table ID:
        var ftTableId = "13Ajs8twEaALtd19pa6LxRpYHLRxFwzdDGKQ2iu-2";
        var locationColumn = "col1";
        var where = "col4 \x3e\x3d 100000 and col3 contains ignoring case \x27DE\x27";
        var min = 1;
        var max = 98; //TODO: Get maximum Table Rows from Table dynamic
        var x = Math.floor(Math.random() * (max - min)) + min;

        //TODO use COUNT query in dataManager
        var ftLayer = _createFusionTableLayer(ftTableId,locationColumn, where, x, 1);

        _createFusionTableQuery(ftTableId, where, x, 1);
        //TODO: check asynchron call, maybe do it synchonous?
        var queryResults = new this.QueryResults(ftLayer,geoObjects);

        //return query results object
        return queryResults;
    };

    //Struct für GeoObjects

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
        var query = "SELECT * FROM " + ftTableId + " WHERE " + where + " OFFSET " + offset + " LIMIT "+ limit; //TODO put all queries into dataManager... getGeoObjects()... etc
        //console.log(query);
        var queryurl = encodeURI(queryUrlHead + query + queryUrlTail);
        //asynchronous call to handle query data
        var jqxhr = $.get(queryurl, function (data) {
            _createGeoObjects(data);
        }, "jsonp");

        return true;
    }
    /**
     * gets the data from the sql query with the address
     * @param response
     */
    function _createGeoObjects(response) {
        //do something with the data using response.rows
        console.log("New Round");
        var address = response.rows[0][0];
        var resultLength = response.length;
        console.log("Address: "+address);
        for(var i = 0; i < resultLength; i++){
            var geoObject = new GeoObject(response.rows[i][0],response.rows[i][1],response.rows[i][2],response.rows[i][3],response.rows[i][4],response.rows[i][5],null);
            geoObjects[i] = geoObject;
        }
    }

    /**
     *
     * @param rowId
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
        this.marker = marker; //TODO: Geocoding
      };
    /**
     *
     * @param tableId
     * @param name
     * @param ftLayer
     * @param geoObjects
     * @constructor
     */
    castReceiver.QueryResults = function (ftLayer, geoObjects) {
        this.ftLayer = ftLayer;
        /** @type Array.<GeoObject> */
        this.geoObjects = geoObjects;
    };

}(this.dataManager = this.dataManager || {}));
