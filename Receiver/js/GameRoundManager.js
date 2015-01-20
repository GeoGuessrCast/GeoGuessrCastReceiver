(function(grm){


    var results = {}; // Map UserId:Points
    var userAnswers = []; // Array of Answer Objects

    /**
     *
     * @param user
     * @param guess String Answer
     * @param gamemode
     * @param distance
     * @param geoObject
     * @constructor
     */
    grm.Answer = function(user, guess, gamemode, distance, geoObject, points) {
        /** @type {User} */
        this.user = user;
        /** @type {string} */
        this.guess = guess;
        /** @type {string} */
        this.gamemode = gamemode;
        /** @type {number} */
        this.distance = distance;
        /** @type {GeoObject} */
        this.geoObject = geoObject;
        /** @type {number} */
        this.points = points;

        this.toString("[Answer] "+this.user.name+" Location: " + this.guess + " at " + this.geoObject.position + "(dist=" + this.distance + ") Points="+this.points);
    }

    grm.roundTimer = null;
    grm.timePerRoundSec = 30;
    grm.roundEvaluationTimeSec = 10;
    grm.goalGeoObject = null; // Target GeoObject

    grm.startRound = function(){
        console.log("\n======= Round " + gameModeManager.currentRound + " =======");
        renderManager.showMidScreenMessage('round ' + gameModeManager.currentRound + ' started...' );
        displayText('Round ' + gameModeManager.currentRound + ' started.' );

        // new random country code, usage?
        var countryCode = dataManager.getRandomCountryCode();

        var geoObjects = dataManager.getGeoObjects(
            data.geoObjType.city,gameModeManager.currentGameModeProfile.limitedCountry,
            gameModeManager.currentGameModeProfile.multipleChoiceMode ? 1 : data.constants.numberOfChoices,
            gameModeManager.currentGameModeProfile.minPopulationDefault);
        //TODO handling of nearby Geo Objects: If Game mode without choices, no query... ?
        //TODO minPopulation definition for each game mode
        var nearbyGeoObjects = dataManager.getNearestGeoObjects(geoObjects[0],5,500000,5000);


        gameModeManager.clearMarkers();
        gameModeManager.clearInfoBubbles();
        //gameModeManager.setLayer(queryResult.ftLayer);
        //gameModeManager.getLayer().setMap(gameModeManager.getMap());


        gameRoundManager.goalGeoObject = geoObjects[0];
        var address = gameRoundManager.goalGeoObject.name;
        var lat = gameRoundManager.goalGeoObject.latitude;
        var long = gameRoundManager.goalGeoObject.longitude;
        var pos = new google.maps.LatLng(lat, long);
        var goalMarker = _placeMarkerOnMap(pos,"goal","#ff0000"); //TODO use different marker icon for goal marker
        goalMarker.icon = {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 3
        };
        gameRoundManager.goalGeoObject.marker = goalMarker;
        gameModeManager.getMap().setCenter(pos);
        gameModeManager.getMap().setZoom(6);


        //reset user map
        //guesses = {};
        results = {};
        //geoCodedUserAnswerPos = {};
        userAnswers = [];

        //choices for Android app
        //TODO: Choices?ChoicesNearby?
        var cityNameChoices = dataManager.getCityNameArray(nearbyGeoObjects);
        console.log(geoObjects + cityNameChoices);

        // GMB: send prepare()
        // describes game mode properties //TODO use parameters below !
        var jsonData = {"event_type": data.eventType.startGame, "multipleChoiceMode": gameModeManager.currentGameModeProfile.multipleChoiceMode , "started": true, "roundNumber": gameModeManager.currentRound, "timerRound" : gameModeManager.currentGameModeProfile.timePerRoundSec, "choices" : cityNameChoices.push(address)};
        eventManager.broadcast(data.channelName.game, jsonData);

        //Set Timer
        executionManager.execDelayed(gameModeManager.currentGameModeProfile.timePerRoundSec*1000, gameRoundManager.endRound);
        renderManager.playTimerAnimationWithRoundDisplay(gameModeManager.currentGameModeProfile.timePerRoundSec, gameModeManager.currentRound, gameModeManager.maxRounds );
    };

    grm.choseAnswer = function(userMac, answer){
        var user = userManager.getUserByMac(userMac);
        console.log("[GRM] " + user.name + " picked " + answer);
        _calculateGuess(user, answer);
    };

    /**
     * Calculates the distance between the guess and the goal coordinates
     * @param userMac
     * @param answer
     * @private
     */
    function _calculateGuess(user, answer){
        // get Geolocation
        gameModeManager.getGeocoder().geocode({
            address: answer,
            region: gameRoundManager.goalGeoObject.countryCode

        }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var pos = results[0].geometry.location;
                var countryCode = results[0].address_components[2].short_name;
                // get Distance to right answer (if not the same)
                var dist = _getDistance(pos,gameRoundManager.goalGeoObject.position);
                // Create new GeoObject for given answer
                var guessedGeoObject = new dataManager.GeoObject("1",answer,pos.k,pos.B,countryCode,0,0,null);
                // Create new Answer Object
                var answerObject = new grm.Answer(user,answer,gameModeManager.currentGameModeProfile.profileName,dist,guessedGeoObject,null); // Already calc points?

                userAnswers.push(answerObject);

                console.log("[GC] found " + answer + " at " + pos + "(dist=" + dist + ")");


            } else {
                console.log(userMac+ ' Address could not be geocoded: ' + status);
                displayText(userMac+ ' Address could not be geocoded: '+answer+" : " + status);

            }
        });

    }





    grm.endRound = function(){
        // send event
        // calculate results, set markers visible
        displayText('Round ' + gameModeManager.currentRound +  ' ended.<br>' );
        var goalInfo = _createInfoWindow("Goal",gameRoundManager.goalGeoObject.name);
        goalInfo.open(gameModeManager.getMap(), gameRoundManager.goalGeoObject.marker);
        gameModeManager.getInfoBubbles().push(goalInfo);

        for (var i=0; i < userAnswers.length; i++ ) {
            var answer = userAnswers[i];
            var points = 0;
            var dist =  answer.distance;
            var distInKm = dist / 1000;
            points = Math.floor(Math.max(0,Math.min(10,(1100-distInKm)/100)));
            answer.points = points;
            var userMac = answer.user.mac;
            results[userMac] = points; //TODO Change result map
            console.log("[GRM] " + answer.user.name + " got " + points + " points (for "+distInKm+" km)");
            // get the saved guessed position for this player
            var guessedGeoObject = answer.geoObject;
            // Now Place the marker on the map:
            var user = answer.user;
            var color = user.color;

            var mark = _placeMarkerOnMap(guessedGeoObject.position, user.name,color);

            var info = _createInfoWindow(user.name,answer.guess);
            info.position = guessedGeoObject.position;
            info.open(gameModeManager.getMap(),mark);
            gameModeManager.getInfoBubbles().push(info);

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

        var contentString = '<div id="content">'+guess+'</div>';
       /* = new google.maps.InfoWindow({
            content: contentString
        });*/
        var infowindow = new InfoBubble({

            content: '<div class="mylabel">'+guess+'</div>',
            shadowStyle: 0,
            padding: 0,
            backgroundColor: 'rgba(255,255,255,10)',
            borderRadius: 2,
            arrowSize: 1,
            borderWidth: 0,
            borderColor: '#2c2c2c',
            disableAutoPan: true,
            hideCloseButton: true,
            arrowPosition: 30,
            backgroundClassName: 'transparent',
            arrowStyle: 2
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