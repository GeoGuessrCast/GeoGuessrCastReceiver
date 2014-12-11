(function(castReceiver){

    // init
    // set empty gameMode
    dataManager.setValue('gameMode_currentId', 0);
    dataManager.setValue('gameMode_currentRound', 0);
    dataManager.setValue('gameModes', JSON.stringify([]));
    //gameMode_1.init();

    castReceiver.addGameMode = function(gameModeId){
        var gameModeArray = JSON.parse(dataManager.getValue('gameModes'));
        gameModeId.push(gameModeId);
        dataManager.setValue('gameModes', JSON.stringify(gameModeArray));
    };
    /**
     * sets the current round to 0
     */
    castReceiver.clearRounds = function(){
        dataManager.setValue('gameMode_currentRound', 0);
    };

    /**
     * gets a list of available game modes
     */
    castReceiver.getAvailableGameModes = function(){

    };

    /**
     * increases the current round
     */
    castReceiver.incCurrentRound = function(){
        // get current round
        var currentRound = parseInt( dataManager.getValue('gameMode_currentRound') || 0 );
        currentRound = currentRound + 1;
        dataManager.setValue('gameMode_currentRound', currentRound);
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