(function(gmm){

    var layer;
    var geocoder = new google.maps.Geocoder();
    var markers = []; //Google Map Marker
    var infobubbles = []; //Google info bubbles

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

    /**
     * clears all markers on the map
     */
    gmm.clearMarkers = function(){
        if (layer) {
            layer.setMap(null);
        }

        markers.map(function (marker) {
            marker.setMap(null);
        });
        markers = [];
    };
    /**
     * clears all markers on the map
     */
    gmm.clearInfoBubbles = function(){

        infobubbles.forEach(function(entry) {
            entry.close();
        });
        infobubbles.map(function (bubble) {
            bubble.setMap(null);
        });
        infobubbles = [];
    };

    gmm.getMap = function(){
        return map;
    };

    gmm.getLayer = function(){
        return layer;
    };

    gmm.getGeocoder = function(){
        return geocoder;
    };

    gmm.getMarkers = function(){
        return markers;
    };

    gmm.getInfoBubbles = function(){
        return infobubbles;
    };

    gmm.setMap = function(setter){
        window.map = setter;
        return window.map;
    };

    gmm.setLayer = function(setter){
        layer = setter;
        return layer;
    };

    gmm.setGeocoder = function(setter){
        geocoder = setter;
        return geocoder;
    };

    gmm.setMarkers = function(setter){
        markers = setter;
        return markers;
    };


    gmm.setInfoBubbles= function(setter){
        infobubbles = setter;
        return infobubbles;
    };


    /**
     * loads game mode ui
     * @private
     */
    function _loadGameUi(){
        $('#gameOverlay').load('templates/GameModeOverlay.html', function (data) {
            $(this).html(data);
            renderManager.refreshBottomScoreboard();
        });
    }

}(this.gameModeManager = this.gameModeManager || {}));