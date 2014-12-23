(function(grm){
    var map, layer, geocoder;
    //Fusion Table ID:
    var ftTableId = "13Ajs8twEaALtd19pa6LxRpYHLRxFwzdDGKQ2iu-2";
    var locationColumn = "col1";
    var where = "col4 \x3e\x3d 100000 and col3 contains ignoring case \x27DE\x27";
    var goal;
    var queryUrlHead = 'https://www.googleapis.com/fusiontables/v1/query?sql=';
    //Google API Key
    var queryUrlTail = '&key=AIzaSyBDXF2p6in0gxcCMZVepVyvVHy_ASfmiXo';
    var guesses = {}; // Map UserID:Distanz zum Ziel
    var positions = {}; //Map UserID:LatLong Position
    var results = {}; // Map UserId:Points
    var markers = []; //Google Map Marker
    var gameState;
    var min = 1;
    var max = 98; //TODO use COUNT query in dataManager

    /**
     * Calculates the distance between the guess and the goal coordinates
     * @param address
     * @param player
     * @private
     */
    function _calculateGuess(address, player){
        // get Geolocation
        // set Marker
        console.debug("get Address: "+address+" for player:" +player);
        geocoder.geocode({
            address: address
        }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var pos = results[0].geometry.location;
                console.log("Pos: "+pos);
                // Saves the Position the Player guessed
                positions[player] = pos;

                // get Distance to right answer (if not the same)
                var dist = _getDistance(pos,goal);

                console.log("Player: "+player+ "Dist: "+dist);
                // dist save
                guesses[player] = dist;


            } else {
                console.log('Address could not be geocoded: ' + status);
            }
        });

    }

    /**
     *
     * @private
     */
    function _clearMarkersOnMap(){
        if (layer) {
            layer.setMap(null);
        }

        markers.map(function (marker) {
            marker.setMap(null);
        });
        markers = [];
    }

    /**
     * Returns the distance between two location points in meters
     *
     * @param p1 (Lat,len)
     * @param p2 (lat,len)
     * @returns {number} distance in meter
     * @private
     */
    function _getDistance(p1, p2) {
        //TODO {sh} : in case of rate limit, use formular not api
        return google.maps.geometry.spherical.computeDistanceBetween (p1, p2); // returns the distance in meter
    }


    /**
     * gets the data from the sql query with the address and zooms into the address
     * @param response
     * @private
     */
    function _getRandomPositionOfRound(response) {
        //do something with the data using response.rows
        console.log("New Round");
        var address = response.rows[0][0];
        console.log("Address: "+address);
        geocoder.geocode({
            address: address
        }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var pos = results[0].geometry.location;
                console.log("Position: "+pos);
                map.setCenter(pos);
                map.setZoom(6);
                //Set global goal var
                goal = pos;
            } else {
                console.log('Address could not be geocoded: ' + status);
            }
        });
    }

    /**
     * Sets an Marker with the Player as Title
     * @param pos
     * @param player
     * @param color
     * @private
     */
    function _placeMarkerOnMap(pos,player,color){
        //var styleIconClass = new StyledIcon(StyledIconTypes.CLASS,{color:"#ff0000"});
        //var styleMaker1 = new StyledMarker({
        //    styleIcon: new StyledIcon(StyledIconTypes.MARKER, {text: ""}, styleIconClass),
        //    position: pos,
        //    map: map
        //});
        //styleIconClass.set("color",color);

        var pinColor = color.split("#")[1];
        var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor);

        var marker = new google.maps.Marker({
            position: pos,
            //map: map,
            icon: pinImage,
            title: "Player: "+player,
            animation: google.maps.Animation.DROP
        });
        marker.setMap(map);
        markers.push(marker);
    }


    /**
     *
     * @private
     */
    function _loadGameUi(){
        $('#gameOverlay').load('templates/GameMode_1.html', function (data) {
            $(this).html(data);
            userManager.refreshBottomScoreboard();
        });
    }

    /**
     *
     * @param {Object} gameModeObject
     * @param {Object} profileObject
     * @private
     */
    function _loadMap(gameModeObject, profileObject) {

    }

    /**
     *
     * @param {Object} gameModeObject
     * @param {Object} profileObject
     */
    grm.init = function(gameModeObject, profileObject){

        _loadMap(gameModeObject, profileObject);

        this.startRound(1);
        // load map ()
    };

    /**
     * Called from event handler to calculate answers
     * @param userMac
     * @param answer
     */
    grm.onChosenMessage = function(userMac, answer){
        //console.log("New Guess: "+userMac+" : "+answer);
        //displayText("New Guess: "+userMac+" chose "+answer);  events werden ohnehin mit allen JSON daten angezeigt !
        _calculateGuess(answer,userMac);
    };

    /**
     *
     */
    grm.startRound = function(){
        var currentRound = gameModeManager.currentRound;
        // send event
        gameModeManager.setGameModeStarted(currentRound);
        // start timer

        // after time is over call endRound
    };

    grm.endRound = function(){
        // send event
        gameModeManager.setGameRoundEnded();
        // calc points
        // set scorebaord
        // update user points
        // call gmm.setGameRoundEnded

    };





}(this.gameRoundManager = this.gameRoundManager || {}));