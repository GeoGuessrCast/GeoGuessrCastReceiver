(function(rm){

    var userMarkers = []; //Google Map Marker
    var userLines = []; //Google Map polyLine

    var currentTimerPosition = 0;
    var numberSteps = 20;
    var percentPerStep = 5;
    var diffusePartPercet = 3;
    rm.consoleOutPutHidden = false;



    rm.placeUserMarkerOnMap = function(user, position){
        var marker = new google.maps.Marker({
            position: position,
            map: gameModeManager.getMap(),
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 4,
                strokeColor: '#ffffff',
                strokeWeight: 1,
                strokeOpacity: 1.0,
                fillColor: user.color,
                fillOpacity: 1
            }
        });
        userMarkers.push(marker);
        var line = new google.maps.Polyline({
            path: [gameRoundManager.goalGeoObject.position, position],
            map: gameModeManager.getMap(),
            strokeColor: user.color,
            strokeWeight: 1,
            strokeOpacity: 1.0
        });
        userLines.push(line);
    };

    rm.clearMarkers = function(){
        userMarkers.map(function (marker) {
            marker.setMap(null);
        });
        userMarkers = [];
        userLines.map(function (line) {
            line.setMap(null);
        });
        userLines = [];
    };


    rm.playTimerAnimationWithRoundDisplay = function(animationDurationSec, currentRound, maxRounds) {
        currentTimerPosition = 0;
        renderManager.incTimerBy();
        $('#roundDisplayAndTimer')
            .show()
            .html('Round ' + currentRound + '/' + maxRounds);

        var aniMs = parseInt(animationDurationSec)*1000;
        /*
         30 s
         30000 ms
         schrittlaenge 100? 5er Schritte
         */
        return executionManager.execPeriodically(aniMs/numberSteps, numberSteps, renderManager.incTimerBy ,null );
        //return executionManager.execDelayed(aniMs, renderManager.incTimerBy ); ....no crash with this
    };

    rm.incTimerBy = function() {
        var counter = (currentTimerPosition + percentPerStep);
        var counter2=parseInt(counter)+diffusePartPercet;
        currentTimerPosition = parseInt(currentTimerPosition) + parseInt(percentPerStep);
        $('#roundDisplayAndTimer').css('background',
            'linear-gradient(to right, rgba(222, 45, 45, 0.90) '+counter+'%, rgba(87, 87, 87, 0.70) '+counter2+'%, rgba(218, 218, 218, 0.70))');
    };

    rm.hideTopRightRoundTimer = function() {
        $('#roundDisplayAndTimer').hide();
    };



    rm.applyGameMenuMapstyle = function() {
        window.map.setCenter(new google.maps.LatLng(45.74167213456433, 38.26884827734375));
        window.map.setZoom(2);
        renderManager.applyMapOptions(
            {
                gameModeName: 'Menu Screen',
                id: -1,
                geoObjType: 0,
                iconUrl: 'images/snowyMountain_outline.png'
            },
            {
                profileName: 'Menu Background Map',
                id: -1,
                limitedCountry: null,
                multipleChoiceMode: false,
                pointingMode: false,
                minPopulationDefault: 0,
                timePerRoundSec: 1000,
                mapOption: {
                    mapType : google.maps.MapTypeId.TERRAIN, // ROADMAP || SATELLITE || HYBRID || TERRAIN
                    borders: false,
                    roads: false,
                    showCityNames: false,
                    showRiverNames: false,
                    showCountryNames: false,
                    renderOptions: {
                        globalHue: '#ff2b00',
                        globalGamma: 0.2,
                        globalSaturation: -99,
                        waterColor: '#100000',
                        borderColor: '#ffffff',
                        borderWeight: 0.3
                    }

                }
            }
        );
    };

    rm.applyMapOptions = function(gameModeObject, profileObject){

        var cityNameVis = gameModeObject.geoObjType==data.geoObjType.city || profileObject.mapOption.showCityNames==false ? "off" : "on";
        var riverNameVis = gameModeObject.geoObjType==data.geoObjType.river || profileObject.mapOption.showRiverNames==false ? "off" : "on";
        var countryNameVis = gameModeObject.geoObjType==data.geoObjType.country || profileObject.mapOption.showCountryNames==false ? "off" : "simplified";

        var mapTypeTemplate = profileObject.mapOption.mapType;
        var countryBorderVis = profileObject.mapOption.borders ? "on" : "off";
        var roadVis = profileObject.mapOption.roads ? "simplified" : "off";

        // basic settings
        var featureOpts = [
            {
                "stylers": [
                    { "visibility": "off" }
                ]
            },{
                "featureType": "administrative.country",
                "elementType": "geometry",
                "stylers": [
                    { "visibility": countryBorderVis }
                ]
            },{
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                    { "visibility": "on" }
                ]
            },{
                "featureType": "landscape",
                "elementType": "geometry",
                "stylers": [
                    { "visibility": "on" }
                ]
            },{
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [
                    { "saturation": -33 },
                    { "gamma": 3.6 },
                    { "visibility": roadVis }
                ]
            },{
                "featureType": "administrative.country",
                "elementType": "labels.text",
                "stylers": [
                    { "visibility": countryNameVis },
                    { "gamma": 3.8 }
                ]
            },{
                "featureType": "water",
                "elementType": "labels",
                "stylers": [
                    { "visibility": riverNameVis }
                ]
            },{
                "featureType": "administrative.locality",
                "elementType": "labels",
                "stylers": [
                    { "visibility": cityNameVis }
                ]
            }
        ];

        //optional render settings
        if (profileObject.mapOption.hasOwnProperty('renderOptions')) {
            var renderOpts = profileObject.mapOption.renderOptions;

            if (renderOpts.hasOwnProperty('globalHue')) {
                featureOpts[0]["stylers"].push({hue: renderOpts['globalHue']});
            }
            if (renderOpts.hasOwnProperty('globalGamma')) {
                featureOpts[0]["stylers"].push({gamma: renderOpts['globalGamma']});
            }
            if (renderOpts.hasOwnProperty('globalSaturation')) {
                featureOpts[0]["stylers"].push({saturation: renderOpts['globalSaturation']});
            }
            if (renderOpts.hasOwnProperty('waterColor')) {
                featureOpts[2]["stylers"].push({color: renderOpts['waterColor']});
            }
            if (renderOpts.hasOwnProperty('borderColor')) {
                featureOpts[1]["stylers"].push({color: renderOpts['borderColor']});
            }
            if (renderOpts.hasOwnProperty('borderWeight')) {
                featureOpts[1]["stylers"].push({weight: renderOpts['borderWeight']});
            }
        }

        map.setMapTypeId(mapTypeTemplate);
        map.setOptions({styles: featureOpts});
    };

    rm.loadMainMenu = function(){
        gameRoundManager.cancelGame();
        renderManager.applyGameMenuMapstyle();

        $('#gameOverlay').load('templates/MainMenu.html', function (content) {
            $(this).html(content);
            var gameModeList = $('#gameModeList');
            for (var g = 0; g < data.gameMode.length; g++){
                gameModeList.append('<li class="menuButton noLinebreak" onclick="renderManager.loadGameProfileMenu(data.gameMode['+g+']);">'+data.gameMode[g].gameModeName+'</li>');
            }
            renderManager.rebuildUserList();
        });
    };

    rm.loadGameProfileMenu = function(selectedGameModeObject){
        gameRoundManager.cancelGame();
        gameModeManager.setGameMode(selectedGameModeObject);

        $('#gameOverlay').load('templates/GameProfileMenu.html', function (content) {
            $(this).html(content);
            var profileList = $('#profileList');
            for (var p = 0; p < data.gameModeProfile.length; p++){
                profileList.append('<li class="menuButton noLinebreak" onclick="gameModeManager.startGame(data.gameModeProfile['+p+']);">'+data.gameModeProfile[p].profileName+'</li>');
            }
            renderManager.rebuildUserList();
        });
    };


    /**
     * rebuilds/updates #mainMenuUserList
     */
    rm.rebuildUserList = function() {
        var userCssClass;
        var userList = userManager.getUserList();
        var userLength = userList.length;
        var mainMenuUserList = $('#mainMenuUserList');
        mainMenuUserList.find('ul').html('');
        for(var i = 0; i < userLength; i++){
            if (userList[i].admin) {
                userCssClass = 'admin';
            } else {
                userCssClass = 'user';
            }
            //$('#mainMenuUserList').find('ul').append('<li style="color:' + userList[i].color + '" class="' + userCssClass + '" id="'+userList[i].mac+'">'+userList[i].name+'</li>');
            mainMenuUserList.find('ul').append('<li class="noLinebreak ' + userCssClass + '" id="'+userList[i].mac+'">'+userList[i].name+'</li>');
        }
    };


    rm.refreshBottomScoreboard = function() {
        var userCssClass;
        var userList = userManager.getUserList();
        var bottomScoreboard = $('#bottomScoreboard');
        var isGuessingState = (gameRoundManager.currentGameState == data.gameState.guessing);

        bottomScoreboard.html('');

        for(var i = 0; i < userList.length; i++){
            var iconCssClass = 'noIcon';
            var color = 'rgb(180,180,180)';
            var user = userList[i];
            var userMacCleaned = user.mac.replace(/([^a-z0-9]+)/gi, '_');
            if (user.admin) {
                userCssClass = 'admin';
            } else {
                userCssClass = 'user';
            }
            var userAnswerCity;
            var userAnswer = user.lastAnswerGiven;
            if (isGuessingState) {
                if (userAnswer == null) {
                    iconCssClass = 'waitingIcon'; //TODO
                } else {
                    iconCssClass = 'readyIcon';
                }
                userAnswerCity = '&nbsp&nbsp&nbsp&nbsp';
            } else {
                if (userAnswer == null) {
                    userAnswerCity = '(no answer)';
                } else {
                    userAnswerCity = userAnswer.guessedName;
                    var answerWorthFact = userAnswer.points/data.constants.maxPointsPerAnswer; // 0=worst answer, 1=best
                    var red = Math.floor((1-answerWorthFact)*160);
                    var green = Math.floor(answerWorthFact*160);
                    color = 'rgb(' + red + ',' + green + ',0)';
                }
            }

            bottomScoreboard
                .append('<span><div><span class="userStates" id="userState_' + userMacCleaned + '">' + userAnswerCity + '</span></div><span class="'
                + userCssClass + ' noLinebreak userName" style="color:' + user.color + '">' + user.name + ': </span><span class="score">' + user.pointsInCurrentGame
                + '</span></span>');

            var userStateDiv = $('#userState_'+userMacCleaned);

            userStateDiv.css('color', color);
            userStateDiv.removeClass('waitingIcon');
            userStateDiv.removeClass('readyIcon');
            userStateDiv.removeClass('noIcon');
            userStateDiv.addClass(iconCssClass);
        }
    };


    rm.showMidScreenMessage = function(message, holdTimeSec){
        $('#midScreenMessage')
            .hide()
            .html(message)
            .fadeIn(data.constants.midScreenMessageFadeInTimeMs, function () {
            executionManager.execDelayed(holdTimeSec*1000,renderManager.clearMidScreenMessage);
        });
    };

    rm.setMidScreenMessage = function(message){
        $('#midScreenMessage')
            .hide()
            .html(message)
            .fadeIn(data.constants.midScreenMessageFadeInTimeMs);
    };

    rm.clearMidScreenMessage = function(){
        $('#midScreenMessage').fadeOut(data.constants.midScreenMessageFadeOutTimeMs, function () {
            $(this).empty();
        });
    };


    rm.hideConsole = function(hide) {
        if (hide) {
            $('#testConsole').hide();
        } else {
            $('#testConsole').show();
        }
        renderManager.hideConsoleOutput(hide);
    };

    rm.hideConsoleOutput = function(hide) {
        if (hide) {
            renderManager.consoleOutPutHidden = true;
            $('#testConsoleOutput').hide();
        } else {
            renderManager.consoleOutPutHidden = false;
            $('#testConsoleOutput').show();
        }
    };

    rm.toggleConsoleOutput = function() {
        renderManager.consoleOutPutHidden = !renderManager.consoleOutPutHidden;
        renderManager.hideConsoleOutput(renderManager.consoleOutPutHidden);
    };


}(this.renderManager = this.renderManager || {}));
