(function(gmm){

    var geocoder = new google.maps.Geocoder();

    /** @type number */
    gmm.maxRounds = 5;
    /** @type number */
    gmm.currentRound = 1;

    gmm.currentGameMode = null;
    gmm.currentGameModeProfile = null;


    gmm.setGameMode = function(gameModeObject){
        gameModeManager.currentGameMode = gameModeObject;
    };

    gmm.setGameModeProfile = function(gameModeProfileObject){
        gameModeManager.currentGameModeProfile = gameModeProfileObject;
    };


    /**
     * starts a new game with config objects
     * @param {Object} profileObject
     */
    gmm.startGame = function(profileObject){
        gameModeManager.setGameModeProfile(profileObject);
        gameModeManager.resetGame();
        renderManager.applyMapOptions(gameModeManager.currentGameMode, profileObject );
        _loadGameUi();
        gameRoundManager.startRound( gameModeManager.currentRound );
    };

    /**
     * sets the current round to 1
     */
    gmm.resetGame = function(){
        gameModeManager.currentRound = 1;
        gameRoundManager.cancelGame();
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