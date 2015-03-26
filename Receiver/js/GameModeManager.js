(function(gmm){

    var geocoder = new google.maps.Geocoder();

    /** @type number */
    gmm.maxRounds = 5;
    /** @type number */
    gmm.currentRound = 1;

    gmm.currentGameMode = null;
    gmm.originalGameModeProfile = null;
    gmm.currentGameModeProfile = null;
    gmm.styledMapOptions = null;


    gmm.setGameMode = function(gameModeObject){
        gameModeManager.currentGameMode = gameModeObject;
    };

    gmm.setGameModeProfile = function(gameModeProfileObject){
        //console.debug('INCOMING PROFILE OBJ.:');
        //console.debug(gameModeProfileObject);
        if (gameModeManager.originalGameModeProfile == null) {
            gameModeManager.originalGameModeProfile = data.gameModeProfile[gameModeProfileObject.id];
        }
        //ensure that gameModeProfileObject has ALL needed keys:
        for (var key in gameModeManager.originalGameModeProfile) {
            if (gameModeManager.originalGameModeProfile.hasOwnProperty(key) && !gameModeProfileObject.hasOwnProperty(key)) {
                gameModeProfileObject[key] = gameModeManager.originalGameModeProfile[key];
            }
        }
        if (gameModeManager.originalGameModeProfile.hasOwnProperty('mapOption')){
            for (var key in gameModeManager.originalGameModeProfile.mapOption) {
                if (gameModeManager.originalGameModeProfile.mapOption.hasOwnProperty(key) && !gameModeProfileObject.mapOption.hasOwnProperty(key)) {
                    gameModeProfileObject.mapOption[key] = gameModeManager.originalGameModeProfile.mapOption[key];
                }
            }
            if (gameModeManager.originalGameModeProfile.mapOption.hasOwnProperty('renderOptions')){
                for (var key in gameModeManager.originalGameModeProfile.mapOption.renderOptions) {
                    if (gameModeManager.originalGameModeProfile.mapOption.renderOptions.hasOwnProperty(key) && !gameModeProfileObject.mapOption.renderOptions.hasOwnProperty(key)) {
                        gameModeProfileObject.mapOption.renderOptions[key] = gameModeManager.originalGameModeProfile.mapOption.renderOptions[key];
                    }
                }
            }
        }
        gameModeManager.currentGameModeProfile = gameModeProfileObject;
        //console.debug('SAVED PROFILE OBJ.:');
        //console.debug(gameModeProfileObject);
    };

    gmm.applyHardness = function(hardness, countryCode){
        console.debug('applying hardness factors onto:');
        console.debug(gameModeManager.currentGameModeProfile);
        gameModeManager.currentGameModeProfile.limitedCountry = countryCode;

        var minCountryPopulationFactor = Math.abs(hardness)*(data.constants.minCountryPopulationRange-1)+1;
        var minPopulationDefaultRangeFactor = Math.abs(hardness)*(data.constants.minPopulationDefaultRange-1)+1;
        var scoreWeightFactorRangeFactor = Math.abs(hardness)*(data.constants.scoreWeightFactorRange-1)+1;

        if (hardness > 0){
            minCountryPopulationFactor = 1 / minCountryPopulationFactor;
            minPopulationDefaultRangeFactor = 1 / minPopulationDefaultRangeFactor;
            scoreWeightFactorRangeFactor = 1 / scoreWeightFactorRangeFactor;
        }

        gameModeManager.currentGameModeProfile.minCountryPopulation *= minCountryPopulationFactor;
        gameModeManager.currentGameModeProfile.minPopulationDefault *= minPopulationDefaultRangeFactor;
        gameModeManager.currentGameModeProfile.scoreWeightFactor *= scoreWeightFactorRangeFactor;
        console.debug('result:');
        console.debug(gameModeManager.currentGameModeProfile);
    };


    gmm.startGame = function(hardness, countryCode){
        gameModeManager.applyHardness(hardness, countryCode);
        gameModeManager.resetGame();
        
        var mapTypeTemplate = gameModeManager.currentGameModeProfile.mapOption.mapType;
        gameModeManager.styledMapOptions = renderManager.generateStyledMapOptions(gameModeManager.currentGameMode, gameModeManager.currentGameModeProfile);
        renderManager.applyMapOptions(mapTypeTemplate, gameModeManager.styledMapOptions);
        
        _loadGameUi();
        gameRoundManager.startRound( gameModeManager.currentRound );
    };

    gmm.resetGame = function(){
        gameModeManager.originalGameModeProfile = null;
        gameModeManager.currentRound = 1;
        gameModeManager.cancelGame();
    };


    gmm.cancelGame = function() {
        gameRoundManager.currentGameState = data.gameState.ended;
        if (gameRoundManager.roundTimer != null) {
            gameRoundManager.roundTimer.terminate();
        }
        if (gameRoundManager.roundTimerAnim != null) {
            gameRoundManager.roundTimerAnim.terminate();
        }
        if (gameRoundManager.gameEvalTimer != null) {
            gameRoundManager.gameEvalTimer.terminate();
        }
        if (gameRoundManager.viewHighScoreTimer != null) {
            gameRoundManager.viewHighScoreTimer.terminate();
        }
        if (gameRoundManager.viewGlobalHighScoreTimer != null) {
            gameRoundManager.viewGlobalHighScoreTimer.terminate();
        }
        if (gameRoundManager.viewMainMenuTimer != null) {
            gameRoundManager.viewMainMenuTimer.terminate();
        }

    };

    gmm.getMap = function(){
        return map;
    };

    gmm.getGeocoder = function(){
        return geocoder;
    };


    /**
     * loads game mode ui
     * @private
     */
    function _loadGameUi(){
        $('#gameOverlay').load('templates/GameModeOverlay.html', function (data) {
            $(this).html(data);
            $('#gameOverlayHeading').html(gameModeManager.currentGameMode.gameModeName);
            $('.headers').addClass(gameModeManager.currentGameMode.iconCssClass);

            renderManager.refreshBottomScoreboard();
        });
    }

}(this.gameModeManager = this.gameModeManager || {}));