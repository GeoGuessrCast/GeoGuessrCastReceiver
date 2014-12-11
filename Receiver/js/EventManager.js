(function(castReceiver){

    castReceiver.event_onReady = function(event) {
        //TODO testing...
        mainMenu.init();

    };

    castReceiver.event_onSenderConnected = function(event){

    };

    castReceiver.event_onSenderDisconnected = function(event){

    };


    castReceiver.event_onUserMessage = function(event){
        var hasUser = userManager.hasUser(event.senderId);
        if(!hasUser){
            //add new User
            var isAdmin = false;
            if(userManager.getUserList().length === 0) {
                isAdmin = true;
            }
            var user = new userManager.User(event.senderId, event.data.userName, event.data.userMac, isAdmin );
            userManager.addUser(user);
            //inform the Sender if the user is game leader
            window.userMessageBus.send(event.senderId, isAdmin);
        }
        // update View or sth...
        var eventData = event.data;
        if(eventData.event_type === 'chosen') {
            displayText('[AMB] chosen - event received');
        }
        // do sth.
        gameModeManager.setGameRoundAnswer(event);
    };

    castReceiver.event_onAdminMessage = function(event){
        displayJson(event.data);
        var eventData = event.data;

        if(eventData.event_type === 'setGameMode'){
            displayText('[AMB] setGameMode - event received');
            // set game mode // init
            gameModeManager.setGameMode(eventData.gameMode);
        }
    };

    castReceiver.event_onGameMessage = function(event){
        // aktueller game mode?
        // aktuelle runde?
        // was koennen fuer msg kommen?
        // next round
        // game started
        // game ended

    };

    castReceiver.event_onSystemVolumeChanged = function(event){

    };

}(this.eventManager = this.eventManager || {}));
