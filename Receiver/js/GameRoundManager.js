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
    var lastRoundCountryCode = 'menuMap';

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

        print("\n======= Round " + gameModeManager.currentRound + " =======");

        gameRoundManager.currentGameState = data.gameState.guessing;

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

        var geoObjects = dataManager.getGeoObjects(
            gameModeManager.currentGameMode.geoObjType, countryCode ,
            gameModeManager.currentGameModeProfile.multipleChoiceMode ? data.constants.numberOfChoices : 1, minPopCountry
            , 10);

        gameRoundManager.goalGeoObject = geoObjects[0];

        var geoNameChoices = dataManager.getCityNameArray(geoObjects);
        console.debug('[geoObjects] ' + geoObjects);
        print('[geoNameChoices] ' + geoNameChoices);

        var bounds = dataManager.getBoundsForCountry(gameRoundManager.goalGeoObject.countryCode);
        //var zoom = dataManager.getZoomLevelForCountry(bounds); //USE bounds OR zoom+center !

        var jsonData = {"event_type": data.eventType.startGame,
            "multipleChoiceMode": gameModeManager.currentGameModeProfile.multipleChoiceMode ,
            "pointingMode": gameModeManager.currentGameModeProfile.pointingMode ,
            "started": true,
            "roundNumber": gameModeManager.currentRound,
            "maxRounds": gameModeManager.maxRounds,
            "timerRound" : gameModeManager.currentGameModeProfile.timePerRoundSec,
            "bounds" : bounds.toString(),
            "styledMapOptions" : gameModeManager.styledMapOptions,
            "mapTypeTemplate" : gameModeManager.currentGameModeProfile.mapOption.mapType,
            "choices" : geoNameChoices};

        var goalPos = new google.maps.LatLng(gameRoundManager.goalGeoObject.latitude, gameRoundManager.goalGeoObject.longitude);


        if (gameModeManager.currentGameModeProfile.pointingMode == false) {
            _placeGoalMarker(goalPos);
        } else {
            if (gameModeManager.goalMarker != null) {
                gameModeManager.goalMarker.setMap(null);
            }
        }



        //gameModeManager.getMap().setCenter(goalPos);
        //gameModeManager.getMap().setZoom(zoom);

        gameModeManager.getMap().fitBounds(bounds);

        renderManager.displayRoundNumber(gameModeManager.currentRound, gameModeManager.maxRounds);

        var onMapLoaded = function() {
            var constMobileAppBroadcastDelay;
            if (gameModeManager.currentGameModeProfile.pointingMode == false) {
                constMobileAppBroadcastDelay = 1000;
                renderManager.showMidScreenMessage('- Round ' + gameModeManager.currentRound + ' -', 0.6 );
            } else {
                constMobileAppBroadcastDelay = 0;
                renderManager.showMidScreenMessage('Where is ' + gameRoundManager.goalGeoObject.name + ' ?', gameModeManager.currentGameModeProfile.timePerRoundSec*0.8 );
            }

            gameRoundManager.roundTimer = executionManager.execDelayed(gameModeManager.currentGameModeProfile.timePerRoundSec*1000, gameRoundManager.endRound);
            gameRoundManager.roundTimerAnim = renderManager.playTimerAnimationWithRoundDisplay(gameModeManager.currentGameModeProfile.timePerRoundSec, gameModeManager.currentRound, gameModeManager.maxRounds );
            executionManager.execDelayed(constMobileAppBroadcastDelay, function(){
                eventManager.broadcast(data.channelName.game, jsonData);
            });
        };

        if (gameRoundManager.lastRoundCountryCode === countryCode) {
            onMapLoaded();
        } else {
            google.maps.event.addListenerOnce(map, 'idle', onMapLoaded);
        }


        gameRoundManager.lastRoundCountryCode = countryCode;
    };



    grm.endRound = function(){
        gameRoundManager.currentGameState = data.gameState.evaluating;
        print('-> Round ' + gameModeManager.currentRound +  ' ended.' );


        if (gameModeManager.currentGameModeProfile.pointingMode == false) {
            renderManager.showMidScreenMessage('Answer: ' + gameRoundManager.goalGeoObject.name, gameRoundManager.roundEvaluationTimeSec-3 );
        } else {
            _placeGoalMarker(gameRoundManager.goalGeoObject.position);
        }

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
        console.log("[GRM] DISTANCE: "+p1+ " :" +p2);
        return google.maps.geometry.spherical.computeDistanceBetween(p1, p2); // returns the distance in meter
    }

    function _latLongStringToPos(answerString) {
        print(answerString);
        var answer = JSON.parse(answerString);
        //INPUT:    '{longitude:13.41, latitude:52.52}'
        var lat, long;

        if(answer.hasOwnProperty('longitude')){
            long = answer['longitude'];
        } else console.error("cant parse longitude from: " + answer );

        if(answer.hasOwnProperty('latitude')){
            lat = answer['latitude'];
        } else console.error("cant parse latitude from: " + answer );

        return new google.maps.LatLng(lat, long);
    }


    grm.choseAnswer = function(userMac, answer){
        if (gameRoundManager.currentGameState != data.gameState.guessing) {
            return;
        }
        var user = userManager.getUserByMac(userMac);


        // STRING -> LAT LONG ANSWER
        if (gameModeManager.currentGameModeProfile.pointingMode){
            var pos = _latLongStringToPos(answer);
            var answerGeoObject = new dataManager.GeoObject(0, "", pos.lat(), pos.lng(), null, 0, 0, null, null, null, null);
            var distInKm = _getDistance(answerGeoObject.position, gameRoundManager.goalGeoObject.position) / 1000;
            answerGeoObject.name = Math.round(distInKm) + 'km';
            _evaluateAnswer(user, answerGeoObject.name, answerGeoObject);
            return;
        }


        // STRING -> CITYNAME ANSWER
        var cleanedAnswerString = answer.replace(/([^a-zäöü\s]+)/gi, ' ');
        cleanedAnswerString = cleanedAnswerString.substring(0, data.constants.maxAnswerLength);

        if (gameModeManager.currentGameMode.geoObjType == data.geoObjType.city) {
            var locationType = "locality"; //TODO river etc
        } else {
            var locationType = "country"
        }
        var geoObject = null;
        if (cleanedAnswerString === gameRoundManager.goalGeoObject.name) {
            console.debug("Answer is identical to goal geo object, no need to geocode this.");
            _evaluateAnswer(user, cleanedAnswerString, gameRoundManager.goalGeoObject);
        } else {
            gameModeManager.getGeocoder().geocode({
                address: cleanedAnswerString,
                region: gameRoundManager.goalGeoObject.countryCode
            }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    //console.debug(results[0]);
                    var isValidLocality = false;
                    for (var a = 0; a < results[0].types.length; a++) {
                        if (results[0].types[a] == locationType) {
                            isValidLocality = true;
                            break;
                        }
                    }
                    if (isValidLocality) {
                        var pos = results[0].geometry.location;
                        var countryCode = null;
                        //finding country code if present:
                        for (var i = 0; i < results[0].address_components.length; i++) {
                            for (var b = 0; b < results[0].address_components[i].types.length; b++) {
                                if (results[0].address_components[i].types[b] == "country") {
                                    countryCode = results[0].address_components[i].short_name;
                                    break;
                                }
                            }
                        }

                        var bounds = results[0].geometry.bounds;
                        var viewport = results[0].geometry.viewport;
                        geoObject = new dataManager.GeoObject(0, cleanedAnswerString, pos.lat(), pos.lng(), countryCode, 0, 0, null, viewport, bounds, locationType);
                    } else {
                        print('[GRM] no valid ' + locationType + ' for: ' + cleanedAnswerString);
                    }
                } else {
                    print('[GRM] could not be geocoded: ' + cleanedAnswerString + " (" + status + ')');
                }

                _evaluateAnswer(user, cleanedAnswerString, geoObject);
            });
        }
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