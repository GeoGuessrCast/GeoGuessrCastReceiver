(function(castReceiver){

    // init
    // set empty gameMode
    dataManager.setValue('gameMode_currentId', 0);
    dataManager.setValue('gameMode_currentRound', 0);
    dataManager.setValue('gameMode_maxRounds', 5);

    // constants
    castReceiver.gm1 = {
        iconUrl: 'string',
        header: 'string'

    };

    castReceiver.p1 = {
        profileName: 'Profile #1',
        mapOption: {
            mapType : 'huhu'
        }
    };

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
        var currentRound = parseInt( dataManager.getValue('gameMode_currentRound') || 0),
            maxRounds = parseInt( dataManager.getValue('gameMode_maxRounds') || 0);

        currentRound = currentRound + 1;
        dataManager.setValue('gameMode_currentRound', currentRound);

        // check if max rounds reached
        if(currentRound === maxRounds) {
            // end game mode
            var data = {"ended": true, "event_type":"game_ended"};
            window.gameMessageBus.broadcast(data);

            // todo fm show final scoreboard
        }
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
     * send gameModeStarted Event to all connected senders
     * @param {number} gameModeId
     */
    castReceiver.setGameModeStarted = function(gameModeId){
        var data = {"event_type":"startGame", "gameMode": gameModeId, "started": true};
        window.gameMessageBus.broadcast(data);
    };

    /**
     * send gameModeEnded Event to all connected senders
     * @param {number} gameModeId
     */
    castReceiver.setGameRoundEnded = function(gameModeId) {
        var data = {"event_type":"round_ended", "gameMode": gameModeId, "ended": true};
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
        // results = array[senderId]
        // get user list
        var resultLength = results.length;
        var userList = userManager.getUserList();

        //for(var i = 0; i < resultLength; i++){
        //    // sender id
        //    if(results[0])
        //}

        //for(var key in results) {
        //    if (key === 'length' || !results.hasOwnProperty(key)) continue;
        //    // key is senderId
        //    if()
        //
        //}

    };
}(this.gameModeManager = this.gameModeManager || {}));