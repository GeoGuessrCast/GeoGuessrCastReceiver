(function(global){

    global.maxRounds = 5;
    global.currentRound = 1;
    global.currentGameId = 1;


    // constants
    global.gm1 = {
        gameModeName: 'City Guessing',
        id: 1,
        iconUrl: '../images/city.png'
    };

    global.p1 = {
        profileName: 'borders + no choices',
        mapOption: {
            mapType : 'huhu'  //TODO
        }
    };

    /**
     * sets the current round to 1
     */
    global.clearRounds = function(){
        global.currentRound = 1;
    };

    /**
     * increases the current round
     */
    global.incCurrentRound = function(){

        // check if max rounds reached
        if(global.currentRound === global.maxRounds) {
            // end game mode
            var data = {"ended": true, "event_type":"game_ended"};
            window.gameMessageBus.broadcast(data);

            mainMenu.init();
            // todo fm show final scoreboard
        } else {
            // next round...
            currentRound = currentRound + 1;
            dataManager.setValue('gameMode_currentRound', currentRound);

            setTimeout(function(){
                gameMode_1.startRound(currentRound);
            }, 10000);



        }
    };

    /**
     * sets the Id of the current GameMode
     * @param {number} gameModeId
     */
    global.setGameMode = function(gameModeId){
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
    global.setGameModeStarted = function(gameModeId){
        var data = {"event_type":"startGame", "gameMode": gameModeId, "started": true};
        try {
            window.gameMessageBus.broadcast(data);
        } catch (Exception) {}
        displayText('[GMB] setGameModeStarted broadcasted');
    };

    /**
     * send gameModeEnded Event to all connected senders
     * @param {number} gameModeId
     */
    global.setGameRoundEnded = function() {
        gameMode_1.roundEnded();
        var data = {"event_type":"round_ended", "ended": true};
        window.gameMessageBus.broadcast(data);
        displayText('[GMB] setGameRoundEnded broadcasted');
    };

    /**
     * sets the {User}'s answer from sender to game mode
     * @param {string} userMac
     * @param {string} answer
     */
    global.setGameRoundAnswer = function(userMac, answer) {
        displayText('setGameRoundAnswer -> ' + userMac + ', ' + answer);
        gameMode_1.onChosenMessage(userMac, answer);
    };

    /**
     * sets the points of current round to the {User}s
     * @param {Array}results
     */
    global.setGameRoundResults = function (results) {
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