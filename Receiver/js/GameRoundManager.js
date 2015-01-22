(function(grm){


    grm.roundTimer = null;
    grm.roundTimerAnim = null;
    grm.timePerRoundSec = 30;
    grm.roundEvaluationTimeSec = 10;
    grm.goalGeoObject = null; // Target GeoObject
    grm.goalMarker = null; // Target GeoObject
    grm.currentGameState = data.gameState.ended;



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
            return "[Answer] guessedName: " + this.guessedName + ", geoObject: " + this.geoObject + ", dist: " + this.distanceToGoalKm + ", points: " + this.points;
        };
    };


    grm.startRound = function(){
        gameRoundManager.currentGameState = data.gameState.guessing;
        print("\n======= Round " + gameModeManager.currentRound + " =======");

        //var countryCode = dataManager.getRandomCountryCode();
        var userList = userManager.getUserList();
        for(var i = 0; i < userList.length; i++){
            userList[i].lastAnswerGiven = null;
        }
        renderManager.refreshBottomScoreboard();
        renderManager.showMidScreenMessage('- Round ' + gameModeManager.currentRound + ' -', 0.6 );

        var geoObjects = dataManager.getGeoObjects(
            data.geoObjType.city,gameModeManager.currentGameModeProfile.limitedCountry,
            gameModeManager.currentGameModeProfile.multipleChoiceMode ? data.constants.numberOfChoices : 1,
            gameModeManager.currentGameModeProfile.minPopulationDefault);

        gameRoundManager.goalGeoObject = geoObjects[0];
        var goalPos = new google.maps.LatLng(gameRoundManager.goalGeoObject.latitude, gameRoundManager.goalGeoObject.longitude);
        _placeGoalMarker(goalPos);

        gameModeManager.getMap().setCenter(goalPos);
        gameModeManager.getMap().setZoom(6);


        var geoNameChoices = dataManager.getCityNameArray(geoObjects);
        console.debug('[geoObjects] ' + geoObjects);
        print('[geoNameChoices] ' + geoNameChoices);


        var jsonData = {"event_type": data.eventType.startGame,
            "multipleChoiceMode": gameModeManager.currentGameModeProfile.multipleChoiceMode ,
            "started": true,
            "roundNumber": gameModeManager.currentRound,
            "timerRound" : gameModeManager.currentGameModeProfile.timePerRoundSec,
            "choices" : geoNameChoices};
        eventManager.broadcast(data.channelName.game, jsonData);

        gameRoundManager.roundTimer = executionManager.execDelayed(gameModeManager.currentGameModeProfile.timePerRoundSec*1000, gameRoundManager.endRound);
        gameRoundManager.roundTimerAnim = renderManager.playTimerAnimationWithRoundDisplay(gameModeManager.currentGameModeProfile.timePerRoundSec, gameModeManager.currentRound, gameModeManager.maxRounds );
    };



    grm.choseAnswer = function(userMac, answer){
        var cleanedAnswerString = answer.replace(/([^a-z\s]+)/gi, ' ');
        cleanedAnswerString = cleanedAnswerString.substring(0, data.constants.maxAnswerLength);
        var user = userManager.getUserByMac(userMac);
        print("[GRM] " + user.name + " picked " + cleanedAnswerString);
        if (gameModeManager.currentGameModeProfile.multipleChoiceMode) {
            _calculateAnswer(user, cleanedAnswerString);
        } else {
            _calculateAnswerWithGeocoder(user, cleanedAnswerString);
        }
    };



    grm.endRound = function(){
        gameRoundManager.currentGameState = data.gameState.evaluating;
        print('-> Round ' + gameModeManager.currentRound +  ' ended.' );
        renderManager.showMidScreenMessage('Answer: ' + gameRoundManager.goalGeoObject.name, gameRoundManager.roundEvaluationTimeSec-3 );
        var userList = userManager.getUserList();
        for(var i = 0; i < userList.length; i++){
            var user = userList[i];
            if (user.lastAnswerGiven != null) {
                user.pointsInCurrentGame += user.lastAnswerGiven.points;
            }
        }
        renderManager.refreshBottomScoreboard();
        var jsonData = {"event_type":"round_ended", "ended": true};
        eventManager.broadcast(data.channelName.game, jsonData);
        gameRoundManager.nextRound();
    };


    grm.cancelRoundTimer = function() {
        gameRoundManager.currentGameState = data.gameState.ended;
        if (gameRoundManager.roundTimer != null) {
            gameRoundManager.roundTimer.terminate();
            print('[GRM] killed roundTimer: ' + gameRoundManager.roundTimer);
        }
        if (gameRoundManager.roundTimerAnim != null) {
            gameRoundManager.roundTimerAnim.terminate();
            print('[GRM] killed roundTimerAnim: ' + gameRoundManager.roundTimerAnim);
        }
    };



    grm.nextRound = function(){
        // check if max rounds reached
        if(gameModeManager.currentRound === gameModeManager.maxRounds) {
            // end game mode
            print('[GRM] maxRounds reached: ' + gameModeManager.maxRounds);
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
            print("[GRM] " + user.name + " got " + points + " points for the RIGTH answer.");
        } else {
            points = 0;
            print("[GRM] " + user.name + " got " + points + " points for the WRONG answer.");
        }
        user.lastAnswerGiven = new grm.Answer(answer,0,null,points);
        renderManager.refreshBottomScoreboard();
    }




    function _calculateAnswerWithGeocoder(user, answer){
        // get Geolocation
        gameModeManager.getGeocoder().geocode({
            address: answer,
            region: gameRoundManager.goalGeoObject.countryCode

        }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var pos = results[0].geometry.location;
                //console.debug(results[0]);
                var countryCode = '';
                for (var i=0; i<results[0].address_components.length; i++) {
                    for (var b=0;b<results[0].address_components[i].types.length;b++) {
                        if (results[0].address_components[i].types[b] == "country") {
                            countryCode = results[0].address_components[i];
                            break;
                        }
                    }
                }
                // get Distance to right answer (if not the same)
                var distInKm = _getDistance(pos,gameRoundManager.goalGeoObject.position)/1000;
                // Create new GeoObject for given answer
                var guessedGeoObject = new dataManager.GeoObject(user.mac,answer,pos.k,pos.B,countryCode,0,0,null);
                // Create new Answer Object
                var points = Math.floor(Math.max(0,Math.min(data.constants.maxPointsPerAnswer,(data.constants.maxDistanceErrorKm+100-distInKm)/100)));
                distInKm = Math.floor(distInKm);
                user.lastAnswerGiven = new grm.Answer(answer,distInKm,guessedGeoObject,points);
                renderManager.refreshBottomScoreboard();
                print("[GRM] " + user.name + " got " + points + " points (for "+distInKm+" km)");
            } else {
                print(user.mac+ ' Address could not be geocoded: '+answer+" : " + status);

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