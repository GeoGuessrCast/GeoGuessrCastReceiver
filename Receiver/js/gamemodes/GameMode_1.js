(function(castReceiver){
    var map, layer, geocoder;
    //Fusion Table ID:
    var ftTableId = "13Ajs8twEaALtd19pa6LxRpYHLRxFwzdDGKQ2iu-2";
    var locationColumn = "col1";
    var where = "col4 \x3e\x3d 100000 and col3 contains ignoring case \x27DE\x27";
    var goal,guess;
    var queryUrlHead = 'https://www.googleapis.com/fusiontables/v1/query?sql=';
    //Google API Key
    var queryUrlTail = '&key=AIzaSyBDXF2p6in0gxcCMZVepVyvVHy_ASfmiXo';
    var guesses = {}; // Map UserID:Answer
    var results = {}; // Map UserId:Points
    var gameState;
    /**
     * Intializes Game Mode 1
     * TODO {sh} : Parameters: Choices = true/false
     * @param parameters
     */
    castReceiver.init = function(parameters){
        console.log('running gameMode_1.init');
        dataManager.setValue('gameMode_currentId', 1);

        var map = window.map;
        geocoder = new google.maps.Geocoder();

        map = new google.maps.Map(document.getElementById('map-canvas'), {
            center: new google.maps.LatLng(45.74167213456433, 38.26884827734375),
            zoom: 3,
            mapTypeControl: false,
            disableDefaultUI: true,
            mapTypeId: google.maps.MapTypeId.SATELLITE

        });
        var style = [
            {
                "featureType": "administrative.locality",
                "elementType": "labels.text",
                "stylers": [
                    {"visibility": "off"}
                ]
            },
            {
                featureType: 'road.highway',
                elementType: 'all',
                stylers: [
                    {visibility: 'off'}
                ]
            },
            {
                "featureType": "administrative.country",
                "elementType": "labels",
                "stylers": [
                    {"visibility": "off"}
                ]
            }
        ];
        var styledMapType = new google.maps.StyledMapType(style, {
            map: map,
            name: 'Styled Map'

        });
        map.mapTypes.set('map-style', styledMapType);
        map.setMapTypeId('map-style');
        gameState = "initialized";
        console.log('gameMode_1 initialized');
        var min = 1;
        var max = 98; //TODO: dynamisch über Anzahl an Rows machen?
        // Creates Random X
        var x = Math.floor(Math.random() * (max - min)) + min;

        layer = new google.maps.FusionTablesLayer({
            query: {
                select: locationColumn,
                from: ftTableId,
                where: where,
                //orderBy: "RAND()",
                offset: x,
                limit: "1"
            },
            options: {
                styleId: 1,
                templateId: 1
            }

        });

        layer.setMap(map);
        console.log("Done");
        // Builds a Fusion Tables SQL query and hands the result to  dataHandler
        // write your SQL as normal, then encode it
        var query = "SELECT * FROM " + ftTableId + " WHERE "+where+" OFFSET "+ x+" LIMIT 1";
        console.log(query);
        var queryurl = encodeURI(queryUrlHead + query + queryUrlTail);

        //asynchronous call to handle query data
        var jqxhr = $.get(queryurl, '_dataHandler(response)' , "jsonp");
        console.log("Game Mode 1 started: "+jqxhr);
        //reset user map
        guesses = {};
        results = {};
        // GMB: send prepare()
        // describes game mode properties
        var data = '{"gameMode" : "1", "timerRound" : "10000", "choices" = "null"}';
        window.gameMessageBus.broadcast(JSON.stringify(data));
        gameState = "started";
        gameModeManager.setGameModeStarted(1);
        //Set Timer
        var timer = $.timer(_gameEnded(),10000,true);

    };



    function _gameEnded(){
        gameState = "ended";
        // calculate results, set markers visible

        //gamemodemanager.inc round
        console.log("Round ended")

        gameModeManager.incCurrentRound();

        gameModeManager.setGameRoundResults(results);

    }
    /**
     * Returns the distance between two location points in meters
     *
     * @param p1 (Lat,len)
     * @param p2 (lat,len)
     * @returns {number} distance in meter
     */
    function _getDistance(p1, p2) {
        //TODO {sh} : in case of rate limit, use formular not api
        return google.maps.geometry.spherical.computeDistanceBetween (p1, p2); // returns the distance in meter
    }

    /**
     * gets the data from the sql query with the address and zooms into the address
     * @param response
     */
    function _dataHandler(response) {
        //do something with the data using response.rows
        console.log("New Round");
        var address = response.rows[0][0];
        console.log(address);
        geocoder.geocode({
            address: address
        }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var pos = results[0].geometry.location;
                map.setCenter(pos);
                map.setZoom(5);
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
     */
    function _setMarker(pos,player){
        var marker = new google.maps.Marker({
            position: pos,
            //map: map,
            title: "Player: "+player,
            animation: google.maps.Animation.DROP
        });
        marker.setMap(map);
    }

    /**
     * Called from event handler to calculate right/wrong answers
     * @param event
     */
    castReceiver.onChosenMessage = function(event){
        var eventType = event.data.type;
        var userId = event.senderId;
        if (eventType == "chosen" && gameState == "started"){
            var answer = event.data.answer;
            console.log("New Guess: "+userId+" : "+answer);
            _calculateGuess(answer,userId);
            // TODO {sh}: maybe delay because of rate limit
            // TODO {sh}: Set Markers invisble and only show after round finishes
        }

    };
    /**
     * Calculates the distance between the guess and the goal coordinates
     * @param address
     * @param playerId
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
                _setMarker(pos, player);

                // get Distance to right answer (if not the same)
                var dist = _getDistance(guess,goal);
                var points = 0;

                if (dist == 0){
                    console.log("richtig");
                    points = 1;
                } else {
                    points = 1 - (1 / (dist*1000));
                }
                console.log("Player: "+player+ "Dist: "+dist+" Points: "+points);
                // dist save
                guesses[player] = dist;
                // results maybe later
                results[player] = points;


            } else {
                console.log('Address could not be geocoded: ' + status);
            }
        });
    }



}(this.gameMode_1 = this.gameMode_1 || {}));
