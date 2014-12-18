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
        displayText('[GMB] setGameModeStarted broadcasted');
    };

    /**
     * send gameModeEnded Event to all connected senders
     * @param {number} gameModeId
     */
    castReceiver.setGameRoundEnded = function(gameModeId) {
        var data = {"event_type":"round_ended", "gameMode": gameModeId, "ended": true};
        window.gameMessageBus.broadcast(data);
        displayText('[GMB] setGameRoundEnded broadcasted');
    };

    /**
     * sets the {User}'s answer from sender to game mode
     * @param {string} userMac
     * @param {string} answer
     */
    castReceiver.setGameRoundAnswer = function(userMac, answer) {
        gameMode_1.onChosenMessage(userMac, answer);
    };

    /**
     * sets the points of current round to the {User}s
     * @param {Array}results
     */
    castReceiver.setGameRoundResults = function (results) {
        // results = array[userMac]
        // get user list
        var resultLength = results.length,
            userList = userManager.getUserList();
        var userListLength = userList.length;

        for (var key in results) {
            if(key === 'length' || !results.hasOwnProperty(key)) continue;
            // key is userMac
            for(var i = 0; i<userListLength; i++){
                if(userList[i].mac == key) {
                    userList[i].pointsInCurrentGame = userList[i].pointsInCurrentGame + results[key];
                    displayText('userMac: ' + userList[i].mac + ', points added: '+ results[key]);
                }
            }
        }
        userManager.setUserList(userList);
    };
}(this.gameModeManager = this.gameModeManager || {}));