(function(gmm){

    /** @type number */
    gmm.maxRounds = 5;
    /** @type number */
    gmm.currentRound = 1;
    /** @type number */
    gmm.currentGameId = 1;


    // constants
    gmm.gm1 = {
        gameModeName: 'City Guessing',
        id: 1,
        iconUrl: '../images/city.png'
    };

    gmm.p1 = {
        profileName: 'borders + no choices',
        id: 1,
        mapOption: {
            mapType : google.maps.MapTypeId.SATELLITE  //TODO
        }
    };

    /**
     * sets the current round to 1
     */
    gmm.resetGame = function(){
        gmm.currentRound = 1;
    };

    /**
     * starts a new game with config objects
     * @param {Object} gameModeObject
     * @param {Object} profileObject
     */
    gmm.startGame = function(gameModeObject, profileObject){
        gmm.resetGame();
        gameRoundManager.loadMap(gameModeObject, profileObject);
        // init grm.init

    };

    /**
     * increases the current round
     */
    //gmm.incCurrentRound = function(){
    gmm.prepareNextRound = function(){

        // check if max rounds reached
        if(gmm.currentRound === gmm.maxRounds) {
            // end game mode
            var data = {"ended": true, "event_type":"game_ended"};
            eventManager.broadcast(data.channelName.game, data);

            mainMenu.init();
            // todo fm show final scoreboard
        } else {
            // next round...
            gmm.currentRound = gmm.currentRound + 1;

            setTimeout(function(){
                //gameMode_1.startRound(gmm.currentRound);
                gameRoundManager.startRound();
            }, 10000);
        }
    };

    /**
     * sets the Id of the current GameMode
     * @param {number} gameModeId
     */
    gmm.setGameMode = function(gameModeId){
        dataManager.setValue('gameMode_currentId', gameModeId);
        // call mode function
        // init game mode statically

        switch(gameModeId){
            case 1:
                gameMode_1.init();
                //gameRoundManager.init(gmm.gm1, gmm.p1);
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
    gmm.setGameModeStarted = function(gameModeId){
        var jsonData = {"event_type":"startGame", "gameMode": gameModeId, "started": true};
            eventManager.broadcast(data.channelName.game, jsonData);
        displayText('[GMB] setGameModeStarted broadcasted');
    };

    /**
     * send gameModeEnded Event to all connected senders
     * @param {number} gameModeId
     */
    gmm.setGameRoundEnded = function() {
        gameMode_1.roundEnded();
        // call prepareNextRound
        var jsonData = {"event_type":"round_ended", "ended": true};
        eventManager.broadcast(data.channelName.game, jsonData);
        displayText('[GMB] setGameRoundEnded broadcasted');
    };

    /**
     * sets the {User}'s answer from sender to game mode
     * @param {string} userMac
     * @param {string} answer
     */
    gmm.setGameRoundAnswer = function(userMac, answer) {
        displayText('setGameRoundAnswer -> ' + userMac + ', ' + answer);
        gameMode_1.onChosenMessage(userMac, answer);
    };

    /**
     * sets the points of current round to the {User}s
     * @param {Array}results
     */
    gmm.setGameRoundResults = function (results) {
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