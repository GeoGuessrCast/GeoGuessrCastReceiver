(function(grm){

    var goal;

    var guesses = {}; // Map UserID:Distanz zum Ziel
    var positions = {}; //Map UserID:LatLong Position
    var results = {}; // Map UserId:Points
    var addresses = {}; // Map UserId:Address (Name of Guess)
    var goalMarker; // Marker of goal
    var goalAddress = "";
    grm.roundTimer = null;
    grm.timePerRoundSec = 30;
    grm.roundEvaluationTimeSec = 10;


    grm.startRound = function(){
        console.log("\n======= Round " + gameModeManager.currentRound + " =======");
        renderManager.showMidScreenMessage('round ' + gameModeManager.currentRound + ' started...' )
        displayText('Round ' + gameModeManager.currentRound + ' started.' );
        var queryResult = dataManager.getGeoObjects(
            data.geoObjType.city,gameModeManager.currentGameModeProfile.limitedCountry,
            gameModeManager.currentGameModeProfile.multipleChoiceMode ? 1 : data.constants.numberOfChoices,
            gameModeManager.currentGameModeProfile.minPopulationDefault);
        if (typeof queryResult == "null") {
            //TODO: Handle if false data
        }
        gameModeManager.clearMarkers();
        //gameModeManager.setLayer(queryResult.ftLayer);
        //gameModeManager.getLayer().setMap(gameModeManager.getMap());


        var geoObject = queryResult.choices[0]; //TODO dynamic
        var address = geoObject.name;
        goalAddress = address;
        var lat = geoObject.latitude;
        var long = geoObject.longitude;
        var pos = new google.maps.LatLng(lat, long);
        goalMarker = _placeMarkerOnMap(pos,"goal","#ff0000"); //TODO use different marker icon for goal marker
        goalMarker.icon = {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 3
        }
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

        //choices for Android app
        //TODO: Choices?ChoicesNearby?
        var cityNameChoices = dataManager.getCityNameArray(queryResult.choicesNearby);
        console.log(queryResult.choices + cityNameChoices);

        // GMB: send prepare()
        // describes game mode properties //TODO use parameters below !
        var jsonData = {"event_type": data.eventType.startGame, "multipleChoiceMode": gameModeManager.currentGameModeProfile.multipleChoiceMode , "started": true, "roundNumber": gameModeManager.currentRound, "timerRound" : gameRoundManager.timePerRoundSec, "choices" : cityNameChoices};
        eventManager.broadcast(data.channelName.game, jsonData);
        //Set Timer
        //console.log("starting RoundTimer....");
        //gameRoundManager.roundTimer = new Worker('js/timer.js'); //External script
        //gameRoundManager.roundTimer.onmessage = function(event) {    //Method called by external script
        //    console.log("GRM: onMessage !");
        //    gameRoundManager.endRound();
        //};
        executionManager.execDelayed(gameRoundManager.timePerRoundSec*1000, gameRoundManager.endRound);
        renderManager.playTimerAnimationWithRoundDisplay(gameRoundManager.timePerRoundSec, gameModeManager.currentRound, gameModeManager.maxRounds );
    };

    grm.choseAnswer = function(userMac, answer){
        //console.log("New Guess: "+userMac+" : "+answer);
        //displayText("New Guess: "+userMac+" chose "+answer);  events werden ohnehin mit allen JSON daten angezeigt !
        _calculateGuess(answer,userMac);
    };

    grm.endRound = function(){
        // send event
        // calculate results, set markers visible
        displayText('Round ' + gameModeManager.currentRound +  ' ended.<br>' );
        var goalInfo = _createInfoWindow("Goal",goalAddress);
        goalInfo.open(gameModeManager.getMap(), goalMarker);

        for (var userMac in guesses) {

            var points = 0;
            var dist =  guesses[userMac];
            var distInKm = dist / 1000;
            points = Math.floor(Math.max(0,Math.min(10,(1100-distInKm)/100)));

            results[userMac] = points;
            console.log("[GRM] " + userManager.getUserByMac(userMac).name + " got " + points + " points (for "+distInKm+" km)");
            // get the saved guessed position for this player
            var pos = positions[userMac];
            // Now Place the marker on the map:
            var user = userManager.getUserByMac(userMac);
            var color = user.color;

            var mark = _placeMarkerOnMap(pos, userMac,color);

            var info = _createInfoWindow(user.name,addresses[userMac]);
            info.open(gameModeManager.getMap(),mark);

        }
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
            executionManager.execDelayed(gameRoundManager.roundEvaluationTimeSec*1000, gameRoundManager.startRound);
        }
    };










    //TODO =============== ab hier überarbeiten ===================



    /**
     * Calculates the distance between the guess and the goal coordinates
     * @param address
     * @param userMac
     * @private
     */
    function _calculateGuess(address, userMac){
        // get Geolocation
        console.log("[GRM] " + userManager.getUserByMac(userMac).name + " picked " + address);
        addresses[userMac] = address;
        gameModeManager.getGeocoder().geocode({
            address: address,
            region: "de" //TODO ... wtf?

        }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var pos = results[0].geometry.location;
                // Saves the Position the Player guessed
                positions[userMac] = pos;

                // get Distance to right answer (if not the same)
                var dist = _getDistance(pos,goal);

                console.log("[GC] found " + address + " at " + pos + "(dist=" + dist + ")");
                // dist save
                guesses[userMac] = dist;


            } else {
                console.log(userMac+ ' Address could not be geocoded: ' + status);
                displayText(userMac+ ' Address could not be geocoded: '+address+" : " + status);

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