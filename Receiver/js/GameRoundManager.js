(function(grm){


    grm.roundTimer = null;
    grm.roundTimerAnim = null;
    grm.gameEvalTimer = null;

    grm.viewHighScoreTimer = null;
    grm.viewGlobalHighScoreTimer = null;
    grm.viewMainMenuTimer = null;

    grm.timePerRoundSec = 30;
    grm.roundEvaluationTimeSec = 10;
    grm.goalGeoObject = null; // Target GeoObject
    grm.goalMarker = null; // Target GeoObject
    grm.currentGameState = data.gameState.ended;

    grm.getMaxPointsPerAnswer = function() {
        if (gameModeManager.currentGameModeProfile == null) {
            return data.constants.maxPointsPerAnswer;
        } else {
            return data.constants.maxPointsPerAnswer * gameModeManager.currentGameModeProfile.scoreWeightFactor;
        }
    };


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
        if (!dataManager.countrySizesAvailable()) {
            print('[GRM] startRound - still waiting for async countrySize query');
            setTimeout(gameRoundManager.startRound, 1000);
            return;
        }

        gameRoundManager.currentGameState = data.gameState.guessing;
        print("\n======= Round " + gameModeManager.currentRound + " =======");

        var countryCode = null;
        if (gameModeManager.currentGameModeProfile.limitedCountry == null) {
            countryCode = dataManager.getRandomCountryCode(gameModeManager.currentGameModeProfile.minTotalCities, gameModeManager.currentGameModeProfile.minCountryPopulation);
        } else {
            countryCode = gameModeManager.currentGameModeProfile.limitedCountry;
        }
        var minPopProfile = gameModeManager.currentGameModeProfile.minPopulationDefault;
        var minPopCountry = dataManager.applyPopulationFact(countryCode, minPopProfile);
        print('[GRM] country: ' + countryCode + ', minPop: ' + minPopProfile + '->' + minPopCountry );

        renderManager.clearMarkers();
        var userList = userManager.getUserList();
        for(var i = 0; i < userList.length; i++){
            userList[i].lastAnswerGiven = null;
        }
        renderManager.refreshBottomScoreboard();
        renderManager.showMidScreenMessage('- Round ' + gameModeManager.currentRound + ' -', 0.6 );

        var geoObjects = dataManager.getGeoObjects(
            gameModeManager.currentGameMode.geoObjType, countryCode ,
            gameModeManager.currentGameModeProfile.multipleChoiceMode ? data.constants.numberOfChoices : 1, minPopCountry
            , 10);

        gameRoundManager.goalGeoObject = geoObjects[0];
        var goalPos = new google.maps.LatLng(gameRoundManager.goalGeoObject.latitude, gameRoundManager.goalGeoObject.longitude);
        _placeGoalMarker(goalPos);
        var zoom = dataManager.getZoomLevelForCountry(gameRoundManager.goalGeoObject.countryCode);
        var bounds = dataManager.getBoundsForCountry(gameRoundManager.goalGeoObject.countryCode);
        //gameModeManager.getMap().setCenter(goalPos);
        gameModeManager.getMap().fitBounds(bounds);

        gameModeManager.getMap().setZoom(zoom);


        var geoNameChoices = dataManager.getCityNameArray(geoObjects);
        console.debug('[geoObjects] ' + geoObjects);
        print('[geoNameChoices] ' + geoNameChoices);


        var jsonData = {"event_type": data.eventType.startGame,
            "multipleChoiceMode": gameModeManager.currentGameModeProfile.multipleChoiceMode ,
            "started": true,
            "roundNumber": gameModeManager.currentRound,
            "maxRounds": gameModeManager.maxRounds,
            "timerRound" : gameModeManager.currentGameModeProfile.timePerRoundSec,
            "choices" : geoNameChoices};
        eventManager.broadcast(data.channelName.game, jsonData);

        gameRoundManager.roundTimer = executionManager.execDelayed(gameModeManager.currentGameModeProfile.timePerRoundSec*1000, gameRoundManager.endRound);
        gameRoundManager.roundTimerAnim = renderManager.playTimerAnimationWithRoundDisplay(gameModeManager.currentGameModeProfile.timePerRoundSec, gameModeManager.currentRound, gameModeManager.maxRounds );
    };



    grm.endRound = function(){
        gameRoundManager.currentGameState = data.gameState.evaluating;
        print('-> Round ' + gameModeManager.currentRound +  ' ended.' );

        renderManager.showMidScreenMessage('Answer: ' + gameRoundManager.goalGeoObject.name, gameRoundManager.roundEvaluationTimeSec-3 );
        var userList = userManager.getUserList();
        for(var i = 0; i < userList.length; i++){
            var user = userList[i];
            user.maxPointsInCurrentGame += gameRoundManager.getMaxPointsPerAnswer();
            if (user.lastAnswerGiven != null) { // ATTENTION - IF NO ANSWER GIVEN lastAnswerGiven = null !
                user.pointsInCurrentGame += user.lastAnswerGiven.points;
                dataManager.persistHighScoreList(user.mac,user.name,user.lastAnswerGiven.points, gameRoundManager.getMaxPointsPerAnswer());
                if (user.lastAnswerGiven.geoObject != null) {
                    renderManager.placeUserMarkerOnMap(user, user.lastAnswerGiven.geoObject.position);
                }
            } else {
                dataManager.persistHighScoreList(user.mac,user.name,0, gameRoundManager.getMaxPointsPerAnswer());
            }
            var jsonData = {
                "event_type":"round_ended",
                "ended": true,
                "correctAnswer": gameRoundManager.goalGeoObject.name,
                "userAnswer": user.lastAnswerGiven?user.lastAnswerGiven.guessedName:null,
                "answerDistance": user.lastAnswerGiven?user.lastAnswerGiven.distanceToGoalKm:null,
                "pointsEarned": user.lastAnswerGiven?user.lastAnswerGiven.points:null
            };
            eventManager.send(user.senderId, data.channelName.game, jsonData);
        }
        userManager.sortUsersByScore();
        renderManager.refreshBottomScoreboard();
        gameRoundManager.nextRound();
    };



    grm.nextRound = function(){
        // check if max rounds reached
        if(gameModeManager.currentRound === gameModeManager.maxRounds) {
            // end game mode
            print('[GRM] maxRounds reached: ' + gameModeManager.maxRounds);
            var jsonData = {"ended": true, "event_type":"game_ended"};
            eventManager.broadcast(data.channelName.game, jsonData);
            // show roundHighscore >> globalHighscore >> mainMenu
            gameRoundManager.viewHighScoreTimer = executionManager.execDelayed((gameRoundManager.roundEvaluationTimeSec-2)*1000, renderManager.loadCurrentGameHighScoreList);
            gameRoundManager.viewGlobalHighScoreTimer = executionManager.execDelayed((gameRoundManager.roundEvaluationTimeSec+10)*1000, renderManager.loadGlobalHighScoreList);
            gameRoundManager.viewMainMenuTimer = executionManager.execDelayed((gameRoundManager.roundEvaluationTimeSec+20)*1000, renderManager.loadMainMenu);
        } else {
            // next round...
            gameModeManager.currentRound = gameModeManager.currentRound + 1;
            gameRoundManager.gameEvalTimer = executionManager.execDelayed(gameRoundManager.roundEvaluationTimeSec*1000, gameRoundManager.startRound);
        }
    };



    function _getDistance(p1, p2) {
        return google.maps.geometry.spherical.computeDistanceBetween (p1, p2); // returns the distance in meter
    }



    grm.choseAnswer = function(userMac, answer){
        if (gameRoundManager.currentGameState != data.gameState.guessing) {
            return;
        }
        var cleanedAnswerString = answer.replace(/([^a-zäöü\s]+)/gi, ' ');
        cleanedAnswerString = cleanedAnswerString.substring(0, data.constants.maxAnswerLength);
        var user = userManager.getUserByMac(userMac);

        var locationType = "locality"; //TODO river etc
        var geoObject = null;

        gameModeManager.getGeocoder().geocode({
            address: cleanedAnswerString,
            region: gameRoundManager.goalGeoObject.countryCode
        }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                //console.debug(results[0]);
                var isValidLocality = false;
                for (var a=0; a<results[0].types.length; a++) {
                    if (results[0].types[a] == locationType) {
                        isValidLocality = true;
                        break;
                    }
                }
                if (isValidLocality) {
                    var pos = results[0].geometry.location;
                    var countryCode = null;
                    //finding country code if present:
                    for (var i=0; i<results[0].address_components.length; i++) {
                        for (var b=0;b<results[0].address_components[i].types.length;b++) {
                            if (results[0].address_components[i].types[b] == "country") {
                                countryCode = results[0].address_components[i].short_name;
                                break;
                            }
                        }
                    }
                    geoObject = new dataManager.GeoObject(0, cleanedAnswerString, pos.k, pos.B, countryCode, 0, 0, null);
                } else {
                    print('[GRM] no valid '+locationType+' for: '+cleanedAnswerString);
                }
            } else {
                print('[GRM] could not be geocoded: '+cleanedAnswerString+" (" + status +')');
            }
            _evaluateAnswer(user, cleanedAnswerString, geoObject);
        });
    };


    function _evaluateAnswer(user, cleanedAnswerString, answerGeoObject){
        var points = 0;
        var distInKm = 10000000000;
        if (answerGeoObject != null) {
            distInKm = _getDistance(answerGeoObject.position, gameRoundManager.goalGeoObject.position) / 1000;
        }
        if (gameModeManager.currentGameModeProfile.multipleChoiceMode) {
            if (cleanedAnswerString == gameRoundManager.goalGeoObject.name) {
                points = gameRoundManager.getMaxPointsPerAnswer();
                print("[GRM] " + user.name + " got " + points + " points for the RIGHT answer (" + cleanedAnswerString + ")");
            } else {
                print("[GRM] " + user.name + " got " + points + " points for the WRONG answer (" + cleanedAnswerString + ")");
            }
        } else {
            if (answerGeoObject != null) {
                points = Math.floor(Math.max(0,Math.min(data.constants.maxPointsPerAnswer,(data.constants.maxDistanceErrorKm+100-distInKm)/100))) * gameModeManager.currentGameModeProfile.scoreWeightFactor;
                print("[GRM] " + user.name + " got " + points + " points for " + cleanedAnswerString + ' (' + answerGeoObject.countryCode + ', '+Math.floor(distInKm)+'km)');
            } else {
                //TODO send message to android app: geo-obj not found - retype your answer
            }
        }
        user.lastAnswerGiven = new grm.Answer(cleanedAnswerString,distInKm,answerGeoObject,points);
        renderManager.refreshBottomScoreboard();
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
                //map: gameModeManager.getMap(),
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 5,
                    strokeColor: '#B42D2D',
                    strokeWeight: 3,
                    strokeOpacity: 1.0,
                    fillColor: '#ffffff',
                    fillOpacity: 0.4
                }
            });

        } else {
            gameModeManager.goalMarker.setPosition(position);
        }
        gameModeManager.goalMarker.setMap(gameModeManager.getMap());
    }


}(this.gameRoundManager = this.gameRoundManager || {}));