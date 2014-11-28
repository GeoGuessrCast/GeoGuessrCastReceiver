(function(castReceiver){

    // init
    // set empty gamemode
    dataManager.setValue('gameMode_currentId', 0);
    dataManager.setValue('gameMode_currentRound', 0);
    gameMode_1.init();

    castReceiver.getAvailableGameModes = function(){

    };

    /**
     * set the Id of the current GameMode
     * @param {number} gameModeId
     */
    castReceiver.setGameMode = function(gameModeId){
        dataManager.setValue('gameMode_currentId', gameModeId);
        // call mode function
    };

    // set game mode functions

}(this.gameModeManager = this.gameModeManager || {}));

