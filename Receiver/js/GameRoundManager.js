(function(grm){

    var goal;

    var guesses = {}; // Map UserID:Distanz zum Ziel
    var positions = {}; //Map UserID:LatLong Position
    var results = {}; // Map UserId:Points
    var addresses = {}; // Map UserId:Address (Name of Guess)
    var goalMarker; // Marker of goal
    var goalAddress = "";
    grm.roundTimer = null;


    grm.startRound = function(){
        renderManager.showMidScreenMessage('round ' + gameModeManager.currentRound + ' started...' )
        displayText('RoundManager: round ' + gameModeManager.currentRound + ' started.' );
        var queryResult = dataManager.getGeoObjects("country","DE",1);
        if (typeof queryResult == "null") {
            //TODO: Handle if false data
        }
        gameModeManager.clearMarkers();
        //gameModeManager.setLayer(queryResult.ftLayer);
        //gameModeManager.getLayer().setMap(gameModeManager.getMap());


        console.log("New Round");
        var geoObject = queryResult.geoObjects[0]; //TODO dynamic
        var address = geoObject.name;
        goalAddress = address;
        var lat = geoObject.lat;
        var long = geoObject.long;
        var pos = new google.maps.LatLng(lat, long);
        console.log("Address: "+address+ ": "+lat+" , "+long);
        goalMarker = _placeMarkerOnMap(pos,"goal","#ff0000"); //TODO use different marker icon for goal marker
        gameModeManager.getMap().setCenter(pos);
        gameModeManager.getMap().setZoom(6);
        //Set global goal var
        goal = pos;
        //console.log("Game Mode 1 started: "+jqxhr);
        //reset user map
        guesses = {};
        results = {};
        positions = {};
        addresses = {};
        // GMB: send prepare()
        // describes game mode properties
        var jsonData = {"event_type":"startGame", "gameMode": 1, "started": true, "roundNumber": gameModeManager.currentRound, "timerRound" : "30000", "choices" : "null"};
        eventManager.broadcast(data.channelName.game, jsonData);
        //Set Timer
        console.log("starting RoundTimer....");
        gameRoundManager.roundTimer = new Worker('js/timer.js'); //External script
        gameRoundManager.roundTimer.onmessage = function(event) {    //Method called by external script
            console.log("GRM: onMessage !");
            gameRoundManager.endRound();
        };
    };

    grm.choseAnswer = function(userMac, answer){
        //console.log("New Guess: "+userMac+" : "+answer);
        //displayText("New Guess: "+userMac+" chose "+answer);  events werden ohnehin mit allen JSON daten angezeigt !
        _calculateGuess(answer,userMac);
    };

    grm.endRound = function(){
        // send event
        // calculate results, set markers visible
        console.log("GRM.roundEnded: Calculating Results...");
        displayText('RoundManager: round ' + gameModeManager.currentRound +  ' ended.<br>' );
        var goalInfo = _createInfoWindow("Goal",goalAddress);
        goalInfo.open(gameModeManager.getMap(), goalMarker);

        for (player in guesses) {

            var points = 0;
            var dist =  guesses[player];
            var distInKm = dist / 1000;
            console.log("Player:"+ player+ " Dist:"+ dist + " ("+distInKm+")");
            points = Math.floor(Math.max(0,Math.min(10,(1100-distInKm)/100)));

            results[player] = points;
            console.log("Points: "+points);
            // get the saved guessed position for this player
            var pos = positions[player];
            console.log("Position: "+ pos);
            // Now Place the marker on the map:
            var user = userManager.getUserByMac(player);
            var color = user.color;

            var mark = _placeMarkerOnMap(pos, player,color);
            var info = _createInfoWindow(player,addresses[player]);
            info.open(gameModeManager.getMap(),mark);

        }
        console.log("Results calculated, Round ended");
        // notify game mode manager that round has ended
        // send results array to gmm
        // results = array[userMac]
        // get user list
        var resultLength = results.length,
            userList = userManager.getUserList();
        var userListLength = userList.length;

        for (var key in results) {
            if(key === 'length' || !results.hasOwnProperty(key)) continue;
            // key is userMac
            for(var i = 0; i<userListLength; i++){
                if(userList[i].mac == key) {
                    userList[i].pointsInCurrentGame = userList[i].pointsInCurrentGame + results[key];
                    displayText('userMac: ' + userList[i].mac + ', points added: '+ results[key]);
                }
            }
        }
        userManager.setUserList(userList);
        userManager.refreshBottomScoreboard(); //TODO test !
        // call prepareNextRound
        var jsonData = {"event_type":"round_ended", "ended": true};
        eventManager.broadcast(data.channelName.game, jsonData);
        displayText('[GRM] setGameRoundEnded broadcasted');
        // calc points
        // set scorebaord
        // update user points
        // call gmm.setGameRoundEnded
        gameRoundManager.nextRound();

    };


    grm.cancelRoundTimer = function() {
        if (gameRoundManager.roundTimer != null) {
            gameRoundManager.roundTimer.terminate();
        }
    };



    grm.nextRound = function(){
        // check if max rounds reached
        if(gameModeManager.currentRound === gameModeManager.maxRounds) {
            // end game mode
            displayText('[GRM] maxRounds reached: ' + gameModeManager.maxRounds);
            var jsonData = {"ended": true, "event_type":"game_ended"};
            eventManager.broadcast(data.channelName.game, jsonData);

            renderManager.loadMainMenu();
            // todo fm show final scoreboard
        } else {
            // next round...
            gameModeManager.currentRound = gameModeManager.currentRound + 1;

            setTimeout(function(){
                //gameMode_1.startRound(gmm.currentRound);
                gameRoundManager.startRound();
            }, 10000); //TODO use async timer to not block thread ?
        }
    };










    //TODO =============== ab hier überarbeiten ===================



    /**
     * Calculates the distance between the guess and the goal coordinates
     * @param address
     * @param player
     * @private
     */
    function _calculateGuess(address, player){
        // get Geolocation
        console.debug("get Address: "+address+" for player:" +player);
        addresses[player] = address;
        gameModeManager.getGeocoder().geocode({
            address: address,
            region: "de"

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
                console.log(player+ ' Address could not be geocoded: ' + status);
                displayText(player+ ' Address could not be geocoded: '+address+" : " + status);

            }
        });

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
     *
     * @param player
     * @param guess
     * @returns {google.maps.InfoWindow}
     * @private
     */
    function _createInfoWindow(player, guess){
        if (player != " "){
            player = player + ': ';
        }

        var contentString = '<div id="content">'+player+''+guess+'</div>';
        var infowindow = new google.maps.InfoWindow({
            content: contentString
        });

        return infowindow;
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
        marker.setMap(gameModeManager.getMap());
        gameModeManager.getMarkers().push(marker);

        return marker;
    }


}(this.gameRoundManager = this.gameRoundManager || {}));