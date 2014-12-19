(function(castReceiver){

    castReceiver.event_onReady = function(event) {
        displayEvent('onReady', event);
        mainMenu.init();

    };

    castReceiver.event_onSenderConnected = function(event){
        displayEvent('onSenderConnected', event);

    };

    castReceiver.event_onSenderDisconnected = function(event){
        displayEvent('onSenderDisconnected', event);

        userManager.removeUser(event.data.userMac);

        if (window.castReceiverManager.getSenders().length == 0) {
            window.close();
        }

    };

    /**
     * on message on user message bus
     * @param event
     */
    castReceiver.event_onUserMessage = function(event){
        displayEvent('onUserMessage', event);
        var eventData = event.data;

        /*
        switch (eventData.event_type) {
            case 'createUser':

        }*/

        if(eventData.event_type === 'createUser') { //TODO USE ENUM !!!!!!!
            var hasUser = userManager.hasUserMac(event.data.userMac);
            if (!hasUser) {
                //add new User
                var isAdmin = false;
                if (userManager.getUserList().length === 0) {
                    isAdmin = true;
                }
                var user = new userManager.User(event.senderId, event.data.userName, event.data.userMac, isAdmin);
                userManager.addUser(user);
            } else {
                // update name and senderId
                userManager.updateUser(event.data.userMac, event.data.userName, event.senderId);
            }
            //inform the Sender if the user is game leader
            window.userMessageBus.send(event.senderId, isAdmin);
        }



        // update View or sth...
        if(eventData.event_type === 'gameRound_answerChosen') {
            gameModeManager.setGameRoundAnswer(event.data.userMac, event.data.answer);
        }
    };
    /**
     * on message on admin message bus
     * @param event
     */
    castReceiver.event_onAdminMessage = function(event){
        displayEvent('onAdminMessage', event);
        var eventData = event.data;

        if(eventData.event_type === 'setGameMode'){
            gameModeManager.setGameMode(eventData.gameMode);
        }

        if(eventData.event_type === 'setGameRoundEnded'){
            displayText('got setGameRoundEnded, ignoring it.');
            //gameModeManager.setGameRoundEnded(eventData.gameMode);
        }
    };

    /**
     * on message on game message bus
     * @param event
     */
    castReceiver.event_onGameMessage = function(event){
        displayEvent('onGameMessage', event);

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
