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
        var userList = userManager.getUserList();
        if(userList.length === 0) {

        }
    };


    // neues vorgehen
    // onUserMessage sends event.data.userMac
    // does user with mac address exists?
    //

    /**
     * on message on user message bus
     * @param event
     */
    castReceiver.event_onUserMessage = function(event){
        displayEvent('onUserMessage', event);
        //var hasUser = userManager.hasUserMac(event.data.userMac);
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
        } else {
            // update name and senderId
            userManager.updateUser(event.data.userMac, event.data.userName, event.senderId);
        }
        // update View or sth...
        var eventData = event.data;
        if(eventData.event_type === 'chosen') {
            displayText('[AMB] chosen - event received');
        }
        // do sth.
        gameModeManager.setGameRoundAnswer(event);
    };
    /**
     * on message on admin message bus
     * @param event
     */
    castReceiver.event_onAdminMessage = function(event){
        displayEvent('onAdminMessage', event);
        var eventData = event.data;

        if(eventData.event_type === 'setGameMode'){
            displayText('[AMB] setGameMode - event received');
            // set game mode // init
            gameModeManager.setGameMode(eventData.gameMode);
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
