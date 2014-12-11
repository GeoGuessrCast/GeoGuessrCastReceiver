(function(castReceiver){

    // init
    // set empty gameMode
    dataManager.setValue('gameMode_currentId', 0);
    dataManager.setValue('gameMode_currentRound', 0);
    //dataManager.setValue('gameModes', JSON.stringify([]));
    //gameMode_1.init();

    /**
     * sets the current round to 0
     */
    castReceiver.clearRounds = function(){
        dataManager.setValue('gameMode_currentRound', 0);
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
     * sets the Id of the current GameMode
     * @param {number} gameModeId
     */
    castReceiver.setGameMode = function(gameModeId){
        dataManager.setValue('gameMode_currentId', gameModeId);
        // call mode function
        // init game mode statically

        switch(gameModeId){
            case 1:
                gameMode_1.init();
                break;
            case 2:
                //gameMode_2.init();
                break;
            case 3:
                //gameMode_3.init();
                break;
            default : gameMode_1.init();
        }

    };

    /**
     * send gameModeStarted Event to all connected sender
     * @param {number} gameModeId
     */
    castReceiver.setGameModeStarted = function(gameModeId){
        var data = '{"gameMode": : '+gameModeId+', "started": true}';
        window.gameMessageBus.broadcast(data);
    };

    /**
     *
     * @param event
     */
    castReceiver.setGameRoundAnswer = function(event) {
        switch(dataManager.getValue('gameMode_currentId')){
            case 1:
                gameMode_1.onChosenMessage(event);
                break;
            case 2:
                //gameMode_2.init();
                break;
            case 3:
                //gameMode_3.init();
                break;
            default : gameMode_1.onChosenMessage(event);
        }
    };

    castReceiver.setGameRoundResults = function (results) {
        // results = array[userId]
        // get user list
    };
}(this.gameModeManager = this.gameModeManager || {}));