(function(grm){


    grm.roundTimer = null;
    grm.timePerRoundSec = 30;
    grm.roundEvaluationTimeSec = 10;
    grm.goalGeoObject = null; // Target GeoObject
    grm.goalMarker = null; // Target GeoObject



    grm.Answer = function(guessedName, distanceToGoalKm, geoObject, points) {
        /** @type {string} */
        this.guessedName = guessedName;
        /** @type {number} */
        this.distanceToGoalKm = distanceToGoalKm;
        /** @type {geoObject} */
        this.geoObject = geoObject;
        /** @type {number} */
        this.points = points;

        this.toString = function() {
            return "[Answer] "+this.user.name+" Location: " + this.guess + " at " + this.geoObject.position + "(dist=" + this.distance + ") Points="+this.points;
        };
    };


    grm.startRound = function(){
        console.log("\n======= Round " + gameModeManager.currentRound + " =======");
        displayText("\n======= Round " + gameModeManager.currentRound + " =======");

        renderManager.showMidScreenMessage('- Round ' + gameModeManager.currentRound + ' -', 0.6 );

        //var countryCode = dataManager.getRandomCountryCode();

        var geoObjects = dataManager.getGeoObjects(
            data.geoObjType.city,gameModeManager.currentGameModeProfile.limitedCountry,
            gameModeManager.currentGameModeProfile.multipleChoiceMode ? data.constants.numberOfChoices : 1,
            gameModeManager.currentGameModeProfile.minPopulationDefault);

        gameRoundManager.goalGeoObject = geoObjects[0];

        var goalName = gameRoundManager.goalGeoObject.name;
        var lat = gameRoundManager.goalGeoObject.latitude;
        var long = gameRoundManager.goalGeoObject.longitude;
        var goalPos = new google.maps.LatLng(lat, long);
        _placeGoalMarker(goalPos);

        gameModeManager.getMap().setCenter(goalPos);
        gameModeManager.getMap().setZoom(6);


        var geoNameChoices = dataManager.getCityNameArray(geoObjects);
        console.debug('[geoObjects] ' + geoObjects);
        console.log('[geoNameChoices] ' + geoNameChoices);


        var jsonData = {"event_type": data.eventType.startGame,
            "multipleChoiceMode": gameModeManager.currentGameModeProfile.multipleChoiceMode ,
            "started": true,
            "roundNumber": gameModeManager.currentRound,
            "timerRound" : gameModeManager.currentGameModeProfile.timePerRoundSec,
            "choices" : geoNameChoices};
        eventManager.broadcast(data.channelName.game, jsonData);

        executionManager.execDelayed(gameModeManager.currentGameModeProfile.timePerRoundSec*1000, gameRoundManager.endRound);
        renderManager.playTimerAnimationWithRoundDisplay(gameModeManager.currentGameModeProfile.timePerRoundSec, gameModeManager.currentRound, gameModeManager.maxRounds );
    };



    grm.choseAnswer = function(userMac, answer){
        var user = userManager.getUserByMac(userMac);
        console.log("[GRM] " + user.name + " picked " + answer);
        if (gameModeManager.currentGameModeProfile.multipleChoiceMode) {
            _calculateAnswer(user, answer);
        } else {
            _calculateAnswerWithGeocoder(user, answer);
        }
    };



    grm.endRound = function(){
        displayText('Round ' + gameModeManager.currentRound +  ' ended.<br>' );
        renderManager.showMidScreenMessage('Answer: ' + gameRoundManager.goalGeoObject.name, gameRoundManager.roundEvaluationTimeSec-3 );
        var userList = userManager.getUserList();
        for(var i = 0; i < userList.length; i++){
            var user = userList[i];
            if (user.lastAnswerGiven != null) {
                user.pointsInCurrentGame += user.lastAnswerGiven.points;
                displayText("[GRM] " + user.name + " got " + user.lastAnswerGiven.points + " points (for "+user.lastAnswerGiven.distanceToGoalKm+" km)");
            }
        }
        userManager.refreshBottomScoreboard();
        var jsonData = {"event_type":"round_ended", "ended": true};
        eventManager.broadcast(data.channelName.game, jsonData);
        gameRoundManager.nextRound();
    };


    grm.cancelRoundTimer = function() {
        if (gameRoundManager.roundTimer != null) {
            //gameRoundManager.roundTimer.terminate(); //TODO fixme
        }
    };



    grm.nextRound = function(){
        // check if max rounds reached
        if(gameModeManager.currentRound === gameModeManager.maxRounds) {
            // end game mode
            displayText('[GRM] maxRounds reached: ' + gameModeManager.maxRounds);
            var jsonData = {"ended": true, "event_type":"game_ended"};
            eventManager.broadcast(data.channelName.game, jsonData);
            executionManager.execDelayed(gameRoundManager.roundEvaluationTimeSec*1000, renderManager.loadMainMenu);
            // todo fm show final scoreboard
        } else {
            // next round...
            gameModeManager.currentRound = gameModeManager.currentRound + 1;
            executionManager.execDelayed(gameRoundManager.roundEvaluationTimeSec*1000, gameRoundManager.startRound);
        }
    };



    function _getDistance(p1, p2) {
        //TODO {sh} : in case of rate limit, use formular not api
        return google.maps.geometry.spherical.computeDistanceBetween (p1, p2); // returns the distance in meter
    }



    function _calculateAnswer(user, answer){
        var points;
        if (answer == gameRoundManager.goalGeoObject.name) {
            points = data.constants.maxPointsPerAnswer;
            console.log("[GRM] " + user.name + " got " + points + " points for the RIGTH answer.");
        } else {
            points = 0;
            console.log("[GRM] " + user.name + " got " + points + " points for the WRONG answer.");
        }
        user.lastAnswerGiven = new grm.Answer(answer,0,null,points);
    }




    function _calculateAnswerWithGeocoder(user, answer){
        // get Geolocation
        gameModeManager.getGeocoder().geocode({
            address: answer,
            region: gameRoundManager.goalGeoObject.countryCode

        }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var pos = results[0].geometry.location;
                var countryCode = results[0].address_components[2].short_name;
                // get Distance to right answer (if not the same)
                var distInKm = _getDistance(pos,gameRoundManager.goalGeoObject.position)/1000;
                // Create new GeoObject for given answer
                var guessedGeoObject = new dataManager.GeoObject(user.mac,answer,pos.k,pos.B,countryCode,0,0,null);
                // Create new Answer Object
                var points = Math.floor(Math.max(0,Math.min(data.constants.maxPointsPerAnswer,(data.constants.maxDistanceErrorKm+100-distInKm)/100)));
                user.lastAnswerGiven = new grm.Answer(answer,distInKm,guessedGeoObject,points);

                console.log("[GRM] " + user.name + " got " + points + " points (for "+distInKm+" km)");


            } else {
                console.log(userMac+ ' Address could not be geocoded: ' + status);
                displayText(userMac+ ' Address could not be geocoded: '+answer+" : " + status);

            }
        });

    }


    function _placeGoalMarker(position){
        if (gameModeManager.goalMarker == null) {
            //TODO create a good crosshair image
            //var image = {
            //    url: 'images/crosshair_red.png',
            //    size: new google.maps.Size(16, 16),
            //    origin: new google.maps.Point(0,0),
            //    anchor: new google.maps.Point(8, 8)
            //};

            gameModeManager.goalMarker = new google.maps.Marker({
                position: position,
                map: gameModeManager.getMap(),
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 4,
                    strokeColor: '#B42D2D'
                }
            });

        } else {
            gameModeManager.goalMarker.setPosition(position);
        }
    }


}(this.gameRoundManager = this.gameRoundManager || {}));