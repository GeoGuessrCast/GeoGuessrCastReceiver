(function(rm){

    var userMarkers = []; //Google Map Marker
    var userLines = []; //Google Map polyLine

    var currentTimerPosition = 0;
    var numberSteps = 20;
    var percentPerStep = 5;
    var diffusePartPercet = 3;
    rm.consoleOutPutHidden = false;

    rm.getUserMarkers = function(){
        return userMarkers;
    };

    rm.placeUserMarkerOnMap = function(user, position){
        var marker = new google.maps.Marker({
            position: position,
            map: gameModeManager.getMap(),
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                //path: 'M533 1254 c-139 -50 -213 -221 -169 -394 18 -74 64 -168 107 -219 34 -41 38 -88 12 -120 -10 -11 -55 -36 -99 -55 -198 -83 -284 -166 -284 -272 0 -42 4 -51 40 -85 74 -71 217 -99 500 -99 286 0 432 29 503 101 38 38 39 41 35 98 -3 45 -11 68 -32 96 -39 50 -144 118 -251 160 -49 20 -96 44 -102 53 -20 25 -15 76 11 113 90 125 121 211 121 334 0 73 -5 100 -24 143 -29 64 -94 124 -158 146 -57 20 -154 19 -210 0z',
                scale: 5,
                strokeColor: '#ffffff',
                strokeWeight: 1,
                strokeOpacity: 1.0,
                fillColor: user.getColor(),
                fillOpacity: 1
            }
        });

        userMarkers.push(marker);
        var line = new google.maps.Polyline({
            path: [gameRoundManager.goalGeoObject.position, position],
            map: gameModeManager.getMap(),
            strokeColor: user.getColor(),
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

    rm.displayRoundNumber = function(currentRound, maxRounds) {
        $('#roundDisplayAndTimer')
            .show()
            .html('Round ' + currentRound + '/' + maxRounds);
    };

    rm.playTimerAnimationWithRoundDisplay = function(animationDurationSec, currentRound, maxRounds) {
        currentTimerPosition = 0;
        renderManager.incTimerBy();
        renderManager.displayRoundNumber(currentRound, maxRounds);

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
        var mapTypeTemplate = google.maps.MapTypeId.TERRAIN;  // ROADMAP || SATELLITE || HYBRID || TERRAIN
        window.map.setCenter(new google.maps.LatLng(45.74167213456433, 38.26884827734375));
        window.map.setZoom(2);
        var styledMapOptions = renderManager.generateStyledMapOptions(
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
                    mapType : mapTypeTemplate,
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
        renderManager.applyMapOptions(mapTypeTemplate, styledMapOptions);
    };

    rm.applyMapOptions = function(mapTypeTemplate, styledMapOptions){
        map.setMapTypeId(mapTypeTemplate);
        map.setOptions({styles: styledMapOptions});
    };
    
    rm.generateStyledMapOptions = function(gameModeObject, profileObject){

        var cityNameVis = gameModeObject.geoObjType==data.geoObjType.city || profileObject.mapOption.showCityNames==false ? "off" : "on";
        var riverNameVis = gameModeObject.geoObjType==data.geoObjType.river || profileObject.mapOption.showRiverNames==false ? "off" : "on";
        var countryNameVis = gameModeObject.geoObjType==data.geoObjType.country || profileObject.mapOption.showCountryNames==false ? "off" : "simplified";

        var countryBorderVis = profileObject.mapOption.borders ? "on" : "off";
        var roadVis = profileObject.mapOption.roads ? "simplified" : "off";

        // basic settings
        var styledMapOptions = [
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
                styledMapOptions[0]["stylers"].push({hue: renderOpts['globalHue']});
            }
            if (renderOpts.hasOwnProperty('globalGamma')) {
                styledMapOptions[0]["stylers"].push({gamma: renderOpts['globalGamma']});
            }
            if (renderOpts.hasOwnProperty('globalSaturation')) {
                styledMapOptions[0]["stylers"].push({saturation: renderOpts['globalSaturation']});
            }
            if (renderOpts.hasOwnProperty('waterColor')) {
                styledMapOptions[2]["stylers"].push({color: renderOpts['waterColor']});
            }
            if (renderOpts.hasOwnProperty('borderColor')) {
                styledMapOptions[1]["stylers"].push({color: renderOpts['borderColor']});
            }
            if (renderOpts.hasOwnProperty('borderWeight')) {
                styledMapOptions[1]["stylers"].push({weight: renderOpts['borderWeight']});
            }
        }

        return styledMapOptions;
    };

    rm.loadMainMenu = function(){
        gameModeManager.cancelGame();
        renderManager.applyGameMenuMapstyle();

        $('#gameOverlay').load('templates/MainMenu.html', function (content) {
            $(this).html(content);
            var gameModeList = $('#gameModeList');
            for (var g = 0; g < data.gameMode.length; g++){
                gameModeList.append('<li class="menuButton noLinebreak" onclick="renderManager.loadGameProfileMenu(data.gameMode['+g+']);">'+data.gameMode[g].gameModeName+'</li>');
            }
            renderManager.rebuildUserList();


            //var xhReq = new XMLHttpRequest();
            //xhReq.open("HEAD", "/GeoGuessrCastReceiver/Receiver/js/GameRoundManager.js", false);
            //xhReq.send(null);
            //var lastModified = xhReq.getResponseHeader("Last-Modified");
            //$('#versionDisplay').html(lastModified);
        });
    };

    rm.loadGameProfileMenu = function(selectedGameModeObject){
        gameModeManager.cancelGame();
        gameModeManager.setGameMode(selectedGameModeObject);

        $('#gameOverlay').load('templates/GameProfileMenu.html', function (content) {
            $(this).html(content);
            var profileList = $('#profileList');
            for (var p = 0; p < data.gameModeProfile.length; p++){
                profileList.append('<li class="menuButton noLinebreak" onclick="renderManager.loadHardnessMenu(data.gameModeProfile['+p+']);">'+data.gameModeProfile[p].profileName+'</li>');
            }
            renderManager.rebuildUserList();
        });
        $('#profileMenuHeading').html(selectedGameModeObject.gameModeName);
        $('.headers').addClass(selectedGameModeObject.iconCssClass);
    };

    rm.loadHardnessMenu = function(selectedGameModeProfileObject){
        gameModeManager.setGameModeProfile(selectedGameModeProfileObject);

        $('#gameOverlay').load('templates/GameHardnessMenu.html', function (content) {
            $(this).html(content);
            if (typeof(cast) == 'undefined') {
                $('#localHardnessTest').show();

            }
            renderManager.rebuildUserList();
        });
        $('#hardnessMenuHeading').html(gameModeManager.currentGameMode.gameModeName + '/' + selectedGameModeProfileObject.profileName);
    };

    rm.loadGlobalHighScoreList = function(){
        renderManager.loadHighScoreList(dataManager.getHighScoreList(data.constants.userMaxScoreTresholdForHighScoreList), 'Global HighScore');
    };

    rm.loadCurrentGameHighScoreList = function(){
        renderManager.loadHighScoreList(dataManager.createHighScoreListFromCurentUsers(data.constants.userMaxScoreTresholdForHighScoreList), 'Current Game HighScore');
    };

    rm.loadHighScoreList = function(highScoreList, heading){
        renderManager.applyGameMenuMapstyle();

        $('#gameOverlay').load('templates/HighScore.html', function (content) {
            $(this).html(content);
            $('#highScoreHeading').html(heading);
            $('#innerHighScoreHeading').html(heading);

            //console.log(highScoreList);
            if (highScoreList == null) return;

            var highScoreContainer = $('#highScoreList');
            //highScoreContainer.html('');
            for(var i = 0; i<highScoreList.length; i++){
                    highScoreContainer.append('<tr style="color: hsl(150, ' + highScoreList[i].pointsPercent + '%, 30%)"><td class="noLinebreak userName leftColumn">'
                    + highScoreList[i].name + '</td><td class="noLinebreak rigthColumn">'
                    + highScoreList[i].pointsPercent + ' %</td></tr>');
            }


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
            var user = userList[i];
            var userMacCleaned = user.mac.replace(/([^a-z0-9]+)/gi, '_');

            if (userList[i].admin) {
                userCssClass = 'admin';
            } else {
                userCssClass = 'user';
            }
            mainMenuUserList.find('ul').append('<li class="noLinebreak userName ' + userCssClass + '" id="userName_'
                + userMacCleaned + '">' + user.name + '</li>');
            var userNameContainer = $('#userName_'+userMacCleaned);
            userNameContainer.css('color', user.getColor());
            userNameContainer.css('background-image', 'url(data:image/svg+xml;base64,' + renderManager.createUserIconBase64(user) + ')');

        }
    };

    rm.createUserIconBase64 = function(user) {
        var userSvg = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128.000000 128.000000" preserveAspectRatio="xMidYMid meet">'
            + '<g transform="translate(0.0,128.0) scale(0.1,-0.1)" fill="' + user.getColor() + '" stroke="none">'
            + '<path d="M533 1254 c-139 -50 -213 -221 -169 -394 18 -74 64 -168 107 -219 34 -41 38 -88 12 -120 -10 -11 -55 -36 -99 -55 -198 -83 -284 -166 -284 -272 0 -42 4 -51 40 -85 74 -71 217 -99 500 -99 286 0 432 29 503 101 38 38 39 41 35 98 -3 45 -11 68 -32 96 -39 50 -144 118 -251 160 -49 20 -96 44 -102 53 -20 25 -15 76 11 113 90 125 121 211 121 334 0 73 -5 100 -24 143 -29 64 -94 124 -158 146 -57 20 -154 19 -210 0z"/>'
            + '</g></svg>';
        return window.btoa(userSvg);
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
            var userPoints = Math.round(user.pointsInCurrentGame);
            var aspectRatioNameCorrection = window.innerWidth / (window.innerHeight * 1.0) - 1.0;
            var trimmedName = user.name.substring(0, Math.round(120*aspectRatioNameCorrection/userManager.getNumberOfUsers()));
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
                    userAnswerCity = userAnswerCity.substring(0, Math.round(200*aspectRatioNameCorrection/userManager.getNumberOfUsers()));
                } else {
                    userAnswerCity = userAnswer.guessedName;
                    userAnswerCity = userAnswerCity.substring(0, Math.round(200*aspectRatioNameCorrection/userManager.getNumberOfUsers()));
                    var answerWorthFact = userAnswer.points/gameRoundManager.getMaxPointsPerAnswer(); // 0=worst answer, 1=best
                    var red = Math.floor((1-answerWorthFact)*160);
                    var green = Math.floor(answerWorthFact*160);
                    color = 'rgb(' + red + ',' + green + ',0)';
                }
            }

            bottomScoreboard
                .append('<span><div><span class="userStates" id="userState_' + userMacCleaned + '">' + userAnswerCity + '</span></div><span class="'
                + userCssClass + ' noLinebreak userName" id="userName_' + userMacCleaned + '">' + trimmedName + ':</span> <span class="score">' + userPoints
                + '</span></span>');

            var userStateDiv = $('#userState_'+userMacCleaned);
            var userNameContainer = $('#userName_'+userMacCleaned);

            userStateDiv.css('color', color);
            userStateDiv.removeClass('waitingIcon');
            userStateDiv.removeClass('readyIcon');
            userStateDiv.removeClass('noIcon');
            userStateDiv.addClass(iconCssClass);

            userNameContainer.css('color', user.getColor());
            userNameContainer.css('background-image', 'url(data:image/svg+xml;base64,' + renderManager.createUserIconBase64(user) + ')');
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
