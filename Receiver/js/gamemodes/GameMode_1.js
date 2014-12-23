(function(castReceiver){
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
    // Creates Random X
    /**
     * Intializes Game Mode 1
     * TODO {sh} : Parameters: Choices = true/false
     * @param mapOptions
     * @param gameModeOptions
     */
    castReceiver.init = function(){
        _loadGameUi();
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
                "featureType": "administrative",
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
        map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
        gameState = "initialized"; //TODO use external ENUM
        console.log('gameMode_1 initialized');


        //console.log("Done"); //TODO use meaningfull messages!  eg:  'GameRoundManager.js: done loading map.'

        gameMode_1.startRound( dataManager.getValue('gameMode_currentRound') ); //TODO use members
    };

    castReceiver.startRound = function(roundNumber) {
        displayText('RoundManager: round ' + roundNumber + ' started.' );

        var x = Math.floor(Math.random() * (max - min)) + min;

        _clearMarkersOnMap();


        layer = new google.maps.FusionTablesLayer({
            query: {
                select: locationColumn,
                from: ftTableId,
                where: where,
                offset: x,
                limit: "1"
            },
            options: {
                styleId: 1,
                templateId: 1
            }

        });

        layer.setMap(map);



        // Builds a Fusion Tables SQL query and hands the result to  dataHandler
        // write your SQL as normal, then encode it
        var query = "SELECT * FROM " + ftTableId + " WHERE "+where+" OFFSET "+ x +" LIMIT 1"; //TODO put all queries into dataManager... getGeoObjects()... etc
        //console.log(query);
        var queryurl = encodeURI(queryUrlHead + query + queryUrlTail);

        //asynchronous call to handle query data
        var jqxhr = $.get(queryurl, function(data){
            _getRandomPositionOfRound(data);
        } , "jsonp");
        //console.log("Game Mode 1 started: "+jqxhr);
        //reset user map
        guesses = {};
        results = {};
        positions = {};
        // GMB: send prepare()
        // describes game mode properties
        var data = {"event_type":"gameDetail" , "gameMode" : "1", "timerRound" : "30000", "choices" : "null"};
        console.log("Prepare");
        try {
            window.gameMessageBus.broadcast(data);
        } catch (Exeption) {}

        gameState = "started";
        gameModeManager.setGameModeStarted(1);
        //Set Timer
        console.log("starting RoundTimer....");
        var worker = new Worker('js/timer.js'); //External script
        worker.onmessage = function(event) {    //Method called by external script
            console.log("gamemode1: onMessage !");
            gameModeManager.setGameRoundEnded();
        };

    }

    /**
     *  Is called from GMM to end current round, all results are calculated
     */
    castReceiver.roundEnded = function(){
        gameState = "ended"; //TODO no magic values ! ...use enum
        // calculate results, set markers visible
        console.log("GameMode_1.js.roundEnded: Calculating Results...");
        displayText('RoundManager: round ' + dataManager.getValue('gameMode_currentRound') +  ' ended.<br>' );
        for (player in guesses) {

            var points = 0;
            var dist =  guesses[player];
            var distInKm = dist / 1000;
            console.log("Player:"+ player+ " Dist:"+ dist + " ("+distInKm+")");
            points = Math.floor(Math.max(0,Math.min(10,(1100-distInKm)/100)));
            /* Alte Version (noch drin falls neue Formel nicht funktioniert):
            if (dist == 0){
                console.log("richtig");
                points = 1;
            } else {
                points = 1 - (1 / (dist*1000));
            }*/
            results[player] = points;
            console.log("Points: "+points);
            // get the saved guessed position for this player
            var pos = positions[player];
            console.log("Position: "+ pos);
            // Now Place the marker on the map:
            var user = userManager.getUserByMac(player);
            var color = user.color;

            _placeMarkerOnMap(pos, player,color);


        }
        console.log("Results calculated, Round ended");
        // notify game mode manager that round has ended
        gameModeManager.incCurrentRound();
        // send results array to gmm
        gameModeManager.setGameRoundResults(results);
        userManager.refreshBottomScoreboard(); //TODO test !

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

    function _clearMarkersOnMap(){
        if (layer) {
            layer.setMap(null);
        }

        markers.map(function (marker) {
            marker.setMap(null);
        });
        markers = [];
    }

    function _loadGameUi(){
        $('#gameOverlay').load('templates/GameMode_1.html', function (data) {
            $(this).html(data);
            userManager.refreshBottomScoreboard();
        });
    }

    /**
     * Called from event handler to calculate answers
     * @param userMac
     * @param answer
     */
    castReceiver.onChosenMessage = function(userMac, answer){
        //console.log("New Guess: "+userMac+" : "+answer);
        //displayText("New Guess: "+userMac+" chose "+answer);  events werden ohnehin mit allen JSON daten angezeigt !
        _calculateGuess(answer,userMac);
    };
    /**
     * Calculates the distance between the guess and the goal coordinates
     * @param address
     * @param player
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



}(this.gameMode_1 = this.gameMode_1 || {}));
